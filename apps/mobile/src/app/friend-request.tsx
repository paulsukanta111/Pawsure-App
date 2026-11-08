// F6 Friend gets a request on WhatsApp (simulated): typed or quick replies, parsed (PS-060, PS-063, PS-067, PS-068, PS-123).
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { addMinutes } from '@pawsure/domain';
import { Button, Chip, WaPhoneChat, EmptyState, NoticeBanner, Screen, space, TextField, type ChatMessage } from '../design';
import { lowerFirst, requestMessage } from '../proto/friendMessages';
import { fmt, useProto } from '../proto/store';

export default function FriendRequest() {
  const { state, dispatch, friends, now } = useProto();
  const search = state.friendSearch;
  const ids = search?.recipients.map((r) => r.friendId) ?? [];
  const [who, setWho] = useState(ids[0] ?? '');
  const [typed, setTyped] = useState('');
  if (!search || !ids.length) {
    return (
      <Screen>
        <EmptyState art="no-messages" title="No request yet" body="Send a cover request from Find cover first." action="Go to Find cover" onAction={() => router.dismissTo('/find-cover')} />
      </Screen>
    );
  }
  const current = ids.includes(who) ? who : ids[0]!;
  const friend = friends.find((f) => f.id === current)!;
  const lang = state.friendLanguage[current] ?? 'en';
  const r = search.recipients.find((x) => x.friendId === current)!;
  const t = fmt(now);
  const alt = fmt(addMinutes(search.taskStart, 30)).replace(' pm', '').replace(' am', '');
  const quick = lang === 'mr' ? ['हो', 'नाही, माफ करा', `${alt} la jamel`] : lang === 'hi' ? ['हाँ', 'नहीं, माफ़ कीजिए', `${alt} baje aa sakti hoon`] : ['Yes', 'Sorry, busy', `I can do ${alt}`];
  const reply = (text: string) => { if (text.trim()) dispatch({ type: 'friend_text_reply', friendId: current, text: text.trim() }); setTyped(''); };
  const mine = state.friendReplies.filter((x) => x.friendId === current);
  const closed = ['completed', 'expired', 'cancelled', 'no_show'].includes(search.state) || search.state === 'confirmed';

  const msgs: ChatMessage[] = [{
    id: 'req', from: 'pawsure', time: search.sentAt ? fmt(search.sentAt) : t,
    text: requestMessage(lang, friend.displayName, state.profile.name, state.pet.name, lowerFirst(state.coverRequest?.summary ?? '')),
    replies: r.state === 'pending' || r.state === 'accepted_waiting' || (closed && r.state !== 'confirmed') ? quick.map((q) => ({ label: q, onPress: () => reply(q) })) : undefined,
  }];
  mine.forEach((m, i) => {
    msgs.push({ id: `r${i}`, from: 'me', time: fmt(m.at), text: m.text });
    if (/Couldn't tell/.test(m.interpretation)) msgs.push({ id: `u${i}`, from: 'pawsure', time: fmt(m.at), text: 'Sorry, please reply Yes, No, or a time like 5:30.' });
  });
  if (r.state === 'holding') msgs.push({ id: 'h', from: 'pawsure', time: t, text: `Thanks! Waiting for ${state.profile.name} to confirm (up to 10 minutes).` });
  if (r.state === 'proposed_time') msgs.push({ id: 'p', from: 'pawsure', time: t, text: `Thanks! ${state.profile.name} will confirm whether ${fmt(r.proposedTime!)} works.` });
  if (r.state === 'accepted_waiting') msgs.push({ id: 'w', from: 'pawsure', time: t, text: `Thanks! Someone replied first; waiting for ${state.profile.name} to confirm.` });
  if (r.state === 'withdrawn' && mine.length) msgs.push({ id: 'x', from: 'pawsure', time: t, text: `All sorted, ${state.profile.name} found cover. Thank you for replying!` });
  if (r.state === 'withdrawn' && !mine.length) msgs.push({ id: 'x2', from: 'pawsure', time: t, text: `Update: ${state.profile.name} found cover, no need to reply. Thank you!` });
  if (r.state === 'expired') msgs.push({ id: 'e', from: 'pawsure', time: t, text: 'This request has closed. Thanks anyway!' });
  if (r.state === 'declined') msgs.push({ id: 'd', from: 'pawsure', time: t, text: 'No problem, thanks for letting us know. Saying no never counts against you.' });
  if (r.state === 'confirmed') {
    msgs.push({ id: 'c', from: 'pawsure', time: t, text: `Confirmed! Flat B-1204, Tower B. Spare key at the security desk, name "${state.profile.name}". ${state.pet.name}: allergic to ${state.pet.allergies.toLowerCase()}. These details stop working after the visit.` });
  }
  const lateYes = closed && mine.some((m) => /^(yes|ho|haan|हो|हाँ)/i.test(m.text)) && r.state !== 'confirmed';
  if (lateYes) msgs.push({ id: 'late', from: 'pawsure', time: t, text: 'Thank you! It\'s already covered, so nothing more is needed.' });

  return (
    <Screen>
      <NoticeBanner icon="friends" title="Simulation of a friend's phone" body={`The friend replies on WhatsApp in their own words; ${state.profile.name} sees Pawsure's reading of it. No real message is sent.`} />
      {ids.length > 1 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {ids.map((id) => <Chip key={id} label={friends.find((f) => f.id === id)!.displayName} selected={current === id} onPress={() => setWho(id)} />)}
        </View>
      ) : null}
      <WaPhoneChat title="Pawsure" subtitle={`Business account · on ${friend.displayName}'s phone`} messages={msgs} onBack={() => router.dismissTo('/find-cover')} />
      {r.state !== 'confirmed' && r.state !== 'declined' ? (
        <View style={{ gap: space.sm }}>
          <TextField label={`Reply as ${friend.displayName}`} value={typed} onChangeText={setTyped} placeholder="Type a reply, e.g. 5:30 la jamel" onSubmitEditing={() => reply(typed)} />
          <Button label="Send reply" kind="secondary" disabled={!typed.trim()} onPress={() => reply(typed)} />
        </View>
      ) : null}
      {r.state === 'confirmed' ? <Button label="I can't make it after all" kind="outlined" onPress={() => dispatch({ type: 'friend', event: { type: 'friend_cancels', at: now, messageId: `${current}-cancel-${now.getTime()}`, friendId: current } })} full /> : null}
      <Button label={`Back to ${state.profile.name}'s Find cover`} kind="secondary" onPress={() => router.dismissTo('/find-cover')} full />
    </Screen>
  );
}
