// Health calendar, history, medication reminders, vet details (PS-040, PS-041, PS-046). Reminds; never prescribes.
import { Linking } from 'react-native';
import { Button, Card, KeyValue, ListItem, NoticeBanner, Screen, SectionHeader, Text, useToast } from '../design';
import { useProto } from '../proto/store';

const HISTORY = [
  { date: '12 Aug 2026', item: 'Rabies booster', by: 'Dr. Kulkarni' },
  { date: '2 Aug 2026', item: 'Deworming tablet', by: 'Owner' },
  { date: '18 Mar 2026', item: 'Annual check-up · weight 11.6 kg', by: 'Dr. Kulkarni' },
  { date: '18 Mar 2026', item: 'DHPPi vaccine', by: 'Dr. Kulkarni' },
];

export default function Health() {
  const { state, dispatch, now } = useProto();
  const toast = useToast();
  return (
    <Screen title={`${state.pet.name}'s health`} subtitle="Dates you entered or copied from your vet.">
      <NoticeBanner icon="shield" title="Reminders only" body="Pawsure does not diagnose, prescribe or change a dose. Ask your vet." />
      <SectionHeader title="Due" />
      {state.health.map((h) => {
        const days = Math.round((h.dueOn.getTime() - now.getTime()) / 86_400_000);
        return (
          <ListItem key={h.id} icon={h.kind === 'vaccine' ? 'vaccine' : h.kind === 'deworming' ? 'medication' : 'calendar'} title={h.title} subtitle={h.detail}
            meta={h.done ? 'Done' : days <= 0 ? 'Due today' : `Due in ${days} days`} metaTone={h.done ? 'success' : days <= 7 ? 'alert' : 'muted'}
            right={h.done ? undefined : <Button label="Done" kind="outlined" onPress={() => { dispatch({ type: 'health_done', id: h.id }); toast(`${h.title} marked done`); }} />} />
        );
      })}
      <SectionHeader title="Daily medicine" />
      <ListItem icon="medication" title={state.pet.medicines} subtitle="With lunch · reminder in the helper's 1 pm prompt" meta="Alert if not checked in by 1:15 pm" />
      <SectionHeader title="History" />
      <Card>{HISTORY.map((h) => <KeyValue key={h.date + h.item} k={`${h.date} · ${h.item}`} v={h.by} />)}</Card>
      <SectionHeader title="Vet" />
      <Card>
        <KeyValue k="Own vet" v={state.pet.vet.name} />
        <KeyValue k="Phone" v={state.pet.vet.phone} />
        <KeyValue k="Nearest 24x7" v={state.pet.clinic24x7} />
        <Button label="Call vet" kind="danger" icon="phone" onPress={() => Linking.openURL(`tel:${state.pet.vet.phone.replace(/\s/g, '')}`)} />
      </Card>
    </Screen>
  );
}
