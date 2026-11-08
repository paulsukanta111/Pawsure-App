// Pilot settings: rewards experiment arm, feature switches and their PRD defaults (6.0, PS-071, PS-126).
import { Card, KeyValue, NoticeBanner, Screen, SectionHeader, Text, Toggle } from '../design';
import { useProto } from '../proto/store';

const SWITCHES: [string, string, boolean][] = [
  ['Helper shareable record', 'Off until the points arm works (after week 2)', false],
  ['Nearby-member fallback', 'Off until the ID-check process is approved', false],
  ['Friend thank-you points', 'Off until reward funding is approved', false],
  ['Old-phone camera look-in', 'Off for the pilot', false],
  ['Steps challenge', 'Off for P0, P1 and P2', false],
];

export default function Pilot() {
  const { state, dispatch } = useProto();
  return (
    <Screen title="Pilot settings" subtitle="What an operations admin controls. Shown here for the demo.">
      <SectionHeader title="Rewards experiment" />
      <Card>
        <Toggle label="This home is in the points group" value={state.rewardsEnabled} onChange={(v) => dispatch({ type: 'patch', patch: { rewardsEnabled: v } })} />
        <Text variant="caption">Points run in 10 of the 20 pilot homes. Keep them only if on-time check-ins rise by 10 percentage points or more versus the other 10.</Text>
      </Card>
      <SectionHeader title="Feature switches" />
      <Card>{SWITCHES.map(([k, v, on]) => <KeyValue key={k} k={k} v={on ? 'On' : `Off · ${v}`} />)}</Card>
      <NoticeBanner icon="leaf" title="Not active in this release" body="Day-care booking (P1) and verified-carer booking (P2) are previews only." />
    </Screen>
  );
}
