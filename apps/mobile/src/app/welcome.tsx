// O1 Welcome, built from the team's welcome-screen design: illustration, headline with
// a yellow underline, short body, "Get started", and dots for the other two intro slides.
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Button, Character, color, radius, Screen, space, Text, type CharacterName } from '../design';
import { WELCOME_HERO } from '../design/welcomeHero';

type Slide = { art: 'hero' | CharacterName; title: string; body: string };
const SLIDES: Slide[] = [
  { art: 'hero', title: "When help can't come, ask friends.", body: 'Pawsure finds a nearby friend who is free and comfortable with the task. You approve every message.' },
  { art: 'crewGroup', title: "Know who's caring, every day.", body: 'See whether planned care for your pet actually happened, with honest evidence instead of empty reassurance.' },
  { art: 'poseKittoLaptop', title: 'Your helper checks in on WhatsApp.', body: 'A photo of the bowl, a voice note or a free missed call. Nothing to install, never a face photo.' },
];

export default function Welcome() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i]!;
  const { width } = useWindowDimensions();
  // Explicit size from the screen width and the artwork's own ratio (no letterboxing gap).
  const heroW = Math.min(width - 32, 420);
  const heroH = Math.round((heroW * WELCOME_HERO.height) / WELCOME_HERO.width);
  return (
    <Screen background={color.bg.paper}>
      <View style={st.wrap}>
        {slide.art === 'hero' ? (
          <Image source={WELCOME_HERO} resizeMode="contain" accessibilityLabel="A dog and a cat in Pawsure hoodies; the dog checks a phone while a friend gives a thumbs up" style={{ width: heroW, height: heroH }} />
        ) : (
          <View style={{ height: heroH, justifyContent: 'center' }}><Character name={slide.art} height={Math.min(heroH, 250)} label={slide.title} /></View>
        )}
        <View style={st.copy}>
          <Text variant="h2" align="center" style={st.title}>{slide.title}</Text>
          <Svg width={220} height={12} viewBox="0 0 220 12" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Path d="M4 8 C 60 2, 150 2, 216 6" stroke={color.action.primary} strokeWidth={5} strokeLinecap="round" fill="none" />
          </Svg>
          <Text variant="subheading" tone="muted" align="center" style={st.body}>{slide.body}</Text>
        </View>
        <Button label="Get started" onPress={() => router.push('/sign-in')} full />
        <View style={st.dots} accessibilityRole="tablist">
          {SLIDES.map((sl, n) => (
            <Pressable key={sl.title} accessibilityRole="tab" accessibilityState={{ selected: n === i }} accessibilityLabel={`Slide ${n + 1} of ${SLIDES.length}: ${sl.title}`}
              hitSlop={12} onPress={() => setI(n)} style={st.dotHit}>
              <View style={[st.dot, n === i && st.dotOn]} />
            </Pressable>
          ))}
        </View>
        <Text variant="small" tone="muted" align="center">Pawsure is a coordination and evidence tool. It is not a vet or an emergency service.</Text>
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.lg, paddingTop: space.lg, width: '100%', maxWidth: 480, alignSelf: 'center' },
  copy: { alignItems: 'center', gap: space.sm, minHeight: 190 },
  title: { maxWidth: 340 },
  body: { maxWidth: 360 },
  dots: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  dotHit: { padding: 6 },
  dot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: color.border.control },
  dotOn: { width: 24, height: 12, backgroundColor: color.action.primary, borderWidth: 1.5, borderColor: color.border.strong },
});
