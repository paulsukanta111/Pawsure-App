// Friend Finder: 9.2 matching, 9.4 state machine, PS-123 timers, 17.1 scenarios.
import { describe, expect, it } from 'vitest';
import {
  addMinutes, ist, matchFriends, newSearch, reduceFriendSearch,
  type FriendCandidate, type FriendEvent, type FriendSearch, type CoverRequest,
} from '../src';

const at = (h: number, m: number) => ist(2026, 11, 9, h, m);
const req: CoverRequest = { taskTypes: ['feeding', 'walk'], window: { start: at(17, 0), end: at(17, 30) }, needsKey: true, largeOrAnxiousDog: false };

const friend = (id: string, over: Partial<FriendCandidate> = {}): FriendCandidate => ({
  id, displayName: id, discoveryOptIn: true, paused: false, blockedWithOwner: false,
  availability: [{ start: at(16, 0), end: at(19, 0) }],
  capabilities: new Set(['feeding_water', 'short_walk']),
  distanceBand: 'same_society', distanceLabel: 'same society', keyStatus: 'no_key',
  openRequests: 0, maxOpenRequests: 2, ...over,
});

describe('matching (9.2)', () => {
  it('ranks nearest first and explains why', () => {
    const r = matchFriends([friend('far', { distanceBand: 'nearby', distanceLabel: 'about 5 min away' }), friend('tower', { distanceBand: 'same_tower', distanceLabel: 'same tower' })], req);
    expect(r.ranked.map((m) => m.friend.id)).toEqual(['tower', 'far']);
    expect(r.ranked[0]!.reasons).toContain('same tower');
  });

  it('excludes paused, opted-out, blocked, unavailable and over-capacity friends', () => {
    const r = matchFriends([
      friend('paused', { paused: true }),
      friend('optout', { discoveryOptIn: false }),
      friend('blocked', { blockedWithOwner: true }),
      friend('busy', { availability: [{ start: at(9, 0), end: at(12, 0) }] }),
      friend('full', { openRequests: 2 }),
      friend('ok'),
    ], req);
    expect(r.ranked.map((m) => m.friend.id)).toEqual(['ok']);
    expect(r.excluded.find((e) => e.friendId === 'paused')?.reasons).toEqual(['paused']);
  });

  it('medicine exclusion: a friend not opted into medicines never appears for a medicine task (17.1)', () => {
    const medReq = { ...req, taskTypes: ['medicine' as const] };
    const r = matchFriends([friend('nomed'), friend('med', { capabilities: new Set(['medicine']) })], medReq);
    expect(r.ranked.map((m) => m.friend.id)).toEqual(['med']);
    expect(r.excluded[0]!.reasons).toContain('missing_capability:medicine');
  });

  it('returns at most three suggestions, in a stable order', () => {
    const r = matchFriends(['d', 'c', 'b', 'a'].map((id) => friend(id)), req);
    expect(r.ranked.map((m) => m.friend.id)).toEqual(['a', 'b', 'c']);
  });
});

// --- state machine -----------------------------------------------------------

const run = (events: FriendEvent[], start = newSearch('fs1', at(17, 0))) => {
  let s: FriendSearch = start;
  const effects = [];
  for (const e of events) {
    const t = reduceFriendSearch(s, e);
    s = t.state;
    effects.push(...t.effects);
  }
  return { s, effects };
};
const sentTo = (ids: string[], when = at(15, 0)): FriendEvent[] => [
  { type: 'owner_confirms_summary', at: when },
  { type: 'suggestions_shown', at: when },
  { type: 'owner_approves', at: when, friendIds: ids },
];
const reply = (friendId: string, response: 'yes' | 'no' | 'propose', when: Date, messageId = `${friendId}-${when.getTime()}`): FriendEvent =>
  ({ type: 'friend_reply', at: when, friendId, response, messageId });

