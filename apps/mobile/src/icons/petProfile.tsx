// PetProfileIcons: pet basics and pet heads.
import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { createIcon } from './base';

export const PetIcon = createIcon('PetIcon', 'PetProfile', ({ f }) => (
  <>
    <Ellipse cx={12} cy={16.3} rx={4.4} ry={3.6} fill={f('yellow')} />
    <Circle cx={4.9} cy={11} r={2.15} fill={f('yellow')} />
    <Circle cx={8.9} cy={5.9} r={2.15} fill={f('yellow')} />
    <Circle cx={15.1} cy={5.9} r={2.15} fill={f('yellow')} />
    <Circle cx={19.1} cy={11} r={2.15} fill={f('yellow')} />
  </>
));
export const BreedIcon = createIcon('BreedIcon', 'PetProfile', ({ f }) => (
  <G transform="rotate(-35 12 12)">
    <Circle cx={5.6} cy={9.6} r={2.4} fill={f('white')} />
    <Circle cx={5.6} cy={14.4} r={2.4} fill={f('white')} />
    <Circle cx={18.4} cy={9.6} r={2.4} fill={f('white')} />
    <Circle cx={18.4} cy={14.4} r={2.4} fill={f('white')} />
    <Rect x={5.6} y={10} width={12.8} height={4} fill={f('white')} stroke="none" />
    <Line x1={6.8} y1={10} x2={17.2} y2={10} />
    <Line x1={6.8} y1={14} x2={17.2} y2={14} />
  </G>
));

export const AgeIcon = createIcon('AgeIcon', 'PetProfile', ({ f }) => (
  <>
    <Rect x={4} y={11} width={16} height={9.5} rx={2} fill={f('yellow')} />
    <Path d="M4 14.2 C6 15.6 7 13 9 14.2 C11 15.4 12 13 14 14.2 C16 15.4 17.5 13 20 14.2" strokeWidth={1.8} />
    <Rect x={11} y={6.5} width={2} height={4.5} rx={0.8} fill={f('white')} />
    <Path d="M12 2.6 C13.3 3.9 13.3 5.2 12 5.6 C10.7 5.2 10.7 3.9 12 2.6 Z" fill={f('orange')} strokeWidth={1.5} />
  </>
));

export const GenderIcon = createIcon('GenderIcon', 'PetProfile', () => (
  <>
    <Circle cx={10} cy={14} r={5.5} />
    <Path d="M14 10 L19.5 4.5 M14.8 4.5 H19.5 V9.2" />
  </>
));

export const IdTagIcon = createIcon('IdTagIcon', 'PetProfile', ({ f }) => (
  <>
    <Rect x={3} y={6} width={18} height={12} rx={3} fill={f('white')} />
    <Circle cx={8.2} cy={12} r={2.6} fill={f('yellow')} />
    <Line x1={12.5} y1={10.2} x2={17.5} y2={10.2} strokeWidth={1.8} />
    <Line x1={12.5} y1={13.8} x2={15.5} y2={13.8} strokeWidth={1.8} />
  </>
));

/** Dog head with yellow headband (Sparky style): ears behind the head, band as one thick stroke. */
export const DogIcon = createIcon('DogIcon', 'PetProfile', ({ f }) => (
  <>
    <Path d="M7.6 7.6 C4.2 7 2.6 11.6 3.6 15.8 C5.4 16.2 6.8 13.6 7.4 11" fill="currentColor" />
    <Path d="M16.4 7.6 C19.8 7 21.4 11.6 20.4 15.8 C18.6 16.2 17.2 13.6 16.6 11" fill="currentColor" />
    <Circle cx={12} cy={13} r={7} fill={f('white')} />
    <Path d="M6.2 9.4 Q12 5.8 17.8 9.4" stroke={f('yellow')} strokeWidth={2.6} />
    <Circle cx={9.6} cy={12.8} r={1.05} fill="currentColor" stroke="none" />
    <Circle cx={14.4} cy={12.8} r={1.05} fill="currentColor" stroke="none" />
    <Ellipse cx={12} cy={15.8} rx={1.6} ry={1.1} fill="currentColor" stroke="none" />
  </>
));

/** Cat head with yellow headband (Kitto style). */
export const CatIcon = createIcon('CatIcon', 'PetProfile', ({ f }) => (
  <>
    <Path d="M4.8 11 L4.8 4.2 L9 7.6 H15 L19.2 4.2 V11 C19.6 16.6 16.2 19.6 12 19.6 C7.8 19.6 4.4 16.6 4.8 11 Z" fill={f('white')} />
    <Path d="M6.4 10 Q12 7.6 17.6 10" stroke={f('yellow')} strokeWidth={2.4} />
    <Circle cx={9.4} cy={13.4} r={1} fill="currentColor" stroke="none" />
    <Circle cx={14.6} cy={13.4} r={1} fill="currentColor" stroke="none" />
    <Path d="M11 15.6 H13 L12 16.7 Z" fill="currentColor" strokeWidth={1.2} />
  </>
));

export const PetProfileIcons = { PetIcon, BreedIcon, AgeIcon, GenderIcon, IdTagIcon, DogIcon, CatIcon };
