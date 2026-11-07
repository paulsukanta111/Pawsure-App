// P6 Carer visit: handbook, check-in near home, task checklist, in-app photos, walk route (P2 preview, C5).
import { useState } from 'react';
import { Button, Card, Checkbox, KeyValue, NoticeBanner, Screen, SectionHeader, Text } from '../../design';
import { useProto } from '../../proto/store';

export default function CarerVisit() {
  const { state } = useProto();
  const [done, setDone] = useState<string[]>([]);
  const tasks = ['Feed 1 cup kibble', 'Refill water', 'Joint supplement with food', '20-minute walk', 'Halfway walk photo (random prompt)'];
  return (
    <Screen title="Visit · Ravi" subtitle={`${state.pet.name} · 1:00 pm`}>
      <NoticeBanner icon="leaf" title="Preview · planned for P2" />
      <Card>
        <Text variant="subheading">Pet handbook</Text>
        <KeyValue k="Allergies" v={state.pet.allergies} tone="alert" />
        <KeyValue k="Fears" v={state.pet.fears} />
        <KeyValue k="Key" v="Shared after check-in near home" />
      </Card>
      <Button label="Check in (location near home)" icon="home" onPress={() => {}} full />
      <SectionHeader title="Tasks" />
      <Card>
        {tasks.map((t) => <Checkbox key={t} label={t} checked={done.includes(t)} onChange={(v) => setDone((d) => (v ? [...d, t] : d.filter((x) => x !== t)))} />)}
      </Card>
      <Text variant="small" tone="muted">Photos are taken in the app only. Walk start and end are recorded; route endpoints near the home are hidden.</Text>
      <Button label="Report a problem" kind="outlined" onPress={() => {}} full />
      <Button label="Check out" onPress={() => {}} disabled={done.length < tasks.length} full />
    </Screen>
  );
}
