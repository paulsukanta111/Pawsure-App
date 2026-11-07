/**
 * Covered care day: the North Star (PS-111, 3.3, 16.3). One deterministic rule.
 *
 * Per pet per IST calendar day. Covered when every planned, non-cancelled task is
 * Confirmed, Likely or Matched, or was Missed but escalated and resolved by 11:59 pm.
 * Trusted helper mode: covered only when the owner taps "Covered"; no tap = Unknown.
 * Days with no planned tasks are excluded. A household day is covered only if every pet is.
 */
import type { TaskConfidence } from './types';
import { istEndOfDay } from './time';

export const COVERED_DAY_RULE_VERSION = 'ps111-v1.3';

export interface DayTask {
  cancelled: boolean;
  confidence: TaskConfidence | 'pending';
  /** For missed tasks: when the escalation was marked resolved, if it was. */
  escalationResolvedAt?: Date;
  /** Partly done tasks never count unless the owner confirms (shows as 'matched'). */
  partlyDone?: boolean;
}

export type PetDayInput =
  | { mode: 'tracked'; date: Date; tasks: DayTask[] }
  | { mode: 'trusted'; date: Date; plannedTaskCount: number; ownerMarkedCovered: boolean | null };

export type DayOutcome = 'covered' | 'not_covered' | 'unknown' | 'excluded';

export interface PetDayResult {
  outcome: DayOutcome;
  /** Quality sub-metric: every task Confirmed or Likely with no owner check. */
  verified: boolean;
  ruleVersion: string;
}

export function computePetDay(input: PetDayInput): PetDayResult {
  const base = { ruleVersion: COVERED_DAY_RULE_VERSION };
  if (input.mode === 'trusted') {
    if (input.plannedTaskCount === 0) return { ...base, outcome: 'excluded', verified: false };
    if (input.ownerMarkedCovered === true) return { ...base, outcome: 'covered', verified: false };
    if (input.ownerMarkedCovered === false) return { ...base, outcome: 'not_covered', verified: false };
    return { ...base, outcome: 'unknown', verified: false };
  }

  const planned = input.tasks.filter((t) => !t.cancelled);
  if (planned.length === 0) return { ...base, outcome: 'excluded', verified: false };

  const deadline = istEndOfDay(input.date);
  const taskCovered = (t: DayTask) => {
    if (t.confidence === 'matched') return true;
    if (t.partlyDone) return false;
    if (t.confidence === 'confirmed' || t.confidence === 'likely') return true;
    if (t.confidence === 'missed') return !!t.escalationResolvedAt && t.escalationResolvedAt <= deadline;
    return false;
  };
  const covered = planned.every(taskCovered);
  const verified = planned.every((t) => !t.partlyDone && (t.confidence === 'confirmed' || t.confidence === 'likely'));
  return { ...base, outcome: covered ? 'covered' : 'not_covered', verified };
}

/** Household day: covered only if every pet with planned tasks is covered. */
export function computeHouseholdDay(pets: PetDayResult[]): DayOutcome {
  const counted = pets.filter((p) => p.outcome !== 'excluded');
  if (counted.length === 0) return 'excluded';
  if (counted.some((p) => p.outcome === 'not_covered')) return 'not_covered';
  if (counted.some((p) => p.outcome === 'unknown')) return 'unknown';
  return 'covered';
}

/**
 * North Star rate for a cohort: covered pet-days / pet-days with a planned task.
 * Unknown (Trusted, no tap) stays in the denominator; excluded days do not count (16.3).
 */
export function coveredDayRate(days: DayOutcome[]): { numerator: number; denominator: number; rate: number | null } {
  const denominator = days.filter((d) => d !== 'excluded').length;
  const numerator = days.filter((d) => d === 'covered').length;
  return { numerator, denominator, rate: denominator === 0 ? null : numerator / denominator };
}
