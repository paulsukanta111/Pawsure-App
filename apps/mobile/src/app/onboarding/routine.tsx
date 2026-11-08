// Onboarding 5/6: daily routine (PS-010, PS-012).
import { router } from 'expo-router';
import { Button, Card, ListItem, NoticeBanner, Screen, StepHeader, Text } from '../../design';
import { TASK_ICON } from '../../proto/labels';
import { fmt, useProto } from '../../proto/store';

export default function OnboardRoutine() {
  const { state } = useProto();
  return (
    <Screen
      footer={
        <>
        <Button label="Continue" onPress={() => router.push('/onboarding/circle')} full />
        </>
      }
    >
      <StepHeader step={5} of={6} title="Daily routine" body={`Suggested from ${state.pet.name}'s profile. Change times and instructions any time.`} />
      {state.tasks.map((t) => <ListItem key={t.id} icon={TASK_ICON[t.type]} title={t.title} subtitle={`${fmt(t.dueAt)} daily`} meta={t.instructions} />)}
      <NoticeBanner icon="check" tone="calm" title="Longest time alone: 4 h 30 min" body="Out 9 am to 7 pm with these visits. Ask your vet what suits your pet." />
      <Card><Text variant="caption">Each task gets a check-in prompt for your helper and an alert for you if nothing arrives.</Text></Card>
      <Button label="Edit routine" kind="outlined" icon="clock" onPress={() => router.push('/routine')} full />
    </Screen>
  );
}
