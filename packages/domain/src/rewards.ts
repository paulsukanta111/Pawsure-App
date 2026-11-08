/**
 * Helper rewards policy (PS-028, PS-042 to PS-044, PS-126). Pilot switch: ON for
 * half the pilot homes. Coupons only, never cash.
 */
import { addMinutes, istMonthKey } from './time';

export const REWARD_POLICY = {
  pointsPerTask: 5,
  /** Per helper per household per month (= the ₹5 self-funded cap). */
  monthlyCapPerHousehold: 125,
  pointsPerCoupon: 500,
  couponValueRupees: 20,
  expiryMonths: 6,
  mismatchHoldDays: 7,
} as const;

export type LedgerState = 'earned' | 'held' | 'released' | 'reversed' | 'redeemed' | 'expired';

export interface LedgerEntry {
  id: string;
  helperId: string;
  householdId: string;
  taskId: string;
  points: number;
  state: LedgerState;
  reason: string;
  at: Date;
  holdUntil?: Date;
}

export interface AccrualInput {
  helperId: string;
  householdId: string;
  taskId: string;
  at: Date;
  outcome: 'earn' | 'held' | 'none';
  /** Feature switch for this household (pilot test arm). */
  rewardsEnabled: boolean;
  existing: readonly LedgerEntry[];
}

/** Returns the new ledger entry, or null when nothing accrues. */
export function accruePoints(input: AccrualInput, newId: string): LedgerEntry | null {
  if (!input.rewardsEnabled || input.outcome === 'none') return null;
  if (input.existing.some((e) => e.taskId === input.taskId && e.helperId === input.helperId)) return null; // one award per task
  const month = istMonthKey(input.at);
  const used = input.existing
    .filter((e) => e.helperId === input.helperId && e.householdId === input.householdId && istMonthKey(e.at) === month)
    .filter((e) => e.state !== 'reversed')
    .reduce((sum, e) => sum + e.points, 0);
  const points = Math.min(REWARD_POLICY.pointsPerTask, REWARD_POLICY.monthlyCapPerHousehold - used);
  if (points <= 0) return null;
  const held = input.outcome === 'held';
  return {
    id: newId,
    helperId: input.helperId,
    householdId: input.householdId,
    taskId: input.taskId,
    points,
    state: held ? 'held' : 'earned',
    reason: held ? 'mismatch_under_review' : 'confirmed_or_likely_task',
    at: input.at,
    holdUntil: held ? addMinutes(input.at, REWARD_POLICY.mismatchHoldDays * 24 * 60) : undefined,
  };
}

/** Spendable balance: earned/released points younger than the expiry window. */
export function spendableBalance(entries: readonly LedgerEntry[], helperId: string, now: Date): number {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - REWARD_POLICY.expiryMonths);
  const earned = entries
    .filter((e) => e.helperId === helperId && (e.state === 'earned' || e.state === 'released') && e.at > cutoff)
    .reduce((s, e) => s + e.points, 0);
  const redeemed = entries.filter((e) => e.helperId === helperId && e.state === 'redeemed').reduce((s, e) => s + e.points, 0);
  return Math.max(0, earned - redeemed);
}

// ---------------------------------------------------------------------------
// Wallet, redemption and mismatch holds (PS-042, PS-044, PS-126)

export interface WalletSummary {
  /** Earned or released, not yet expired. */
  earned: number;
  /** Held while a mismatch is reviewed. */
  held: number;
  redeemed: number;
  spendable: number;
  /** Spendable points that expire within 30 days. */
  expiringSoon: number;
  couponsAvailable: number;
  pointsToNextCoupon: number;
}

const DAY_MS = 86_400_000;

function expiryOf(e: LedgerEntry): Date {
  const d = new Date(e.at);
  d.setUTCMonth(d.getUTCMonth() + REWARD_POLICY.expiryMonths);
  return d;
}

export function walletSummary(entries: readonly LedgerEntry[], helperId: string, now: Date): WalletSummary {
  const mine = entries.filter((e) => e.helperId === helperId);
  const live = mine.filter((e) => (e.state === 'earned' || e.state === 'released') && expiryOf(e) > now);
  const earned = live.reduce((s, e) => s + e.points, 0);
  const held = mine.filter((e) => e.state === 'held').reduce((s, e) => s + e.points, 0);
  const redeemed = mine.filter((e) => e.state === 'redeemed').reduce((s, e) => s + e.points, 0);
  const spendable = Math.max(0, earned - redeemed);
  const expiringSoon = Math.min(spendable, live.filter((e) => expiryOf(e).getTime() - now.getTime() <= 30 * DAY_MS).reduce((s, e) => s + e.points, 0));
  const couponsAvailable = Math.floor(spendable / REWARD_POLICY.pointsPerCoupon);
  return { earned, held, redeemed, spendable, expiringSoon, couponsAvailable, pointsToNextCoupon: REWARD_POLICY.pointsPerCoupon - (spendable % REWARD_POLICY.pointsPerCoupon) };
}

/** Redeem one ₹20 coupon (500 points). Returns null if there aren't enough points. Coupons only, never cash. */
export function redeemCoupon(entries: readonly LedgerEntry[], helperId: string, now: Date, newId: string): LedgerEntry | null {
  if (walletSummary(entries, helperId, now).spendable < REWARD_POLICY.pointsPerCoupon) return null;
  return { id: newId, helperId, householdId: '*', taskId: `coupon:${newId}`, points: REWARD_POLICY.pointsPerCoupon, state: 'redeemed', reason: `₹${REWARD_POLICY.couponValueRupees} coupon`, at: now };
}

export type HoldDecision = 'release' | 'reverse';

/** Close a mismatch hold with a reason. Only held entries change; one mismatch is never a misconduct finding. */
export function resolveHold(entry: LedgerEntry, decision: HoldDecision, at: Date, reason: string): LedgerEntry {
  if (entry.state !== 'held') return entry;
  if (!reason.trim()) throw new Error('A hold is closed with a reason');
  return { ...entry, state: decision === 'release' ? 'released' : 'reversed', reason, at: entry.at, holdUntil: at };
}

/** Holds release automatically when nobody decides within 7 days. */
export function autoReleaseHolds(entries: readonly LedgerEntry[], now: Date): LedgerEntry[] {
  return entries.map((e) => (e.state === 'held' && e.holdUntil && e.holdUntil <= now
    ? { ...e, state: 'released' as const, reason: 'Hold expired after 7 days without a finding' }
    : e));
}
