// P5 Carer levels and O8 carer cards (P2 preview, PS-075, PS-116, 11.3, C5).
import { router } from 'expo-router';
import { View } from 'react-native';
import { Avatar, Card, Chip, KeyValue, ListItem, NoticeBanner, Screen, SectionHeader, space, Text } from '../../design';
import { CARERS } from '../../proto/later';

const LEVELS = [
  { level: 'Verified', how: 'ID check, police verification and two pet-owner references.' },
  { level: 'Trained', how: 'Practical test with a dog, quiz in their language, first-aid modules.' },
  { level: 'Trusted', how: '50+ verified visits, 90%+ Confirmed or Likely, no unresolved serious incident.' },
];

export default function Carers() {
  return (
    <Screen title="Verified carers" subtitle="Levels are earned, never bought.">
      <NoticeBanner icon="leaf" title="Preview · planned for P2" body="Bookings stay off until terms, insurance and legal review are approved." />
      {CARERS.map((c) => (
        <Card key={c.id}>
          <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <Avatar label={c.name} tone={c.level === 'Trusted' ? 'dark' : c.level === 'Trained' ? 'yellow' : 'beige'} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{c.name}</Text>
              <Text variant="caption" tone="muted">{c.distance} · ₹{c.price} per visit</Text>
            </View>
            <Chip label={c.level} />
          </View>
          <KeyValue k="Verified visits" v={String(c.visits)} />
          <KeyValue k="Confirmed or Likely" v={`${c.confirmedShare}%`} />
          <KeyValue k="First aid" v={c.firstAid ? 'Done' : 'In progress'} />
        </Card>
      ))}
      <SectionHeader title="How levels work" />
      {LEVELS.map((l) => <ListItem key={l.level} icon="shield" title={l.level} subtitle={l.how} />)}
      <ListItem icon="activity" title="See a carer visit" onPress={() => router.push('/later/carer-visit')} />
    </Screen>
  );
}
