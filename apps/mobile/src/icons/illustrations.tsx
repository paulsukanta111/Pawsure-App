// Feature illustrations on the 48 grid (micro illustrations: features and benefits).
import { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { createIcon, Paw } from './base';

const big = { grid: 48 as const };

export const NutritionIllustration = createIcon('NutritionIllustration', 'Illustration', ({ f }) => (
  <>
    <Path d="M11 24 C11 19 16 16 24 16 C32 16 37 19 37 24 Z" fill={f('amber')} />
    <Circle cx={19} cy={20.5} r={1.4} fill="currentColor" stroke="none" />
    <Circle cx={25} cy={19} r={1.4} fill="currentColor" stroke="none" />
    <Circle cx={30} cy={21} r={1.4} fill="currentColor" stroke="none" />
    <Path d="M6 24 H42 C42 32.5 34.5 38 24 38 C13.5 38 6 32.5 6 24 Z" fill={f('yellow')} />
    <Paw cx={24} cy={30.5} s={1.2} />
    <Path d="M35 8 L33 12 M40 11 L36.5 13.5" strokeWidth={2.5} />
  </>
), big);

export const FitnessIllustration = createIcon('FitnessIllustration', 'Illustration', ({ f }) => (
  <>
    <Line x1={14} y1={24} x2={34} y2={24} strokeWidth={4} />
    <Rect x={8} y={14} width={7} height={20} rx={2.5} fill={f('amber')} />
    <Rect x={33} y={14} width={7} height={20} rx={2.5} fill={f('amber')} />
    <Rect x={4} y={18} width={4.5} height={12} rx={1.8} fill={f('white')} />
    <Rect x={39.5} y={18} width={4.5} height={12} rx={1.8} fill={f('white')} />
  </>
), big);

export const ProtectionIllustration = createIcon('ProtectionIllustration', 'Illustration', ({ f }) => (
  <>
    <Path d="M24 6 L38 12 V22 C38 32 32 39 24 42 C16 39 10 32 10 22 V12 Z" fill={f('yellow')} />
    <Path d="M24 11 L33 15 V22 C33 28.5 29.5 33.5 24 36 C18.5 33.5 15 28.5 15 22 V15 Z" fill={f('white')} strokeWidth={2} />
    <Paw cx={24} cy={24} s={1.6} />
  </>
), big);

export const WellnessIllustration = createIcon('WellnessIllustration', 'Illustration', ({ f }) => (
  <>
    <Path d="M24 40 C10 30.5 6 23.5 6 17.2 A9.2 9.2 0 0 1 24 12.8 A9.2 9.2 0 0 1 42 17.2 C42 23.5 38 30.5 24 40 Z" fill={f('orange')} />
    <Path d="M14 17 A5 5 0 0 1 18.5 13" strokeWidth={2.5} stroke={f('white')} />
  </>
), big);

export const HealthyIllustration = createIcon('HealthyIllustration', 'Illustration', ({ f }) => (
  <>
    <Path d="M10 38 C8 22 18 9 40 8 C40 28 28 40 10 38 Z" fill={f('green')} />
    <Path d="M10 38 C18 29 24 23 32 17" />
    <Path d="M20 28 L18 22 M25 23 L24 17 M26 26 L32 26" strokeWidth={2} />
  </>
), big);

export const HappyPetIllustration = createIcon('HappyPetIllustration', 'Illustration', ({ f }) => (
  <>
    <Path d="M20 8 L23 17 L32 20 L23 23 L20 32 L17 23 L8 20 L17 17 Z" fill={f('yellow')} />
    <Path d="M35 26 L36.8 31.2 L42 33 L36.8 34.8 L35 40 L33.2 34.8 L28 33 L33.2 31.2 Z" fill={f('yellow')} />
    <Ellipse cx={37} cy={10} rx={2.2} ry={2.2} fill={f('amber')} />
  </>
), big);

export const Illustrations = { NutritionIllustration, FitnessIllustration, ProtectionIllustration, WellnessIllustration, HealthyIllustration, HappyPetIllustration };
