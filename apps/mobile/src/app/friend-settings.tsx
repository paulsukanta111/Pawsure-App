// F7 Friend profile settings: windows, tasks, pause all, location scope, nearby opt-in (PS-052 to PS-054, 9.3, 9.5).
import { View } from 'react-native';
import { Card, Chip, NoticeBanner, Screen, SectionHeader, space, Text, Toggle } from '../design';
import { useProto } from '../proto/store';

const CAPS: { value: string; label: string }[] = [
  { value: 'feeding_water', label: 'Feeding and water' },
  { value: 'short_walk', label: 'Short walks' },
  { value: 'medicine', label: 'Medicines' },
  { value: 'large_anxious_dog', label: 'Large or anxious dogs' },
];
const WINDOWS = ['Weekdays 7–9 am', 'Weekdays 6–9 pm', 'Weekends 10 am–1 pm', 'Weekends 4–8 pm'];
const KEYS = [{ v: 'has_key', l: 'I can hold a key' }, { v: 'needs_handover', l: 'Only with handover' }, { v: 'no_key', l: 'No keys' }] as const;

export default function FriendSettings() {
  const { state, dispatch } = useProto();
  const p = state.myFriendProfile;
  const set = (patch: Partial<typeof p>) => dispatch({ type: 'my_friend_profile', patch });
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  return (
    <Screen title="My help settings" subtitle="How you can help friends. Changes apply within 60 seconds.">
      <Card>
        <Toggle label="Pause all requests" value={p.paused} onChange={(v) => set({ paused: v })} />
        <Text variant="small" tone="muted">Saying no or pausing never counts against you.</Text>
      </Card>
      <SectionHeader title="Who can find me" />
      <Card>
        <Toggle label="Friends who invited me can ask" value={p.discoverable} onChange={(v) => set({ discoverable: v })} />
        <Toggle label="Nearby Pawsure members can ask" value={p.nearby} onChange={(v) => set({ nearby: v })} />
        {p.nearby ? <NoticeBanner icon="shield" title="Needs an ID check" body="Nearby requests stay off until the ID-check process is approved." /> : null}
        <Text variant="small" tone="muted">Both are off until you turn them on. Nobody sees your flat number.</Text>
      </Card>
      <SectionHeader title="Tasks I'm comfortable with" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {CAPS.map((c) => <Chip key={c.value} label={c.label} selected={p.capabilities.includes(c.value)} onPress={() => set({ capabilities: toggle(p.capabilities, c.value) })} />)}
      </View>
      <Text variant="small" tone="muted">Medicine requests only come to you if you choose Medicines.</Text>
      <SectionHeader title="When I'm usually free" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {WINDOWS.map((w) => <Chip key={w} label={w} selected={p.windows.includes(w)} onPress={() => set({ windows: toggle(p.windows, w) })} />)}
      </View>
      <SectionHeader title="Keys" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {KEYS.map((k) => <Chip key={k.v} label={k.l} selected={p.keyStatus === k.v} onPress={() => set({ keyStatus: k.v })} />)}
      </View>
      <SectionHeader title="Location" />
      <Card>
        <Toggle label="Share live location during an accepted visit" value={p.liveLocation} onChange={(v) => set({ liveLocation: v })} />
        <Text variant="small" tone="muted">Only the owner of that visit sees it, only during the visit, and it's deleted 24 hours later. Never in the background.</Text>
      </Card>
    </Screen>
  );
}
