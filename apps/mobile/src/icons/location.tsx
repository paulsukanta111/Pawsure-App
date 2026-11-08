// LocationIcons: places. Society-level only; never an exact pin of someone's home.
import { Circle, Line, Path, Rect } from 'react-native-svg';
import { createIcon, Paw, PIN } from './base';

export const NearbyIcon = createIcon('NearbyIcon', 'Location', ({ f }) => (
  <>
    <Path d={PIN} fill={f('yellow')} />
    <Circle cx={12} cy={9.8} r={2.6} fill={f('white')} />
  </>
));

export const PetCareIcon = createIcon('PetCareIcon', 'Location', ({ f }) => (
  <>
    <Path d={PIN} fill={f('yellow')} />
    <Paw cx={12} cy={10.2} s={0.9} />
  </>
));

export const VetClinicIcon = createIcon('VetClinicIcon', 'Location', ({ f }) => (
  <>
    <Rect x={4.5} y={5} width={15} height={15.5} rx={2.5} fill={f('white')} />
    <Rect x={8.5} y={8.5} width={7} height={7} rx={1.6} fill={f('yellow')} />
    <Line x1={12} y1={10} x2={12} y2={14} strokeWidth={1.8} />
    <Line x1={10} y1={12} x2={14} y2={12} strokeWidth={1.8} />
    <Line x1={9} y1={20.5} x2={15} y2={20.5} />
  </>
));

export const PetStoreIcon = createIcon('PetStoreIcon', 'Location', ({ f }) => (
  <>
    <Rect x={4} y={9.5} width={16} height={11} rx={1.5} fill={f('white')} />
    <Path d="M3 9.5 L5 4 H19 L21 9.5 C21 11 19.8 12 18.4 12 C17 12 15.8 11 15.8 9.5 C15.8 11 14.6 12 13.2 12 H10.8 C9.4 12 8.2 11 8.2 9.5 C8.2 11 7 12 5.6 12 C4.2 12 3 11 3 9.5 Z" fill={f('orange')} />
    <Rect x={10} y={15} width={4} height={5.5} rx={1} fill={f('yellow')} />
  </>
));

export const PetParkIcon = createIcon('PetParkIcon', 'Location', ({ f }) => (
  <>
    <Path d="M12 3 L17.5 10.5 H15 L19 16.5 H5 L9 10.5 H6.5 Z" fill={f('green')} />
    <Line x1={12} y1={16.5} x2={12} y2={21} />
    <Line x1={8} y1={21} x2={16} y2={21} />
  </>
));

export const PetBoardingIcon = createIcon('PetBoardingIcon', 'Location', ({ f }) => (
  <>
    <Path d="M3.5 11 L12 4 L20.5 11 V19 A1.5 1.5 0 0 1 19 20.5 H5 A1.5 1.5 0 0 1 3.5 19 Z" fill={f('white')} />
    <Paw cx={12} cy={14} s={1.05} fill="currentColor" />
  </>
));

export const LocationIcons = { NearbyIcon, PetCareIcon, VetClinicIcon, PetStoreIcon, PetParkIcon, PetBoardingIcon };
