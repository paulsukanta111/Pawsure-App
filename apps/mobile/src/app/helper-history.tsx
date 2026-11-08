// Owner: helper performance and check-in history (PS-015, PS-034, PS-117 method mix). Counts, not a rating.
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Card, Chip, ListItem, NoticeBanner, Screen, SectionHeader, space, Stat, StatusPill, Text } from '../design';
import { CONSENT_TEXT } from '../proto/HelperInvite';
import { TASK_ICON } from '../proto/labels';
import { fmt, useProto } from '../proto/store';

const PAST: { day: string; done: number; total: number; method: string; note?: string }[] = [
  { day: 'Yesterday', done: 4, total: 4, method: 'Photo with code' },
  { day: 'Thu', done: 4, total: 4, method: 'Photo with code' },
  { day: 'Wed', done: 3, total: 4, method: 'Photo + voice note', note: 'Walk: visit only, no task evidence' },
  { day: 'Tue', done: 4, total: 4, method: 'Photo with code' },
  { day: 'Mon', done: 4, total: 4, method: 'Missed call + code' },
  { day: 'Sun', done: 2, total: 2, method: 'Photo with code' },
];

export default function HelperHistory() {
  const { state, evaluations, pointsThisMonth } = useProto();
  const h = state.helper;
  const mismatches = state.tasks.filter((t) => evaluations[t.id]?.mismatch);
  return (
    <Screen title={`${h.name}'s check-ins`} subtitle={CONSENT_TEXT[h.consent].title}>
      {h.mode === 'trusted' ? <NoticeBanner icon="care" title="Trusted helper mode" body="No check-ins, alerts or points while this is on. History below is from before." /> : null}
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <Stat value="92%" label="Tasks with evidence, last 30 days" icon="check" />
        <Stat value="27 s" label="Median time per check-in" icon="clock" />
        <Stat value={String(pointsThisMonth)} label="Points from your home this month" icon="paw" />
      </View>
      <Card>
        <Text variant="label">How she checks in</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
          <Chip label="Photo with code · 78%" /><Chip label="Voice note · 12%" /><Chip label="Missed call + code · 10%" />
        </View>
        <Text variant="small" tone="muted">Counts to understand what works for her. Never a public rating or ranking.</Text>
      </Card>

      <SectionHeader title="Today" />
      {state.tasks.filter((t) => !t.cancelled).map((t) => (
        <ListItem key={t.id} icon={TASK_ICON[t.type]} title={t.title} subtitle={fmt(t.dueAt)} right={<StatusPill value={evaluations[t.id]!.task} />} onPress={() => router.push(`/task/${t.id}`)} />
      ))}

      {mismatches.length ? (
        <>
          <SectionHeader title="Mismatches" />
          {mismatches.map((t) => {
            const d = state.disputes[t.id];
            return (
              <ListItem key={t.id} icon="alert" title={t.title} subtitle={d?.helperText ? `She replied: "${d.helperText}"` : 'Waiting for her reply'}
                meta={d?.decision ? (d.decision === 'release' ? `Released: ${d.reason}` : `Not given: ${d.reason}`) : 'Points on hold, up to 7 days'}
                metaTone={d?.decision === 'release' ? 'success' : 'alert'} onPress={() => router.push(`/task/${t.id}`)} />
            );
          })}
        </>
      ) : null}

      <SectionHeader title="Earlier" />
      {PAST.map((p) => (
        <ListItem key={p.day} icon="calendar" title={`${p.day} · ${p.done} of ${p.total} tasks with evidence`} subtitle={p.method} meta={p.note} metaTone={p.note ? 'alert' : 'muted'} />
      ))}
      <Button label="Change method, language or mode" kind="secondary" onPress={() => router.push('/helper-invite')} full />
    </Screen>
  );
}
