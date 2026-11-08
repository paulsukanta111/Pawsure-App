// Onboarding 2/6: privacy notice and consent (PS-002, PS-119, DPDP 14.5, retention 14.7).
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Card, Checkbox, KeyValue, Screen, SectionHeader, StepHeader, Text, Toggle } from '../../design';
import { CONSENT_VERSION } from '../../lib/auth';

export default function OnboardConsent() {
  const [read, setRead] = useState(false);
  const [whatsapp, setWhatsapp] = useState(true);
  const [push, setPush] = useState(true);
  return (
    <Screen
      footer={
        <>
        {!read ? <Text variant="small" tone="muted" align="center">Tick "I have read the privacy notice" to continue.</Text> : null}
        <Button label="Agree and continue" disabled={!read || (!whatsapp && !push)} onPress={() => router.push('/onboarding/pet')} full />
        </>
      }
    >
      <StepHeader step={2} of={6} title="Your privacy" body="Plain language. Also available in Hindi and Marathi." />
      <Card>
        <Text variant="subheading">What we collect and why</Text>
        <Text variant="caption">• Your pet's profile, routine and health dates: to run daily care.</Text>
        <Text variant="caption">• Check-in photos and voice notes from your helper: as evidence that tasks happened. Never faces.</Text>
        <Text variant="caption">• Your society and tower: so friends nearby can help. Never your flat number in public.</Text>
        <Text variant="caption">• Call and message times: for evidence and security.</Text>
      </Card>
      <SectionHeader title="How long we keep it" />
      <Card>
        <KeyValue k="Check-in photos and voice notes" v="90 days" />
        <KeyValue k="Call and message records" v="12 months" />
        <KeyValue k="Task results (no media)" v="Account life + 1 year" />
        <KeyValue k="Incident records" v="3 years" />
        <KeyValue k="Live location during a visit" v="24 hours" />
        <Text variant="small" tone="muted">Proposed periods, pending legal review.</Text>
      </Card>
      <SectionHeader title="Your rights" />
      <Card>
        <Text variant="caption">See, correct or delete your data, or withdraw consent, from Me → Privacy or by WhatsApp. We reply within 7 days. Withdrawing stops new collection at once.</Text>
      </Card>
      <SectionHeader title="Alerts" />
      <Card>
        <Toggle label="Alerts on WhatsApp" value={whatsapp} onChange={setWhatsapp} />
        <Toggle label="Push notifications" value={push} onChange={setPush} />
        {!whatsapp && !push ? <Text variant="caption" tone="alert">Turn on at least one, or you won't hear about missed tasks.</Text> : null}
      </Card>
      <Checkbox label="I have read the privacy notice" checked={read} onChange={setRead} />
      <Text variant="small" tone="muted">Notice version {CONSENT_VERSION}</Text>
    </Screen>
  );
}
