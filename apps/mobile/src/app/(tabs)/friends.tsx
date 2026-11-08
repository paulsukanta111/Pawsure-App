// F2 Friends list and invite (PS-050 to PS-054, PS-069).
import { router } from 'expo-router';
import { View } from 'react-native';
import { Avatar, Button, Card, Chip, ListItem, NoticeBanner, Screen, SectionHeader, space, Text, TextField, useToast } from '../../design';
import { useState } from 'react';
import { LANG_NAME } from '../../proto/friendMessages';
import { useProto, type Lang } from '../../proto/store';

const KEY: Record<string, string> = { has_key: 'Has a key', needs_handover: 'Needs key handover', no_key: 'No key' };
const CAP: Record<string, string> = { feeding_water: 'Feeding', short_walk: 'Walks', medicine: 'Medicine', large_anxious_dog: 'Large/anxious dogs' };

export default function Friends() {
  const { friends, state, dispatch } = useProto();
  const toast = useToast();
  const [inviting, setInviting] = useState(false);
  const [fName, setFName] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fLang, setFLang] = useState<Lang>('en');
  return (
    <Screen title="Friends" subtitle="People you trust who chose to help. They only see your society and tower.">
      {!inviting ? (
        <Button label="Invite a friend" icon="plus" onPress={() => setInviting(true)} full />
      ) : (
        <Card tone="brand">
          <Text variant="subheading">Invite a friend</Text>
          <TextField label="Name" value={fName} onChangeText={setFName} />
          <TextField label="WhatsApp number" value={fPhone} onChangeText={setFPhone} keyboardType="phone-pad" />
          {fPhone && fPhone.replace(/\D/g, '').length < 10 ? <Text variant="caption" tone="alert">Enter a 10-digit mobile number.</Text> : null}
          <Text variant="label">Their language</Text>
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            {(['en', 'hi', 'mr'] as Lang[]).map((l) => <Chip key={l} label={LANG_NAME[l]} selected={fLang === l} onPress={() => setFLang(l)} />)}
          </View>
          <Button label="Send invite (simulated)" disabled={!fName.trim() || fPhone.replace(/\D/g, '').length < 10}
            onPress={() => { dispatch({ type: 'invite_friend', name: fName.trim(), phone: fPhone, language: fLang }); toast(`Invite for ${fName.trim()} ready (simulated)`, 'info'); setInviting(false); setFName(''); setFPhone(''); }} />
          <Button label="Cancel" kind="outlined" onPress={() => setInviting(false)} />
        </Card>
      )}
      <Text variant="small" tone="muted">An invite isn't consent to be found. Each friend opts in separately and can pause or leave any time.</Text>
      {state.invitedFriends.length ? (
        <>
          <SectionHeader title="Invited" />
          {state.invitedFriends.map((f) => <ListItem key={f.phone} icon="community" title={f.name} subtitle={`${f.phone} · ${LANG_NAME[f.language]}`} meta="Waiting for them to accept and choose what they're comfortable with" />)}
        </>
      ) : null}
      <SectionHeader title="Your friends" />
      {friends.map((f) => (
        <Card key={f.id}>
          <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <Avatar label={f.displayName} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{f.displayName}</Text>
              <Text variant="caption" tone="muted">{f.distanceLabel} · {KEY[f.keyStatus]}</Text>
            </View>
            <Text variant="label" tone={f.paused ? 'alert' : 'success'}>{f.paused ? 'Paused' : 'Available'}</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
            {[...f.capabilities].map((c) => <Chip key={c} label={CAP[c]!} />)}
          </View>
          <Button label="View profile" kind="outlined" onPress={() => router.push(`/friend/${f.id}`)} />
        </Card>
      ))}
      {!state.ownerPrivacy.nearbyFallback ? (
        <NoticeBanner icon="shield" title="Nearby members are off" body="People outside your circle can't be suggested until ID checks are approved." />
      ) : null}
      <SectionHeader title="You as a friend" />
      <ListItem icon="friends" title="My help settings" subtitle={state.myFriendProfile.paused ? 'Paused' : state.myFriendProfile.windows.join(' · ')} onPress={() => router.push('/friend-settings')} />
      <ListItem icon="shield" title="What friends see about me" onPress={() => router.push('/privacy-profile')} />
    </Screen>
  );
}
