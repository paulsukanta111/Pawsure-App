// Me: plan, wallet, care circle, privacy and rights (PS-002, PS-005, PS-119, PS-108).
import { router } from 'expo-router';
import { Card, ListItem, Logo, Screen, SectionHeader, Text } from '../../design';
import { helper, household, owner } from '../../demo/data';

export default function Me() {
  return (
    <Screen header={<Logo size={32} tagline />}>
      <Text variant="h3">{owner.name}</Text>
      <Text variant="caption" tone="muted" style={{ marginTop: -12 }}>{household.society}, {household.tower}</Text>

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
    </Screen>
  );
}
