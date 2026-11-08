// UtilityIcons: small UI glyphs, rewards and common objects.
import { Circle, Line, Path, Rect } from 'react-native-svg';
import { createIcon, HEART, SHIELD } from './base';

export const BackIcon = createIcon('BackIcon', 'Utility', () => <Path d="M15 5 L8 12 L15 19" />);
export const ForwardIcon = createIcon('ForwardIcon', 'Utility', () => <Path d="M9 5 L16 12 L9 19" />);
export const CloseIcon = createIcon('CloseIcon', 'Utility', () => <Path d="M6 6 L18 18 M18 6 L6 18" />);
export const SelectIcon = createIcon('SelectIcon', 'Utility', () => <Path d="M5 12.5 L10 17.5 L19 7" />);
export const ArrowUpIcon = createIcon('ArrowUpIcon', 'Utility', () => <Path d="M12 20 V4 M6 10 L12 4 L18 10" />);

/** Like; `filled` = liked (orange). */
export const LikeIcon = createIcon('LikeIcon', 'Utility', ({ f, filled }) => <Path d={HEART} fill={filled ? f('orange') : 'none'} />);
/** Save; `filled` = saved (yellow). */
export const SaveIcon = createIcon('SaveIcon', 'Utility', ({ f, filled }) => <Path d="M6.5 3 H17.5 A1 1 0 0 1 18.5 4 V21 L12 16.5 L5.5 21 V4 A1 1 0 0 1 6.5 3 Z" fill={filled ? f('yellow') : 'none'} />);

export const ShareIcon = createIcon('ShareIcon', 'Utility', () => (
  <Path d="M14 3.5 H20.5 V10 M20.5 3.5 L11 13 M18 14 V19 A1.5 1.5 0 0 1 16.5 20.5 H5 A1.5 1.5 0 0 1 3.5 19 V7.5 A1.5 1.5 0 0 1 5 6 H10" />
));
export const UploadIcon = createIcon('UploadIcon', 'Utility', () => <Path d="M4 15 V19.5 H20 V15 M12 15 V4 M7 9 L12 4 L17 9" />);
export const DownloadIcon = createIcon('DownloadIcon', 'Utility', () => <Path d="M4 15 V19.5 H20 V15 M12 4 V15 M7 10 L12 15 L17 10" />);

export const PhoneIcon = createIcon('PhoneIcon', 'Utility', ({ f }) => (
  <Path d="M6.5 3.5 L9.5 3.5 L11 8 L8.8 9.4 C9.8 11.6 12.4 14.2 14.6 15.2 L16 13 L20.5 14.5 V17.5 A2 2 0 0 1 18.5 19.5 C10.2 19 5 13.8 4.5 5.5 A2 2 0 0 1 6.5 3.5 Z" fill={f('yellow')} />
));
export const KeyIcon = createIcon('KeyIcon', 'Utility', ({ f }) => (
  <>
    <Circle cx={8} cy={12} r={4.5} fill={f('yellow')} />
    <Circle cx={8} cy={12} r={1.4} fill="currentColor" stroke="none" />
    <Path d="M12.5 12 H21 M18 12 V15 M15.5 12 V14" />
  </>
));
export const ClockIcon = createIcon('ClockIcon', 'Utility', ({ f }) => (
  <>
    <Circle cx={12} cy={12} r={9} fill={f('white')} />
    <Path d="M12 7 V12 L15.5 14" />
  </>
));
export const CameraIcon = createIcon('CameraIcon', 'Utility', ({ f }) => (
  <>
    <Path d="M3.5 8.5 A2 2 0 0 1 5.5 6.5 H8 L9.5 4.5 H14.5 L16 6.5 H18.5 A2 2 0 0 1 20.5 8.5 V18 A2 2 0 0 1 18.5 20 H5.5 A2 2 0 0 1 3.5 18 Z" fill={f('white')} />
    <Circle cx={12} cy={13} r={3.8} fill={f('sky')} />
  </>
));
export const MicIcon = createIcon('MicIcon', 'Utility', ({ f }) => (
  <>
    <Rect x={9} y={3} width={6} height={11} rx={3} fill={f('yellow')} />
    <Path d="M5.5 11 A6.5 6.5 0 0 0 18.5 11 M12 17.5 V21 M9 21 H15" />
  </>
));

