// O8 day-care cards (P1 preview): grade, score, distance, free-roam vs crate hours, staff ratio (PS-112).
import { router } from 'expo-router';
import { View } from 'react-native';
import { Card, Chip, KeyValue, NoticeBanner, Screen, space, Text } from '../../design';
import { DAY_CARES } from '../../proto/later';

export default function DayCares() {
  return (
    <Screen title="Day cares near you" subtitle="Graded against a published 100-point standard. Grades are never bought.">
      <NoticeBanner icon="leaf" title="Preview · planned for P1" body="Not available in the pilot. Sample day cares shown." />
      {DAY_CARES.map((d) => (
        <Card key={d.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="bodyStrong">{d.name}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="h3">{d.grade}</Text>
              <Text variant="small" tone="muted">{d.score}/100</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
            <Chip label={d.distance} /><Chip label={`₹${d.price}/stay`} /><Chip label={`Registration: ${d.registration}`} />
          </View>
          <KeyValue k="Free-roam hours per day" v={`${d.freeRoamHours} h`} />
          <KeyValue k="Cage/crate hours per day" v={`${d.crateHours} h`} />
          <KeyValue k="Staff to dogs" v={d.staffRatio} />
          <KeyValue k="Last audit" v={d.lastAudit} />
          <Text variant="small" tone="muted">Values come from the audit, not the facility's own description.</Text>
          <Chip label="View and book" onPress={() => router.push(`/later/daycare?id=${d.id}`)} />
        </Card>
      ))}
      <Text variant="small" tone="muted">A Pawsure grade is a private assessment, never a government approval.</Text>
    </Screen>
  );
}
