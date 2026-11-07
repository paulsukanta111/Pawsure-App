// F3 Friend profile (owner view): tasks, availability, coarse distance, key, consented history (PS-052, PS-064, PS-069).
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Avatar, Button, Card, Chip, KeyValue, NoticeBanner, Screen, space, Text } from '../../design';
import { fmt, useProto } from '../../proto/store';

const CAP: Record<string, string> = { feeding_water: 'Feeding and water', short_walk: 'Short walks', medicine: 'Medicines', large_anxious_dog: 'Large or anxious dogs' };
const KEY: Record<string, string> = { has_key: 'Has a key', needs_handover: 'Needs key handover', no_key: 'No key' };

export default function FriendProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { friends } = useProto();
  const [blocked, setBlocked] = useState(false);
  const f = friends.find((x) => x.id === id);
  if (!f) return <Screen title="Not found"><Button label="Back" onPress={() => router.back()} /></Screen>;
  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <Avatar label={f.displayName} tone="yellow" size={64} />
        <View style={{ flex: 1 }}>
          <Text variant="h2">{f.displayName}</Text>
          <Text variant="caption" tone="muted">{f.distanceLabel} · {f.paused ? 'Paused' : 'Taking requests'}</Text>
        </View>
      </View>
      <Card>
        <Text variant="label">Comfortable with</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
          {[...f.capabilities].map((c) => <Chip key={c} label={CAP[c]!} />)}
        </View>
        <KeyValue k="Usually free" v={f.availability.map((w) => `${fmt(w.start)}–${fmt(w.end)}`).join(', ')} />
        <KeyValue k="Key" v={KEY[f.keyStatus]!} />
        <Text variant="small" tone="muted">Availability updated today. It's not a promise: they still accept each request.</Text>
      </Card>
      {f.pastHelps ? (
        <Card>
          <Text variant="label">History (shared with their consent)</Text>
          <KeyValue k="Times helped you" v={String(f.pastHelps)} />
          <KeyValue k="Usual reply time" v={`~${f.medianResponseMinutes} min`} />
          <Text variant="small" tone="muted">Counts only. Not a rating, safety check or guarantee.</Text>
        </Card>
      ) : <Text variant="caption" tone="muted">No shared history yet.</Text>}
      <Button label="Ask for help" icon="care" onPress={() => router.dismissTo('/find-cover')} full />
      {blocked ? <NoticeBanner icon="shield" tone="alert" title="Blocked" body="You won't see each other in Friend Finder. Our team has a record if you reported a problem." /> : (
        <>
          <Button label="Report a problem" kind="outlined" onPress={() => setBlocked(true)} full />
          <Button label="Block" kind="outlined" onPress={() => setBlocked(true)} full />
        </>
      )}
    </Screen>
  );
}