const gear = (() => {
  const pts: string[] = [];
  const teeth = 8;
  for (let i = 0; i < teeth * 4; i++) {
    const a = (Math.PI * 2 * i) / (teeth * 4) - Math.PI / 2;
    const r = i % 4 === 0 || i % 4 === 1 ? 9.3 : 7.2;
    pts.push(`${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
})();
export const SettingsIcon = createIcon('SettingsIcon', 'Utility', ({ f }) => (
  <>
    <Path d={gear} fill={f('white')} />
    <Circle cx={12} cy={12} r={2.8} fill={f('yellow')} />
  </>
));

export const ProtectionIcon = createIcon('ProtectionIcon', 'Utility', ({ f }) => (
  <>
    <Path d={SHIELD} fill={f('yellow')} />
    <Path d="M8.8 12 L11 14.2 L15.4 9.8" />
  </>
));
export const LeafIcon = createIcon('LeafIcon', 'Utility', ({ f }) => (
  <>
    <Path d="M5 19 C4 11 9 4.5 20 4 C20 14 14 20 5 19 Z" fill={f('green')} />
    <Path d="M5 19 C9 14.5 12 11.5 16 8.5" />
  </>
));
export const SmileIcon = createIcon('SmileIcon', 'Utility', ({ f }) => (
  <>
    <Circle cx={12} cy={12} r={9} fill={f('yellow')} />
    <Circle cx={9} cy={10} r={1.1} fill="currentColor" stroke="none" />
    <Circle cx={15} cy={10} r={1.1} fill="currentColor" stroke="none" />
    <Path d="M8 14 A4.5 4.5 0 0 0 16 14" />
  </>
));

export const RewardsIcon = createIcon('RewardsIcon', 'Utility', ({ f }) => (
  <>
    <Path d="M8.5 13.5 L6.8 21 L12 18.8 L17.2 21 L15.5 13.5" fill={f('orange')} />
    <Circle cx={12} cy={9} r={6} fill={f('yellow')} />
    <Path d="M12 6.2 L12.9 8.1 L15 8.3 L13.4 9.7 L13.9 11.8 L12 10.7 L10.1 11.8 L10.6 9.7 L9 8.3 L11.1 8.1 Z" fill="currentColor" strokeWidth={0.8} />
  </>
));
export const OffersIcon = createIcon('OffersIcon', 'Utility', ({ f }) => (
  <>
    <Rect x={4} y={11} width={16} height={9.5} rx={1.5} fill={f('yellow')} />
    <Rect x={3} y={7.5} width={18} height={3.8} rx={1.2} fill={f('yellow')} />
    <Line x1={12} y1={7.5} x2={12} y2={20.5} />
    <Path d="M12 7.5 C10.5 3.5 6.5 4 7.6 6.6 C8.2 7.6 10 7.5 12 7.5 Z M12 7.5 C13.5 3.5 17.5 4 16.4 6.6 C15.8 7.6 14 7.5 12 7.5 Z" />
  </>
));
export const CouponsIcon = createIcon('CouponsIcon', 'Utility', ({ f }) => (
  <>
    <Path d="M3 7 H21 V10 A2 2 0 0 0 21 14 V17 H3 V14 A2 2 0 0 0 3 10 Z" fill={f('yellow')} />
    <Circle cx={9.2} cy={10} r={1.1} fill="currentColor" stroke="none" />
    <Circle cx={14.8} cy={14} r={1.1} fill="currentColor" stroke="none" />
    <Line x1={15} y1={9.2} x2={9} y2={14.8} />
  </>
));
export const PremiumIcon = createIcon('PremiumIcon', 'Utility', ({ f }) => (
  <Path d="M3 8 L7.5 12 L12 5 L16.5 12 L21 8 L19 18.5 H5 Z" fill={f('yellow')} />
));

export const UtilityIcons = {
  BackIcon, ForwardIcon, CloseIcon, SelectIcon, ArrowUpIcon, LikeIcon, SaveIcon, ShareIcon, UploadIcon, DownloadIcon,
  PhoneIcon, KeyIcon, ClockIcon, CameraIcon, MicIcon, SettingsIcon, ProtectionIcon, LeafIcon, SmileIcon,
  RewardsIcon, OffersIcon, CouponsIcon, PremiumIcon,
};
