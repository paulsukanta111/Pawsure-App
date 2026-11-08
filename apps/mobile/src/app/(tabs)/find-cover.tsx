// AI Friend Finder (P0): F4 Ask Pawsure, F5 suggestions, request states, owner approval, reply parsing.
// PS-055 to PS-068, PS-123, PS-125, 9.1-9.5. The "AI" here is a simulated parser; rules decide
// eligibility and ranking (matchFriends); nothing is sent without the owner's approval.
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  addMinutes, ist, istDateKey, matchFriends, parseCoverText,
  type CoverRequest, type FriendSearch, type ParsedCoverRequest, type TaskType,
} from '@pawsure/domain';
import {
  Avatar, Button, Card, Chip, color, EmptyState, Icon, KeyValue, ListItem, Loading, NoticeBanner, radius, Screen,
  SectionHeader, space, Text, TextField, useToast, type IconName,
} from '../../design';
import { DemoClock } from '../../proto/DemoClock';
import { LANG_NAME, lowerFirst, requestMessage } from '../../proto/friendMessages';
import { fmt, useProto } from '../../proto/store';

const TASKS: { type: TaskType; label: string; icon: IconName }[] = [
  { type: 'feeding', label: 'Feed', icon: 'food' },
  { type: 'water', label: 'Water', icon: 'water' },
  { type: 'walk', label: 'Walk', icon: 'activity' },
  { type: 'medicine', label: 'Medicine', icon: 'medication' },
];
const EXAMPLES = [
  'My regular helper is unavailable tomorrow between 12 PM and 4 PM. Can someone feed Bruno and take him for a walk?',
  "I'm stuck in a meeting until 8. Can someone feed Bruno and take him down at 5? Spare key is with security.",
  'Can someone give Bruno his tablet at 2 pm tomorrow? Key needed.',
];
const STATE_TEXT: Record<FriendSearch['state'], string> = {
  draft: 'Draft', ready_for_search: 'Ready to search', awaiting_owner_approval: 'Choose who to ask',
  sent: 'Sent. Waiting for a reply.', provisional_hold: 'A friend said yes. Confirm within 10 minutes.',
  confirmed: 'Cover confirmed. Only the access details they need were shared.', completed: 'Cover completed.',
  expired: 'Nobody could help in time.', cancelled: 'You cancelled this request.', no_show: 'Your friend did not arrive. Alerts resumed from the backup step.',
};
const EXCLUSION_TEXT: Record<string, string> = {
  not_opted_in: 'not opted in', paused: 'paused', blocked: 'blocked', unavailable: 'busy at that time', over_capacity: 'already helping others',
  'missing_capability:medicine': 'not comfortable with medicines', 'missing_capability:short_walk': 'not comfortable with walks',
  'missing_capability:feeding_water': 'not comfortable with feeding', 'missing_capability:large_anxious_dog': 'not comfortable with large dogs',
};

interface Draft { tasks: TaskType[]; day: 'today' | 'tomorrow'; startH: number | null; startM: number; endH: number | null; endM: number; ampmPending: boolean; needsKey: boolean | null; medicineOk: boolean }

const ist24 = (d: Date) => { const t = new Date(d.getTime() + 330 * 60_000); return { h: t.getUTCHours(), m: t.getUTCMinutes() }; };

function draftFrom(p: ParsedCoverRequest): Draft {
  const s = p.start ? ist24(p.start) : null;
  const e = p.end ? ist24(p.end) : null;
  return {
    tasks: p.tasks, day: p.day, needsKey: p.needsKey, medicineOk: false,
    startH: s?.h ?? p.pendingHours?.startHour ?? null, startM: s?.m ?? p.pendingHours?.startMinute ?? 0,
    endH: e?.h ?? p.pendingHours?.endHour ?? null, endM: e?.m ?? p.pendingHours?.endMinute ?? 0,
    ampmPending: !!p.pendingHours,
  };
}
const label = (t: TaskType) => TASKS.find((x) => x.type === t)?.label ?? t;

