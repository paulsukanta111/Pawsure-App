// ActionIcons: plain outlines for in-screen actions.
import { Circle, Line, Path } from 'react-native-svg';
import { createIcon } from './base';

export const PlusIcon = createIcon('PlusIcon', 'Action', () => (
  <>
    <Line x1={12} y1={5} x2={12} y2={19} />
    <Line x1={5} y1={12} x2={19} y2={12} />
  </>
));

export const EditIcon = createIcon('EditIcon', 'Action', ({ f, filled }) => (
  <>
    <Path d="M15.5 4 L20 8.5 L9 19.5 H4.5 V15 Z" fill={filled ? f('yellow') : 'none'} />
    <Line x1={13} y1={6.5} x2={17.5} y2={11} />
  </>
));

export const SearchIcon = createIcon('SearchIcon', 'Action', ({ f, filled }) => (
  <>
    <Circle cx={10.5} cy={10.5} r={6.5} fill={filled ? f('sky') : 'none'} />
    <Line x1={15.5} y1={15.5} x2={20.5} y2={20.5} />
  </>
));

export const FilterIcon = createIcon('FilterIcon', 'Action', ({ f }) => (
  <>
    <Line x1={4} y1={8} x2={20} y2={8} />
    <Line x1={4} y1={16} x2={20} y2={16} />
    <Circle cx={9} cy={8} r={2.5} fill={f('white')} />
    <Circle cx={15} cy={16} r={2.5} fill={f('white')} />
  </>
));

export const SortIcon = createIcon('SortIcon', 'Action', () => (
  <>
    <Path d="M8 20 V4 M4.5 7.5 L8 4 L11.5 7.5" />
    <Path d="M16 4 V20 M12.5 16.5 L16 20 L19.5 16.5" />
  </>
));

export const MoreIcon = createIcon('MoreIcon', 'Action', () => (
  <>
    <Circle cx={12} cy={5} r={1.5} fill="currentColor" stroke="none" />
    <Circle cx={12} cy={12} r={1.5} fill="currentColor" stroke="none" />
    <Circle cx={12} cy={19} r={1.5} fill="currentColor" stroke="none" />
  </>
));

export const ActionIcons = { PlusIcon, EditIcon, SearchIcon, FilterIcon, SortIcon, MoreIcon };
