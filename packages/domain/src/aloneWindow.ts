/**
 * Alone-window warning (PS-012, wireframe O3): out 9-7 with a visit at 1 pm means
 * the pet is never alone more than 6 hours. Warns when the longest gap between
 * leaving, each visit and returning exceeds the configured limit.
 * Guidance only: no health/safety claim without vet-reviewed guidance.
 */
import { minutesBetween } from './time';

export const DEFAULT_ALONE_LIMIT_MINUTES = 6 * 60;

export interface AloneWindowResult {
  longestMinutes: number;
  /** Start and end of the longest stretch. */
  from: Date;
  to: Date;
  exceeds: boolean;
}

export function longestAloneWindow(leaveAt: Date, returnAt: Date, visitTimes: Date[], limitMinutes = DEFAULT_ALONE_LIMIT_MINUTES): AloneWindowResult {
  if (returnAt <= leaveAt) throw new RangeError('returnAt must be after leaveAt');
  const points = [leaveAt, ...visitTimes.filter((v) => v > leaveAt && v < returnAt).sort((a, b) => a.getTime() - b.getTime()), returnAt];
  let best = { longestMinutes: 0, from: leaveAt, to: returnAt };
  for (let i = 1; i < points.length; i++) {
    const gap = minutesBetween(points[i - 1]!, points[i]!);
    if (gap > best.longestMinutes) best = { longestMinutes: gap, from: points[i - 1]!, to: points[i]! };
  }
  return { ...best, exceeds: best.longestMinutes > limitMinutes };
}
