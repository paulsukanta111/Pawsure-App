// O1 Welcome, laid out like the app mockups: headline, short line, illustration, dots,
// "Next" through the three intro slides, "Get started", and "Log in" for returning users.
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Button, Character, color, radius, Screen, space, Text, type CharacterName } from '../design';
import { WELCOME_HERO } from '../design/welcomeHero';
import { useFrameWidth } from '../proto/PhoneFrame';

type Slide = { art: 'hero' | CharacterName; title: string; body: string };
const SLIDES: Slide[] = [
  { art: 'hero', title: "When help can't come, ask friends.", body: 'Pawsure finds a nearby friend who is free and comfortable with the task. You approve every message.' },
  { art: 'crewGroup', title: "Know who's caring, every day.", body: 'See whether planned care for your pet actually happened, with honest evidence instead of empty reassurance.' },
  { art: 'poseKittoLaptop', title: 'Your helper checks in on WhatsApp.', body: 'A photo of the bowl, a voice note or a free missed call. Nothing to install, never a face photo.' },
];

export default function Welcome() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i]!;
  const width = useFrameWidth();
  // Explicit size from the screen width and the artwork's own ratio (no letterboxing gap).
  const heroW = Math.min(width - 32, 420);
  const heroH = Math.round((heroW * WELCOME_HERO.height) / WELCOME_HERO.width);
  return (
    <Screen background={color.bg.paper}>
      <View style={st.wrap}>
        {/* Mockup order: headline, short line, illustration, dots, then the yellow button. */}
        <View style={st.copy}>
          <Text variant="h2" align="center" style={st.title}>{slide.title}</Text>
          <Text variant="body" tone="muted" align="center" style={st.body}>{slide.body}</Text>
        </View>
        {slide.art === 'hero' ? (
          <Image source={WELCOME_HERO} resizeMode="contain" accessibilityLabel="A dog and a cat in Pawsure hoodies; the dog checks a phone while a friend gives a thumbs up" style={{ width: heroW, height: heroH }} />
        ) : (
          <View style={{ height: heroH, justifyContent: 'center' }}><Character name={slide.art} height={Math.min(heroH, 250)} label={slide.title} /></View>
        )}
        <View style={st.dots} accessibilityRole="tablist">
          {SLIDES.map((sl, n) => (
            <Pressable key={sl.title} accessibilityRole="tab" accessibilityState={{ selected: n === i }} accessibilityLabel={`Slide ${n + 1} of ${SLIDES.length}: ${sl.title}`}
              hitSlop={12} onPress={() => setI(n)} style={st.dotHit}>
              <View style={[st.dot, n === i && st.dotOn]} />
            </Pressable>
          ))}
        </View>
        {i < SLIDES.length - 1 ? (
          <Button label="Next" onPress={() => setI(i + 1)} full />
        ) : null}
        <Button label="Get started" kind={i < SLIDES.length - 1 ? 'outlined' : 'primary'} onPress={() => router.push('/sign-in')} full />
        <Pressable accessibilityRole="link" onPress={() => router.push('/sign-in')} hitSlop={8} style={st.login}>
          <Text variant="caption" tone="muted">Already have an account? <Text variant="label">Log in</Text></Text>
        </Pressable>
        <Text variant="small" tone="muted" align="center">Pawsure is a coordination and evidence tool. It is not a vet or an emergency service.</Text>
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.lg, paddingTop: space.lg, width: '100%', maxWidth: 480, alignSelf: 'center' },
  copy: { alignItems: 'center', gap: space.sm, minHeight: 150, justifyContent: 'center' },
  login: { minHeight: 32, justifyContent: 'center' },
  title: { maxWidth: 340 },
  body: { maxWidth: 360 },
  dots: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  dotHit: { padding: 6 },
  dot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: color.border.control },
  dotOn: { width: 24, height: 12, backgroundColor: color.action.primary, borderWidth: 1.5, borderColor: color.border.strong },
});
