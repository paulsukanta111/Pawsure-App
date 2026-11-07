/**
 * Friend Finder request state machine (9.4, PS-059 to PS-063, PS-067, PS-068, PS-123).
 *
 * A pure reducer: (state, event) -> { state, effects }. The backend persists the
 * state, runs the effects (WhatsApp sends, access disclosure, alerts) and feeds
 * `tick` events from durable timers. Every inbound WhatsApp reply carries a
 * message id; replays of the same id are ignored (idempotency).
 */
import { addMinutes } from './time';

export interface FriendTimers {
  requestExpiryMinutes: number;
  recipientReminderMinutes: number;
  holdMinutes: number;
  ownerHoldReminderMinutes: number;
  closeBeforeTaskMinutes: number;
  noShowAfterTaskMinutes: number;
}

/** PS-123 defaults. */
export const DEFAULT_FRIEND_TIMERS: FriendTimers = {
  requestExpiryMinutes: 15,
  recipientReminderMinutes: 8,
  holdMinutes: 10,
  ownerHoldReminderMinutes: 5,
  closeBeforeTaskMinutes: 30,
  noShowAfterTaskMinutes: 20,
};

export type SearchState =
  | 'draft'
  | 'ready_for_search'
  | 'awaiting_owner_approval'
  | 'sent'
  | 'provisional_hold'
  | 'confirmed'
  | 'completed'
  | 'expired'
  | 'cancelled'
  | 'no_show';

export type RecipientState =
  | 'pending'
  | 'accepted_waiting'
  | 'holding'
  | 'proposed_time'
  | 'declined'
  | 'expired'
  | 'withdrawn'
  | 'confirmed'
  | 'cancelled_by_friend';

export interface Recipient {
  friendId: string;
  state: RecipientState;
  respondedAt?: Date;
  proposedTime?: Date;
}

export interface FriendSearch {
  id: string;
  state: SearchState;
  taskStart: Date;
  recipients: Recipient[];
  excludedFriendIds: string[];
  sentAt?: Date;
  expiresAt?: Date;
  recipientReminderSent: boolean;
  holdFriendId?: string;
  holdStartedAt?: Date;
  ownerHoldReminderSent: boolean;
  confirmedFriendId?: string;
  friendArrived: boolean;
  processedMessageIds: string[];
}

export type FriendEvent =
  | { type: 'owner_confirms_summary'; at: Date }
  | { type: 'suggestions_shown'; at: Date }
  | { type: 'owner_approves'; at: Date; friendIds: string[] }
  | { type: 'friend_reply'; at: Date; messageId: string; friendId: string; response: 'yes' | 'no' | 'propose'; proposedTime?: Date }
  | { type: 'owner_confirms'; at: Date; friendId: string }
  | { type: 'owner_accepts_proposal'; at: Date; friendId: string }
  | { type: 'owner_cancels'; at: Date; reason: string }
  | { type: 'friend_cancels'; at: Date; messageId: string; friendId: string }
  | { type: 'task_edited'; at: Date; newTaskStart: Date }
  | { type: 'friend_arrived'; at: Date }
  | { type: 'cover_completed'; at: Date }
  | { type: 'tick'; at: Date };

export type FriendEffect =
  | { type: 'send_request'; friendIds: string[] }
  | { type: 'remind_recipients'; friendIds: string[] }
  | { type: 'tell_waiting_for_owner'; friendIds: string[] }
  | { type: 'notify_owner'; message: 'friend_accepted' | 'friend_declined' | 'friend_proposed_time' | 'friend_cancelled' | 'no_response' | 'no_show' | 'hold_released' }
  | { type: 'remind_owner_to_confirm'; friendId: string }
  | { type: 'disclose_access'; friendId: string }
  | { type: 'revoke_access'; friendId: string }
  | { type: 'withdraw_requests'; friendIds: string[] }
  | { type: 'send_already_covered'; friendId: string }
  | { type: 'ask_reconfirm'; friendId: string }
  | { type: 'create_cover_task'; friendId: string }
  | { type: 'offer_fallback' }
  | { type: 'resume_escalation_from_backup' }
  | { type: 'offer_thank_you'; friendId: string };

