// P2 Pickup handover vs drop-off (P1 preview, C4).
import { Button, Card, KeyValue, NoticeBanner, Screen, SectionHeader, Text } from '../../design';

const ROWS: [string, string, string][] = [
  ['Coat and skin', 'Normal', 'Normal'], ['Paws and nails', 'Normal', 'Normal'], ['Eyes and ears', 'Normal', 'Normal'],
  ['Energy', 'Normal', 'Tired, happy'], ['Meals', 'Home 7:30 am', 'Snack 11 am, lunch 1 pm'],
];

export default function DcHandover() {
  return (
    <Screen title="Pickup handover" subtitle="Bruno · 6:02 pm">
      <NoticeBanner icon="leaf" title="Preview · planned for P1" />
      <SectionHeader title="Drop-off → pickup" />
      <Card>
        {ROWS.map(([k, a, b]) => <KeyValue key={k} k={k} v={`${a} → ${b}`} />)}
      </Card>
      <Card tone="calm"><Text variant="body">No differences flagged. Staff and owner both acknowledged.</Text></Card>
      <Text variant="small" tone="muted">Pre-existing marks recorded at drop-off protect the day care from blame; new ones open an incident record.</Text>
      <Button label="Confirm pickup" onPress={() => {}} full />
    </Screen>
  );
}
