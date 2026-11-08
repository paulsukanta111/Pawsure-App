// O2 Pet profile, O3 routine, O14 Emergency card, O15 health (PS-003, PS-004, PS-010, PS-035, PS-040, PS-106).
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  Button, Card, Character, Chip, color, IconTile, KeyValue, LineChart, radius, ListItem, PetAvatar, Screen, SectionHeader, SegmentedTabs, space, Text,
} from '../../design';
import { TASK_ICON } from '../../proto/labels';
import { fmt, useProto } from '../../proto/store';

type Tab = 'health' | 'routine' | 'emergency';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Pet() {
  const { state, now } = useProto();
  const [tab, setTab] = useState<Tab>('health');
  const pet = state.pet;
  return (
    <Screen>
      <View style={{ alignItems: 'center', backgroundColor: color.bg.paper, borderRadius: radius.xl, borderWidth: 1, borderColor: color.border.subtle, paddingTop: space.md, overflow: 'hidden' }}>
        <Character name={pet.species === 'cat' ? 'avatarKitto' : 'poseSparky'} height={180} label={`${pet.name}`} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <PetAvatar species={pet.species} size={56} />
        <View style={{ flex: 1 }}>
          <Text variant="h2">{pet.name}</Text>
          <Text variant="caption" tone="muted">{pet.breed} {pet.speciesLabel.toLowerCase()} · {pet.age} · {pet.weightKg} kg</Text>
        </View>
        <Button label="Edit" kind="outlined" onPress={() => router.push('/pet-edit')} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        {pet.tags.map((t) => <Chip key={t} label={t} />)}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {([['health', 'Health'], ['food', 'Food'], ['activity', 'Walks'], ['calendar', 'Records']] as const).map(([i, l]) => (
          <View key={l} style={{ alignItems: 'center', gap: 4 }}><IconTile name={i} /><Text variant="small">{l}</Text></View>
        ))}
      </View>
      <Text variant="body">{pet.about}</Text>

      <SegmentedTabs value={tab} onChange={setTab} options={[{ value: 'health', label: 'Health' }, { value: 'routine', label: 'Routine' }, { value: 'emergency', label: 'Emergency' }]} />

      {tab === 'health' ? (
        <>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <Text variant="label">Weight</Text>
                <Text variant="h3">{pet.weightKg} kg</Text>
              </View>
              <Text variant="small" tone="success">+0.3 kg this month</Text>
            </View>
            <LineChart data={pet.weightSeries} labels={DAYS} unit=" kg" />
          </Card>
          <ListItem icon="food" title="Food" subtitle={pet.food} meta="Owner-provided" />
          <ListItem icon="activity" title="Walks this week" subtitle="5 of 7 afternoon walks with evidence" meta="Good" metaTone="success" />
          <ListItem icon="water" title="Water" subtitle="Bowl refilled at lunch daily" meta="Good" metaTone="success" />
          <SectionHeader title="Reminders" action="All" onAction={() => router.push('/health')} />
          {state.health.map((h) => {
            const d = Math.round((h.dueOn.getTime() - now.getTime()) / 86_400_000);
            return <ListItem key={h.id} icon={h.kind === 'vaccine' ? 'vaccine' : h.kind === 'deworming' ? 'medication' : 'calendar'} title={h.title} subtitle={h.detail}
              meta={h.done ? 'Done' : d <= 0 ? 'Today' : `Due in ${d} days`} metaTone={h.done ? 'success' : d <= 7 ? 'alert' : 'muted'} onPress={() => router.push('/health')} />;
          })}
        </>
      ) : null}

      {tab === 'routine' ? (
        <>
          {state.tasks.map((t) => <ListItem key={t.id} icon={TASK_ICON[t.type]} title={t.title} subtitle={`${fmt(t.dueAt)} daily`} meta={t.instructions} onPress={() => router.push(`/task/${t.id}`)} />)}
          <Button label="Edit routine" kind="secondary" icon="clock" onPress={() => router.push('/routine')} full />
        </>
      ) : null}

      {tab === 'emergency' ? (
        <Card tone="alert">
          <Text variant="subheading">Emergency card</Text>
          <KeyValue k="Allergies" v={pet.allergies} tone="alert" />
          <KeyValue k="Medicines" v={pet.medicines} />
          <KeyValue k="Own vet" v={pet.vet.name} />
          <KeyValue k="Nearest 24x7 clinic" v={pet.clinic24x7} />
          <KeyValue k="Fears and habits" v={pet.fears} />
          <Button label="Open emergency" kind="danger" icon="alert" onPress={() => router.push('/emergency')} full />
        </Card>
      ) : null}
    </Screen>
  );
}
