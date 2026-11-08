// W1-W5 Helper on WhatsApp (simulated), inside the owner's prototype. The same chat runs
// full-screen in the helper experience (/helper-app). Logic lives in proto/useHelperChat.
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Card, Chip, WaPhoneChat, EmptyState, KeyValue, Loading, NoticeBanner, Screen, SectionHeader, space } from '../design';
import { DemoClock } from '../proto/DemoClock';
import { HOMES, useHelperChat } from '../proto/useHelperChat';
import { useProto } from '../proto/store';

export default function HelperWhatsApp() {
  const { state } = useProto();
  const h = state.helper;
  const { msgs, uploading, home, setHome, showHistory, mine, restart, wallet } = useHelperChat();

  if (h.consent === 'not_invited') {
    return (
      <Screen>
        <NoticeBanner icon="phone" title={`Simulation of ${h.name}'s phone`} body="She never installs an app." />
        <EmptyState art="no-messages" title="No invitation yet" body={`Neha hasn't invited ${h.name} yet.`} action="Go to invite" onAction={() => router.push(state.onboarded ? '/helper-invite' : '/onboarding/invite-helper')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <NoticeBanner icon="phone" title={`Simulation of ${h.name}'s phone`} body={`She never installs an app. Everything here updates ${state.profile.name}'s screens. No real message is sent.`} />
      <DemoClock compact />
      {h.consent === 'given' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {HOMES.map((x) => <Chip key={x.id} label={x.label} selected={home === x.id} onPress={() => setHome(x.id)} />)}
        </View>
      ) : null}
      <WaPhoneChat title="Pawsure" subtitle={`Business account · ${h.language === 'en' ? 'English' : h.language === 'hi' ? 'Hindi' : 'Marathi'}`} messages={msgs} onBack={() => router.back()}
        footer={uploading ? <Loading label={uploading} /> : undefined} />

      {showHistory && h.consent === 'given' ? (
        <>
          <SectionHeader title="Points history" />
          <Card>
            <KeyValue k="Spendable" v={`${wallet.spendable} points`} />
            <KeyValue k="On hold" v={`${wallet.held} points`} />
            <KeyValue k="Next ₹20 coupon in" v={`${wallet.pointsToNextCoupon} points`} />
            {mine.slice(0, 6).map((e) => (
              <KeyValue key={e.id} k={`${e.at.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${e.householdId === 'demo' ? 'Neha' : e.householdId === 'kapoor' ? 'Kapoor' : 'Coupon'}`}
                v={`${e.state === 'redeemed' ? '−' : '+'}${e.points} ${e.state === 'earned' ? '' : e.state}`.trim()} tone={e.state === 'held' || e.state === 'reversed' ? 'alert' : undefined} />
            ))}
          </Card>
        </>
      ) : null}
      {h.consent !== 'pending' ? <Button label="Restart the invite (W1)" kind="outlined" onPress={restart} full /> : null}
      <Button label={`See ${state.profile.name}'s Today screen`} kind="secondary" onPress={() => (state.onboarded ? router.dismissTo('/') : router.back())} full />
    </Screen>
  );
}
