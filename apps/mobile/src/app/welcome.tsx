// O1 Welcome (moodboard "Onboarding 1-2"): three short slides, then sign in.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Logo, ProgressDots, Scene, Screen, space, Text, type SceneName } from '../design';

const SLIDES: { scene: SceneName; title: string; body: string }[] = [
  { scene: 'welcome', title: "Know who's caring, every day.", body: 'See whether planned care for your pet actually happened, with honest evidence instead of empty reassurance.' },
  { scene: 'helper', title: 'Your helper checks in on WhatsApp.', body: 'A photo of the bowl, a voice note or a free missed call. Nothing to install, never a face photo.' },
  { scene: 'friends', title: "When help can't come, ask friends.", body: 'Pawsure finds a nearby friend who is free and comfortable with the task. You approve every message.' },
];

export default function Welcome() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i]!;
  const last = i === SLIDES.length - 1;
  return (
    <Screen>
      <View style={{ alignItems: 'center', paddingTop: space.lg }}>
        <Logo size={40} />
      </View>
      <Scene name={slide.scene} height={240} label={slide.title} />
      <View style={{ gap: space.sm, minHeight: 150 }}>
        <Text variant="h2" align="center">{slide.title}</Text>
        <Text variant="body" tone="muted" align="center">{slide.body}</Text>
      </View>
      <View style={{ alignItems: 'center' }}><ProgressDots count={SLIDES.length} index={i} /></View>
      <Button label={last ? 'Get started' : 'Next'} onPress={() => (last ? router.push('/sign-in') : setI(i + 1))} full />
      {!last ? <Button label="Skip" kind="outlined" onPress={() => router.push('/sign-in')} full /> : null}
      <Text variant="small" tone="muted" align="center">Pawsure is a coordination and evidence tool. It is not a vet or an emergency service.</Text>
    </Screen>
  );
}
