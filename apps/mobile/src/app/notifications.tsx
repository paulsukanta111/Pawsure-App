// Alerts feed: missed-task ladder steps and incidents.
import { router } from 'expo-router';
import { Button, ListItem, Screen, Text } from '../design';
import { DemoClock } from '../proto/DemoClock';
import { fmt, useProto } from '../proto/store';

export default function Notifications() {
  const { alerts } = useProto();
  return (
    <Screen title="Alerts" subtitle="Newest first. Everything is also in the day report.">
      <DemoClock compact />
      {alerts.length === 0 ? <Text variant="body" tone="muted">Nothing needs you right now.</Text> : null}
      {alerts.map((a) => (
        <ListItem
          key={a.id}
          icon={a.kind === 'incident' ? 'alert' : a.kind === 'backup_look_in' ? 'friends' : a.kind === 'suggest_cover' ? 'care' : 'reminder'}
          title={a.title}
          subtitle={`${fmt(a.at)}${a.acknowledged ? ' · acknowledged' : ''}`}
          meta={a.body}
          metaTone={a.acknowledged ? 'muted' : 'alert'}
          onPress={() => router.push(a.taskId ? `/missed/${a.taskId}` : '/emergency')}
        />
      ))}
      <Button label="Back to today" kind="outlined" onPress={() => router.back()} />
    </Screen>
  );
}
