// O15 Wallet + health: helper points (owner sees totals), health calendar, steps behind a flag (PS-040 to PS-046, PS-126).
import { router } from 'expo-router';
import { View } from 'react-native';
import { REWARD_POLICY } from '@pawsure/domain';
import { Button, Card, ListItem, NoticeBanner, Screen, SectionHeader, space, Stat, Text, Toggle } from '../design';
import { useProto } from '../proto/store';

export default function Wallet() {
  const { state, dispatch, pointsThisMonth, now } = useProto();
  const toCoupon = Math.max(0, REWARD_POLICY.pointsPerCoupon - (180 + pointsThisMonth));
  return (
    <Screen title="Wallet and health">
      <SectionHeader title={`${state.helper.name}'s points`} />
      <Card>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Stat value={String(pointsThisMonth)} label="From your home this month" icon="paw" />
          <Stat value={String(180 + pointsThisMonth)} label="All homes" icon="home" />
        </View>
        <Text variant="caption">
          {REWARD_POLICY.pointsPerTask} points per Confirmed or Likely task, up to {REWARD_POLICY.monthlyCapPerHousehold} a month from each home.
          {' '}{REWARD_POLICY.pointsPerCoupon} points = a ₹{REWARD_POLICY.couponValueRupees} coupon. {toCoupon} to go.
        </Text>
        <Text variant="small" tone="muted">Coupons only, never cash. Points expire after 6 months. A mismatch holds a task's points for up to 7 days.</Text>
        <Toggle label="Rewards for this home (pilot test)" value={state.rewardsEnabled} onChange={(v) => dispatch({ type: 'patch', patch: { rewardsEnabled: v } })} />
      </Card>

      <SectionHeader title="Health calendar" />
      {state.health.map((h) => {
        const days = Math.round((h.dueOn.getTime() - now.getTime()) / 86_400_000);
        return (
          <ListItem key={h.id} icon={h.kind === 'vaccine' ? 'vaccine' : h.kind === 'deworming' ? 'medication' : 'calendar'} title={h.title} subtitle={h.detail}
            meta={h.done ? 'Done' : days <= 0 ? 'Due today' : `Due in ${days} days`} metaTone={h.done ? 'success' : days <= 7 ? 'alert' : 'muted'}
            right={h.done ? undefined : <Button label="Done" kind="outlined" onPress={() => dispatch({ type: 'health_done', id: h.id })} />} />
        );
      })}
      <Text variant="small" tone="muted">Dates are entered by you or copied from your vet. Pawsure reminds; it never prescribes a schedule or dose.</Text>

      <SectionHeader title="Partner offers" />
      <NoticeBanner icon="leaf" title="Planned" body="Free vet check-ups and brand coupons appear only after a partner signs. Nothing is promised until then." />

      <SectionHeader title="Steps challenge" />
      <NoticeBanner icon="activity" title="Switched off" body="Opt-in steps challenge is behind a feature flag and off for the launch releases." />
      <Button label="Back" kind="outlined" onPress={() => router.back()} />
    </Screen>
  );
}
