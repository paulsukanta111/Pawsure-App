// F2 Friends list and invite, F3 friend profile (PS-050 to PS-054, PS-069).
import { View } from 'react-native';
import { Button, Card, Chip, IconTile, Screen, SectionHeader, space, Text } from '../../design';
import { friends } from '../../demo/data';

const KEY: Record<string, string> = { has_key: 'Has a key', needs_handover: 'Needs key handover', no_key: 'No key' };
const CAP: Record<string, string> = { feeding_water: 'Feeding', short_walk: 'Walks', medicine: 'Medicine', large_anxious_dog: 'Large/anxious dogs' };

export default function Friends() {
  return (
    <Screen title="Friends" subtitle="People you trust who chose to help. They only see your society and tower.">
      <Button label="Invite a friend on WhatsApp" icon="plus" onPress={() => {}} full />
      <Text variant="small" tone="muted">An invite isn't consent to be found. Each friend opts in separately and can pause or leave any time.</Text>
      <SectionHeader title="Your friends" />
      {friends.map((f) => (
        <Card key={f.id}>
          <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <IconTile name="profile" />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{f.displayName}</Text>
              <Text variant="caption" tone="muted">{f.distanceLabel} · {KEY[f.keyStatus]}</Text>
            </View>
            <Text variant="label" tone={f.paused ? 'alert' : 'success'}>{f.paused ? 'Paused' : 'Available'}</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
            {[...f.capabilities].map((c) => <Chip key={c} label={CAP[c]!} />)}
          </View>
          {f.pastHelps ? <Text variant="small" tone="muted">Helped {f.pastHelps} times · usually replies in ~{f.medianResponseMinutes} min</Text> : null}
        </Card>
      ))}
      <Card tone="brand">
        <Text variant="caption">Nearby members (people outside your circle) stay switched off until ID checks are approved.</Text>
      </Card>
    </Screen>
  );
}
