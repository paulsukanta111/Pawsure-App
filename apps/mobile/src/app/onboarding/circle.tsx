// Onboarding 6/6: care circle - helper, backup, co-owner (PS-005, PS-020).
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Card, KeyValue, ListItem, Screen, SectionHeader, StepHeader, Text, TextField, useToast } from '../../design';
import { CONSENT_TEXT } from '../../proto/HelperInvite';
import { useProto } from '../../proto/store';

export default function OnboardCircle() {
  const { state, dispatch } = useProto();
  const toast = useToast();
  const [coName, setCoName] = useState('Amit');
  const [coPhone, setCoPhone] = useState('+91 98200 11111');
  const finish = () => { dispatch({ type: 'finish_onboarding' }); router.replace('/'); };
  return (
    <Screen>
      <StepHeader step={6} of={6} title="Who helps" body="Add the people who look after your pet." />
      <SectionHeader title="Helper" />
      <ListItem icon="care" title={state.helper.name} subtitle={CONSENT_TEXT[state.helper.consent].title}
        metaTone={state.helper.consent === 'given' ? 'success' : 'muted'} meta={state.helper.mode === 'trusted' ? 'Trusted helper mode' : undefined}
        onPress={() => router.push('/onboarding/invite-helper')} />
      <SectionHeader title="Backup" />
      <Card>
        <KeyValue k={state.backup.name} v={state.backup.phone} />
        <Text variant="small" tone="muted">Gets a 15-minute look-in link only if you don't respond to a missed task.</Text>
      </Card>
      <SectionHeader title="Co-owner" />
      {state.coOwners.map((c) => <ListItem key={c.phone} icon="profile" title={c.name} subtitle={c.phone} meta="Invite sent (simulated)" />)}
      {!state.coOwners.length ? (
        <Card>
          <TextField label="Name" value={coName} onChangeText={setCoName} />
          <TextField label="Mobile number" value={coPhone} onChangeText={setCoPhone} keyboardType="phone-pad" />
          <Button label="Invite co-owner" kind="secondary" icon="plus" disabled={!coName.trim() || coPhone.replace(/\D/g, '').length < 10}
            onPress={() => { dispatch({ type: 'invite_co_owner', name: coName.trim(), phone: coPhone }); toast(`Invite for ${coName.trim()} ready (simulated)`, 'info'); }} />
        </Card>
      ) : null}
      <Button label="Finish setup" onPress={finish} full />
    </Screen>
  );
}
