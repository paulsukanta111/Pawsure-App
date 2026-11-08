# Pawsure iconography

The Pawsure icon library lives in `apps/mobile/src/icons/`. It follows the team's iconography reference sheet: bold rounded charcoal outlines, flat fills, friendly geometry and minimal detail. It replaces the generic Lucide icons used earlier.

Live gallery: in the app, **Me → Icons** (route `/icons`). It shows every icon by category, at every size, with variants, on cream and white backgrounds, with accent fills on or off.

## System

| Property | Value |
|---|---|
| UI icon grid | 24 × 24 viewBox |
| Feature illustration grid | 48 × 48 viewBox |
| Stroke | 2 on the 24 grid, 2.5 on the 48 grid; round caps and joins |
| Outline colour | `currentColor`, default charcoal (`color.text.primary`) |
| Fills | `iconFill` tokens: yellow, orange, amber, green, lime, sky, teal, white, paper |
| Sizes | 16, 20, 24 (default), 32, 48 (`iconSpec.sizes`) |
| Backgrounds | Charcoal outlines give ≥ 3:1 contrast on cream, white, beige and paper |

Fills are decorative: meaning always comes from the shape, a text label, or both. Status colours never stand alone.

## Categories (88 icons)

| Category | Icons |
|---|---|
| NavigationIcons | Home, Chat, Add (primary, yellow circle), Health, Profile, FindCover |
| ActionIcons | Plus, Edit, Search, Filter, Sort, More |
| HealthIcons | Weight, Food, Activity, Water, Poop, Sleep, Vitals |
| CareIcons | Vaccination, Medication, Appointment, Calendar, Todo, VetVisit, Insurance, Records |
| PetProfileIcons | Pet (paw), Breed, Age, Gender, IdTag, Dog, Cat |
| ReminderIcons | Reminder, ReminderCompleted, ReminderSnooze, ReminderDismiss |
| CommunityIcons | Friends, AddFriend, HelpRequest, OfferHelp |
| LocationIcons | Nearby, PetCare, VetClinic, PetStore, PetPark, PetBoarding |
| StatusIcons | Success, Warning, Error, Info, Loading, Sync, HealthExcellent → HealthAttention |
| UtilityIcons | Back, Forward, Close, Select, ArrowUp, Like, Save, Share, Upload, Download, Phone, Key, Clock, Camera, Mic, Settings, Protection, Leaf, Smile, Rewards, Offers, Coupons, Premium |
| Illustrations (48) | Nutrition, Fitness, Protection, Wellness, Healthy, HappyPet |

Rewards, Offers, Coupons and Premium are grouped with UtilityIcons to keep the ten requested categories.

## Props

```tsx
interface IconProps {
  size?: number;        // px; default 24 (48 for illustrations)
  color?: string;       // outline colour via currentColor
  filled?: boolean;     // selected variant (tabs, like, save)
  accent?: boolean;     // flat fills on (default) or outline only
  label?: string;       // accessibility label; omit for decorative icons
  strokeWidth?: number; // override, rarely needed
}
```

## Usage

```tsx
import { AddIcon, HomeIcon, ICONS, LikeIcon, VaccinationIcon, WarningIcon } from '../icons';

<HomeIcon />                                  // 24px outline
<HomeIcon filled />                           // selected tab
<LikeIcon filled />                           // liked (orange)
<VaccinationIcon size={32} />                 // larger
<VaccinationIcon accent={false} />            // outline only
<VaccinationIcon color={color.text.muted} />  // recolour the outline
<AddIcon size={48} />                         // primary action: yellow circle
<WarningIcon label="Warning" />               // meaningful: announced by screen readers
const Icon = ICONS[name];                      // data-driven lookup
```

Inside screens, prefer the semantic wrapper `Icon` from `src/design` (`<Icon name="vaccine" />`). It maps meanings to library components, so a redesign happens in one place.

## Rules

- **One drawing per icon.** Every icon is defined once with `createIcon` in its category file. Shared shapes (paw, heart, bell, pin, shield, hand) live in `icons/base.tsx`.
- **Selected state = filled.** Tabs use `filled` with accents on; unselected tabs are plain outlines.
- **Primary actions use `AddIcon`** (yellow circle). Other actions use plain outlines.
- **Accessibility:** decorative icons are hidden from screen readers; pass `label` when the icon is the only content of a control, or use a labelled button.
- **Adding an icon:** draw it on the 24 grid with the shared stroke, use `f('yellow')`-style fills, add it to its category object, and it appears in `ICONS` and the gallery automatically.

## Characters and illustrations

The Pet Crew (Kitto, Sparky, Bunji, Toby, Hedge, Piku) and the empty-state scenes come from the team's character and iconography sheets. They are raster illustrations, cropped into `apps/mobile/assets/characters/` and embedded via `src/design/characters.ts`. Use `<Character name="…" />`, `<CrewAvatar species="dog" />` and `<EmptyState art="no-results" />`. They are not redrawn as SVG; ask the illustrator for vector sources if they are needed at large sizes.
