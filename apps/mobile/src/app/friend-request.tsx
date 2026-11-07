// F6 Friend gets a request on WhatsApp (simulated): yes / no / propose a time (PS-060, PS-063, PS-067, PS-068).
import { router } from 'expo-router';
import { useState } from 'react';
import { addMinutes } from '@pawsure/domain';
import { Button, Chip, ChatThread, NoticeBanner, Screen, Text, type ChatMessage } from '../design';
import { fmt, useProto } from '../proto/store';

export default function FriendRequest() {
  const { state, dispatch, friends, now } = useProto();
  const search = state.friendSearch;
  const ids = search?.recipients.map((r) => r.friendId) ?? [];
  const [who, setWho] = useState(ids[0] ?? '');
  if (!search || !ids.length) {
    return (
      <Screen title="No request yet">
        <Text variant="body">Send a cover request from Find cover first.</Text>
        <Button label="Go to Find cover" onPress={() => router.dismissTo('/find-cover')} />
      </Screen>
    );
  }
  const friend = friends.find((f) => f.id === who)!;
  const r = search.recipients.find((x) => x.friendId === who)!;
  const t = fmt(now);
  const reply = (response: 'yes' | 'no' | 'propose') =>
    dispatch({ type: 'friend', event: { type: 'friend_reply', at: now, messageId: `${who}-${response}-${now.getTime()}`, friendId: who, response, proposedTime: response === 'propose' ? addMinutes(search.taskStart, 30) : undefined } });

  const msgs: ChatMessage[] = [{
    id: 'req', from: 'pawsure', time: search.sentAt ? fmt(search.sentAt) : t,
    text: `Hi ${friend.displayName}! Neha (Hiranandani Gardens, Tower B) asks if you can help ${state.pet.name}:\n${state.coverRequest?.summary}.\nAddress and key details are shared only if you accept and Neha confirms.`,
    replies: r.state === 'pending' ? [
      { label: 'Yes', onPress: () => reply('yes') },
      { label: 'No', onPress: () => reply('no') },
      { label: `I can do ${fmt(addMinutes(search.taskStart, 30))}`, onPress: () => reply('propose') },
    ] : undefined,
  }];
  if (r.state !== 'pending') {
    msgs.push({ id: 'ans', from: 'me', time: r.respondedAt ? fmt(r.respondedAt) : t, text: r.state === 'declined' ? 'No' : r.state === 'proposed_time' ? `I can do ${fmt(r.proposedTime!)}` : 'Yes' });
  }
  if (r.state === 'holding') msgs.push({ id: 'h', from: 'pawsure', time: t, text: 'Thanks! Waiting for Neha to confirm (up to 10 minutes).' });
  if (r.state === 'accepted_waiting') msgs.push({ id: 'w', from: 'pawsure', time: t, text: 'Thanks! Someone else replied first; waiting for Neha to confirm.' });
  if (r.state === 'withdrawn') msgs.push({ id: 'x', from: 'pawsure', time: t, text: 'All sorted, Neha found cover. Thank you for replying!' });
  if (r.state === 'declined') msgs.push({ id: 'd', from: 'pawsure', time: t, text: 'No problem, thanks for letting us know.' });
  if (r.state === 'confirmed') {
    msgs.push({ id: 'c', from: 'pawsure', time: t, text: `Confirmed! Flat B-1204. Spare key with the security desk, name "Neha". ${state.pet.name}: ${state.pet.allergies} allergy. Emergency card: tap the link during the visit.\nThese details stop working after the visit.` });
  }

  return (
    <Screen>
      <NoticeBanner icon="friends" title="Simulation of a friend's phone" body="The friend answers in WhatsApp; Neha sees the reply in Find cover." />
      {ids.length > 1 ? ids.map((id) => <Chip key={id} label={friends.find((f) => f.id === id)!.displayName} selected={who === id} onPress={() => setWho(id)} />) : null}
      <ChatThread title="Pawsure" subtitle={`To ${friend.displayName}`} messages={msgs} />
      {r.state === 'confirmed' ? <Button label="I can't make it after all" kind="outlined" onPress={() => dispatch({ type: 'friend', event: { type: 'friend_cancels', at: now, messageId: `${who}-cancel-${now.getTime()}`, friendId: who } })} full /> : null}
      <Button label="Back to Neha's Find cover" kind="secondary" onPress={() => router.dismissTo('/find-cover')} full />
    </Screen>
  );
}
