/**
 * Time helpers. Pawsure computes every calendar-day rule in IST (UTC+05:30,
 * no daylight saving), per PS-111. All instants are plain `Date` objects in UTC.
 */

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
const IST_OFFSET_MS = 330 * MINUTE;

export const addMinutes = (d: Date, minutes: number): Date => new Date(d.getTime() + minutes * MINUTE);

export const minutesBetween = (from: Date, to: Date): number => (to.getTime() - from.getTime()) / MINUTE;

/** Calendar date in IST as `YYYY-MM-DD`. */
export function istDateKey(d: Date): string {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Month in IST as `YYYY-MM`. */
export function istMonthKey(d: Date): string {
  return istDateKey(d).slice(0, 7);
}

/** Build a UTC instant from an IST wall-clock time. `ist(2026, 11, 7, 16, 0)` = 4:00 pm IST on 7 Nov 2026. */
export function ist(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MS);
}

/** 11:59:59.999 pm IST on the IST calendar day containing `d`. */
export function istEndOfDay(d: Date): Date {
  const [y, m, day] = istDateKey(d).split('-').map(Number) as [number, number, number];
  return new Date(ist(y, m, day + 1).getTime() - 1);
}
