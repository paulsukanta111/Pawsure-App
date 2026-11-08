/**
 * Semantic icon names used across screens, mapped to the Pawsure icon library (src/icons).
 * Screens say what they mean (`<Icon name="vaccine" />`); the library decides how it looks.
 * Use the named components from src/icons directly when you need a specific variant.
 */
import {
  ActivityIcon, AppointmentIcon, EditIcon, MoreIcon, ArrowUpIcon, BackIcon, CatIcon, ChatIcon, ClockIcon, CouponsIcon, DogIcon, ErrorIcon,
  FindCoverIcon, FoodIcon, ForwardIcon, FriendsIcon, HealthIcon, HelpRequestIcon, HomeIcon, InfoIcon, KeyIcon, LeafIcon,
  MedicationIcon, MicIcon, NearbyIcon, OffersIcon, PetIcon, PhoneIcon, PlusIcon, ProfileIcon, ProtectionIcon, RecordsIcon,
  ReminderIcon, RewardsIcon, SearchIcon, SelectIcon, SettingsIcon, SmileIcon, SuccessIcon, TodoIcon, VaccinationIcon,
  VetVisitIcon, VitalsIcon, WarningIcon, WaterIcon, WeightIcon, type IconComponent,
} from '../icons';
import { color, icon as iconToken } from './theme';

export const icons = {
  paw: PetIcon, dog: DogIcon, cat: CatIcon, food: FoodIcon, health: VitalsIcon, calendar: AppointmentIcon, vaccine: VaccinationIcon,
  medication: MedicationIcon, activity: ActivityIcon, reminder: ReminderIcon, home: HomeIcon, stats: HealthIcon, community: ChatIcon,
  settings: SettingsIcon, profile: ProfileIcon, friends: FriendsIcon, care: HelpRequestIcon, findCover: FindCoverIcon, smile: SmileIcon,
  leaf: LeafIcon, water: WaterIcon, weight: WeightIcon, key: KeyIcon, phone: PhoneIcon, shield: ProtectionIcon, clock: ClockIcon,
  alert: WarningIcon, error: ErrorIcon, info: InfoIcon, success: SuccessIcon, plus: PlusIcon, search: SearchIcon, check: SelectIcon,
  chevronRight: ForwardIcon, chevronLeft: BackIcon, arrowUp: ArrowUpIcon, mic: MicIcon, nearby: NearbyIcon, rewards: RewardsIcon,
  coupons: CouponsIcon, offers: OffersIcon, records: RecordsIcon, todo: TodoIcon, vetVisit: VetVisitIcon, edit: EditIcon, more: MoreIcon,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof icons;

export function Icon({ name, size = iconToken.md, tint = color.text.primary, label, filled, accent }: {
  name: IconName; size?: number; tint?: string; label?: string; filled?: boolean; accent?: boolean;
}) {
  const Cmp = icons[name];
  return <Cmp size={size} color={tint} label={label} filled={filled} accent={accent} />;
}