export interface Transition { state: FriendSearch; effects: FriendEffect[] }

export class FriendRequestError extends Error {}

const TERMINAL: SearchState[] = ['completed', 'expired', 'cancelled', 'no_show'];

export function newSearch(id: string, taskStart: Date): FriendSearch {
  return {
    id, state: 'draft', taskStart, recipients: [], excludedFriendIds: [],
    recipientReminderSent: false, ownerHoldReminderSent: false, friendArrived: false, processedMessageIds: [],
  };
}

export function reduceFriendSearch(s: FriendSearch, e: FriendEvent, t: FriendTimers = DEFAULT_FRIEND_TIMERS): Transition {
  // Idempotency for inbound webhooks.
  if ((e.type === 'friend_reply' || e.type === 'friend_cancels') && s.processedMessageIds.includes(e.messageId)) {
    return { state: s, effects: [] };
  }
  const next: FriendSearch = {
    ...s,
    recipients: s.recipients.map((r) => ({ ...r })),
    processedMessageIds: 'messageId' in e ? [...s.processedMessageIds, e.messageId] : s.processedMessageIds,
  };
  const fx: FriendEffect[] = [];
  const rec = (id: string) => next.recipients.find((r) => r.friendId === id);
  const open = () => next.recipients.filter((r) => r.state === 'pending' || r.state === 'accepted_waiting' || r.state === 'proposed_time');

  if (TERMINAL.includes(s.state) && e.type !== 'friend_reply' && e.type !== 'tick') {
    throw new FriendRequestError(`Search ${s.id} is ${s.state}`);
  }

  switch (e.type) {
    case 'owner_confirms_summary':
      expect(s, 'draft');
      next.state = 'ready_for_search';
      break;

    case 'suggestions_shown':
      expect(s, 'ready_for_search');
      next.state = 'awaiting_owner_approval';
      break;

    case 'owner_approves': {
      expect(s, 'awaiting_owner_approval');
      const ids = e.friendIds.filter((id) => !next.excludedFriendIds.includes(id));
      if (ids.length === 0 || ids.length > 3) throw new FriendRequestError('Approve between 1 and 3 eligible friends');
      next.recipients = ids.map((friendId) => ({ friendId, state: 'pending' as const }));
      next.state = 'sent';
      next.sentAt = e.at;
      next.expiresAt = minDate(addMinutes(e.at, t.requestExpiryMinutes), addMinutes(next.taskStart, -t.closeBeforeTaskMinutes));
      next.recipientReminderSent = false;
      fx.push({ type: 'send_request', friendIds: ids });
      break;
    }

    case 'friend_reply': {
      const r = rec(e.friendId);
      if (!r) break; // Not a recipient of this search: ignore.
      if (TERMINAL.includes(s.state) || s.state === 'confirmed' || !['pending', 'accepted_waiting'].includes(r.state)) {
        if (e.response === 'yes') fx.push({ type: 'send_already_covered', friendId: e.friendId });
        break; // Late reply: polite message, no state change.
      }
      r.respondedAt = e.at;
      if (e.response === 'no') {
        r.state = 'declined';
        fx.push({ type: 'notify_owner', message: 'friend_declined' });
        endIfNobodyLeft(next, fx);
      } else if (e.response === 'propose') {
        r.state = 'proposed_time';
        r.proposedTime = e.proposedTime;
        fx.push({ type: 'notify_owner', message: 'friend_proposed_time' });
      } else if (s.state === 'sent') {
        startHold(next, r, e.at, fx);
      } else {
        r.state = 'accepted_waiting';
        fx.push({ type: 'tell_waiting_for_owner', friendIds: [r.friendId] });
      }
      break;
    }

    case 'owner_confirms': {
      expect(s, 'provisional_hold');
      if (next.holdFriendId !== e.friendId) throw new FriendRequestError('Can only confirm the friend holding the request');
      confirmFriend(next, e.friendId, fx);
      break;
    }

    case 'owner_accepts_proposal': {
      if (s.state !== 'sent' && s.state !== 'provisional_hold') throw new FriendRequestError(`Cannot accept a proposal while ${s.state}`);
      const r = rec(e.friendId);
      if (r?.state !== 'proposed_time' || !r.proposedTime) throw new FriendRequestError('No proposed time from that friend');
      next.taskStart = r.proposedTime;
      if (next.holdFriendId && next.holdFriendId !== e.friendId) rec(next.holdFriendId)!.state = 'withdrawn';
      confirmFriend(next, e.friendId, fx);
      break;
    }

    case 'owner_cancels': {
      if (next.confirmedFriendId) fx.push({ type: 'revoke_access', friendId: next.confirmedFriendId });
      const ids = open().map((r) => r.friendId).concat(next.holdFriendId ? [next.holdFriendId] : []);
      if (ids.length) fx.push({ type: 'withdraw_requests', friendIds: ids });
      next.recipients.forEach((r) => { if (r.state !== 'declined' && r.state !== 'expired') r.state = 'withdrawn'; });
      next.state = 'cancelled';
      break;
    }

    case 'friend_cancels': {
      const r = rec(e.friendId);
      if (!r) break;
      if (s.state === 'confirmed' && next.confirmedFriendId === e.friendId) {
        r.state = 'cancelled_by_friend';
        next.excludedFriendIds = [...next.excludedFriendIds, e.friendId];
        next.confirmedFriendId = undefined;
        fx.push({ type: 'revoke_access', friendId: e.friendId }, { type: 'notify_owner', message: 'friend_cancelled' });
        // Search reopens, but every new outbound request needs fresh owner approval.
        next.state = 'awaiting_owner_approval';
      } else if (s.state === 'provisional_hold' && next.holdFriendId === e.friendId) {
        r.state = 'cancelled_by_friend';
        releaseHold(next, e.at, fx, t);
      } else if (['pending', 'accepted_waiting', 'proposed_time'].includes(r.state)) {
        r.state = 'declined';
        endIfNobodyLeft(next, fx);
      }
      break;
    }

    case 'task_edited': {
      next.taskStart = e.newTaskStart;
      const holder = next.confirmedFriendId ?? next.holdFriendId;
      if (holder && (s.state === 'confirmed' || s.state === 'provisional_hold')) {
        rec(holder)!.state = 'pending';
        next.confirmedFriendId = undefined;
        next.holdFriendId = undefined;
        next.state = 'sent';
        next.sentAt = e.at;
        next.expiresAt = minDate(addMinutes(e.at, t.requestExpiryMinutes), addMinutes(next.taskStart, -t.closeBeforeTaskMinutes));
        next.recipientReminderSent = false;
        if (s.state === 'confirmed') fx.push({ type: 'revoke_access', friendId: holder });
        fx.push({ type: 'ask_reconfirm', friendId: holder });
      }
      break;
    }

    case 'friend_arrived':
      expect(s, 'confirmed');
      next.friendArrived = true;
      break;

    case 'cover_completed':
      expect(s, 'confirmed');
      next.state = 'completed';
      fx.push({ type: 'offer_thank_you', friendId: next.confirmedFriendId! });
      break;

    case 'tick':
      onTick(next, e.at, fx, t);
      break;
  }
  return { state: next, effects: fx };
}

