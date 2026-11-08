// NavigationIcons: tab bar. Outline by default; `filled` = selected (yellow fill).
import { Circle, Line, Path, Rect } from 'react-native-svg';
import { createIcon, HandHeart } from './base';

export const HomeIcon = createIcon('HomeIcon', 'Navigation', ({ f, filled }) => (
  <Path d="M4 11 L12 4 L20 11 V19 A1.5 1.5 0 0 1 18.5 20.5 H15 V15.5 A1.5 1.5 0 0 0 13.5 14 H10.5 A1.5 1.5 0 0 0 9 15.5 V20.5 H5.5 A1.5 1.5 0 0 1 4 19 Z" fill={filled ? f('yellow') : 'none'} />
));

export const ChatIcon = createIcon('ChatIcon', 'Navigation', ({ f, filled }) => (
  <>
    <Path d="M5 4.5 H19 A2 2 0 0 1 21 6.5 V15 A2 2 0 0 1 19 17 H10 L6 20.5 V17 H5 A2 2 0 0 1 3 15 V6.5 A2 2 0 0 1 5 4.5 Z" fill={filled ? f('yellow') : 'none'} />
    <Circle cx={8} cy={10.8} r={1.1} fill="currentColor" stroke="none" />
    <Circle cx={12} cy={10.8} r={1.1} fill="currentColor" stroke="none" />
    <Circle cx={16} cy={10.8} r={1.1} fill="currentColor" stroke="none" />
  </>
));

/** Primary action: always a yellow circle (use for the main add/create button). */
export const AddIcon = createIcon('AddIcon', 'Navigation', ({ f }) => (
  <>
    <Circle cx={12} cy={12} r={9.5} fill={f('yellow')} />
    <Line x1={12} y1={7.5} x2={12} y2={16.5} />
    <Line x1={7.5} y1={12} x2={16.5} y2={12} />
  </>
));

export const HealthIcon = createIcon('HealthIcon', 'Navigation', ({ f, filled }) => (
  <>
    <Rect x={3.5} y={12} width={4.5} height={8.5} rx={1.2} fill={filled ? f('yellow') : 'none'} />
    <Rect x={9.75} y={7.5} width={4.5} height={13} rx={1.2} fill={filled ? f('yellow') : 'none'} />
    <Rect x={16} y={3.5} width={4.5} height={17} rx={1.2} fill={filled ? f('yellow') : 'none'} />
  </>
));

export const ProfileIcon = createIcon('ProfileIcon', 'Navigation', ({ f, filled }) => (
  <>
    <Circle cx={12} cy={8} r={4} fill={filled ? f('yellow') : 'none'} />
    <Path d="M4 20.5 C4 16.5 7.6 14.5 12 14.5 C16.4 14.5 20 16.5 20 20.5 Z" fill={filled ? f('yellow') : 'none'} />
  </>
));

/** Find cover tab: an open hand offering a heart (same drawing as HelpRequestIcon). */
export const FindCoverIcon = createIcon('FindCoverIcon', 'Navigation', ({ f, filled }) => (
  <HandHeart heart={filled ? f('orange') : 'none'} hand={filled ? f('yellow') : 'none'} cuff={filled ? f('white') : 'none'} />
));

export const NavigationIcons = { HomeIcon, ChatIcon, AddIcon, HealthIcon, ProfileIcon, FindCoverIcon };
