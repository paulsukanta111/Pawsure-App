// O4 Care circle: helper method and language, Trusted mode, backup + look-in, code card, gate app (PS-020 to PS-026, PS-102, PS-109).
import { router } from 'expo-router';
import { View } from 'react-native';
import { Avatar, Button, Card, Chip, KeyValue, ListItem, NoticeBanner, Screen, SectionHeader, space, Text, Toggle } from '../design';
import { useProto, type HelperMethod, type Lang } from '../proto/store';

const METHODS: { value: HelperMethod; label: string }[] = [
  { value: 'whatsapp_photo', label: 'WhatsApp photo' },
  { value: 'whatsapp_voice', label: 'Voice note' },
  { value: 'missed_call_code', label: 'Missed call + code' },
];
const LANGS: { value: Lang; label: string }[] = [{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिंदी' }, { value: 'mr', label: 'मराठी' }];

export default function CareCircle() {
  const { state, dispatch } = useProto();
  const h = state.helper;
  return (
    <Screen title="Care circle" subtitle="Who looks after the pet, and how they check in.">
      <Card>
        <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
          <Avatar label={h.name} tone="yellow" size={48} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{h.name} · helper</Text>
            <Text variant="caption" tone={h.consent === 'given' ? 'success' : h.consent === 'declined' ? 'alert' : 'muted'}>
              {h.consent === 'given' ? 'Consent given' : h.consent === 'declined' ? 'Said "Not now"' : 'Invite sent, waiting for her answer'}
            </Text>
          </View>
        </View>
        <Text variant="label">Check-in method (she can change it any time)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {METHODS.map((m) => <Chip key={m.value} label={m.label} selected={h.method === m.value} onPress={() => dispatch({ type: 'helper', patch: { method: m.value } })} />)}
        </View>
        <Text variant="label">Language</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {LANGS.map((l) => <Chip key={l.value} label={l.label} selected={h.language === l.value} onPress={() => dispatch({ type: 'helper', patch: { language: l.value } })} />)}
        </View>
        <Toggle label="Trusted helper mode (no check-ins, alerts or points)" value={h.mode === 'trusted'} onChange={(v) => dispatch({ type: 'helper', patch: { mode: v ? 'trusted' : 'tracked' } })} />
        {h.consent === 'declined' ? <NoticeBanner icon="care" title="Nothing is collected from Sunita" body="Use Trusted helper mode or owner-only signals. Visits show Not confirmed, never 'failed'." /> : null}
        <Button label="Open Sunita's WhatsApp (simulated)" kind="secondary" onPress={() => router.push('/helper')} full />
        <Button label="Basic phone check-in (simulated)" kind="outlined" onPress={() => router.push('/basic-phone')} full />
      </Card>

      <SectionHeader title="Backup" />
      <Card>
        <KeyValue k={state.backup.name} v={state.backup.phone} />
        <Text variant="caption">If you don't acknowledge a missed task within 30 minutes, {state.backup.name} gets a WhatsApp link that opens for 15 minutes. It shows the missed task, emergency card and spare-key note, never your exact address unless already authorised.</Text>
        <Button label="Preview the look-in link" kind="outlined" onPress={() => router.push('/look-in?task=t-walk')} full />
      </Card>

      <SectionHeader title="Evidence at home" />
      <ListItem icon="key" title="Food-box code card" subtitle="A new code every day, kept inside the food box" onPress={() => router.push('/code-card')} />
      <Card>
        <Toggle label="My building has a gate app" value={state.gateApp} onChange={(v) => dispatch({ type: 'patch', patch: { gateApp: v } })} />
        <Text variant="small" tone="muted">
          {state.gateApp
            ? "You can attach your own gate-app entry alert. It's labelled owner-provided; Pawsure has no direct gate-app access."
            : 'Without a gate app, random photo prompts rise to 1 in 5 visits so evidence stays honest.'}
        </Text>
      </Card>

      <SectionHeader title="Co-owner" />
      <Button label="Invite a co-owner" icon="plus" kind="secondary" onPress={() => {}} full />
      <Text variant="small" tone="muted">Removing someone revokes their access everywhere within 60 seconds, including open look-in links.</Text>
    </Screen>
  );
}
