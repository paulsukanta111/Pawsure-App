// Onboarding: invite helper (shared flow with /helper-invite).
import { router } from 'expo-router';
import { Button, Screen, StepHeader } from '../../design';
import { HelperInvite } from '../../proto/HelperInvite';

export default function OnboardInviteHelper() {
  return (
    <Screen footer={<Button label="Continue" onPress={() => router.back()} full />}>
      <StepHeader step={6} of={6} title="Invite your helper" body="She needs nothing but WhatsApp or a basic phone." />
      <HelperInvite />
    </Screen>
  );
}
