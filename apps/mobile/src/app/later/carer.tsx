// P2 preview: verified carer profile - ID verification status, levels, skills, first aid, visit history (11.3, C5, PS-116).
import { View } from 'react-native';
import { Avatar, Card, Chip, KeyValue, ListItem, NoticeBanner, Screen, SectionHeader, space, Text } from '../../design';

const LEVELS: [string, string, boolean][] = [
  ['Verified', 'ID check, police verification, two references', true],
  ['Trained', 'Practical dog test, quiz, first-aid modules', true],
  ['Trusted', '50+ verified visits, 90%+ Confirmed or Likely, no serious incident', true],
];
const VISITS = [['6 Nov', 'Bruno · walk + feed', 'Confirmed'], ['4 Nov', 'Coco · feed', 'Confirmed'], ['2 Nov', 'Max · walk', 'Likely'], ['30 Oct', 'Bruno · walk', 'Confirmed']];

export default function CarerProfile() {
  return (
    <Screen>
      <NoticeBanner icon="leaf" title="Preview · planned for P2" body="Carer booking stays off until terms, insurance and legal review are approved." />
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <Avatar label="Ravi" tone="dark" size={64} />
        <View style={{ flex: 1 }}>
          <Text variant="h2">Ravi</Text>
          <Text variant="caption" tone="muted">Walker and sitter · same society · ₹350 per visit</Text>
        </View>
        <Chip label="Trusted" />
      </View>
      <SectionHeader title="Verification" />
      <Card>
        <KeyValue k="Identity check" v="Done · 14 Mar 2026" tone="success" />
        <KeyValue k="Police verification" v="Done · 2 Apr 2026" tone="success" />
        <KeyValue k="References" v="2 pet owners" tone="success" />
        <KeyValue k="Yearly ID re-check due" v="Mar 2027" />
        <Text variant="small" tone="muted">Checks completed and dates. Not a guarantee of future conduct.</Text>
      </Card>
      <SectionHeader title="Levels (earned, never bought)" />
      {LEVELS.map(([l, how, done]) => <ListItem key={l} icon={done ? 'check' : 'clock'} title={l} subtitle={how} meta={done ? 'Reached' : 'In progress'} metaTone={done ? 'success' : 'muted'} />)}
      <SectionHeader title="Skills" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        <Chip label="First aid ✓" /><Chip label="Large dogs" /><Chip label="Medicines" /><Chip label="Puppies" />
      </View>
      <SectionHeader title="Visit history" />
      <Card>
        <KeyValue k="Verified visits" v="64" />
        <KeyValue k="Confirmed or Likely" v="94%" />
        {VISITS.map(([d, w, r]) => <KeyValue key={d + w} k={`${d} · ${w}`} v={r} />)}
      </Card>
    </Screen>
  );
}
