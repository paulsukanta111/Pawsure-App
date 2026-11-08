// v2: Ask Pawsure parse stand-in (PS-055/056/067), wallet and holds (PS-126).
import { describe, expect, it } from 'vitest';
import {
  autoReleaseHolds, ist, parseCoverText, parseFriendReply, redeemCoupon, resolveHold, walletSummary, type LedgerEntry,
} from '../src';

const now = ist(2026, 11, 9, 10, 0);

describe('parseCoverText (LLM stand-in)', () => {
  it('master-prompt example: tomorrow 12-4 pm, feed + walk', () => {
    const r = parseCoverText('My regular helper is unavailable tomorrow between 12 PM and 4 PM. Can someone feed Bruno and take him for a walk?', now, 'Bruno');
    expect(r.tasks).toEqual(['feeding', 'walk']);
    expect(r.day).toBe('tomorrow');
    expect(r.start).toEqual(ist(2026, 11, 10, 12, 0));
    expect(r.end).toEqual(ist(2026, 11, 10, 16, 0));
    expect(r.blocking.map((b) => b.field)).toEqual(['access']); // key not mentioned: must ask
  });

  it('PRD example: "stuck until 8 ... at 5" ignores the absence time and asks am/pm', () => {
    const r = parseCoverText('I am stuck in a meeting until 8. Can someone feed Bruno and take him down at 5? Spare key is with security', now);
    expect(r.tasks).toEqual(['feeding', 'walk']);
    expect(r.needsKey).toBe(true);
    expect(r.start).toBeNull();
    expect(r.blocking.map((b) => b.field)).toEqual(['ampm']);
    expect(r.pendingHours?.startHour).toBe(5);
  });

  it('explicit single time gets a 30-minute window', () => {
    const r = parseCoverText('feed him at 6:30 pm, someone is home', now);
    expect(r.start).toEqual(ist(2026, 11, 9, 18, 30));
    expect(r.end).toEqual(ist(2026, 11, 9, 19, 0));
    expect(r.needsKey).toBe(false);
    expect(r.blocking).toEqual([]);
  });

  it('"10-1 pm" means 10 am to 1 pm', () => {
    const r = parseCoverText('walk between 10-1 pm, key needed', now);
    expect(r.start).toEqual(ist(2026, 11, 9, 10, 0));
    expect(r.end).toEqual(ist(2026, 11, 9, 13, 0));
  });

  it('no task or no time blocks the search', () => {
    const r = parseCoverText('can someone help please', now);
    expect(r.blocking.map((b) => b.field)).toEqual(['tasks', 'time', 'access']);
  });

  it('medicine always needs explicit confirmation', () => {
    const r = parseCoverText('give Bruno his tablet at 2 pm, key needed', now);
    expect(r.tasks).toEqual(['medicine']);
    expect(r.blocking.map((b) => b.field)).toEqual(['medicine']);
  });
});

describe('parseFriendReply', () => {
  const task = ist(2026, 11, 9, 17, 0);
  it('"5:30 la jamel" is a proposed time in the same half of the day', () => {
    const r = parseFriendReply('5:30 la jamel', task);
    expect(r.intent).toBe('propose');
    expect(r.proposedTime).toEqual(ist(2026, 11, 9, 17, 30));
  });
  it.each([['Yes!'], ['ho'], ['haan, chalega'], ['ok 👍']])('%s is yes', (t) => {
    expect(parseFriendReply(t, task).intent).toBe('yes');
  });
  it.each([['हो'], ['हाँ, ठीक है'], ['चालेल']])('Devanagari %s is yes', (t) => {
    expect(parseFriendReply(t, task).intent).toBe('yes');
  });
  it.each([['नहीं, माफ़ कीजिए'], ['नाही, माफ करा'], ['आज नको']])('Devanagari %s is no', (t) => {
    expect(parseFriendReply(t, task).intent).toBe('no');
  });
  it.each([['sorry, busy'], ['nahi'], ["can't today"]])('%s is no', (t) => {
    expect(parseFriendReply(t, task).intent).toBe('no');
  });
  it('the requested time itself counts as yes', () => {
    expect(parseFriendReply('5 pm works', task).intent).toBe('yes');
  });
  it('anything else stays unclear (never silently accepted)', () => {
    expect(parseFriendReply('who is this?', task).intent).toBe('unclear');
  });
});

describe('wallet and holds (PS-126)', () => {
  const e = (id: string, points: number, state: LedgerEntry['state'], at: Date, holdUntil?: Date): LedgerEntry =>
    ({ id, helperId: 's', householdId: 'h', taskId: id, points, state, reason: '', at, holdUntil });

  it('summarises earned, held, redeemed and coupons', () => {
    const entries = [e('a', 300, 'earned', ist(2026, 10, 1)), e('b', 250, 'earned', ist(2026, 11, 1)), e('c', 5, 'held', now), e('d', 500, 'redeemed', ist(2026, 11, 2))];
    const w = walletSummary(entries, 's', now);
    expect(w).toMatchObject({ earned: 550, held: 5, redeemed: 500, spendable: 50, couponsAvailable: 0, pointsToNextCoupon: 450 });
  });

  it('points older than 6 months expire; those near expiry are flagged', () => {
    const entries = [e('old', 100, 'earned', ist(2026, 4, 1)), e('soon', 100, 'earned', ist(2026, 5, 20))];
    const w = walletSummary(entries, 's', now);
    expect(w.earned).toBe(100);
    expect(w.expiringSoon).toBe(100);
  });

  it('redeems a coupon only with 500 spendable points', () => {
    expect(redeemCoupon([e('a', 495, 'earned', now)], 's', now, 'r')).toBeNull();
    expect(redeemCoupon([e('a', 500, 'earned', now)], 's', now, 'r')).toMatchObject({ state: 'redeemed', points: 500 });
  });

  it('a hold closes with a reason, or releases itself after 7 days', () => {
    const held = e('h', 5, 'held', now, ist(2026, 11, 16, 10, 0));
    expect(() => resolveHold(held, 'release', now, ' ')).toThrow();
    expect(resolveHold(held, 'release', now, 'Helper explained: bowl was refilled after the photo').state).toBe('released');
    expect(autoReleaseHolds([held], ist(2026, 11, 15))[0]!.state).toBe('held');
    expect(autoReleaseHolds([held], ist(2026, 11, 16, 10, 0))[0]!.state).toBe('released');
  });
});
