// F4 Ask Pawsure, F5 suggestions, request state (PS-055 to PS-068, PS-123, PS-125).
// The LLM parser is not wired yet, so this uses the PS-125 plain form, which is
// also the permanent fallback when the AI is down, slow (8 s) or unsure.
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  matchFriends, newSearch, reduceFriendSearch,
  type CoverRequest, type FriendEvent, type FriendSearch, type TaskType,
} from '@pawsure/domain';
import { Button, Card, Chip, IconTile, Screen, SectionHeader, space, Text, TextField, type IconName } from '../../design';
import { friends, pet, today } from '../../demo/data';
import { fmtTime } from '../../format';

const TASKS: { type: TaskType; label: string; icon: IconName }[] = [
  { type: 'feeding', label: 'Feed', icon: 'food' },
  { type: 'water', label: 'Water', icon: 'water' },
  { type: 'walk', label: 'Short walk', icon: 'activity' },
  { type: 'medicine', label: 'Medicine', icon: 'medication' },
];
const TIMES = [16, 17, 18, 19];

function labelOf(t: TaskType): string {
  return TASKS.find((x) => x.type === t)?.label ?? t;
}

function sentence(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const STATE_TEXT: Record<FriendSearch['state'], string> = {
  draft: 'Draft',
  ready_for_search: 'Ready to search',
  awaiting_owner_approval: 'Choose who to ask',
  sent: 'Sent on WhatsApp. Waiting for a reply (expires in 15 min).',
  provisional_hold: 'A friend said yes. Confirm within 10 minutes.',
  confirmed: 'Cover confirmed. Only the access details they need were shared.',
  completed: 'Cover completed.',
  expired: 'Nobody could help in time.',
  cancelled: 'You cancelled this request.',
  no_show: 'Your friend did not arrive. Alerts have resumed.',
};

export default function FindCover() {
  const [raw, setRaw] = useState('');
  const [types, setTypes] = useState<TaskType[]>(['feeding', 'walk']);
  const [hour, setHour] = useState(17);
  const [needsKey, setNeedsKey] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [search, setSearch] = useState<FriendSearch | null>(null);

  const request: CoverRequest = useMemo(
    () => ({ taskTypes: types, window: { start: today(hour), end: today(hour, 30) }, needsKey, largeOrAnxiousDog: false }),
    [types, hour, needsKey],
  );
  const matches = useMemo(() => matchFriends(friends, request), [request]);
  const taskWords: string[] = types.map((t) => labelOf(t).toLowerCase());
  const summary = taskWords.length ? sentence(taskWords.join(' + ')) : 'Nothing selected';
  const nameOf = (id: string) => friends.find((f) => f.id === id)?.displayName ?? id;
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const dispatch = (e: FriendEvent) => search && setSearch(reduceFriendSearch(search, e).state);
  const startSearch = () => {
    let s = newSearch('demo', request.window.start);
    s = reduceFriendSearch(s, { type: 'owner_confirms_summary', at: new Date() }).state;
    s = reduceFriendSearch(s, { type: 'suggestions_shown', at: new Date() }).state;
    setSearch(s);
  };
  const reset = () => { setSearch(null); setPicked([]); };

  return (
    <Screen title="Find cover" subtitle="Your own friends first. Nobody is contacted until you approve.">
      {!search ? (
        <Card>
          <Text variant="subheading">Ask Pawsure</Text>
          <TextField
            icon="mic"
            value={raw}
            onChangeText={setRaw}
            multiline
            label="What do you need?"
            placeholder={`"Stuck till 8. Can someone feed ${pet.name} and take him down at 5?"`}
          />
          <Text variant="small" tone="muted">AI understanding is coming soon. For now, pick the details below.</Text>
          <Text variant="label">Tasks</Text>
          <View style={st.row}>
            {TASKS.map((t) => (
              <Chip key={t.type} icon={t.icon} label={t.label} selected={types.includes(t.type)} onPress={() => setTypes((p) => toggle(p, t.type))} />
            ))}
          </View>
          <Text variant="label">Time</Text>
          <View style={st.row}>
            {TIMES.map((h) => <Chip key={h} label={fmtTime(today(h))} selected={hour === h} onPress={() => setHour(h)} />)}
          </View>
          <Text variant="label">Key needed?</Text>
          <View style={st.row}>
            <Chip label="Yes" selected={needsKey} onPress={() => setNeedsKey(true)} />
            <Chip label="No" selected={!needsKey} onPress={() => setNeedsKey(false)} />
          </View>
          <Card tone="brand">
            <Text variant="bodyStrong">
              {summary} for {pet.name} at{' '}
              {fmtTime(request.window.start)}{needsKey ? ' · key needed' : ''}
            </Text>
            <Text variant="small" tone="muted">Check this is right before we look for friends.</Text>
          </Card>
          <Button label="Looks right, find friends" onPress={startSearch} disabled={!types.length} full />
        </Card>
      ) : null}

      {search?.state === 'awaiting_owner_approval' ? (
        <>
          <SectionHeader title="Nearest suitable friends" action="Edit request" onAction={reset} />
          {matches.ranked.length === 0 ? (
            <Card tone="alert">
              <Text variant="body">No friend is free and comfortable with these tasks right now. Try another time, or invite more friends.</Text>
            </Card>
          ) : null}
          {matches.ranked.map((m, i) => {
            const on = picked.includes(m.friend.id);
            return (
              <Card key={m.friend.id} tone={on ? 'brand' : 'plain'}>
                <View style={st.friendHead}>
                  <IconTile name="profile" tone={i === 0 ? 'yellow' : 'beige'} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{m.friend.displayName}</Text>
                    <Text variant="caption" tone="muted">{m.reasons.join(' · ')}</Text>
                  </View>
                </View>
                <Chip label={on ? 'Selected' : 'Select'} selected={on} onPress={() => setPicked((p) => toggle(p, m.friend.id))} />
              </Card>
            );
          })}
          {matches.ranked.length ? (
            <>
              <Button
                label={picked.length ? `Send request to ${picked.length}` : 'Select someone to ask'}
                disabled={!picked.length}
                onPress={() => dispatch({ type: 'owner_approves', at: new Date(), friendIds: picked })}
                full
              />
              {matches.ranked.length > 1 ? (
                <Button
                  label={`Ask all ${matches.ranked.length}`}
                  kind="secondary"
                  full
                  onPress={() => dispatch({ type: 'owner_approves', at: new Date(), friendIds: matches.ranked.map((m) => m.friend.id) })}
                />
              ) : null}
              <Text variant="small" tone="muted">With "Ask all", the first yes holds the request until you confirm; the others are told politely.</Text>
            </>
          ) : null}
        </>
      ) : null}

      {search && search.state !== 'awaiting_owner_approval' ? (
        <Card tone={search.state === 'confirmed' || search.state === 'completed' ? 'calm' : search.state === 'expired' || search.state === 'no_show' ? 'alert' : 'plain'}>
          <Text variant="subheading">Request status</Text>
          <Text variant="body">{STATE_TEXT[search.state]}</Text>
          {search.recipients.map((r) => (
            <Text key={r.friendId} variant="caption" tone="muted">{nameOf(r.friendId)}: {r.state.replace(/_/g, ' ')}</Text>
          ))}
          {search.state === 'sent' ? (
            <Button
              label={`Demo: ${nameOf(search.recipients[0]!.friendId)} replies yes`}
              kind="outlined"
              onPress={() => dispatch({ type: 'friend_reply', at: new Date(), messageId: `demo-${Date.now()}`, friendId: search.recipients[0]!.friendId, response: 'yes' })}
            />
          ) : null}
          {search.state === 'provisional_hold' && search.holdFriendId ? (
            <Button label={`Confirm ${nameOf(search.holdFriendId)}`} onPress={() => dispatch({ type: 'owner_confirms', at: new Date(), friendId: search.holdFriendId! })} />
          ) : null}
          {['completed', 'expired', 'cancelled', 'no_show'].includes(search.state) ? (
            <Button label="Start again" kind="secondary" onPress={reset} />
          ) : (
            <Button label="Cancel request" kind="outlined" onPress={() => dispatch({ type: 'owner_cancels', at: new Date(), reason: 'owner cancelled' })} />
          )}
        </Card>
      ) : null}
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  friendHead: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
});
