/**
 * Pawsure icon library: central registry and exports.
 * Import named components (`import { HomeIcon } from '../icons'`) or look up by
 * name through ICONS for data-driven UI. See docs/iconography.md.
 */
import { ActionIcons } from './actions';
import type { IconCategory, IconComponent } from './base';
import { CareIcons } from './care';
import { CommunityIcons } from './community';
import { HealthIcons } from './health';
import { Illustrations } from './illustrations';
import { LocationIcons } from './location';
import { NavigationIcons } from './navigation';
import { PetProfileIcons } from './petProfile';
import { ReminderIcons } from './reminders';
import { StatusIcons } from './status';
import { UtilityIcons } from './utility';

export * from './actions';
export * from './care';
export * from './community';
export * from './health';
export * from './illustrations';
export * from './location';
export * from './navigation';
export * from './petProfile';
export * from './reminders';
export * from './status';
export * from './utility';
export type { DrawContext, FillKey, IconCategory, IconComponent, IconProps } from './base';

export const ICON_CATEGORIES: Record<IconCategory, Record<string, IconComponent>> = {
  Navigation: NavigationIcons,
  Action: ActionIcons,
  Health: HealthIcons,
  Care: CareIcons,
  PetProfile: PetProfileIcons,
  Reminder: ReminderIcons,
  Community: CommunityIcons,
  Location: LocationIcons,
  Status: StatusIcons,
  Utility: UtilityIcons,
  Illustration: Illustrations,
};

/** Every icon by component name, e.g. ICONS.HomeIcon. */
export const ICONS: Record<string, IconComponent> = Object.assign({}, ...Object.values(ICON_CATEGORIES));
export const ICON_COUNT = Object.keys(ICONS).length;
