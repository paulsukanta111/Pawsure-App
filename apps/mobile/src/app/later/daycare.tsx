// O9 day-care detail and booking (P1 preview): score breakdown, red lines, registration, vet sign-off, certificate (PS-073, PS-074, PS-113, PS-114).
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Chip, color, KeyValue, NoticeBanner, radius, Screen, SectionHeader, space, Text } from '../../design';
import { DAY_CARES, RED_LINES } from '../../proto/later';

export default function DayCare() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const d = DAY_CARES.find((x) => x.id === id) ?? DAY_CARES[0]!;
  const [slot, setSlot] = useState('9 am – 6 pm');
  return (
    <Screen title={d.name} subtitle={`${d.distance} · ₹${d.price} per stay`}>
      <NoticeBanner icon="leaf" title="Preview · planned for P1" />
      <Card tone="brand">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View><Text variant="label">Pawsure grade</Text><Text variant="h1">{d.grade}</Text></View>
          <View style={{ alignItems: 'flex-end' }}><Text variant="h3">{d.score}/100</Text><Text variant="small">Live score: 70% audit + 30% proof from stays</Text></View>
        </View>
        <Text variant="small">Certificate valid until {d.certificateUntil}. Re-checked quarterly by surprise visit.</Text>
        <Chip label="View certificate" onPress={() => router.push('/later/certificate')} />
      </Card>
      <SectionHeader title="Score breakdown" />
      <Card>
        {d.categories.map((c) => (
          <View key={c.name} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="caption">{c.name}</Text><Text variant="label">{c.points}/{c.max}</Text>
            </View>
            <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: color.bg.canvas, borderWidth: 1, borderColor: color.border.subtle }}>
              <View style={{ width: `${(c.points / c.max) * 100}%`, height: '100%', borderRadius: radius.pill, backgroundColor: color.action.primary }} />
            </View>
          </View>
        ))}
      </Card>
      <SectionHeader title="Red lines (all passed)" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        {RED_LINES.map((r) => <Chip key={r} label={`✓ ${r}`} />)}
      </View>
      <Card>
        <KeyValue k="State Animal Welfare Board registration" v={d.registration} />
        <KeyValue k="Health findings" v="Reviewed by a qualified vet" tone="success" />
        <KeyValue k="Free-roam / crate hours" v={`${d.freeRoamHours} h / ${d.crateHours} h`} />
        <KeyValue k="Staff to dogs" v={d.staffRatio} />
      </Card>
      <SectionHeader title="Booking (preview)" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {['9 am – 1 pm', '9 am – 6 pm', '2 pm – 8 pm'].map((s) => <Chip key={s} label={s} selected={slot === s} onPress={() => setSlot(s)} />)}
      </View>
      <Text variant="small" tone="muted">Free cancellation up to 2 hours before. Refunds go back to your payment method. Multi-day boarding is not offered.</Text>
      <Button label={`Preview booking ${slot} · ₹${d.price}`} kind="secondary" onPress={() => router.push('/later/dropoff')} full />
      <Text variant="small" tone="muted">Booking isn't available in this release. This shows how the drop-off would look.</Text>
    </Screen>
  );
}
