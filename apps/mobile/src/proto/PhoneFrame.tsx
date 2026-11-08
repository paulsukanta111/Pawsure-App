/**
 * Prototype-only: on a wide browser window the app renders inside a phone (390 × 844 with bezel,
 * status bar and notch) so it reads as a mobile app. On a phone-sized window it stays full screen.
 * Screens that size themselves from the window use useFrameWidth() instead.
 */
import { usePathname } from 'expo-router';
import { createContext, useContext, type ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { chatSim, color, radius, Text } from '../design';
import { fmt, useProto } from './store';

const FRAME_W = 390;
const FRAME_H = 844;
const BEZEL = 10;
const STATUS_H = 34;
const FrameWidth = createContext<number | null>(null);

/** Width the app actually has: the phone's width when framed, otherwise the window's. */
export function useFrameWidth() {
  const framed = useContext(FrameWidth);
  const { width } = useWindowDimensions();
  return framed ?? width;
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width >= 700;
  if (!framed) return <>{children}</>;
  // Leave room for the prototype bar (~56) and a margin; shrink the phone on short windows.
  const h = Math.max(560, Math.min(FRAME_H, height - 56 - 32));
  return (
    <View style={st.stage}>
      <View style={[st.phone, { width: FRAME_W + BEZEL * 2, height: h + BEZEL * 2 }]}>
        <View style={st.screen}>
          <StatusBar />
          <FrameWidth.Provider value={FRAME_W}>
            <View style={{ flex: 1 }}>{children}</View>
          </FrameWidth.Provider>
        </View>
      </View>
    </View>
  );
}

function StatusBar() {
  const { now } = useProto();
  const path = usePathname();
  // Match the top of the screen underneath: WhatsApp's green chat header, its white chat list, or the app canvas.
  const bg = path === '/helper-app/chat' ? chatSim.header : path.startsWith('/helper-app') ? chatSim.surface : color.bg.canvas;
  const fg = path === '/helper-app/chat' ? chatSim.onHeader : color.text.primary;
  return (
    <View style={[st.status, { backgroundColor: bg }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text variant="label" style={{ color: fg, width: 70 }}>{fmt(now).replace(/ (am|pm)$/, '')}</Text>
      <View style={st.notch} />
      <View style={{ width: 70, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Svg width={62} height={14} viewBox="0 0 62 14">
          {[0, 1, 2, 3].map((i) => <Rect key={i} x={i * 5} y={10 - i * 3} width={3.5} height={4 + i * 3} rx={1} fill={fg} />)}
          <Path d="M29 5.5a9 9 0 0 1 12 0M31.5 8.2a5 5 0 0 1 7 0" stroke={fg} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <Rect x={34.3} y={10.4} width={1.6} height={1.6} rx={0.8} fill={fg} />
          <Rect x={45} y={2} width={14} height={10} rx={2.5} stroke={fg} strokeWidth={1.3} fill="none" />
          <Rect x={46.8} y={3.8} width={9} height={6.4} rx={1.2} fill={fg} />
          <Rect x={59.6} y={5.2} width={1.6} height={3.6} rx={0.8} fill={fg} />
        </Svg>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg.brand, padding: 16 },
  phone: { borderRadius: 54, backgroundColor: color.bg.inverse, padding: BEZEL,
    shadowColor: color.bg.inverse, shadowOpacity: 0.35, shadowRadius: 30, shadowOffset: { width: 0, height: 14 } },
  screen: { flex: 1, borderRadius: 44, overflow: 'hidden', backgroundColor: color.bg.canvas },
  status: { height: STATUS_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28 },
  notch: { width: 96, height: 26, borderRadius: radius.pill, backgroundColor: color.bg.inverse },
});
