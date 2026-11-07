// Rule set v1 table (PRD 10.5) and the trust scenarios in 17.1.
import { describe, expect, it } from 'vitest';
import { evaluateTask, ist, minimumVisitMinutes, type CheckInSignal } from '../src';

const due = ist(2026, 11, 9, 13, 0); // 1:00 pm IST lunch feed
const at = (h: number, m: number) => ist(2026, 11, 9, h, m);
const CODE = '4821';
let n = 0;
const sig = (s: Omit<CheckInSignal, 'id'>): CheckInSignal => ({ id: `s${++n}`, fromRegisteredNumber: true, ...s });
const run = (signals: CheckInSignal[], extra: Partial<Parameters<typeof evaluateTask>[0]> = {}) =>
  evaluateTask({ dueAt: due, now: at(15, 0), signals, expectedCode: CODE, visitTaskTypes: ['feeding'], ...extra });

describe('rule set v1 (10.5)', () => {
  it('photo with today\'s code + arrival/exit calls of enough duration = Confirmed, points', () => {
    const r = run([
      sig({ type: 'arrival_call', at: at(13, 0) }),
      sig({ type: 'whatsapp_photo', at: at(13, 3), code: CODE, imageHash: 'a' }),
      sig({ type: 'exit_call', at: at(13, 7) }),
    ]);
    expect(r).toMatchObject({ task: 'confirmed', visit: 'confirmed', points: 'earn', visitMinutes: 7 });
  });

  it('photo with today\'s code + owner gate entry = Confirmed', () => {
    const r = run([sig({ type: 'gate_entry', at: at(12, 58) }), sig({ type: 'whatsapp_photo', at: at(13, 2), code: CODE })]);
    expect(r.task).toBe('confirmed');
  });

  it('a code photo alone is never Confirmed (v1.3 change): Likely, visit not shown', () => {
    const r = run([sig({ type: 'whatsapp_photo', at: at(13, 2), code: CODE })]);
    expect(r).toMatchObject({ task: 'likely', visit: 'not_shown', points: 'earn' });
  });

  it.each([
    ['photo without code', { type: 'whatsapp_photo' as const }],
    ['voice note naming the task', { type: 'voice_note' as const, namesTask: true }],
    ['IVR code after the task prompt', { type: 'ivr_code' as const, code: CODE, afterTaskPrompt: true }],
  ])('%s = Likely', (_, s) => {
    expect(run([sig({ at: at(13, 5), ...s })]).task).toBe('likely');
  });

  it('a voice note that does not name the task is only an acknowledgement', () => {
    expect(run([sig({ type: 'voice_note', at: at(13, 5) })]).task).toBe('missed');
  });

  it('visit only, no task evidence: visit Likely, task Not confirmed ("visit only"), no points (17.1)', () => {
    const r = run([sig({ type: 'arrival_call', at: at(13, 0) }), sig({ type: 'exit_call', at: at(13, 10) })]);
    expect(r).toMatchObject({ task: 'not_confirmed', visit: 'likely', points: 'none' });
    expect(r.reasons).toContain('visit_only');
  });

  it('one call only = Not confirmed', () => {
    expect(run([sig({ type: 'arrival_call', at: at(13, 0) })])).toMatchObject({ task: 'not_confirmed', visit: 'not_confirmed' });
  });

  it('visit too short for the tasks = Not confirmed, even with a code photo it is not Confirmed', () => {
    const calls = [sig({ type: 'arrival_call', at: at(13, 0) }), sig({ type: 'exit_call', at: at(13, 2) })];
    expect(run(calls).task).toBe('not_confirmed');
    expect(run([...calls, sig({ type: 'whatsapp_photo', at: at(13, 1), code: CODE })]).task).toBe('likely');
  });

  it('wrong or old code = Not confirmed', () => {
    const r = run([sig({ type: 'whatsapp_photo', at: at(13, 2), code: '0000' })]);
    expect(r).toMatchObject({ task: 'not_confirmed', points: 'none' });
    expect(r.reasons).toContain('wrong_code');
  });

  it('old photo re-sent (same image hash) does not count; task stays not confirmed (17.1)', () => {
    const r = run([sig({ type: 'whatsapp_photo', at: at(13, 2), code: CODE, imageHash: 'h1' })], {
      priorImageHashes: new Set(['h1']),
    });
    expect(r.task).toBe('missed');
    expect(r.reasons).toContain('duplicate_image');
  });

  it('calls from an unregistered number are ignored', () => {
    const r = run([
      sig({ type: 'arrival_call', at: at(13, 0), fromRegisteredNumber: false }),
      sig({ type: 'exit_call', at: at(13, 10), fromRegisteredNumber: false }),
    ]);
    expect(r.task).toBe('missed');
  });

  it('nothing by due + grace = Missed; before that = pending', () => {
    expect(run([], { now: at(13, 31) }).task).toBe('missed');
    expect(run([], { now: at(13, 29) }).task).toBe('pending');
  });

  it('evidence window: from 30 min before due; up to 3 h late is accepted and labelled late; later is ignored', () => {
    expect(run([sig({ type: 'whatsapp_photo', at: at(12, 29) })]).task).toBe('missed');
    const late = run([sig({ type: 'whatsapp_photo', at: at(15, 0) })], { now: at(16, 30) });
    expect(late).toMatchObject({ task: 'likely', late: true });
    expect(run([sig({ type: 'whatsapp_photo', at: at(16, 1) })], { now: at(17, 0) }).task).toBe('missed');
  });

  it('owner return check matches a task that was not Confirmed/Likely = Matched, no points', () => {
    expect(run([], { returnCheck: 'done' })).toMatchObject({ task: 'matched', points: 'none' });
  });

  it('owner return check contradicts a Confirmed/Likely task = mismatch, points held', () => {
    const r = run([sig({ type: 'whatsapp_photo', at: at(13, 2), code: CODE })], { returnCheck: 'not_done' });
    expect(r).toMatchObject({ task: 'not_confirmed', mismatch: true, points: 'held' });
  });

  it('stores rule version and reason codes', () => {
    const r = run([sig({ type: 'whatsapp_photo', at: at(13, 2), code: CODE })]);
    expect(r.ruleVersion).toBe('v1');
    expect(r.reasons).toContain('code_photo');
  });
});

describe('minimum visit duration (10.5)', () => {
  it('per task type, summed for a multi-task visit and capped at 30', () => {
    expect(minimumVisitMinutes(['feeding'])).toBe(5);
    expect(minimumVisitMinutes(['walk'])).toBe(15);
    expect(minimumVisitMinutes(['feeding', 'medicine', 'toilet_pad'])).toBe(11);
    expect(minimumVisitMinutes(['walk', 'walk', 'feeding'])).toBe(30);
  });
});
