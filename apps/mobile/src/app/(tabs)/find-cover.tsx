// F4 Ask Pawsure, F5 suggestions, request state, O8 later options (PS-055 to PS-068, PS-123, PS-125).
// The LLM parser is not wired yet, so this uses the PS-125 plain form, which is
// also the permanent fallback when the AI is down, slow (8 s) or unsure.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { addMinutes, matchFriends, type CoverRequest, type FriendSearch, type TaskType } from '@pawsure/domain';
import { Avatar, Button, Card, Chip, ListItem, NoticeBanner, Screen, SectionHeader, space, Text, TextField, type IconName } from '../../design';
import { today } from '../../demo/data';
import { DemoClock } from '../../proto/DemoClock';
import { fmt, useProto } from '../../proto/store';

const TASKS: { type: TaskType; label: string; icon: IconName }[] = [
  { type: 'feeding', label: 'Feed', icon: 'food' },
  { type: 'water', label: 'Water', icon: 'water' },
  { type: 'walk', label: 'Short walk', icon: 'activity' },
  { type: 'medicine', label: 'Medicine', icon: 'medication' },
];
const TIMES = [16, 17, 18, 19];

const STATE_TEXT: Record<FriendSearch['state'], string> = {
  draft: 'Draft',
  ready_for_search: 'Ready to search',
  awaiting_owner_approval: 'Choose who to ask',
  sent: 'Sent on WhatsApp. Waiting for a reply.',
  provisional_hold: 'A friend said yes. Confirm within 10 minutes.',
  confirmed: 'Cover confirmed. Only the access details they need were shared.',
  completed: 'Cover completed.',
  expired: 'Nobody could help in time.',
  cancelled: 'You cancelled this request.',
  no_show: 'Your friend did not arrive. Alerts have resumed from the backup step.',
};

