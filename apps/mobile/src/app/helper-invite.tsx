// Owner: invite helper / view consent status (PS-020 to PS-022, PS-110).
import { Screen } from '../design';
import { HelperInvite } from '../proto/HelperInvite';

export default function HelperInviteScreen() {
  return (
    <Screen title="Your helper" subtitle="Invite, language, method and consent status.">
      <HelperInvite />
    </Screen>
  );
}
