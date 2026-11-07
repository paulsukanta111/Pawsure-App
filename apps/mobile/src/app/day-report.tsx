// O13 Day report: covered day, each task, calls, points and streak (PS-016, PS-103, PS-111).
import { router } from 'expo-router';
import { Linking, View } from 'react-native';
import { Button, Card, ListItem, Screen, SectionHeader, space, Stat, StatusPill, Text } from '../design';
import { TASK_ICON } from '../proto/labels';
import { fmt, useProto } from '../proto/store';

export default function DayReport() {
  const { state, evaluations, day, pointsThisMonth, streakDays, verifiedVisits, alerts, now } = useProto();
  const trusted = state.helper.mode === 'trusted';
  const unresolved = alerts.filter((a) => !a.acknowledged);
  const upcoming = state.health.filter((h) => !h.done && h.dueOn.getTime() - now.getTime() < 7 * 86_400_000);
  return (
    <Screen title="Day report" subtitle={`${state.pet.name} · as of ${fmt(now)}`}>
      <Card tone={day.outcome === 'covered' ? 'calm' : day.outcome === 'not_covered' ? 'alert' : 'plain'}>
        <Text variant="h3">
          {day.outcome === 'covered' ? 'Covered care day' : day.outcome === 'unknown' ? 'Unknown: not marked yet' : day.outcome === 'excluded' ? 'No tasks planned' : 'Not a covered day yet'}
        </Text>
        <Text variant="caption">
          {day.verified ? 'Every task was Confirmed or Likely without needing your check.' : trusted ? 'Trusted helper mode counts a day only when you tap Covered.' : 'Tasks without evidence need your return check, or a missed task needs handling.'}
        </Text>
        <Text variant="small" tone="muted">Rule {day.ruleVersion}. You can correct today within 48 hours.</Text>
      </Card>

      {!trusted ? (
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Stat value={String(pointsThisMonth)} label={`${state.helper.name}'s points this month`} icon="paw" />
          <Stat value={`${streakDays} days`} label="On-time streak" icon="activity" />
          <Stat value={String(verifiedVisits)} label="Verified visits" icon="check" />
        </View>
      ) : null}

      <SectionHeader title="Tasks" />
      {state.tasks.map((t) => (
        <ListItem key={t.id} icon={TASK_ICON[t.type]} title={t.title} subtitle={t.cancelled ? `Cancelled: ${t.cancelReason}` : fmt(t.dueAt)}
          right={trusted || t.cancelled ? undefined : <StatusPill value={evaluations[t.id]!.task} />} onPress={() => router.push(`/task/${t.id}`)} />
      ))}

      <SectionHeader title="Calls you placed from the app" />
      <Text variant="caption" tone="muted">1 call to {state.helper.name} at 1:40 pm. Tracking this shows whether Pawsure is reducing checking calls.</Text>

      {unresolved.length ? (
        <>
          <SectionHeader title="Still open" />
          {unresolved.map((a) => <ListItem key={a.id} icon="alert" title={a.title} subtitle={fmt(a.at)} metaTone="alert" onPress={() => router.push(a.taskId ? `/missed/${a.taskId}` : '/emergency')} />)}
        </>
      ) : null}

      {upcoming.length ? (
        <>
          <SectionHeader title="Coming up this week" />
          {upcoming.map((h) => <ListItem key={h.id} icon="calendar" title={h.title} subtitle={h.detail} />)}
        </>
      ) : null}

      {!trusted ? <Button label={`Thank ${state.helper.name} on WhatsApp`} icon="care" onPress={() => Linking.openURL('https://wa.me/?text=Thank%20you%20for%20looking%20after%20Bruno%20today!')} full /> : null}
    </Screen>
  );
}
