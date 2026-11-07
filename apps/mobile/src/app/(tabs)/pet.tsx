// O2 Pet profile, O3 routine, O14 Emergency card, O15 health (PS-003, PS-004, PS-010, PS-035, PS-040, PS-106).
import { useState } from 'react';
import { Linking, View } from 'react-native';
import {
  Button, Card, Chip, IllustrationSlot, ListItem, MetricCard, PetAvatar, Screen, SectionHeader, SegmentedTabs, space, Text,
} from '../../design';
import { health, pet, tasks } from '../../demo/data';
import { fmtTime } from '../../format';

type Tab = 'health' | 'routine' | 'emergency';

export default function Pet() {
  const [tab, setTab] = useState<Tab>('health');
  const call = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  return (
    <Screen>
      <IllustrationSlot name={`${pet.name} portrait`} height={180} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <PetAvatar species={pet.species} size={56} />
        <View style={{ flex: 1 }}>
          <Text variant="h2">{pet.name}</Text>
          <Text variant="caption" tone="muted">{pet.breed} {pet.speciesLabel.toLowerCase()} · {pet.age} · {pet.weightKg} kg</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        {pet.tags.map((t) => <Chip key={t} label={t} />)}
      </View>
      <Text variant="body">{pet.about}</Text>

      <SegmentedTabs
        value={tab}
        onChange={setTab}
        options={[{ value: 'health', label: 'Health' }, { value: 'routine', label: 'Routine' }, { value: 'emergency', label: 'Emergency' }]}
      />

      {tab === 'health' ? (
        <>
          <MetricCard icon="health" label="Weight" value={`${pet.weightKg} kg`} delta="+0.3 kg this month" series={pet.weightSeries} />
          <SectionHeader title="Reminders" />
          {health.map((h) => (
            <ListItem key={h.id} icon={h.icon} title={h.title} subtitle={h.subtitle}
              meta={h.dueInDays === 0 ? 'Today' : `Due in ${h.dueInDays} days`} metaTone={h.dueInDays <= 7 ? 'alert' : 'muted'} onPress={() => {}} />
          ))}
          <Text variant="small" tone="muted">Dates are entered by you or copied from your vet. Pawsure only reminds; it never prescribes.</Text>
        </>
      ) : null}

      {tab === 'routine' ? (
        <>
          {tasks.map((t) => <ListItem key={t.id} icon="clock" title={t.title} subtitle={`${fmtTime(t.dueAt)} daily`} onPress={() => {}} />)}
          <Button label="Add a task" kind="secondary" icon="plus" onPress={() => {}} />
        </>
      ) : null}

      {tab === 'emergency' ? (
        <Card tone="alert">
          <Text variant="subheading">Emergency card</Text>
          <Field k="Allergies" v={pet.allergies} />
          <Field k="Medicines" v={pet.medicines} />
          <Field k="Own vet" v={pet.vet.name} />
          <Field k="Nearest 24x7 clinic" v={pet.clinic24x7} />
          <Field k="Backup" v={pet.backup.name} />
          <Field k="Fears and habits" v={pet.fears} />
          <Button label="Call vet" kind="danger" icon="phone" onPress={() => call(pet.vet.phone)} full />
          <Button label="Call backup" kind="secondary" icon="phone" onPress={() => call(pet.backup.phone)} full />
          <Text variant="small" tone="muted">Pawsure does not provide emergency or vet services. Details are owner-provided.</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <View>
      <Text variant="label">{k}</Text>
      <Text variant="body">{v}</Text>
    </View>
  );
}
