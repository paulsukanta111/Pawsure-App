/**
 * Iconography (moodboard section 04): rounded outline icons, 2px stroke, charcoal.
 * Screens use semantic names; swapping the icon set later only touches this file.
 */
import {
  ArrowUp, Bell, CalendarDays, Cat, ChartColumn, Check, ChevronLeft, ChevronRight, Clock, Dog, Droplets,
  Footprints, HandHeart, Heart, House, KeyRound, Leaf, MessageCircle, Mic, PawPrint, Phone, Pill, Plus, Scale,
  Search, Settings, ShieldCheck, Smile, Soup, Syringe, TriangleAlert, User, Users,
} from 'lucide-react-native';
import { color, icon as iconToken } from './theme';

export const icons = {
  paw: PawPrint, dog: Dog, cat: Cat, food: Soup, health: Heart, calendar: CalendarDays, vaccine: Syringe,
  medication: Pill, activity: Footprints, reminder: Bell, home: House, stats: ChartColumn, community: MessageCircle,
  settings: Settings, profile: User, friends: Users, care: HandHeart, smile: Smile, leaf: Leaf, water: Droplets,
  weight: Scale, key: KeyRound, phone: Phone, shield: ShieldCheck, clock: Clock, alert: TriangleAlert, plus: Plus,
  search: Search, check: Check, chevronRight: ChevronRight, chevronLeft: ChevronLeft, arrowUp: ArrowUp, mic: Mic,
} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, size = iconToken.md, tint = color.text.primary, label }: { name: IconName; size?: number; tint?: string; label?: string }) {
  const Cmp = icons[name];
  return (
    <Cmp
      size={size}
      color={tint}
      strokeWidth={iconToken.stroke}
      accessibilityLabel={label}
      accessible={!!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    />
  );
}
