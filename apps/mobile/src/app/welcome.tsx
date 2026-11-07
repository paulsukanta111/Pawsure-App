// O1 Welcome (moodboard "Onboarding 1").
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, IllustrationSlot, Logo, ProgressDots, Screen, space, Text } from '../design';

export default function Welcome() {
  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: space.lg, paddingTop: space.xl }}>
        <Logo size={44} />
        <Text variant="h2" align="center">Know who's caring, every day.</Text>
        <Text variant="body" tone="muted" align="center">
          See whether your pet's care actually happened, get alerted when it didn't, and find trusted cover from friends.
        </Text>
      </View>
      <IllustrationSlot name="welcome hero" height={240} />
      <View style={{ alignItems: 'center' }}>
        <ProgressDots count={3} index={0} />
      </View>
      <Button label="Get started" onPress={() => router.push('/sign-in')} full />
      <Text variant="small" tone="muted" align="center">
        Pawsure is a coordination and evidence tool. It is not a vet or an emergency service.
      </Text>
    </Screen>
  );
}
