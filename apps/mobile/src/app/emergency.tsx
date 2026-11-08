// O14 Emergency: report, severity routing, own vet first, incident log (PS-035, PS-036, PS-039, PS-106, PS-124).
import { useState } from 'react';
import { Linking, View } from 'react-native';
import { planIncidentNotifications, SEVERITY_OF, type IncidentCategory, type Severity } from '@pawsure/domain';
import { Button, Card, Chip, KeyValue, ListItem, NoticeBanner, Screen, SectionHeader, space, Text } from '../design';
import { CATEGORY_LABEL, fmt, useProto } from '../proto/store';

const GROUPS: { severity: Severity; title: string; cats: IncidentCategory[] }[] = [
  { severity: 'S1', title: 'Urgent', cats: ['injury', 'bite', 'collapse', 'breathing', 'pet_missing', 'door_key_security'] },
  { severity: 'S2', title: 'Unwell', cats: ['vomiting', 'not_eating', 'limping', 'unusual_behaviour'] },
  { severity: 'S3', title: 'Practical', cats: ['food_water_out', 'toilet_pad_out', 'pet_left_outside'] },
];

export default function Emergency() {
  const { state, dispatch } = useProto();
  const [picked, setPicked] = useState<IncidentCategory | null>(null);
  const call = (p: string) => Linking.openURL(`tel:${p.replace(/\s/g, '')}`);
  const plan = picked ? planIncidentNotifications('preview', SEVERITY_OF[picked]) : [];

  return (
    <Screen title="Emergency" subtitle={`${state.pet.name}'s card and incident reporting. Always free.`}>
      <NoticeBanner icon="shield" tone="alert" title="Pawsure is not a vet or emergency service" body="Call your own vet first. Partner vet lines appear only once a written agreement exists." />
      <Button label={`Call own vet · ${state.pet.vet.name.split(',')[0]}`} kind="danger" icon="phone" onPress={() => call(state.pet.vet.phone)} full />
      <Button label={`Call backup · ${state.backup.name}`} kind="secondary" icon="phone" onPress={() => call(state.backup.phone)} full />

      <Card>
        <Text variant="subheading">Emergency card</Text>
        <KeyValue k="Allergies" v={state.pet.allergies} tone="alert" />
        <KeyValue k="Medicines" v={state.pet.medicines} />
        <KeyValue k="Own vet" v={`${state.pet.vet.name} · ${state.pet.vet.phone}`} />
        <KeyValue k="Nearest 24x7 clinic" v={state.pet.clinic24x7} />
        <KeyValue k="Backup" v={`${state.backup.name} · ${state.backup.phone}`} />
        <Text variant="small" tone="muted">Owner-provided. {state.helper.name} and {state.backup.name} can open it from WhatsApp during a visit or incident.</Text>
      </Card>

      <SectionHeader title="Emergency contacts" />
      <Card>
        <KeyValue k={`Own vet · ${state.pet.vet.name.split(',')[0]}`} v={state.pet.vet.phone} />
        <KeyValue k="Nearest 24x7 clinic" v={state.pet.clinic24x7} />
        <KeyValue k={`Backup · ${state.backup.name}`} v={state.backup.phone} />
        <KeyValue k={`Helper · ${state.helper.name}`} v={state.helper.phone} />
        {state.coOwners.map((c) => <KeyValue key={c.phone} k={`Co-owner · ${c.name}`} v={c.phone} />)}
        <Text variant="small" tone="muted">Who is called first depends on severity: see below.</Text>
      </Card>

      <SectionHeader title="Report a problem" />
      {GROUPS.map((g) => (
        <View key={g.severity} style={{ gap: space.sm }}>
          <Text variant="label" tone={g.severity === 'S1' ? 'alert' : 'primary'}>{g.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {g.cats.map((c) => <Chip key={c} label={CATEGORY_LABEL[c]} selected={picked === c} onPress={() => setPicked(c)} />)}
          </View>
        </View>
      ))}
      {picked ? (
        <Card tone={SEVERITY_OF[picked] === 'S1' ? 'alert' : 'plain'}>
          <Text variant="bodyStrong">Who is told</Text>
          {plan.map((p) => (
            <Text key={p.jobKey} variant="caption">
              {p.offsetMinutes === 0 ? 'Now' : `+${p.offsetMinutes} min`}: {p.recipients === 'all_care_circle' ? 'everyone in the care circle' : p.recipients.join(' and ')} by {p.channels.join(' + ').replace('phone_call', 'phone call')}{p.onlyIfUnacknowledged ? ' if nobody has acknowledged' : ''}{p.note ? ` (${p.note})` : ''}
            </Text>
          ))}
          <Button label="Send report" kind={SEVERITY_OF[picked] === 'S1' ? 'danger' : 'primary'} onPress={() => { dispatch({ type: 'incident', category: picked, by: 'Neha' }); setPicked(null); }} full />
        </Card>
      ) : null}

      <SectionHeader title="Incident log" />
      {state.incidents.length === 0 ? <Text variant="caption" tone="muted">No incidents.</Text> : null}
      {state.incidents.map((i) => (
        <Card key={i.id} tone={!i.resolvedAt && i.severity === 'S1' ? 'alert' : 'plain'}>
          <ListItem icon="alert" title={`${i.severity} · ${CATEGORY_LABEL[i.category]}`} subtitle={`${fmt(i.at)} · reported by ${i.by}`}
            meta={i.resolvedAt ? `Resolved ${fmt(i.resolvedAt)}` : i.acknowledgedAt ? `Acknowledged ${fmt(i.acknowledgedAt)}` : 'Waiting for someone to say "I\'m on it"'}
            metaTone={i.resolvedAt ? 'success' : 'alert'} />
          {!i.resolvedAt ? (
            <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
              {!i.acknowledgedAt ? <Button label="I'm on it" onPress={() => dispatch({ type: 'incident_ack', id: i.id })} /> : null}
              <Button label="Mark resolved" kind="outlined" onPress={() => dispatch({ type: 'incident_resolve', id: i.id })} />
            </View>
          ) : null}
        </Card>
      ))}
      <Text variant="small" tone="muted">Edits are audited. Incident records are kept for 3 years.</Text>
    </Screen>
  );
}
