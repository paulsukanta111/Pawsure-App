// Me: plan, wallet, care circle, privacy and rights (PS-002, PS-005, PS-119, PS-108).
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Card, ListItem, Logo, Screen, SectionHeader, Text } from '../../design';
import { helper } from '../../demo/data';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface Profile { name: string; phone: string; household?: { name: string; society: string | null; tower: string | null } }

export default function Me() {
  const auth = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const uid = auth.session?.user.id;
      if (!uid) return;
      // Filter by our own auth id: RLS also returns people in our care circle.
      const { data: me } = await supabase.from('people').select('display_name, phone_e164').eq('auth_user_id', uid).maybeSingle();
      const { data: hh } = await supabase.from('households').select('name, society, tower').limit(1).maybeSingle();
      if (me) setProfile({ name: me.display_name, phone: me.phone_e164, household: hh ?? undefined });
    })();
  }, [auth.session?.user.id]);

  return (
    <Screen header={<Logo size={32} tagline />}>
      <Text variant="h3">{profile?.name ?? 'Loading…'}</Text>
      {profile?.household ? (
        <Text variant="caption" tone="muted" style={{ marginTop: -12 }}>
          {profile.household.name} · {[profile.household.society, profile.household.tower].filter(Boolean).join(', ')}
        </Text>
      ) : null}
      {auth.mode === 'demo' ? (
        <Card tone="brand">
          <Text variant="caption">You're signed in to the shared demo household. Changes you make are visible to anyone using the demo.</Text>
        </Card>
      ) : null}

      <SectionHeader title="Care circle" />
      <ListItem icon="care" title={`${helper.name} · helper`} subtitle={`${helper.method} · ${helper.language}`} meta="Consent given · can pause any time" metaTone="success" onPress={() => {}} />
      <ListItem icon="key" title="Food-box code card" subtitle="Print this month's card" onPress={() => {}} />

      <SectionHeader title="Plan" />
      <Card>
        <Text variant="bodyStrong">Free</Text>
        <Text variant="caption" tone="muted">Alerts, backup escalation, the emergency card and incident reporting are always free.</Text>
      </Card>

      <SectionHeader title="Privacy and your data" />
      <ListItem icon="shield" title="See or correct my data" subtitle="We reply within 7 days" onPress={() => {}} />
      <ListItem icon="settings" title="Withdraw consent or delete" onPress={() => {}} />
      <ListItem icon="leaf" title="Style guide" subtitle="Design tokens and components" onPress={() => router.push('/styleguide')} />

      <Button label="Sign out" kind="outlined" onPress={auth.signOut} full />
    </Screen>
  );
}
