// O2 Pet profile, O3 routine, O14 Emergency card, O15 health (PS-003, PS-004, PS-010, PS-035, PS-040, PS-106).
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  Button, Card, Character, Chip, color, Icon, IconButton, KeyValue, LineChart, ListItem, MetricRow, QuickAction, radius, Screen, SectionHeader,
  SegmentedTabs, space, Text,
} from '../../design';
import { TASK_ICON } from '../../proto/labels';
import { fmt, useProto } from '../../proto/store';

type Tab = 'health' | 'routine' | 'emergency';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Pet() {
  const { state, now } = useProto();
  const [tab, setTab] = useState<Tab>('health');
  const [range, setRange] = useState<'week' | 'month' | 'year'>('week');
  const pet = state.pet;
  return (
    <Screen>
      {/* Mockup pet profile: the character on a soft yellow circle. */}
      <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: 210 }}>
        <View style={{ position: 'absolute', bottom: 0, width: 200, height: 200, borderRadius: radius.pill, backgroundColor: color.bg.selected }} />
        <Character name={pet.species === 'cat' ? 'avatarKitto' : 'poseSparky'} height={200} label={`${pet.name}`} />
      </View>
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
          <Text variant="h2">{pet.name}</Text>
          <IconButton name="edit" label={`Edit ${pet.name}'s profile`} onPress={() => router.push('/pet-edit')} />
        </View>
        <Text variant="caption" tone="muted">{pet.breed} {pet.speciesLabel.toLowerCase()} · {pet.age} · {pet.weightKg} kg</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {pet.tags.map((t) => <Chip key={t} label={t} />)}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <QuickAction icon="health" label="Health" selected={tab === 'health'} onPress={() => setTab('health')} />
        <QuickAction icon="food" label="Routine" selected={tab === 'routine'} onPress={() => setTab('routine')} />
        <QuickAction icon="alert" label="Emergency" selected={tab === 'emergency'} onPress={() => setTab('emergency')} />
        <QuickAction icon="records" label="Records" onPress={() => router.push('/health')} />
      </View>
      <View style={{ gap: space.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="subheading" style={{ fontFamily: 'Mukta_600SemiBold' }}>About {pet.name}</Text>
          <IconButton name="edit" label={`Edit about ${pet.name}`} onPress={() => router.push('/pet-edit')} />
        </View>
        <Text variant="body">{pet.about}</Text>
      </View>


      {tab === 'health' ? (
        <>
          <SegmentedTabs value={range} onChange={setRange} options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }]} />
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text variant="label" tone="muted">Weight</Text>
                <Text variant="h2">{pet.weightKg} kg</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: space.md }}>
                <Icon name="arrowUp" size={16} tint={color.text.success} />
                <Text variant="label" tone="success">+0.3 kg</Text>
              </View>
            </View>
            {range === 'week' ? <LineChart data={pet.weightSeries} labels={DAYS} unit=" kg" /> : (
              <Text variant="caption" tone="muted">{range === 'month' ? 'Monthly' : 'Yearly'} view fills in as you log weights. Showing this week for now.</Text>
            )}
          </Card>
          <MetricRow icon="food" title="Food" value={pet.food} status="Owner-provided" statusTone="muted" />
          <MetricRow icon="activity" title="Walks this week" value="5 of 7 with evidence" status="Good" />
          <MetricRow icon="water" title="Water" value="Bowl refilled at lunch daily" status="Good" />
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
