/**
 * Original Pawsure illustrations, drawn as SVG so they ship with the app and scale cleanly.
 * Bruno is a flat, friendly Indie dog with a yellow bandana: simple shapes, a thick
 * charcoal outline and the moodboard palette. Decorative: hidden from screen readers
 * unless a label is passed.
 */
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { art } from './theme';

export type Mood = 'happy' | 'sleepy' | 'worried' | 'wink';

export function BrunoFace({ size = 120, mood = 'happy', label }: { size?: number; mood?: Mood; label?: string }) {
  const L = art.line;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityLabel={label} accessible={!!label}>
      <Path d="M24 44 C14 22 22 10 42 22 C40 32 34 40 30 50 Z" fill={art.furDark} stroke={L} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M96 44 C106 22 98 10 78 22 C80 32 86 40 90 50 Z" fill={art.furDark} stroke={L} strokeWidth={3} strokeLinejoin="round" />
      <Ellipse cx={60} cy={62} rx={40} ry={36} fill={art.fur} stroke={L} strokeWidth={3} />
      <Path d="M44 30 C50 26 70 26 76 30 C70 36 50 36 44 30 Z" fill={art.furDark} opacity={0.5} />
      <Ellipse cx={60} cy={80} rx={21} ry={15} fill={art.muzzle} stroke={L} strokeWidth={2.5} />
      {mood === 'sleepy' ? (
        <G stroke={L} strokeWidth={3} strokeLinecap="round" fill="none">
          <Path d="M39 60 Q46 65 53 60" />
          <Path d="M67 60 Q74 65 81 60" />
        </G>
      ) : mood === 'wink' ? (
        <G>
          <Circle cx={46} cy={58} r={5.5} fill={L} />
          <Circle cx={47.8} cy={56.2} r={1.6} fill="#FFFFFF" />
          <Path d="M67 59 Q74 54 81 59" stroke={L} strokeWidth={3} strokeLinecap="round" fill="none" />
        </G>
      ) : (
        <G>
          <Circle cx={46} cy={58} r={5.5} fill={L} />
          <Circle cx={74} cy={58} r={5.5} fill={L} />
          <Circle cx={47.8} cy={56.2} r={1.6} fill="#FFFFFF" />
          <Circle cx={75.8} cy={56.2} r={1.6} fill="#FFFFFF" />
          {mood === 'worried' ? (
            <G stroke={L} strokeWidth={2.5} strokeLinecap="round">
              <Path d="M38 48 L50 45" />
              <Path d="M82 48 L70 45" />
            </G>
          ) : null}
        </G>
      )}
      <Ellipse cx={36} cy={72} rx={5} ry={3} fill={art.blush} opacity={0.8} />
      <Ellipse cx={84} cy={72} rx={5} ry={3} fill={art.blush} opacity={0.8} />
      <Ellipse cx={60} cy={73} rx={7} ry={5} fill={L} />
      <Path d={mood === 'worried' ? 'M52 88 Q60 82 68 88' : 'M60 78 Q60 87 52 87 M60 78 Q60 87 68 87'} stroke={L} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      {mood === 'happy' || mood === 'wink' ? <Path d="M56 87 Q60 96 64 87 Z" fill="#E86A5C" stroke={L} strokeWidth={2} strokeLinejoin="round" /> : null}
      <Path d="M32 96 Q60 108 88 96 L60 118 Z" fill={art.bandana} stroke={L} strokeWidth={3} strokeLinejoin="round" />
      <Circle cx={60} cy={104} r={2} fill={L} />
    </Svg>
  );
}

function Heart({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <Path transform={`translate(${x} ${y}) scale(${s})`} d="M10 18 C2 12 0 7 3 3.5 C6 0 9.5 1.5 10 4 C10.5 1.5 14 0 17 3.5 C20 7 18 12 10 18 Z" fill={art.bandana} stroke={art.line} strokeWidth={2} strokeLinejoin="round" />;
}

function Paw({ x, y, s = 1, o = 0.35 }: { x: number; y: number; s?: number; o?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill={art.line}>
      <Ellipse cx={10} cy={13} rx={6} ry={5} />
      <Circle cx={3} cy={6} r={2.6} /><Circle cx={8} cy={2} r={2.6} /><Circle cx={13} cy={2} r={2.6} /><Circle cx={18} cy={6} r={2.6} />
    </G>
  );
}

export type SceneName = 'welcome' | 'home' | 'empty' | 'success' | 'friends' | 'alert' | 'helper';

/** Wide scenes for heroes, empty states and confirmations. */
export function Scene({ name, height = 200, label }: { name: SceneName; height?: number; label?: string }) {
  const mood: Mood = name === 'empty' ? 'sleepy' : name === 'alert' ? 'worried' : name === 'success' ? 'wink' : 'happy';
  return (
    <Svg width="100%" height={height} viewBox="0 0 320 200" accessibilityLabel={label} accessible={!!label} preserveAspectRatio="xMidYMid meet">
      <Rect x={8} y={8} width={304} height={184} rx={28} fill={art.sky} />
      <Paw x={34} y={34} s={1.2} /><Paw x={262} y={150} s={1.1} /><Paw x={252} y={40} s={0.8} o={0.2} />
      {name === 'home' || name === 'welcome' ? (
        <G>
          <Path d="M222 168 L222 104 L258 76 L294 104 L294 168 Z" fill="#FFFFFF" stroke={art.line} strokeWidth={3} strokeLinejoin="round" />
          <Rect x={248} y={130} width={20} height={38} rx={4} fill={art.bandana} stroke={art.line} strokeWidth={2.5} />
        </G>
      ) : null}
      {name === 'friends' ? (
        <G>
          <Circle cx={250} cy={92} r={22} fill={art.muzzle} stroke={art.line} strokeWidth={3} />
          <Path d="M222 160 Q250 112 278 160 Z" fill={art.bandana} stroke={art.line} strokeWidth={3} strokeLinejoin="round" />
          <Circle cx={243} cy={90} r={2.5} fill={art.line} /><Circle cx={257} cy={90} r={2.5} fill={art.line} />
          <Path d="M243 100 Q250 105 257 100" stroke={art.line} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </G>
      ) : null}
      {name === 'helper' ? (
        <G>
          <Ellipse cx={252} cy={160} rx={36} ry={10} fill={art.furDark} opacity={0.25} />
          <Path d="M222 150 Q252 176 282 150 L276 138 L228 138 Z" fill="#FFFFFF" stroke={art.line} strokeWidth={3} strokeLinejoin="round" />
          <Ellipse cx={252} cy={138} rx={24} ry={6} fill={art.fur} stroke={art.line} strokeWidth={2.5} />
        </G>
      ) : null}
      {name === 'alert' ? (
        <G>
          <Circle cx={256} cy={96} r={30} fill="#FFFFFF" stroke={art.line} strokeWidth={3} />
          <Path d="M256 80 L256 100" stroke="#B3261E" strokeWidth={5} strokeLinecap="round" />
          <Circle cx={256} cy={112} r={3.5} fill="#B3261E" />
        </G>
      ) : null}
      {name === 'empty' ? <Path d="M232 96 h20 l-20 22 h20 M262 70 h14 l-14 16 h14" stroke={art.line} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.6} /> : null}
      {name === 'welcome' || name === 'success' || name === 'friends' ? <><Heart x={196} y={44} s={1.3} /><Heart x={56} y={142} s={0.9} /></> : null}
      <G transform="translate(84 32) scale(1.25)">
        <BrunoFace size={120} mood={mood} />
      </G>
    </Svg>
  );
}
