// CommunityIcons: friends and help.
import { Circle, Line, Path } from 'react-native-svg';
import { Badge, createIcon, HandHeart, HEART } from './base';

export const FriendsIcon = createIcon('FriendsIcon', 'Community', ({ f }) => (
  <>
    <Circle cx={6} cy={9} r={2.4} fill={f('yellow')} />
    <Circle cx={18} cy={9} r={2.4} fill={f('yellow')} />
    <Path d="M1.8 18 C1.8 15.4 3.6 13.8 6.2 13.8" />
    <Path d="M22.2 18 C22.2 15.4 20.4 13.8 17.8 13.8" />
    <Circle cx={12} cy={8} r={3} fill={f('white')} />
    <Path d="M6 20.5 C6 16.9 8.7 14.8 12 14.8 C15.3 14.8 18 16.9 18 20.5 Z" fill={f('yellow')} />
  </>
));

export const AddFriendIcon = createIcon('AddFriendIcon', 'Community', ({ f }) => (
  <>
    <Circle cx={10} cy={8} r={3.6} fill={f('white')} />
    <Path d="M3 20 C3 16.4 6.1 14.4 10 14.4 C11.2 14.4 12.3 14.6 13.2 15" />
    <Badge fill={f('yellow')}>
      <Line x1={17.5} y1={15.4} x2={17.5} y2={19.6} strokeWidth={1.7} />
      <Line x1={15.4} y1={17.5} x2={19.6} y2={17.5} strokeWidth={1.7} />
    </Badge>
  </>
));

/** Help request: an open hand offering a heart. */
export const HelpRequestIcon = createIcon('HelpRequestIcon', 'Community', ({ f }) => <HandHeart heart={f('orange')} hand={f('yellow')} cuff={f('white')} />);

export const OfferHelpIcon = createIcon('OfferHelpIcon', 'Community', ({ f }) => <Path d={HEART} fill={f('orange')} />);

export const CommunityIcons = { FriendsIcon, AddFriendIcon, HelpRequestIcon, OfferHelpIcon };
