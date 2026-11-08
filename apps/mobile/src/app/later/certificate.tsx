// P1 preview: Pawsure certificate with QR to the live score (11.2, PS-073). Private assessment, never government approval.
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Card, color, KeyValue, NoticeBanner, radius, Screen, space, Text } from '../../design';

// A decorative QR-like pattern for the preview (not a scannable code).
const CELLS = Array.from({ length: 121 }, (_, i) => ((i * 7919) % 13) % 3 === 0);

export default function Certificate() {
  return (
    <Screen title="Certificate" subtitle="Happy Paws Powai">
      <NoticeBanner icon="leaf" title="Preview · planned for P1" body="Not active in this release. Sample day care." />
      <Card tone="brand">
        <Text variant="label">Pawsure graded day care</Text>
        <Text variant="h1">A · 88</Text>
        <KeyValue k="Live score" v="88 (70% audit + 30% proof from stays)" />
        <KeyValue k="Audited" v="12 Oct 2026" />
        <KeyValue k="Valid until" v="12 Jan 2027" />
        <View style={{ alignItems: 'center', paddingVertical: space.md }}>
          <View style={{ padding: space.sm, backgroundColor: color.bg.raised, borderRadius: radius.md, borderWidth: 1, borderColor: color.border.strong }}>
            <Svg width={132} height={132} viewBox="0 0 11 11" accessibilityLabel="Sample QR placeholder">
              {CELLS.map((on, i) => (on ? <Rect key={i} x={i % 11} y={Math.floor(i / 11)} width={1} height={1} fill={color.text.primary} /> : null))}
              <Rect x={0} y={0} width={3} height={3} fill={color.text.primary} /><Rect x={8} y={0} width={3} height={3} fill={color.text.primary} /><Rect x={0} y={8} width={3} height={3} fill={color.text.primary} />
            </Svg>
          </View>
          <Text variant="small" tone="muted">Scan for the live score (placeholder pattern)</Text>
        </View>
        <Text variant="small">A private Pawsure assessment. Not a government approval or licence. Grades are never bought.</Text>
      </Card>
    </Screen>
  );
}
