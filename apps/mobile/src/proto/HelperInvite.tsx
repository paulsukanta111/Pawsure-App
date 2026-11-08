// Owner invites the helper (PS-020, PS-021, PS-022, PS-110): language, why, method, preview, consent status.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  Avatar, Button, Card, ChatThread, Chip, NoticeBanner, SectionHeader, space, Text, TextField, Toggle, useToast,
} from '../design';
import { HELPER_TEXT } from './helperStrings';
import { useProto, type HelperConsent, type HelperMethod, type Lang } from './store';

const LANGS: { value: Lang; label: string }[] = [{ value: 'mr', label: 'मराठी' }, { value: 'hi', label: 'हिंदी' }, { value: 'en', label: 'English' }];
const METHODS: { value: HelperMethod; label: string; note: string }[] = [
  { value: 'whatsapp_photo', label: 'Photo', note: 'Photo of the bowl with today\'s code' },
  { value: 'whatsapp_voice', label: 'Voice note', note: 'Says what was done, in her words' },
  { value: 'missed_call_code', label: 'Missed call + code', note: 'Basic phone, no data needed' },
];
export const CONSENT_TEXT: Record<HelperConsent, { title: string; body: string; tone: 'brand' | 'calm' | 'alert' }> = {
  not_invited: { title: 'Not invited yet', body: 'Nothing is collected until she says yes.', tone: 'brand' },
  pending: { title: 'Invite sent, waiting for her answer', body: 'She chooses her language and check-in method on WhatsApp.', tone: 'brand' },
  given: { title: 'Consent given', body: 'She can change method, pause or stop any time by replying on WhatsApp.', tone: 'calm' },
  declined: { title: 'She said "Not now"', body: 'Nothing is collected. Use Trusted helper mode or your own return checks; visits show Not confirmed, never "failed".', tone: 'alert' },
  withdrawn: { title: 'She stopped check-ins', body: 'Collection stopped at once. Earlier records she relies on are kept as the retention policy says.', tone: 'alert' },
};

export function HelperInvite({ next }: { next?: () => void }) {
  const { state, dispatch } = useProto();
  const toast = useToast();
  const h = state.helper;
  const [name, setName] = useState(h.name);
  const [phone, setPhone] = useState(h.phone);
  const T = HELPER_TEXT[h.language];
  const status = CONSENT_TEXT[h.consent];

  const send = () => {
    dispatch({ type: 'helper', patch: { name: name.trim() || 'Sunita', phone, consent: 'pending', mode: 'tracked' } });
    toast('Invite ready (simulated). No WhatsApp message was sent.', 'info');
  };

  return (
    <View style={{ gap: space.lg }}>
      <Card tone={status.tone}>
        <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
          <Avatar label={name || 'S'} tone="yellow" size={48} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{name || 'Your helper'}</Text>
            <Text variant="label">{status.title}</Text>
          </View>
        </View>
        <Text variant="caption">{status.body}</Text>
      </Card>

      <TextField label="Helper's name" value={name} onChangeText={setName} />
      <TextField label="WhatsApp number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Text variant="label">Her language</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {LANGS.map((l) => <Chip key={l.value} label={l.label} selected={h.language === l.value} onPress={() => dispatch({ type: 'helper', patch: { language: l.value } })} />)}
      </View>

      <SectionHeader title="Why check-ins?" />
      <Card>
        <Text variant="caption">• You see whether each task happened, without calling her.</Text>
        <Text variant="caption">• Her good work gets a record and coupon points.</Text>
        <Text variant="caption">• A missed task reaches you quickly, so the pet is never forgotten.</Text>
        <Text variant="small" tone="muted">One mismatch is never treated as misconduct; she sees the reason and can respond.</Text>
      </Card>

      <Text variant="label">Suggest a check-in method (she decides)</Text>
      <View style={{ gap: space.sm }}>
        {METHODS.map((m) => (
          <Chip key={m.value} label={`${m.label} · ${m.note}`} selected={h.method === m.value} onPress={() => dispatch({ type: 'helper', patch: { method: m.value } })} />
        ))}
      </View>

      <SectionHeader title="What she will see" />
      <ChatThread title="Pawsure" subtitle="WhatsApp invite preview" messages={[
        { id: 'p', from: 'pawsure', time: 'now', text: T.consent(name || 'Sunita', state.profile.name, state.pet.name), replies: [{ label: T.yes, onPress: () => {} }, { label: T.notNow, onPress: () => {} }] },
      ]} />
      <NoticeBanner icon="shield" title="Never a face photo" body="Only the bowl or the pet. She can stop any time, and nothing is collected before she agrees." />

      {h.consent === 'not_invited' || h.consent === 'declined' || h.consent === 'withdrawn' ? (
        <Button label="Send invite on WhatsApp (simulated)" icon="community" onPress={send} full />
      ) : null}
      {h.consent !== 'not_invited' ? (
        <Button label={`Open ${name || 'Sunita'}'s phone (simulated)`} kind="secondary" icon="phone" onPress={() => router.push('/helper')} full />
      ) : null}
      <Toggle label="Use Trusted helper mode instead (no check-ins, alerts or points)" value={h.mode === 'trusted'} onChange={(v) => dispatch({ type: 'helper', patch: { mode: v ? 'trusted' : 'tracked' } })} />
      {next ? <Button label="Continue" kind="outlined" onPress={next} full /> : null}
    </View>
  );
}
