// F1 Owner profile: what friends can see, society-only location, nearby fallback toggle (PS-050, PS-054, 9.3).
import { Card, KeyValue, NoticeBanner, Screen, SectionHeader, Text, Toggle } from '../design';
import { useProto } from '../proto/store';

export default function PrivacyProfile() {
  const { state, dispatch } = useProto();
  const p = state.ownerPrivacy;
  return (
    <Screen title="What friends see" subtitle="Your profile in Friend Finder.">
      <Card>
        <KeyValue k="Name" v="Neha" />
        <KeyValue k="Location" v={p.societyOnly ? 'Hiranandani Gardens' : 'Hiranandani Gardens, Tower B'} />
        <KeyValue k="Pet" v={`${state.pet.name} · ${state.pet.breed} ${state.pet.speciesLabel.toLowerCase()}`} />
        <KeyValue k="Language" v="English" />
        <Text variant="small" tone="muted">Never shown: flat number, phone number, when the home is empty, access instructions.</Text>
      </Card>
      <Card>
        <Toggle label="Show society only (hide tower)" value={p.societyOnly} onChange={(v) => dispatch({ type: 'owner_privacy', patch: { societyOnly: v } })} />
      </Card>
      <SectionHeader title="If no friend is free" />
      <Card>
        <Toggle label="Allow nearby ID-checked members as a fallback" value={p.nearbyFallback} onChange={(v) => dispatch({ type: 'owner_privacy', patch: { nearbyFallback: v } })} />
        <NoticeBanner icon="shield" title="Switched off for the pilot" body="Nearby-member fallback stays off until the ID-check process is approved, even if you turn this on." />
      </Card>
      <Text variant="small" tone="muted">Exact address and key details are shared only with a friend who accepted and whom you confirmed, and only for that visit.</Text>
    </Screen>
  );
}
