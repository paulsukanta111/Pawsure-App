// Me: plan, wallet, care circle, privacy and rights (PS-002, PS-005, PS-108, PS-119).
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Card, ListItem, Logo, Screen, SectionHeader, Text } from '../../design';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { CONSENT_TEXT } from '../../proto/HelperInvite';
import { useProto } from '../../proto/store';

interface Profile { name: string; household?: { name: string; society: string | null; tower: string | null } }

export default function Me() {
  const auth = useAuth();
  const { state, dispatch, wallet } = useProto();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const uid = auth.userId;
      if (!uid) return;
      if (auth.mode === 'local') {
        setProfile({ name: 'Neha', household: { name: "Neha's home", society: 'Hiranandani Gardens', tower: 'Tower B' } });
        return;
      }
      // Filter by our own auth id: RLS also returns people in our care circle.
      const { data: me } = await supabase.from('people').select('display_name').eq('auth_user_id', uid).maybeSingle();
      const { data: hh } = await supabase.from('households').select('name, society, tower').limit(1).maybeSingle();
      if (me) setProfile({ name: me.display_name, household: hh ?? undefined });
    })();
  }, [auth.userId, auth.mode]);

  return (
    <Screen header={<Logo size={32} tagline />}>
      <Text variant="h3">{state.profile.name || profile?.name || 'Loading…'}</Text>
      {profile?.household ? (
        <Text variant="caption" tone="muted" style={{ marginTop: -12 }}>
          {profile.household.name} · {[profile.household.society, profile.household.tower].filter(Boolean).join(', ')}
        </Text>
      ) : null}
      {auth.mode !== 'otp' ? (
        <Card tone="brand">
          <Text variant="caption">Demo household. The day's events are simulated on this device; use "All screens" to explore every flow.</Text>
          <Button label="All screens" icon="leaf" onPress={() => router.push('/prototype')} />
        </Card>
      ) : null}

      <SectionHeader title="Care" />
      <ListItem icon="care" title="Care circle" subtitle={`${state.helper.name}, ${state.backup.name} (backup)`} onPress={() => router.push('/care-circle')} />
      <ListItem icon="community" title={`${state.helper.name}: invite and consent`} subtitle={CONSENT_TEXT[state.helper.consent].title} onPress={() => router.push('/helper-invite')} />
      <ListItem icon="stats" title={`${state.helper.name}'s check-ins`} subtitle="Performance and history" onPress={() => router.push('/helper-history')} />
      <ListItem icon="key" title="Food-box code card" subtitle="Print this month's card" onPress={() => router.push('/code-card')} />
      <ListItem icon="paw" title="Rewards" subtitle={`${wallet.spendable} spendable · ${wallet.held} on hold`} onPress={() => router.push('/rewards')} />
      <ListItem icon="health" title="Health" subtitle="Reminders, history and vet" onPress={() => router.push('/health')} />
      <ListItem icon="alert" title="Emergency and incidents" onPress={() => router.push('/emergency')} />

      <SectionHeader title="Friends" />
      <ListItem icon="shield" title="What friends see about me" subtitle="Society and tower only" onPress={() => router.push('/privacy-profile')} />
      <ListItem icon="friends" title="My help settings" subtitle="When and how I can help others" onPress={() => router.push('/friend-settings')} />

      <SectionHeader title="Plan" />
      <Card>
        <Text variant="bodyStrong">Free</Text>
        <Text variant="caption" tone="muted">Alerts, backup escalation, the emergency card and incident reporting are always free. Plus (₹149/month) is being tested.</Text>
      </Card>

      <SectionHeader title="Privacy and your data" />
      <ListItem icon="shield" title="See or correct my data" subtitle="We reply within 7 days" onPress={() => {}} />
      <ListItem icon="settings" title="Withdraw consent or delete" onPress={() => {}} />
      <SectionHeader title="About this prototype" />
      <ListItem icon="leaf" title="Style guide" subtitle="Design tokens and components" onPress={() => router.push('/styleguide')} />
      <ListItem icon="settings" title="Pilot settings" subtitle="Rewards experiment and feature switches" onPress={() => router.push('/pilot')} />
      <ListItem icon="check" title="What this prototype covers" subtitle="PRD requirements shown and not yet shown" onPress={() => router.push('/coverage')} />
      <Button label="Replay onboarding" kind="outlined" onPress={() => dispatch({ type: 'replay_onboarding' })} full />

      <Button label="Reset demo day" kind="outlined" onPress={() => dispatch({ type: 'reset' })} full />
      <Button label="Sign out" kind="outlined" onPress={auth.signOut} full />
    </Screen>
  );
}
