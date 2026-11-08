// Rewards wallet (PS-042 to PS-045, PS-126): earned, pending/held, redeemed, coupons, expiry. Coupons only, never cash.
import { View } from 'react-native';
import { REWARD_POLICY } from '@pawsure/domain';
import { Button, Card, color, KeyValue, NoticeBanner, radius, Screen, SectionHeader, space, Stat, Text, useToast } from '../design';
import { HELPER_ID, useProto } from '../proto/store';

const HOME: Record<string, string> = { demo: 'Your home', kapoor: 'Another home', '*': 'Coupon' };

export default function Rewards() {
  const { state, dispatch, wallet, ledger, pointsThisMonth } = useProto();
  const toast = useToast();
  const entries = ledger.filter((e) => e.helperId === HELPER_ID).sort((a, b) => b.at.getTime() - a.at.getTime());
  const held = entries.filter((e) => e.state === 'held');
  const redeemed = entries.filter((e) => e.state === 'redeemed');
  const pct = Math.min(100, ((wallet.spendable % REWARD_POLICY.pointsPerCoupon) / REWARD_POLICY.pointsPerCoupon) * 100);
  return (
    <Screen title={`${state.helper.name}'s rewards`} subtitle="Points she earns for checked-in care. You see totals; she sees details on WhatsApp.">
      {!state.rewardsEnabled ? <NoticeBanner icon="leaf" title="Rewards are off for your home" body="Your home is in the comparison group of the pilot. Check-ins work the same." /> : null}
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <Stat value={String(wallet.spendable)} label="Spendable" icon="paw" />
        <Stat value={String(wallet.held)} label="On hold" icon="clock" />
        <Stat value={String(wallet.redeemed)} label="Redeemed" icon="check" />
      </View>
      <Card>
        <Text variant="label">Next ₹{REWARD_POLICY.couponValueRupees} coupon</Text>
        <View style={{ height: 12, borderRadius: radius.pill, backgroundColor: color.bg.canvas, borderWidth: 1, borderColor: color.border.control, overflow: 'hidden' }}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color.action.primary }} />
        </View>
        <Text variant="caption">{wallet.couponsAvailable ? `${wallet.couponsAvailable} coupon ready` : `${wallet.pointsToNextCoupon} points to go`}</Text>
        {wallet.expiringSoon ? <Text variant="caption" tone="alert">{wallet.expiringSoon} points expire within 30 days.</Text> : null}
        <Button label="Redeem a coupon (simulated)" disabled={!wallet.couponsAvailable} onPress={() => { dispatch({ type: 'redeem' }); toast(`₹${REWARD_POLICY.couponValueRupees} coupon issued (simulated)`); }} />
      </Card>
      <Card>
        <Text variant="label">The rules</Text>
        <KeyValue k="Per Confirmed or Likely task" v={`${REWARD_POLICY.pointsPerTask} points`} />
        <KeyValue k="Most from one home per month" v={`${REWARD_POLICY.monthlyCapPerHousehold} points`} />
        <KeyValue k="Coupon" v={`${REWARD_POLICY.pointsPerCoupon} points = ₹${REWARD_POLICY.couponValueRupees}`} />
        <KeyValue k="Points expire after" v={`${REWARD_POLICY.expiryMonths} months`} />
        <KeyValue k="A mismatch holds points for" v={`up to ${REWARD_POLICY.mismatchHoldDays} days`} />
        <KeyValue k="Your home this month" v={`${pointsThisMonth} of ${REWARD_POLICY.monthlyCapPerHousehold}`} />
        <Text variant="small" tone="muted">No cash payouts. Coupons are self-funded until a partner signs.</Text>
      </Card>
      {held.length ? (
        <>
          <SectionHeader title="On hold" />
          {held.map((e) => <KeyValue key={e.id} k={`${state.tasks.find((t) => t.id === e.taskId)?.title ?? 'Task'} · until ${e.holdUntil?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`} v={`${e.points}`} tone="alert" />)}
        </>
      ) : null}
      <SectionHeader title="History" />
      <Card>
        {entries.slice(0, 12).map((e) => (
          <KeyValue key={e.id} k={`${e.at.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${HOME[e.householdId] ?? 'Home'}${e.state === 'held' || e.state === 'released' || e.state === 'reversed' ? ` · ${e.state}` : ''}`}
            v={`${e.state === 'redeemed' ? '−' : e.state === 'reversed' ? '±' : '+'}${e.points}`} tone={e.state === 'reversed' || e.state === 'held' ? 'alert' : undefined} />
        ))}
      </Card>
      {redeemed.length ? <Text variant="small" tone="muted">{redeemed.length} coupon{redeemed.length === 1 ? '' : 's'} redeemed so far.</Text> : null}
    </Screen>
  );
}
