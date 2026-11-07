// PS-102 Backup 15-minute look-in link. Opens without an account; expires; never shows the exact address.
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { addMinutes, planLadder } from '@pawsure/domain';
import { Button, Card, KeyValue, Logo, NoticeBanner, Screen, Text } from '../design';
import { fmt, useProto } from '../proto/store';

export default function LookIn() {
  const { task: taskId } = useLocalSearchParams<{ task?: string }>();
  const { state, dispatch, evaluations, now, alerts } = useProto();
  const task = state.tasks.find((t) => t.id === taskId) ?? state.tasks.find((t) => evaluations[t.id]!.task === 'missed');
  const step = task ? planLadder(task.id, task.type, task.dueAt)[1]! : null;
  const sent = task ? alerts.some((a) => a.taskId === task.id && a.kind === 'backup_look_in') : false;
  const expires = step ? addMinutes(step.at, 15) : null;
  const open = sent && expires && now < expires;

  useEffect(() => { if (open) dispatch({ type: 'look_in_opened' }); }, [open, dispatch]);

  return (
    <Screen header={<Logo size={28} />}>
      <Text variant="h3">Hi {state.backup.name}</Text>
      {!task || !step ? <NoticeBanner icon="check" tone="calm" title="Nothing to look into" body="No missed task right now." /> : null}
      {task && !sent ? (
        <NoticeBanner icon="clock" title="Preview: this link isn't active yet" body={`It's sent at ${fmt(step!.at)} only if Neha hasn't acknowledged the missed ${task.title.toLowerCase()}. Move the demo clock to ${fmt(step!.at)} to see it live.`} />
      ) : null}
      {task && sent && !open ? <NoticeBanner icon="alert" tone="alert" title="This link has expired" body={`It was open until ${fmt(expires!)}. Ask Neha for a new one if you still need it.`} /> : null}
      {task && (open || !sent) ? (
        <>
          <Card tone="alert">
            <Text variant="subheading">{state.pet.name}: {task.title}</Text>
            <KeyValue k="Was due" v={fmt(task.dueAt)} />
            <KeyValue k="Last evidence" v={(state.signals[task.id] ?? []).length ? 'Partial' : 'None yet'} tone="alert" />
            <KeyValue k="Helper" v={`${state.helper.name} · ${state.helper.phone}`} />
            {open ? <Text variant="small" tone="muted">Link open until {fmt(expires!)}. Every open is logged.</Text> : null}
          </Card>
          <Card>
            <Text variant="subheading">Emergency card</Text>
            <KeyValue k="Allergies" v={state.pet.allergies} tone="alert" />
            <KeyValue k="Medicines" v={state.pet.medicines} />
            <KeyValue k="Own vet" v={state.pet.vet.phone} />
            <KeyValue k="Nearest 24x7" v={state.pet.clinic24x7} />
            <KeyValue k="Spare key" v="With the security desk, name Neha" />
          </Card>
          <Button label={`Call ${state.helper.name}`} icon="phone" onPress={() => Linking.openURL(`tel:${state.helper.phone.replace(/\s/g, '')}`)} full />
          <Button label="Call the vet" kind="danger" icon="phone" onPress={() => Linking.openURL(`tel:${state.pet.vet.phone.replace(/\s/g, '')}`)} full />
          <Text variant="small" tone="muted">Your exact address isn't shown on this page. The link can't be forwarded into a new session.</Text>
        </>
      ) : null}
    </Screen>
  );
}