function onTick(s: FriendSearch, now: Date, fx: FriendEffect[], t: FriendTimers) {
  if (s.state === 'sent' && s.sentAt && s.expiresAt) {
    if (now >= s.expiresAt) {
      const pending = s.recipients.filter((r) => r.state === 'pending' || r.state === 'proposed_time');
      pending.forEach((r) => (r.state = 'expired'));
      if (pending.length) fx.push({ type: 'withdraw_requests', friendIds: pending.map((r) => r.friendId) });
      s.state = 'expired';
      fx.push({ type: 'notify_owner', message: 'no_response' }, { type: 'offer_fallback' });
      return;
    }
    if (!s.recipientReminderSent && now >= addMinutes(s.sentAt, t.recipientReminderMinutes)) {
      s.recipientReminderSent = true;
      const ids = s.recipients.filter((r) => r.state === 'pending').map((r) => r.friendId);
      if (ids.length) fx.push({ type: 'remind_recipients', friendIds: ids });
    }
  } else if (s.state === 'provisional_hold' && s.holdStartedAt) {
    if (now >= addMinutes(s.holdStartedAt, t.holdMinutes)) {
      const holder = s.recipients.find((r) => r.friendId === s.holdFriendId);
      if (holder) holder.state = 'withdrawn';
      fx.push({ type: 'notify_owner', message: 'hold_released' });
      releaseHold(s, now, fx, t);
    } else if (!s.ownerHoldReminderSent && now >= addMinutes(s.holdStartedAt, t.ownerHoldReminderMinutes)) {
      s.ownerHoldReminderSent = true;
      fx.push({ type: 'remind_owner_to_confirm', friendId: s.holdFriendId! });
    }
  } else if (s.state === 'confirmed' && !s.friendArrived && now >= addMinutes(s.taskStart, t.noShowAfterTaskMinutes)) {
    s.state = 'no_show';
    fx.push({ type: 'revoke_access', friendId: s.confirmedFriendId! });
    fx.push({ type: 'notify_owner', message: 'no_show' }, { type: 'resume_escalation_from_backup' });
  }
}

