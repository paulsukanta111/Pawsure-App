// Onboarding: invite helper (shared flow with /helper-invite).
import { router } from 'expo-router';
import { Screen, StepHeader } from '../../design';
import { HelperInvite } from '../../proto/HelperInvite';

export default function OnboardInviteHelper() {
  return (
    <Screen>
      <StepHeader step={6} of={6} title="Invite your helper" body="She needs nothing but WhatsApp or a basic phone." />
      <HelperInvite next={() => router.back()} />
    </Screen>
  );
}
