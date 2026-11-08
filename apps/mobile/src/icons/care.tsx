// CareIcons: care tasks and services.
import { G, Line, Path, Rect } from 'react-native-svg';
import { createIcon, Paw, SHIELD } from './base';

export const VaccinationIcon = createIcon('VaccinationIcon', 'Care', ({ f }) => (
  <G transform="rotate(45 12 12)">
    <Rect x={9.2} y={6} width={5.6} height={10.5} rx={1.2} fill={f('yellow')} />
    <Line x1={12} y1={2.5} x2={12} y2={6} />
    <Line x1={9.6} y1={2.5} x2={14.4} y2={2.5} />
    <Line x1={12} y1={16.5} x2={12} y2={21.5} />
    <Line x1={9.2} y1={9.5} x2={11} y2={9.5} strokeWidth={1.6} />
    <Line x1={9.2} y1={12.5} x2={11} y2={12.5} strokeWidth={1.6} />
  </G>
));

export const MedicationIcon = createIcon('MedicationIcon', 'Care', ({ f }) => (
  <G transform="rotate(45 12 12)">
    <Path d="M8 12 V7.5 A4 4 0 0 1 16 7.5 V12 Z" fill={f('yellow')} />
    <Path d="M8 12 V16.5 A4 4 0 0 0 16 16.5 V12 Z" fill={f('white')} />
    <Line x1={8} y1={12} x2={16} y2={12} />
  </G>
));

export const AppointmentIcon = createIcon('AppointmentIcon', 'Care', ({ f }) => (
  <>
    <Rect x={3.5} y={5} width={17} height={15.5} rx={3} fill={f('white')} />
    <Path d="M3.5 8 A3 3 0 0 1 6.5 5 H17.5 A3 3 0 0 1 20.5 8 V9.5 H3.5 Z" fill={f('orange')} />
    <Line x1={8} y1={3} x2={8} y2={7} />
    <Line x1={16} y1={3} x2={16} y2={7} />
    <Paw cx={12} cy={15} s={0.85} />
  </>
));

export const CalendarIcon = createIcon('CalendarIcon', 'Care', ({ f }) => (
  <>
    <Rect x={3.5} y={5} width={17} height={15.5} rx={3} fill={f('white')} />
    <Line x1={3.5} y1={9.5} x2={20.5} y2={9.5} />
    <Line x1={8} y1={3} x2={8} y2={7} />
    <Line x1={16} y1={3} x2={16} y2={7} />
  </>
));

export const TodoIcon = createIcon('TodoIcon', 'Care', ({ f }) => (
  <>
    <Rect x={5} y={4} width={14} height={17} rx={2.5} fill={f('white')} />
    <Rect x={9} y={2.5} width={6} height={3.5} rx={1.2} fill={f('yellow')} />
    <Path d="M8 10.5 L9.5 12 L11.8 9.6" strokeWidth={1.8} />
    <Line x1={13.5} y1={11} x2={16} y2={11} strokeWidth={1.8} />
    <Path d="M8 15.5 L9.5 17 L11.8 14.6" strokeWidth={1.8} />
    <Line x1={13.5} y1={16} x2={16} y2={16} strokeWidth={1.8} />
  </>
));

export const VetVisitIcon = createIcon('VetVisitIcon', 'Care', ({ f }) => (
  <>
    <Path d="M9 7 V5.5 A1 1 0 0 1 10 4.5 H14 A1 1 0 0 1 15 5.5 V7" />
    <Rect x={3} y={7} width={18} height={13} rx={3} fill={f('yellow')} />
    <Line x1={12} y1={10.3} x2={12} y2={16.7} />
    <Line x1={8.8} y1={13.5} x2={15.2} y2={13.5} />
  </>
));

export const InsuranceIcon = createIcon('InsuranceIcon', 'Care', ({ f }) => (
  <>
    <Path d={SHIELD} fill={f('yellow')} />
    <Paw cx={12} cy={12.2} s={0.9} />
  </>
));

export const RecordsIcon = createIcon('RecordsIcon', 'Care', ({ f }) => (
  <>
    <Path d="M6 3 H14.5 L19 7.5 V19.5 A1.5 1.5 0 0 1 17.5 21 H6.5 A1.5 1.5 0 0 1 5 19.5 V4 A1 1 0 0 1 6 3 Z" fill={f('white')} />
    <Path d="M14.5 3 V7.5 H19" />
    <Line x1={8.5} y1={11.5} x2={15.5} y2={11.5} strokeWidth={1.8} />
    <Line x1={8.5} y1={15} x2={15.5} y2={15} strokeWidth={1.8} />
    <Line x1={8.5} y1={18} x2={12.5} y2={18} strokeWidth={1.8} />
  </>
));

export const CareIcons = { VaccinationIcon, MedicationIcon, AppointmentIcon, CalendarIcon, TodoIcon, VetVisitIcon, InsuranceIcon, RecordsIcon };