export default function FindCover() {
  const { state, dispatch, friends, now } = useProto();
  const toast = useToast();
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'compose' | 'parsing' | 'confirm' | 'searching'>('compose');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const search = state.friendSearch;
  const pet = state.pet.name;

  // Simulated AI and matching delays, so the states are visible.
  useEffect(() => {
    if (phase === 'parsing') {
      const t = setTimeout(() => {
        const parsed = parseCoverText(text, now, pet);
        setDraft(draftFrom(parsed));
        dispatch({ type: 'ask', from: 'pawsure', text: parsed.understood.length ? `Here's what I understood. Please check before I look for friends.` : `I need a little more detail. Please fill in the card.`, kind: 'parse' });
        setPhase('confirm');
      }, 900);
      return () => clearTimeout(t);
    }
    if (phase === 'searching' && search) {
      const t = setTimeout(() => setPhase('compose'), 700);
      return () => clearTimeout(t);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const [y, mo, d] = istDateKey(now).split('-').map(Number) as [number, number, number];
  const request: (CoverRequest & { summary: string }) | null = useMemo(() => {
    if (!draft || draft.startH === null || draft.ampmPending) return null;
    const dd = draft.day === 'tomorrow' ? d + 1 : d;
    const start = ist(y, mo, dd, draft.startH, draft.startM);
    let end = draft.endH !== null ? ist(y, mo, dd, draft.endH, draft.endM) : addMinutes(start, 30);
    if (end <= start) end = addMinutes(start, 30);
    const words = draft.tasks.map((t) => label(t).toLowerCase()).join(' + ');
    const summary = `${words.charAt(0).toUpperCase()}${words.slice(1)} for ${pet}, ${draft.day} ${fmt(start)}–${fmt(end)}${draft.needsKey ? ', key needed' : draft.needsKey === false ? ', someone is home' : ''}`;
    return { taskTypes: draft.tasks, window: { start, end }, needsKey: !!draft.needsKey, largeOrAnxiousDog: false, summary };
  }, [draft, y, mo, d, pet]);

  const blocking: string[] = [];
  if (draft) {
    if (!draft.tasks.length) blocking.push('Choose at least one task');
    if (draft.startH === null) blocking.push('Choose a time');
    if (draft.ampmPending) blocking.push('Morning or evening?');
    if (draft.needsKey === null) blocking.push('Will they need a key?');
    if (draft.tasks.includes('medicine') && !draft.medicineOk) blocking.push('Confirm the medicine instructions');
    if (request && addMinutes(request.window.start, -30) <= now) blocking.push('Requests close 30 minutes before the task. Pick a later time.');
  }

  const activeReq = state.coverRequest;
  const matches = useMemo(() => (activeReq ? matchFriends(friends, activeReq) : null), [friends, activeReq]);
  const nameOf = (id: string) => friends.find((f) => f.id === id)?.displayName ?? id;
  const done = search && ['completed', 'expired', 'cancelled', 'no_show'].includes(search.state);

  const send = () => {
    if (!text.trim()) return;
    dispatch({ type: 'ask', from: 'owner', text: text.trim() });
    setPhase('parsing');
  };
  const startOver = () => { dispatch({ type: 'ask_reset' }); setDraft(null); setPicked([]); setText(''); setPhase('compose'); };
  const confirmDraft = () => {
    if (!request) return;
    dispatch({ type: 'start_cover', request });
    dispatch({ type: 'ask', from: 'pawsure', text: 'Checking your own friends first. Fixed rules check who is free and comfortable; nearest first.', kind: 'status' });
    setPhase('searching');
  };
  const approve = (ids: string[]) => {
    dispatch({ type: 'friend', event: { type: 'owner_approves', at: now, friendIds: ids } });
    dispatch({ type: 'ask', from: 'pawsure', text: `Sent to ${ids.map(nameOf).join(', ')} in their language (simulated: no real WhatsApp message).`, kind: 'status' });
    toast('Simulated: no real WhatsApp message was sent', 'info');
  };

  return (
    <Screen title="Find cover" subtitle="Ask Pawsure in your own words. Your friends first; nobody is contacted until you approve.">
      {state.helper.unavailableToday ? <NoticeBanner icon="care" tone="alert" title={`${state.helper.name} can't come today`} body="Your original plan is kept for the record." /> : null}

      {/* Conversation */}
      {state.askLog.length ? (
        <View style={st.chat}>
          {state.askLog.map((m) => (
            <View key={m.id} style={[st.bubble, m.from === 'owner' ? st.me : st.them]}>
              {m.from === 'pawsure' ? <Text variant="small" tone="muted">Pawsure (simulated AI)</Text> : null}
              <Text variant="body">{m.text}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {phase === 'parsing' ? <Loading label="Reading your request…" /> : null}
      {phase === 'searching' ? <Loading label="Checking your friends…" /> : null}

      {/* Compose */}
      {!search && phase === 'compose' && !draft ? (
        <Card>
          <TextField icon="mic" value={text} onChangeText={setText} multiline label="What do you need?"
            placeholder={`e.g. "Can someone feed ${pet} at 6 pm? Key needed."`} />
          <Button label="Ask Pawsure" icon="community" onPress={send} disabled={!text.trim()} full />
          <Text variant="label">Try an example</Text>
          {EXAMPLES.map((e) => (
            <Pressable key={e} accessibilityRole="button" onPress={() => setText(e)} style={st.example}>
              <Text variant="caption">{e}</Text>
            </Pressable>
          ))}
          <Button label="Use a simple form instead" kind="outlined" onPress={() => { setDraft({ tasks: [], day: 'today', startH: null, startM: 0, endH: null, endM: 0, ampmPending: false, needsKey: null, medicineOk: false }); setPhase('confirm'); }} full />
          <Text variant="small" tone="muted">The AI only reads your words. Who is free and who is suggested is decided by fixed rules, not by the AI.</Text>
        </Card>
      ) : null}

      {/* Interpretation card (PS-056): editable; search blocked until material fields are clear. */}
      {!search && phase === 'confirm' && draft ? (
        <Card tone="brand">
          <Text variant="subheading">Check the details</Text>
          <Text variant="label">Tasks</Text>
          <View style={st.row}>
            {TASKS.map((t) => (
              <Chip key={t.type} icon={t.icon} label={t.label} selected={draft.tasks.includes(t.type)}
                onPress={() => setDraft({ ...draft, tasks: draft.tasks.includes(t.type) ? draft.tasks.filter((x) => x !== t.type) : [...draft.tasks, t.type] })} />
            ))}
          </View>
          <Text variant="label">Day</Text>
          <View style={st.row}>
            <Chip label="Today" selected={draft.day === 'today'} onPress={() => setDraft({ ...draft, day: 'today' })} />
            <Chip label="Tomorrow" selected={draft.day === 'tomorrow'} onPress={() => setDraft({ ...draft, day: 'tomorrow' })} />
          </View>
          <Text variant="label">Time</Text>
          {draft.ampmPending && draft.startH !== null ? (
            <View style={{ gap: space.sm }}>
              <Text variant="caption" tone="alert">You wrote "{draft.startH}{draft.startM ? `:${String(draft.startM).padStart(2, '0')}` : ''}". Morning or evening?</Text>
              <View style={st.row}>
                <Chip label={`${draft.startH}:${String(draft.startM).padStart(2, '0')} am`} onPress={() => setDraft({ ...draft, startH: draft.startH! % 12, ampmPending: false })} />
                <Chip label={`${draft.startH}:${String(draft.startM).padStart(2, '0')} pm`} onPress={() => setDraft({ ...draft, startH: (draft.startH! % 12) + 12, endH: draft.endH !== null ? (draft.endH % 12) + 12 : null, ampmPending: false })} />
              </View>
            </View>
          ) : (
            <View style={st.row}>
              {[9, 11, 12, 14, 16, 17, 18, 19].map((h) => (
                <Chip key={h} label={fmt(ist(2026, 1, 1, h, 0))} selected={draft.startH === h && draft.startM === 0}
                  onPress={() => setDraft({ ...draft, startH: h, startM: 0, endH: draft.endH !== null && draft.endH > h ? draft.endH : null })} />
              ))}
            </View>
          )}
          {request ? <Text variant="caption">Window: {fmt(request.window.start)}–{fmt(request.window.end)}</Text> : null}
          <Text variant="label">Key needed?</Text>
          <View style={st.row}>
            <Chip label="Yes, key needed" selected={draft.needsKey === true} onPress={() => setDraft({ ...draft, needsKey: true })} />
            <Chip label="No, someone is home" selected={draft.needsKey === false} onPress={() => setDraft({ ...draft, needsKey: false })} />
          </View>
          {draft.tasks.includes('medicine') ? (
            <Chip label={`Use the instructions from ${pet}'s profile: ${state.pet.medicines}`} selected={draft.medicineOk} onPress={() => setDraft({ ...draft, medicineOk: !draft.medicineOk })} />
          ) : null}
          {blocking.length ? (
            <View style={{ gap: 2 }}>
              {blocking.map((b) => <Text key={b} variant="caption" tone="alert">• {b}</Text>)}
            </View>
          ) : <Text variant="bodyStrong">{request?.summary}</Text>}
          <Button label="Looks right, find friends" disabled={!!blocking.length} onPress={confirmDraft} full />
          <Button label="Start over" kind="outlined" onPress={startOver} full />
        </Card>
      ) : null}

      {/* Suggestions (F5) */}
      {search?.state === 'awaiting_owner_approval' && matches && phase !== 'searching' ? (
        matches.ranked.length === 0 ? (
          <>
            <EmptyState scene="empty" title="No friend is free for this" body={`${matches.excluded.length} friends checked: ${[...new Set(matches.excluded.flatMap((e) => e.reasons.map((r) => EXCLUSION_TEXT[r] ?? r)))].join(', ')}.`} />
            <Button label="Try another time" onPress={() => { dispatch({ type: 'clear_cover' }); setPhase('confirm'); }} full />
            <Button label="Invite more friends" kind="secondary" onPress={() => router.dismissTo('/friends')} full />
            <Button label="Ask nearby ID-checked members" kind="outlined" disabled onPress={() => {}} full />
            <Text variant="small" tone="muted">Nearby members aren't available yet: ID checks are not approved. Day cares and verified carers come in later releases.</Text>
            <Button label="Start over" kind="outlined" onPress={startOver} full />
          </>
        ) : (
          <>
            <SectionHeader title="Nearest suitable friends" />
            <Text variant="caption" tone="muted">{activeReq?.summary}</Text>
            {matches.ranked.map((m, i) => {
              const on = picked.includes(m.friend.id);
              const lang = state.friendLanguage[m.friend.id] ?? 'en';
              return (
                <Card key={m.friend.id} tone={on ? 'brand' : 'plain'}>
                  <View style={st.head}>
                    <Avatar label={m.friend.displayName} tone={i === 0 ? 'yellow' : 'beige'} />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyStrong">{i + 1}. {m.friend.displayName}</Text>
                      <Text variant="small" tone="muted">Speaks {LANG_NAME[lang]}</Text>
                    </View>
                    <Chip label={on ? 'Selected' : 'Select'} selected={on} onPress={() => setPicked((p) => (p.includes(m.friend.id) ? p.filter((x) => x !== m.friend.id) : [...p, m.friend.id]))} />
                  </View>
                  <Text variant="caption">Why: {m.reasons.join(' · ')}</Text>
                  {on ? (
                    <View style={st.preview}>
                      <Text variant="small" tone="muted">Message preview · {LANG_NAME[lang]}</Text>
                      <Text variant="caption">{requestMessage(lang, m.friend.displayName, state.profile.name, pet, lowerFirst(activeReq!.summary))}</Text>
                    </View>
                  ) : null}
                </Card>
              );
            })}
            {matches.excluded.length ? <Text variant="small" tone="muted">{matches.excluded.length} other friend{matches.excluded.length === 1 ? '' : 's'} not suggested ({[...new Set(matches.excluded.flatMap((e) => e.reasons.map((r) => EXCLUSION_TEXT[r] ?? r)))].join(', ')}).</Text> : null}
            <Button label={picked.length ? `Approve and send to ${picked.length}` : 'Select who to ask'} disabled={!picked.length} onPress={() => approve(picked)} full />
            {matches.ranked.length > 1 ? <Button label={`Ask all ${matches.ranked.length}`} kind="secondary" onPress={() => approve(matches.ranked.map((m) => m.friend.id))} full /> : null}
            <Text variant="small" tone="muted">With "Ask all", the first yes holds the request for 10 minutes until you confirm; the others are told politely. Your address is never in the first message.</Text>
            <Button label="Start over" kind="outlined" onPress={startOver} full />
          </>
        )
      ) : null}

      {/* Request status */}
      {search && search.state !== 'awaiting_owner_approval' ? (
        <>
          <DemoClock compact />
          <Card tone={search.state === 'confirmed' || search.state === 'completed' ? 'calm' : done ? 'alert' : 'plain'}>
            <Text variant="subheading">Request status</Text>
            <Text variant="body">{STATE_TEXT[search.state]}</Text>
            <KeyValue k="Request" v={activeReq?.summary ?? ''} />
            {search.sentAt ? <KeyValue k="Sent" v={fmt(search.sentAt)} /> : null}
            {search.state === 'sent' && search.expiresAt ? <KeyValue k="Reminder / expiry" v={`${fmt(addMinutes(search.sentAt!, 8))} / ${fmt(search.expiresAt)}`} /> : null}
            {search.state === 'provisional_hold' && search.holdStartedAt ? <KeyValue k="Hold ends" v={fmt(addMinutes(search.holdStartedAt, 10))} /> : null}
            {search.recipients.map((r) => <KeyValue key={r.friendId} k={nameOf(r.friendId)} v={r.state.replace(/_/g, ' ')} tone={r.state === 'confirmed' ? 'success' : r.state === 'declined' || r.state === 'expired' ? 'alert' : undefined} />)}
          </Card>

          {state.friendReplies.length ? (
            <>
              <SectionHeader title="Replies" />
              {state.friendReplies.map((r, i) => (
                <ListItem key={i} icon="community" title={`${nameOf(r.friendId)}: "${r.text}"`} subtitle={`Pawsure read this as: ${r.interpretation}`} meta={fmt(r.at)} />
              ))}
            </>
          ) : null}

          {search.state === 'sent' || search.state === 'provisional_hold' ? (
            <Button label={`Open ${nameOf(search.holdFriendId ?? search.recipients.find((r) => r.state === 'pending')?.friendId ?? search.recipients[0]!.friendId)}'s phone (simulated)`} kind="secondary" icon="phone" onPress={() => router.push('/friend-request')} full />
          ) : null}
          {search.state === 'provisional_hold' && search.holdFriendId ? (
            <Button label={`Confirm ${nameOf(search.holdFriendId)}`} onPress={() => { dispatch({ type: 'friend', event: { type: 'owner_confirms', at: now, friendId: search.holdFriendId! } }); toast(`${nameOf(search.holdFriendId!)} confirmed. Access details shared for this visit only`); }} full />
          ) : null}
          {search.recipients.some((r) => r.state === 'proposed_time') ? (() => {
            const r = search.recipients.find((x) => x.state === 'proposed_time')!;
            return <Button label={`Accept ${nameOf(r.friendId)}'s time: ${fmt(r.proposedTime!)}`} kind="secondary" onPress={() => dispatch({ type: 'friend', event: { type: 'owner_accepts_proposal', at: now, friendId: r.friendId } })} full />;
          })() : null}
          {search.state === 'sent' || search.state === 'provisional_hold' ? (
            <Button label="Wait 15 minutes (demo)" kind="outlined" icon="clock" onPress={() => { dispatch({ type: 'advance', minutes: 15 }); dispatch({ type: 'friend', event: { type: 'tick', at: addMinutes(now, 15) } }); }} full />
          ) : null}
          {search.state === 'confirmed' ? (
            <>
              <NoticeBanner icon="key" tone="calm" title="Shared with your friend for this visit" body="Flat number, spare-key note and the emergency card. Revoked automatically after the visit or if anyone cancels." />
              <Button label="Friend arrived (simulate)" kind="outlined" onPress={() => dispatch({ type: 'friend', event: { type: 'friend_arrived', at: now } })} full />
              <Button label="Mark cover completed" onPress={() => { dispatch({ type: 'friend', event: { type: 'cover_completed', at: now } }); toast('Cover completed. Say thanks on WhatsApp?'); }} full />
            </>
          ) : null}
          {search.state === 'expired' ? (
            <EmptyState scene="empty" title="No reply in time" body="Requests expire after 15 minutes so friends aren't chased. Try another time, or ask your backup." action="Try again" onAction={() => { dispatch({ type: 'clear_cover' }); setPhase('confirm'); }} />
          ) : null}
          {done ? <Button label="New request" kind="secondary" onPress={startOver} full />
            : <Button label="Cancel request" kind="outlined" onPress={() => dispatch({ type: 'friend', event: { type: 'owner_cancels', at: now, reason: 'owner cancelled' } })} full />}
        </>
      ) : null}

      <SectionHeader title="Later options" />
      <ListItem icon="home" title="Graded day cares" subtitle="Preview only, planned for P1. Not bookable." onPress={() => router.push('/later/daycares')} />
      <ListItem icon="shield" title="Verified carers" subtitle="Preview only, planned for P2. Not bookable." onPress={() => router.push('/later/carers')} />
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  head: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  chat: { gap: space.sm },
  bubble: { maxWidth: '88%', padding: space.md, borderRadius: radius.lg, borderWidth: 1, gap: 2 },
  me: { alignSelf: 'flex-end', backgroundColor: color.bg.selected, borderColor: color.border.strong, borderTopRightRadius: radius.xs },
  them: { alignSelf: 'flex-start', backgroundColor: color.bg.raised, borderColor: color.border.subtle, borderTopLeftRadius: radius.xs },
  example: { padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: color.border.subtle, backgroundColor: color.bg.canvas },
  preview: { padding: space.md, borderRadius: radius.md, backgroundColor: color.bg.canvas, borderWidth: 1, borderStyle: 'dashed', borderColor: color.border.control, gap: 4 },
});
