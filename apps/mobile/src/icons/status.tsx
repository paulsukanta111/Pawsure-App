// StatusIcons: feedback states and health status hearts. Colour always pairs with a shape or label.
import { Circle, Line, Path } from 'react-native-svg';
import { createIcon, HEART, type FillKey } from './base';

export const SuccessIcon = createIcon('SuccessIcon', 'Status', ({ f }) => (
  <>
    <Circle cx={12} cy={12} r={9.5} fill={f('green')} />
    <Path d="M7.8 12.4 L10.8 15.4 L16.4 9" />
  </>
));

export const WarningIcon = createIcon('WarningIcon', 'Status', ({ f }) => (
  <>
    <Circle cx={12} cy={12} r={9.5} fill={f('amber')} />
    <Line x1={12} y1={7} x2={12} y2={12.8} />
    <Circle cx={12} cy={16.4} r={1.25} fill="currentColor" stroke="none" />
  </>
));

export const ErrorIcon = createIcon('ErrorIcon', 'Status', ({ f }) => (
  <>
    <Circle cx={12} cy={12} r={9.5} fill={f('orange')} />
    <Path d="M8.8 8.8 L15.2 15.2 M15.2 8.8 L8.8 15.2" />
  </>
));

export const InfoIcon = createIcon('InfoIcon', 'Status', ({ f }) => (
  <>
    <Circle cx={12} cy={12} r={9.5} fill={f('sky')} />
    <Circle cx={12} cy={7.6} r={1.25} fill="currentColor" stroke="none" />
    <Line x1={12} y1={11} x2={12} y2={16.8} />
  </>
));

export const LoadingIcon = createIcon('LoadingIcon', 'Status', () => (
  <Circle cx={12} cy={12} r={8.5} strokeDasharray="3.2 3.4" />
));

export const SyncIcon = createIcon('SyncIcon', 'Status', () => (
  <>
    <Path d="M19.8 11 A8 8 0 0 0 5.6 7.2" />
    <Path d="M5 3.5 V7.8 H9.3" />
    <Path d="M4.2 13 A8 8 0 0 0 18.4 16.8" />
    <Path d="M19 20.5 V16.2 H14.7" />
  </>
));

const heart = (name: string, fill: FillKey) => createIcon(name, 'Status', ({ f }) => <Path d={HEART} fill={f(fill)} />);
/** Health status hearts (excellent → attention). Always shown with a text label. */
export const HealthExcellentIcon = heart('HealthExcellentIcon', 'green');
export const HealthGoodIcon = heart('HealthGoodIcon', 'lime');
export const HealthOkayIcon = heart('HealthOkayIcon', 'yellow');
export const HealthMonitorIcon = heart('HealthMonitorIcon', 'amber');
export const HealthAttentionIcon = heart('HealthAttentionIcon', 'orange');

export const StatusIcons = {
  SuccessIcon, WarningIcon, ErrorIcon, InfoIcon, LoadingIcon, SyncIcon,
  HealthExcellentIcon, HealthGoodIcon, HealthOkayIcon, HealthMonitorIcon, HealthAttentionIcon,
};
