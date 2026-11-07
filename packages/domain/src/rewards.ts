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
