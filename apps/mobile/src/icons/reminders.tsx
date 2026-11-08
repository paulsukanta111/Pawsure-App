// ReminderIcons: a bell with a status badge.
import { Line, Path } from 'react-native-svg';
import { Badge, Bell, createIcon } from './base';

export const ReminderIcon = createIcon('ReminderIcon', 'Reminder', ({ f }) => <Bell fill={f('yellow')} />);

export const ReminderCompletedIcon = createIcon('ReminderCompletedIcon', 'Reminder', ({ f }) => (
  <>
    <Bell fill={f('white')} />
    <Badge fill={f('green')}><Path d="M15.3 17.6 L16.9 19.2 L19.8 16" strokeWidth={1.7} /></Badge>
  </>
));

export const ReminderSnoozeIcon = createIcon('ReminderSnoozeIcon', 'Reminder', ({ f }) => (
  <>
    <Bell fill={f('white')} />
    <Badge fill={f('amber')}><Path d="M17.5 15.2 V17.6 L19 18.6" strokeWidth={1.7} /></Badge>
  </>
));

export const ReminderDismissIcon = createIcon('ReminderDismissIcon', 'Reminder', ({ f }) => (
  <>
    <Bell fill={f('white')} />
    <Badge fill={f('orange')}>
      <Line x1={15.8} y1={15.8} x2={19.2} y2={19.2} strokeWidth={1.7} />
      <Line x1={19.2} y1={15.8} x2={15.8} y2={19.2} strokeWidth={1.7} />
    </Badge>
  </>
));

export const ReminderIcons = { ReminderIcon, ReminderCompletedIcon, ReminderSnoozeIcon, ReminderDismissIcon };