function startHold(s: FriendSearch, r: Recipient, at: Date, fx: FriendEffect[]) {
  r.state = 'holding';
  s.state = 'provisional_hold';
  s.holdFriendId = r.friendId;
  s.holdStartedAt = at;
  s.ownerHoldReminderSent = false;
  fx.push({ type: 'notify_owner', message: 'friend_accepted' });
  const others = s.recipients.filter((o) => o.state === 'pending').map((o) => o.friendId);
  if (others.length) fx.push({ type: 'tell_waiting_for_owner', friendIds: others });
}

function releaseHold(s: FriendSearch, now: Date, fx: FriendEffect[], t: FriendTimers) {
  s.holdFriendId = undefined;
  s.holdStartedAt = undefined;
  const waiting = s.recipients.find((r) => r.state === 'accepted_waiting');
  if (waiting) {
    s.state = 'sent';
    startHold(s, waiting, now, fx);
    return;
  }
  s.state = 'sent';
  if (s.expiresAt && now >= s.expiresAt) onTick(s, now, fx, t);
  else endIfNobodyLeft(s, fx);
}

function confirmFriend(s: FriendSearch, friendId: string, fx: FriendEffect[]) {
  const others = s.recipients.filter((r) => r.friendId !== friendId && ['pending', 'accepted_waiting', 'proposed_time', 'holding'].includes(r.state));
  others.forEach((r) => (r.state = 'withdrawn'));
  s.recipients.find((r) => r.friendId === friendId)!.state = 'confirmed';
  s.state = 'confirmed';
  s.confirmedFriendId = friendId;
  s.holdFriendId = undefined;
  s.holdStartedAt = undefined;
  // Minimum necessary access only after acceptance AND owner confirmation (PS-063, 9.5).
  fx.push({ type: 'disclose_access', friendId }, { type: 'create_cover_task', friendId });
  if (others.length) fx.push({ type: 'withdraw_requests', friendIds: others.map((r) => r.friendId) });
}

function endIfNobodyLeft(s: FriendSearch, fx: FriendEffect[]) {
  if (s.state !== 'sent') return;
  const live = s.recipients.some((r) => ['pending', 'accepted_waiting', 'proposed_time', 'holding'].includes(r.state));
  if (!live) {
    s.state = 'expired';
    fx.push({ type: 'offer_fallback' });
  }
}

function expect(s: FriendSearch, state: SearchState) {
  if (s.state !== state) throw new FriendRequestError(`Expected ${state}, search ${s.id} is ${s.state}`);
}

const minDate = (a: Date, b: Date) => (a < b ? a : b);
