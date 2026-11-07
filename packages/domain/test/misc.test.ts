// Task lifecycle (PS-121), code card (PS-109), rewards (PS-126).
import { describe, expect, it } from 'vitest';
import {
  accruePoints, createTask, expectedCodeFor, generateCodeCard, ist, spendableBalance, transitionTask,
  type LedgerEntry,
} from '../src';

const t0 = ist(2026, 11, 9, 9, 0);

describe('task lifecycle (PS-121)', () => {
  it('keeps full history and never overwrites', () => {
    let t = createTask('t1', t0, 'owner');
    t = transitionTask(t, { to: 'reassigned', at: t0, by: 'owner', reason: 'Sunita off', reassignedTo: 'friend:ravi' });
    t = transitionTask(t, { to: 'done_reported', at: t0, by: 'friend:ravi' });
    t = transitionTask(t, { to: 'done_with_evidence', at: t0, by: 'system' });
    expect(t.history.map((h) => h.to)).toEqual(['planned', 'reassigned', 'done_reported', 'done_with_evidence']);
  });

  it('cancel, skip and partly done need a reason; finished tasks cannot reopen', () => {
    const t = createTask('t1', t0, 'owner');
    expect(() => transitionTask(t, { to: 'cancelled', at: t0, by: 'owner' })).toThrow();
    const c = transitionTask(t, { to: 'cancelled', at: t0, by: 'owner', reason: 'pet at vet' });
    expect(() => transitionTask(c, { to: 'planned', at: t0, by: 'owner' })).toThrow();
  });

  it('a missed task can still close with late evidence', () => {
    const m = transitionTask(createTask('t1', t0, 'owner'), { to: 'missed', at: t0, by: 'system' });
    expect(transitionTask(m, { to: 'done_with_evidence', at: t0, by: 'system' }).status).toBe('done_with_evidence');
  });
});

describe('code card (PS-109)', () => {
  let seed = 1;
  const rng = (max: number) => (seed = (seed * 9301 + 49297) % 233280) % max;

  it('one distinct 4-digit code per day of the month', () => {
    const card = generateCodeCard('c1', 'h1', '2026-11', t0, rng);
    const codes = Object.values(card.codes);
    expect(codes).toHaveLength(30);
    expect(new Set(codes).size).toBe(30);
    expect(codes.every((c) => /^\d{4}$/.test(c))).toBe(true);
  });

  it('a replacement card supersedes the old one; revoked codes stop counting', () => {
    const old = generateCodeCard('c1', 'h1', '2026-11', ist(2026, 11, 1), rng);
    const fresh = generateCodeCard('c2', 'h1', '2026-11', ist(2026, 11, 8), rng);
    old.revokedAt = ist(2026, 11, 8);
    expect(expectedCodeFor([old, fresh], ist(2026, 11, 9, 13))).toBe(fresh.codes[9]);
    expect(expectedCodeFor([old, fresh], ist(2026, 11, 5, 13))).toBe(old.codes[5]);
    expect(expectedCodeFor([old], ist(2026, 12, 1, 13))).toBeUndefined();
  });
});

describe('rewards (PS-126)', () => {
  const base = { helperId: 'sunita', householdId: 'h1', at: t0, rewardsEnabled: true };

  it('5 points per Confirmed/Likely task; none when the pilot switch is off', () => {
    expect(accruePoints({ ...base, taskId: 't1', outcome: 'earn', existing: [] }, 'e1')?.points).toBe(5);
    expect(accruePoints({ ...base, taskId: 't1', outcome: 'earn', existing: [], rewardsEnabled: false }, 'e1')).toBeNull();
    expect(accruePoints({ ...base, taskId: 't1', outcome: 'none', existing: [] }, 'e1')).toBeNull();
  });

  it('caps at 125 points per helper per household per month', () => {
    const existing: LedgerEntry[] = Array.from({ length: 25 }, (_, i) => ({
      id: `e${i}`, helperId: 'sunita', householdId: 'h1', taskId: `t${i}`, points: 5, state: 'earned', reason: 'x', at: t0,
    }));
    expect(accruePoints({ ...base, taskId: 'new', outcome: 'earn', existing }, 'e')).toBeNull();
    expect(accruePoints({ ...base, householdId: 'h2', taskId: 'new', outcome: 'earn', existing }, 'e')?.points).toBe(5);
  });

  it('a mismatch holds the points for up to 7 days', () => {
    const e = accruePoints({ ...base, taskId: 't1', outcome: 'held', existing: [] }, 'e1')!;
    expect(e.state).toBe('held');
    expect(e.holdUntil).toEqual(ist(2026, 11, 16, 9, 0));
  });

  it('held and expired points are not spendable', () => {
    const entries: LedgerEntry[] = [
      { id: '1', helperId: 's', householdId: 'h', taskId: 'a', points: 5, state: 'earned', reason: '', at: t0 },
      { id: '2', helperId: 's', householdId: 'h', taskId: 'b', points: 5, state: 'held', reason: '', at: t0 },
      { id: '3', helperId: 's', householdId: 'h', taskId: 'c', points: 5, state: 'earned', reason: '', at: ist(2026, 1, 1) },
    ];
    expect(spendableBalance(entries, 's', ist(2026, 11, 10))).toBe(5);
  });
});
