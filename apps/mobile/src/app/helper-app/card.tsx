// Helper experience, "My Pawsure card": the web page her "My points" link opens. Her record,
// points across homes, coupons, holds explained, and her rights (PS-027, PS-029, PS-034, PS-110, PS-119).
import { router } from 'expo-router';
import { Stack } from 'expo-router/js-stack';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, CharacterAvatar, color, KeyValue, NoticeBanner, radius, Screen, SectionHeader, space, Stat, Text, useToast } from '../../design';
import { HELPER_APP_TEXT } from '../../proto/helperAppStrings';
import { useProto } from '../../proto/store';
import { useHelperChat } from '../../proto/useHelperChat';

export default function HelperCard() {
  const { state, dispatch, wallet } = useProto();
  const h = state.helper;
  const A = HELPER_APP_TEXT[h.language];
  const toast = useToast();
  const { mine } = useHelperChat();
  const [confirmStop, setConfirmStop] = useState(false);
  const progress = Math.max(0, Math.min(1, 1 - wallet.pointsToNextCoupon / 500));
  const stateLabel = { earned: A.earned, held: A.held, redeemed: A.redeemed, reversed: A.reversed } as Record<string, string>;

  return (
    <Screen>
      <Stack.Screen options={{ title: A.cardTitle }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <CharacterAvatar name="avatarBunji" size={64} />
        <View style={{ flex: 1 }}>
          <Text variant="h2">{h.name}</Text>
          <Text variant="caption" tone="muted">{A.cardTitle}</Text>
        </View>
      </View>

      {h.consent === 'withdrawn' || h.consent === 'declined' ? <NoticeBanner icon="info" title={A.stopped} /> : null}

      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <Stat value="41" label={A.visits} icon="success" />
        <Stat value={h.mode === 'tracked' ? '6' : '0'} label={A.streak} icon="activity" />
        <Stat value={String(wallet.spendable)} label={A.points} icon="rewards" />
      </View>

      <Card>
        <Text variant="bodyStrong">{wallet.couponsAvailable ? A.getCoupon : A.toCoupon(wallet.pointsToNextCoupon)}</Text>
        <View style={{ height: 12, borderRadius: radius.pill, backgroundColor: color.bg.sunken, overflow: 'hidden' }}
          accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
          <View style={{ width: `${Math.round((wallet.couponsAvailable ? 1 : progress) * 100)}%`, height: '100%', backgroundColor: color.action.primary }} />
        </View>
        <Button label={A.getCoupon} disabled={!wallet.couponsAvailable} onPress={() => { dispatch({ type: 'redeem' }); toast(A.couponDone); }} full />
      </Card>

      {wallet.held ? (
        <Card tone="brand">
          <Text variant="bodyStrong">{A.onHold}: {wallet.held}</Text>
          <Text variant="caption">{A.onHoldBody}</Text>
        </Card>
      ) : null}

      <SectionHeader title={A.history} />
      <Card>
        {mine.slice(0, 8).map((e) => (
          <KeyValue key={e.id} k={`${e.at.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${e.householdId === 'demo' ? 'Neha' : e.householdId === 'kapoor' ? 'Kapoor' : 'Coupon'}`}
            v={`${e.state === 'redeemed' ? '−' : '+'}${e.points} ${e.state === 'earned' ? '' : stateLabel[e.state] ?? e.state}`.trim()}
            tone={e.state === 'held' || e.state === 'reversed' ? 'alert' : undefined} />
        ))}
      </Card>

      <SectionHeader title={A.homes} />
      <Card>
        <KeyValue k="Neha · Bruno" v="Tower B" />
        <KeyValue k="Kapoor family · Coco" v="Tower D" />
        <Text variant="caption" tone="muted">{A.homesBody}</Text>
      </Card>

      <SectionHeader title={A.rights} />
      <Card>
        <Text variant="caption">{A.rightsBody}</Text>
        {h.consent === 'given' ? (
          confirmStop ? (
            <View style={{ gap: space.sm }}>
              <Text variant="bodyStrong">{A.stopConfirm}</Text>
              <View style={{ flexDirection: 'row', gap: space.sm }}>
                <Button label={A.stop} kind="danger" onPress={() => { dispatch({ type: 'helper', patch: { consent: 'withdrawn' } }); setConfirmStop(false); toast(A.stopped); }} />
                <Button label="✕" kind="outlined" accessibilityHint="Cancel" onPress={() => setConfirmStop(false)} />
              </View>
            </View>
          ) : <Button label={A.stop} kind="outlined" onPress={() => setConfirmStop(true)} full />
        ) : null}
      </Card>
      <Button label={`← ${A.chats}`} kind="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace('/helper-app'))} full />
    </Screen>
  );
}
