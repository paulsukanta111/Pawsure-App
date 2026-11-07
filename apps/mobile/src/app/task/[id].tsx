// O6 Task detail: visit vs task evidence, reason codes, cancel, dispute (PS-015, PS-030, PS-034, PS-121, PS-122).
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  Button, Card, Chip, confidenceStyle, Divider, KeyValue, ListItem, NoticeBanner, Screen, SectionHeader, space, StatusPill, Text,
} from '../../design';
import { REASON_TEXT, SIGNAL_LABEL, TASK_ICON } from '../../proto/labels';
import { fmt, useProto } from '../../proto/store';

const CANCEL_REASONS = ['Pet at the vet', 'I did it myself', 'Not needed today'];

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch, evaluations, now } = useProto();
  const [cancelling, setCancelling] = useState(false);
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return <Screen title="Task not found"><Button label="Back" onPress={() => router.back()} /></Screen>;
  const ev = evaluations[task.id]!;
  const sigs = (state.signals[task.id] ?? []).filter((s) => s.at <= now);
  const arrival = sigs.find((s) => s.type === 'arrival_call');
  const exit = [...sigs].reverse().find((s) => s.type === 'exit_call');
  const c = confidenceStyle[ev.task];

  return (
    <Screen title={task.title} subtitle={`Due ${fmt(task.dueAt)} · ${state.helper.name}`}>
      {task.cancelled ? <NoticeBanner icon="alert" title="Cancelled" body={`${task.cancelReason}. Not counted in today's covered-day result.`} /> : null}

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="subheading">Task</Text>
          <StatusPill value={ev.task} />
        </View>
        <Text variant="body">{c.explain}</Text>
        {task.instructions ? <KeyValue k="Instructions" v={task.instructions} /> : null}
        <Divider />
        <Text variant="subheading">Visit</Text>
        <Text variant="body">
          {arrival && exit ? `${state.helper.name} came ${fmt(arrival.at)}–${fmt(exit.at)} (${ev.visitMinutes} min).` : arrival ? `Arrival call at ${fmt(arrival.at)}; no leaving call yet.` : 'No arrival or leaving signal.'}
        </Text>
        <Text variant="small" tone="muted">A visit shows someone came. It never proves a task was done on its own.</Text>
      </Card>

      <SectionHeader title="Why this label" />
      <Card>
        {ev.reasons.map((r) => <Text key={r} variant="caption">• {REASON_TEXT[r] ?? r}</Text>)}
        <Text variant="small" tone="muted">Rule set {ev.ruleVersion}. Points: {ev.points === 'earn' ? 'earned' : ev.points === 'held' ? 'held while we check' : 'none'}.</Text>
      </Card>

      <SectionHeader title="Signals received" />
      {sigs.length === 0 ? <Text variant="caption" tone="muted">Nothing yet.</Text> : null}
      {sigs.map((s) => {
        const meta = SIGNAL_LABEL[s.type];
        return (
          <ListItem key={s.id} icon={meta.icon} title={meta.label} subtitle={`${fmt(s.at)} · ${meta.kind === 'task' ? 'task evidence' : 'visit evidence'}`}
            meta={s.code ? `Code ${s.code}` : s.namesTask ? 'Names the task' : undefined} />
        );
      })}

      {!task.cancelled ? (
        <>
          <SectionHeader title="Something wrong?" />
          <Button label="Flag a mismatch" kind="secondary" onPress={() => { dispatch({ type: 'return_check', answers: { [task.id]: 'not_done' } }); }} full />
          <Text variant="small" tone="muted">A mismatch holds points for up to 7 days. {state.helper.name} sees the reason and can respond; one mismatch is never a misconduct finding.</Text>
          {ev.task === 'missed' ? <Button label="Open alert" kind="outlined" onPress={() => router.push(`/missed/${task.id}`)} full /> : null}
          {!cancelling ? (
            <Button label="Cancel this task today" kind="outlined" onPress={() => setCancelling(true)} full />
          ) : (
            <Card>
              <Text variant="label">Why?</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {CANCEL_REASONS.map((r) => <Chip key={r} label={r} onPress={() => { dispatch({ type: 'cancel_task', id: task.id, reason: r }); setCancelling(false); }} />)}
              </View>
            </Card>
          )}
        </>
      ) : null}
      <Text variant="small" tone="muted">Changes are timestamped and never overwrite history.</Text>
      <ListItem icon={TASK_ICON[task.type]} title="Edit routine" onPress={() => router.push('/routine')} />
    </Screen>
  );
}
