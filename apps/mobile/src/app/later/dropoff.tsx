// O10 Drop-off condition card and handover code (P1 preview, C4).
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Card, color, IllustrationSlot, KeyValue, NoticeBanner, radius, Screen, SectionHeader, space, Text } from '../../design';
import { useProto } from '../../proto/store';

export default function DropOff() {
  const { state } = useProto();
  return (
    <Screen title="Drop-off card" subtitle={`${state.pet.name} at Happy Paws Powai · 9:04 am`}>
      <NoticeBanner icon="leaf" title="Preview · planned for P1" />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {['Front', 'Side', 'Paws'].map((p) => <View key={p} style={{ flex: 1 }}><IllustrationSlot name={p} height={90} /></View>)}
      </View>
      <Card>
        <KeyValue k="Coat and skin" v="Normal" />
        <KeyValue k="Paws and nails" v="Normal" />
        <KeyValue k="Eyes and ears" v="Normal" />
        <KeyValue k="Meal given at home" v="7:30 am" />
        <KeyValue k="Energy" v="Normal" />
        <KeyValue k="Weight" v={`${state.pet.weightKg} kg`} />
        <Text variant="small" tone="muted">Photos are taken in the app at drop-off, time-stamped. Gallery uploads don't count.</Text>
      </Card>
      <SectionHeader title="Handover code" />
      <View style={{ alignSelf: 'center', padding: space.lg, borderRadius: radius.lg, borderWidth: 2, borderColor: color.border.strong, backgroundColor: color.action.primary }}>
        <Text variant="h2">7 3 1 9</Text>
      </View>
      <Text variant="caption" align="center">Staff enter this to confirm they received {state.pet.name}. Pickup is compared against this card.</Text>
      <Button label="See the stay" onPress={() => router.push('/later/stay')} full />
    </Screen>
  );
}
