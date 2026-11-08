// HealthIcons: tracking metrics. Flat fills match the reference sheet.
import { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { createIcon, HEART } from './base';

export const WeightIcon = createIcon('WeightIcon', 'Health', ({ f }) => (
  <>
    <Rect x={3.5} y={3.5} width={17} height={17} rx={4.5} fill={f('white')} />
    <Rect x={7.5} y={7} width={9} height={4.5} rx={2.25} fill={f('paper')} />
    <Line x1={12} y1={9.2} x2={13.6} y2={8.2} strokeWidth={1.6} />
  </>
));

export const FoodIcon = createIcon('FoodIcon', 'Health', ({ f }) => (
  <>
    <Path d="M5.5 12 C5.5 9.6 8 8 12 8 C16 8 18.5 9.6 18.5 12 Z" fill={f('yellow')} />
    <Circle cx={9.5} cy={10.4} r={0.8} fill="currentColor" stroke="none" />
    <Circle cx={13} cy={9.6} r={0.8} fill="currentColor" stroke="none" />
    <Circle cx={15.4} cy={10.8} r={0.8} fill="currentColor" stroke="none" />
    <Path d="M3 12 H21 C21 16.2 17.3 19 12 19 C6.7 19 3 16.2 3 12 Z" fill={f('white')} />
  </>
));

/** Activity: a sneaker. */
export const ActivityIcon = createIcon('ActivityIcon', 'Health', ({ f }) => (
  <>
    <Path d="M3 16.5 V12.5 L6.5 7.5 L9.5 9.5 L11.5 8 C12.8 10.4 15 11.8 18.2 12.4 C20 12.8 21 13.8 21 15.2 V16.5 Z" fill={f('yellow')} />
    <Path d="M3 16.5 H21 V18 A1.5 1.5 0 0 1 19.5 19.5 H4.5 A1.5 1.5 0 0 1 3 18 Z" fill={f('white')} />
    <Line x1={12} y1={11.5} x2={13.2} y2={10.4} strokeWidth={1.6} />
    <Line x1={13.8} y1={12.6} x2={15} y2={11.5} strokeWidth={1.6} />
  </>
));

export const WaterIcon = createIcon('WaterIcon', 'Health', ({ f, filled }) => (
  <>
    <Path d="M12 3 C12 3 5.8 10 5.8 14.2 A6.2 6.2 0 0 0 18.2 14.2 C18.2 10 12 3 12 3 Z" fill={filled ? f('sky') : f('white')} />
    <Path d="M9 14.5 A3 3 0 0 0 11.5 17.2" strokeWidth={1.6} />
  </>
));

export const PoopIcon = createIcon('PoopIcon', 'Health', ({ f }) => (
  <Path d="M5 19.5 H19 A2.6 2.6 0 0 0 19 14.3 H18 A2.4 2.4 0 0 0 15.8 10.6 H15 A2.6 2.6 0 0 0 12.2 6.4 C12.4 4.6 11.2 3.6 10 3.5 C10.8 5 9.6 6.6 8 6.6 A2.5 2.5 0 0 0 7.8 10.6 H7.2 A2.4 2.4 0 0 0 5 14.3 A2.6 2.6 0 0 0 5 19.5 Z" fill={f('amber')} />
));

export const SleepIcon = createIcon('SleepIcon', 'Health', ({ f }) => (
  <>
    <Path d="M13.5 5 A8 8 0 1 0 20 15.5 A6.4 6.4 0 0 1 13.5 5 Z" fill={f('yellow')} />
    <G strokeWidth={1.6}>
      <Path d="M15.5 3 H19 L15.5 6.6 H19" />
    </G>
  </>
));

export const VitalsIcon = createIcon('VitalsIcon', 'Health', ({ f }) => (
  <>
    <Path d={HEART} fill={f('orange')} />
    <Path d="M6.5 12.2 H9.2 L10.6 9.4 L12.6 14.6 L14 12.2 H17.5" strokeWidth={1.8} />
  </>
));

export const HealthIcons = { WeightIcon, FoodIcon, ActivityIcon, WaterIcon, PoopIcon, SleepIcon, VitalsIcon };