describe('request state machine (9.4, PS-123)', () => {
  it('nothing is sent until the owner approves (9.5)', () => {
    const { s, effects } = run(sentTo(['a']).slice(0, 2));
    expect(s.state).toBe('awaiting_owner_approval');
    expect(effects).toEqual([]);
  });

  it('happy path: approve -> yes -> provisional hold -> owner confirms -> access disclosed', () => {
    const { s, effects } = run([...sentTo(['a']), reply('a', 'yes', at(15, 4)), { type: 'owner_confirms', at: at(15, 5), friendId: 'a' }]);
    expect(s.state).toBe('confirmed');
    expect(effects).toContainEqual({ type: 'disclose_access', friendId: 'a' });
  });

  it('ask all 3: first yes holds; later yes waits; confirming withdraws the others; no duplicate cover', () => {
    const { s, effects } = run([
      ...sentTo(['a', 'b', 'c']),
      reply('b', 'yes', at(15, 2)),
      reply('a', 'yes', at(15, 3)),
      { type: 'owner_confirms', at: at(15, 4), friendId: 'b' },
      reply('c', 'yes', at(15, 6)),
    ]);
    expect(s.confirmedFriendId).toBe('b');
    expect(s.recipients.find((r) => r.friendId === 'a')!.state).toBe('withdrawn');
    expect(effects.filter((e) => e.type === 'disclose_access')).toHaveLength(1);
    expect(effects).toContainEqual({ type: 'send_already_covered', friendId: 'c' });
  });

  it('duplicate webhooks (same message id) are ignored', () => {
    const r1 = reply('a', 'yes', at(15, 2), 'msg-1');
    const { s, effects } = run([...sentTo(['a', 'b']), r1, r1]);
    expect(s.state).toBe('provisional_hold');
    expect(effects.filter((e) => e.type === 'notify_owner')).toHaveLength(1);
  });

  it('reminder at 8 min, expiry at 15 min with fallback offered', () => {
    const { s, effects } = run([...sentTo(['a']), { type: 'tick', at: at(15, 8) }, { type: 'tick', at: at(15, 15) }]);
    expect(effects).toContainEqual({ type: 'remind_recipients', friendIds: ['a'] });
    expect(s.state).toBe('expired');
    expect(effects).toContainEqual({ type: 'offer_fallback' });
  });

  it('search closes 30 min before the task even if 15 min have not passed', () => {
    const { s } = run([...sentTo(['a'], at(16, 25)), { type: 'tick', at: at(16, 30) }]);
    expect(s.state).toBe('expired');
  });

  it('hold: owner reminded once at 5 min, released at 10 min, next waiting yes takes the hold', () => {
    const { s, effects } = run([
      ...sentTo(['a', 'b']),
      reply('a', 'yes', at(15, 1)),
      reply('b', 'yes', at(15, 2)),
      { type: 'tick', at: at(15, 6) },
      { type: 'tick', at: at(15, 7) },
      { type: 'tick', at: at(15, 11) },
    ]);
    expect(effects.filter((e) => e.type === 'remind_owner_to_confirm')).toHaveLength(1);
    expect(s.state).toBe('provisional_hold');
    expect(s.holdFriendId).toBe('b');
  });

  it('all decline -> expired with fallback', () => {
    const { s } = run([...sentTo(['a', 'b']), reply('a', 'no', at(15, 1)), reply('b', 'no', at(15, 2))]);
    expect(s.state).toBe('expired');
  });

  it('friend cancels after confirming: owner alerted, access revoked, search reopens without that friend', () => {
    const { s, effects } = run([
      ...sentTo(['a']), reply('a', 'yes', at(15, 1)), { type: 'owner_confirms', at: at(15, 2), friendId: 'a' },
      { type: 'friend_cancels', at: at(16, 0), friendId: 'a', messageId: 'c1' },
    ]);
    expect(s.state).toBe('awaiting_owner_approval');
    expect(s.excludedFriendIds).toEqual(['a']);
    expect(effects).toContainEqual({ type: 'revoke_access', friendId: 'a' });
    expect(() => reduceFriendSearch(s, { type: 'owner_approves', at: at(16, 1), friendIds: ['a'] })).toThrow();
  });

  it('friend no-show: no signal by task time + 20 min alerts owner and resumes the ladder at the backup step (17.1)', () => {
    const { s, effects } = run([
      ...sentTo(['a']), reply('a', 'yes', at(15, 1)), { type: 'owner_confirms', at: at(15, 2), friendId: 'a' },
      { type: 'tick', at: at(17, 19) }, { type: 'tick', at: at(17, 20) },
    ]);
    expect(s.state).toBe('no_show');
    expect(effects).toContainEqual({ type: 'resume_escalation_from_backup' });
  });

  it('task changed after acceptance: friend must reconfirm and access is revoked meanwhile', () => {
    const { s, effects } = run([
      ...sentTo(['a']), reply('a', 'yes', at(15, 1)), { type: 'owner_confirms', at: at(15, 2), friendId: 'a' },
      { type: 'task_edited', at: at(15, 30), newTaskStart: at(18, 0) },
    ]);
    expect(s.state).toBe('sent');
    expect(effects).toContainEqual({ type: 'ask_reconfirm', friendId: 'a' });
    expect(effects).toContainEqual({ type: 'revoke_access', friendId: 'a' });
  });

  it('proposed time needs owner confirmation before the task changes (PS-067)', () => {
    const proposal: FriendEvent = { type: 'friend_reply', at: at(15, 1), friendId: 'a', response: 'propose', proposedTime: at(17, 30), messageId: 'p1' };
    const { s } = run([...sentTo(['a']), proposal]);
    expect(s.taskStart).toEqual(at(17, 0));
    const t = reduceFriendSearch(s, { type: 'owner_accepts_proposal', at: at(15, 2), friendId: 'a' });
    expect(t.state.state).toBe('confirmed');
    expect(t.state.taskStart).toEqual(at(17, 30));
  });

  it('owner can cancel at any open state; confirmed access is revoked', () => {
    const { s, effects } = run([
      ...sentTo(['a']), reply('a', 'yes', at(15, 1)), { type: 'owner_confirms', at: at(15, 2), friendId: 'a' },
      { type: 'owner_cancels', at: at(15, 3), reason: 'came home early' },
    ]);
    expect(s.state).toBe('cancelled');
    expect(effects).toContainEqual({ type: 'revoke_access', friendId: 'a' });
  });

  it('no more than three recipients per approval', () => {
    expect(() => run(sentTo(['a', 'b', 'c', 'd']))).toThrow();
  });

  it('expiry is computed from approval time', () => {
    const { s } = run(sentTo(['a']));
    expect(s.expiresAt).toEqual(addMinutes(at(15, 0), 15));
  });
});
