// PS-111 sample days and the 17.1 covered-care-day scenarios.
import { describe, expect, it } from 'vitest';
import { computeHouseholdDay, computePetDay, coveredDayRate, ist, istDateKey } from '../src';

const day = ist(2026, 11, 9, 9, 0);

describe('covered care day (PS-111)', () => {
  it('covered when every planned task is Confirmed, Likely or Matched', () => {
    const r = computePetDay({ mode: 'tracked', date: day, tasks: [
      { cancelled: false, confidence: 'confirmed' },
      { cancelled: false, confidence: 'likely' },
      { cancelled: false, confidence: 'matched' },
    ] });
    expect(r).toMatchObject({ outcome: 'covered', verified: false });
  });

  it('verified only when all are Confirmed/Likely without an owner check', () => {
    const r = computePetDay({ mode: 'tracked', date: day, tasks: [
      { cancelled: false, confidence: 'confirmed' },
      { cancelled: false, confidence: 'likely' },
    ] });
    expect(r).toMatchObject({ outcome: 'covered', verified: true });
  });

  it('a Not confirmed task makes the day not covered', () => {
    const r = computePetDay({ mode: 'tracked', date: day, tasks: [
      { cancelled: false, confidence: 'confirmed' },
      { cancelled: false, confidence: 'not_confirmed' },
    ] });
    expect(r.outcome).toBe('not_covered');
  });

  it('a missed task counts only if its escalation was resolved by 11:59 pm IST', () => {
    const base = { cancelled: false, confidence: 'missed' as const };
    expect(computePetDay({ mode: 'tracked', date: day, tasks: [{ ...base, escalationResolvedAt: ist(2026, 11, 9, 23, 58) }] }).outcome).toBe('covered');
    expect(computePetDay({ mode: 'tracked', date: day, tasks: [{ ...base, escalationResolvedAt: ist(2026, 11, 10, 0, 1) }] }).outcome).toBe('not_covered');
    expect(computePetDay({ mode: 'tracked', date: day, tasks: [base] }).outcome).toBe('not_covered');
  });

  it('cancelled tasks leave the denominator; a day with only cancelled tasks is excluded (17.1)', () => {
    expect(computePetDay({ mode: 'tracked', date: day, tasks: [
      { cancelled: true, confidence: 'missed' },
      { cancelled: false, confidence: 'likely' },
    ] }).outcome).toBe('covered');
    expect(computePetDay({ mode: 'tracked', date: day, tasks: [{ cancelled: true, confidence: 'pending' }] }).outcome).toBe('excluded');
  });

  it('a partly done task is not covered unless the owner confirms it (17.1)', () => {
    expect(computePetDay({ mode: 'tracked', date: day, tasks: [{ cancelled: false, confidence: 'likely', partlyDone: true }] }).outcome).toBe('not_covered');
    expect(computePetDay({ mode: 'tracked', date: day, tasks: [{ cancelled: false, confidence: 'matched', partlyDone: true }] }).outcome).toBe('covered');
  });

  it('Trusted helper: covered only on an owner tap; no tap = Unknown (17.1)', () => {
    expect(computePetDay({ mode: 'trusted', date: day, plannedTaskCount: 3, ownerMarkedCovered: true }).outcome).toBe('covered');
    expect(computePetDay({ mode: 'trusted', date: day, plannedTaskCount: 3, ownerMarkedCovered: null }).outcome).toBe('unknown');
    expect(computePetDay({ mode: 'trusted', date: day, plannedTaskCount: 0, ownerMarkedCovered: null }).outcome).toBe('excluded');
  });

  it('household is covered only if every pet is', () => {
    const covered = { outcome: 'covered' as const, verified: true, ruleVersion: 'x' };
    const notCovered = { outcome: 'not_covered' as const, verified: false, ruleVersion: 'x' };
    const excluded = { outcome: 'excluded' as const, verified: false, ruleVersion: 'x' };
    expect(computeHouseholdDay([covered, excluded])).toBe('covered');
    expect(computeHouseholdDay([covered, notCovered])).toBe('not_covered');
  });

  it('North Star rate keeps Unknown in the denominator and drops excluded days (16.3)', () => {
    expect(coveredDayRate(['covered', 'covered', 'unknown', 'not_covered', 'excluded'])).toEqual({ numerator: 2, denominator: 4, rate: 0.5 });
  });

  it('uses the IST calendar day', () => {
    expect(istDateKey(ist(2026, 11, 9, 23, 59))).toBe('2026-11-09');
    expect(istDateKey(ist(2026, 11, 10, 0, 1))).toBe('2026-11-10');
  });
});