function labelOf(t: TaskType): string {
  return TASKS.find((x) => x.type === t)?.label ?? t;
}
function sentence(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default function FindCover() {
  const { state, dispatch, friends, now } = useProto();
  const [raw, setRaw] = useState('');
  const [types, setTypes] = useState<TaskType[]>(['feeding', 'walk']);
  const [hour, setHour] = useState(17);
  const [needsKey, setNeedsKey] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const search = state.friendSearch;

  const request: CoverRequest = useMemo(
    () => ({ taskTypes: types, window: { start: today(hour), end: today(hour, 30) }, needsKey, largeOrAnxiousDog: false }),
    [types, hour, needsKey],
  );
  const activeReq = state.coverRequest ?? request;
  const matches = useMemo(() => matchFriends(friends, activeReq), [friends, activeReq]);
  const nameOf = (id: string) => friends.find((f) => f.id === id)?.displayName ?? id;
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const taskWords: string[] = types.map((t) => labelOf(t).toLowerCase());
  const summary = taskWords.length ? `${sentence(taskWords.join(' + '))} for ${state.pet.name} at ${fmt(request.window.start)}${needsKey ? ' · key needed' : ''}` : 'Nothing selected';
  const done = search && ['completed', 'expired', 'cancelled', 'no_show'].includes(search.state);

  return (
    <Screen title="Find cover" subtitle="Your own friends first. Nobody is contacted until you approve.">
      {state.helper.unavailableToday ? <NoticeBanner icon="care" tone="alert" title={`${state.helper.name} can't come today`} body="Ask a friend to cover today's tasks." /> : null}

      {!search ? (
        <Card>
          <Text variant="subheading">Ask Pawsure</Text>
          <TextField icon="mic" value={raw} onChangeText={setRaw} multiline label="What do you need?"
            placeholder={`"Stuck till 8. Can someone feed ${state.pet.name} and take him down at 5?"`} />
          <Text variant="small" tone="muted">AI understanding is coming soon. For now, pick the details below.</Text>
          <Text variant="label">Tasks</Text>
          <View style={st.row}>
            {TASKS.map((t) => <Chip key={t.type} icon={t.icon} label={t.label} selected={types.includes(t.type)} onPress={() => setTypes((p) => toggle(p, t.type))} />)}
          </View>
          <Text variant="label">Time</Text>
          <View style={st.row}>
            {TIMES.map((h) => <Chip key={h} label={fmt(today(h))} selected={hour === h} onPress={() => setHour(h)} />)}
          </View>
          <Text variant="label">Key needed?</Text>
          <View style={st.row}>
            <Chip label="Yes" selected={needsKey} onPress={() => setNeedsKey(true)} />
            <Chip label="No" selected={!needsKey} onPress={() => setNeedsKey(false)} />
          </View>
          {types.includes('medicine') ? <Text variant="small" tone="muted">Only friends who opted into medicines will be suggested. Pawsure never suggests a dose.</Text> : null}
          <Card tone="brand">
            <Text variant="bodyStrong">{summary}</Text>
            <Text variant="small" tone="muted">Check this is right before we look for friends.</Text>
          </Card>
          <Button label="Looks right, find friends" disabled={!types.length || addMinutes(request.window.start, -30) <= now}
            onPress={() => dispatch({ type: 'start_cover', request: { ...request, summary } })} full />
          {addMinutes(request.window.start, -30) <= now ? <Text variant="small" tone="alert">Requests close 30 minutes before the task. Pick a later time.</Text> : null}
        </Card>
      ) : null}

      {search ? <DemoClock compact /> : null}

      {search?.state === 'awaiting_owner_approval' ? (
        <>
          <SectionHeader title="Nearest suitable friends" action="Edit request" onAction={() => { dispatch({ type: 'clear_cover' }); setPicked([]); }} />
          <Text variant="caption" tone="muted">{state.coverRequest?.summary}</Text>
          {matches.ranked.length === 0 ? <Card tone="alert"><Text variant="body">No friend is free and comfortable with these tasks. Try another time, or invite more friends.</Text></Card> : null}
          {matches.ranked.map((m, i) => {
            const on = picked.includes(m.friend.id);
            return (
              <Card key={m.friend.id} tone={on ? 'brand' : 'plain'}>
                <View style={st.friendHead}>
                  <Avatar label={m.friend.displayName} tone={i === 0 ? 'yellow' : 'beige'} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{m.friend.displayName}</Text>
                    <Text variant="caption" tone="muted">{m.reasons.join(' · ')}</Text>
                  </View>
                </View>
                <View style={st.row}>
                  <Chip label={on ? 'Selected' : 'Select'} selected={on} onPress={() => setPicked((p) => toggle(p, m.friend.id))} />
                  <Button label="Profile" kind="outlined" onPress={() => router.push(`/friend/${m.friend.id}`)} />
                </View>
              </Card>
            );
          })}
          {matches.ranked.length ? (
            <>
              <Card>
                <Text variant="label">Message preview (sent in each friend's language)</Text>
                <Text variant="caption">"Hi! Neha is asking if you can help with {state.pet.name}: {state.coverRequest?.summary.toLowerCase()}. Reply Yes, No, or suggest another time."</Text>
              </Card>
              <Button label={picked.length ? `Send request to ${picked.length}` : 'Select someone to ask'} disabled={!picked.length}
                onPress={() => dispatch({ type: 'friend', event: { type: 'owner_approves', at: now, friendIds: picked } })} full />
              {matches.ranked.length > 1 ? (
                <Button label={`Ask all ${matches.ranked.length}`} kind="secondary" full
                  onPress={() => dispatch({ type: 'friend', event: { type: 'owner_approves', at: now, friendIds: matches.ranked.map((m) => m.friend.id) } })} />
              ) : null}
              <Text variant="small" tone="muted">With "Ask all", the first yes holds the request for 10 minutes until you confirm; the others are told politely.</Text>
            </>
          ) : null}
        </>
      ) : null}

      {search && search.state !== 'awaiting_owner_approval' ? (
        <Card tone={search.state === 'confirmed' || search.state === 'completed' ? 'calm' : done ? 'alert' : 'plain'}>
          <Text variant="subheading">Request status</Text>
          <Text variant="body">{STATE_TEXT[search.state]}</Text>
          {search.expiresAt && search.state === 'sent' ? <Text variant="small" tone="muted">Expires {fmt(search.expiresAt)}. Recipients get one reminder at 8 minutes.</Text> : null}
          {search.recipients.map((r) => <Text key={r.friendId} variant="caption" tone="muted">{nameOf(r.friendId)}: {r.state.replace(/_/g, ' ')}</Text>)}
          {(search.state === 'sent' || search.state === 'provisional_hold') ? (
            <Button label={`Open ${nameOf(search.recipients[0]!.friendId)}'s WhatsApp (simulated)`} kind="outlined" onPress={() => router.push('/friend-request')} />
          ) : null}
          {search.state === 'sent' ? <Button label="Check for replies (advance 15 min)" kind="outlined" onPress={() => { dispatch({ type: 'advance', minutes: 15 }); dispatch({ type: 'friend', event: { type: 'tick', at: addMinutes(now, 15) } }); }} /> : null}
          {search.state === 'provisional_hold' && search.holdFriendId ? (
            <Button label={`Confirm ${nameOf(search.holdFriendId)}`} onPress={() => dispatch({ type: 'friend', event: { type: 'owner_confirms', at: now, friendId: search.holdFriendId! } })} />
          ) : null}
          {search.recipients.some((r) => r.state === 'proposed_time') ? (
            <Button label={`Accept ${nameOf(search.recipients.find((r) => r.state === 'proposed_time')!.friendId)}'s time`} kind="secondary"
              onPress={() => dispatch({ type: 'friend', event: { type: 'owner_accepts_proposal', at: now, friendId: search.recipients.find((r) => r.state === 'proposed_time')!.friendId } })} />
          ) : null}
          {search.state === 'confirmed' ? (
            <>
              <Button label="Friend arrived (simulate)" kind="outlined" onPress={() => dispatch({ type: 'friend', event: { type: 'friend_arrived', at: now } })} />
              <Button label="Mark cover completed" onPress={() => dispatch({ type: 'friend', event: { type: 'cover_completed', at: now } })} />
            </>
          ) : null}
          {search.state === 'expired' && !state.ownerPrivacy.nearbyFallback ? (
            <Text variant="small" tone="muted">Nearby members fallback is off until ID checks are approved. Try another time, ask your backup, or see later options below.</Text>
          ) : null}
          {done ? <Button label="Start again" kind="secondary" onPress={() => { dispatch({ type: 'clear_cover' }); setPicked([]); }} />
            : <Button label="Cancel request" kind="outlined" onPress={() => dispatch({ type: 'friend', event: { type: 'owner_cancels', at: now, reason: 'owner cancelled' } })} />}
        </Card>
      ) : null}

      <SectionHeader title="Later options" />
      <ListItem icon="home" title="Graded day cares" subtitle="Audited, with a live score and handover cards" meta="Preview · planned for P1" onPress={() => router.push('/later/daycares')} />
      <ListItem icon="shield" title="Verified carers" subtitle="ID-checked, trained, levels earned not bought" meta="Preview · planned for P2" onPress={() => router.push('/later/carers')} />
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  friendHead: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
});
