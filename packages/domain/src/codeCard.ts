/**
 * Monthly food-box code card (PS-024, PS-109, 10.5). One random code per IST day,
 * kept inside the food box. A new card every month and on demand after suspected
 * copying; codes from a revoked card stop counting at once.
 */
import { istDateKey } from './time';

export interface CodeCard {
  id: string;
  householdId: string;
  /** `YYYY-MM` (IST). */
  month: string;
  /** Day of month (1-31) -> code. */
  codes: Record<number, string>;
  issuedAt: Date;
  revokedAt?: Date;
}

export type RandomInt = (maxExclusive: number) => number;

/** Generate distinct 4-digit codes for every day of the month. Pass a CSPRNG in production. */
export function generateCodeCard(id: string, householdId: string, month: string, issuedAt: Date, randomInt: RandomInt): CodeCard {
  const [y, m] = month.split('-').map(Number) as [number, number];
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const used = new Set<string>();
  const codes: Record<number, string> = {};
  for (let d = 1; d <= days; d++) {
    let code: string;
    do code = String(randomInt(10_000)).padStart(4, '0');
    while (used.has(code));
    used.add(code);
    codes[d] = code;
  }
  return { id, householdId, month, codes, issuedAt };
}

/** Today's expected code for the active card, or undefined if no valid card covers that day. */
export function expectedCodeFor(cards: CodeCard[], at: Date): string | undefined {
  const key = istDateKey(at);
  const month = key.slice(0, 7);
  const day = Number(key.slice(8, 10));
  const active = cards
    .filter((c) => c.month === month && c.issuedAt <= at && (!c.revokedAt || c.revokedAt > at))
    .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())[0];
  return active?.codes[day];
}
