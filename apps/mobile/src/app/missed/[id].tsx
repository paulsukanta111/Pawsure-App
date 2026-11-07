// O7 Missed check-in: alert and escalation ladder with times (PS-031, PS-032, PS-101, PS-102, 10.4).
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, View } from 'react-native';
import { planLadder, shouldRun } from '@pawsure/domain';
import { Button, Card, color, Icon, NoticeBanner, Screen, SectionHeader, space, StatusPill, Text } from '../../design';
import { DemoClock } from '../../proto/DemoClock';
import { fmt, useProto } from '../../proto/store';

const STEP_TEXT = {
  owner_alert: { title: 'You are alerted', body: 'WhatsApp and push to you, with the last evidence.' },
  backup_look_in: { title: 'Backup gets a 15-minute look-in link', body: 'Only if you have not acknowledged. Shows the missed task, emergency card and spare-key note.' },
  suggest_cover: { title: 'Pawsure suggests cover', body: 'Friends first. Day cares and carers appear when those phases launch.' },
} as const;

export default function Missed() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch, evaluations, now } = useProto();
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return <Screen title="Not found"><Button label="Back" onPress={() => router.back()} /></Screen>;
  const ev = evaluations[task.id]!;
  const ack = state.acks[task.id];
  const resolved = state.resolved[task.id];
  const ladder = planLadder(task.id, task.type, task.dueAt);
  const taskResolved = ev.task !== 'missed' && ev.task !== 'pending';

  return (
    <Screen title={task.title} subtitle={`Due ${fmt(task.dueAt)} · ${state.helper.name}`}>
      <DemoClock compact />
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
        <StatusPill value={ev.task} />
        {ack ? <Text variant="caption" tone="success">You acknowledged at {fmt(ack)}</Text> : null}
        {resolved ? <Text variant="caption" tone="success">Resolved {fmt(resolved)}</Text> : null}
      </View>
      {taskResolved ? <NoticeBanner icon="check" tone="calm" title="Evidence arrived" body="The ladder stopped automatically." /> : null}

      <SectionHeader title="What happens and when" />
      <Card>
        {ladder.map((step) => {
          const ran = shouldRun(step, { taskResolved: taskResolved || !!resolved, ownerAcknowledgedAt: ack }, now);
          const stopped = !ran && (step.stopsOnOwnerAck && !!ack && ack <= step.at || taskResolved || !!resolved) && now >= step.at;
          const status = ran ? 'Done' : stopped ? 'Stopped' : now >= step.at ? 'Skipped' : 'Upcoming';
          return (
            <View key={step.jobKey} style={{ flexDirection: 'row', gap: space.md, paddingVertical: space.sm }}>
              <View style={{ width: 64 }}>
                <Text variant="label">{fmt(step.at)}</Text>
                <Text variant="small" tone={status === 'Done' ? 'alert' : status === 'Stopped' ? 'success' : 'muted'}>{status}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{step.step}. {STEP_TEXT[step.kind].title}</Text>
                <Text variant="caption" tone="muted">{STEP_TEXT[step.kind].body}</Text>
              </View>
            </View>
          );
        })}
        <Text variant="small" tone="muted">"I'm on it" stops steps 2 and 3. Medicine alerts at due + 15 min, walks at + 45 min.</Text>
      </Card>

      <Button label="I'm on it" onPress={() => dispatch({ type: 'ack', taskId: task.id })} disabled={!!ack} full />
      <Button label={`Call ${state.helper.name}`} kind="secondary" icon="phone" onPress={() => Linking.openURL(`tel:${state.helper.phone.replace(/\s/g, '')}`)} full />
      <Button label="Find cover" kind="secondary" icon="care" onPress={() => router.dismissTo('/find-cover')} full />
      <Button label="Mark resolved" kind="outlined" onPress={() => dispatch({ type: 'resolve', taskId: task.id })} disabled={!!resolved} full />
      <Button label="Preview the backup's look-in link" kind="outlined" onPress={() => router.push(`/look-in?task=${task.id}`)} full />
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
        <Icon name="shield" size={18} tint={color.text.muted} />
        <Text variant="small" tone="muted" style={{ flex: 1 }}>Hurt or sick? Use Emergency instead: it alerts you and your backup at once.</Text>
      </View>
    </Screen>
  );
}
