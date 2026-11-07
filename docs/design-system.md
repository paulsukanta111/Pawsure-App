# Pawsure design system

Built from the moodboard (warm, playful, hand-drawn pet care). The live version
of everything below is the **Style guide** screen in the app (Me → Style guide,
route `/styleguide`), which renders the real components.

| Layer | Where |
|---|---|
| Tokens (colour, type, spacing, radius, icon) + contrast helpers | `packages/design-tokens/src/index.ts` |
| Contrast tests (WCAG AA) | `packages/design-tokens/test/contrast.test.ts` |
| App theme (confidence states, re-exports tokens) | `apps/mobile/src/design/theme.ts` |
| Components | `apps/mobile/src/design/*.tsx`, import from `../design` |

## 01 Colour

| Token | Hex | Use |
|---|---|---|
| Stone | `#C3BEA8` | Brand backgrounds, illustration backdrops |
| Golden Yellow | `#FFC400` | Primary actions, selected states, highlights. **Fill only, never text on light** |
| Cream | `#FFFDF0` | Cards and panels |
| Soft Beige | `#F4EED8` | Screen background |
| Charcoal | `#20201D` | Text, icons, control borders |
| Charcoal muted | `#5A574C` | Secondary text (≥ 4.5:1 on every surface) |
| Alert | `#B3261E` | Missed / not confirmed / due soon |
| Success | `#2E6B34` | Good / covered |

Components use the semantic names (`color.bg.card`, `color.text.muted`,
`color.action.primary`…), never raw hex.

## 02 Typography

Baloo 2 (rounded bold headings) + Mukta (body). Both include **Devanagari**, so
Hindi and Marathi render in the same style (the moodboard's rounded font may not).

| Style | Size/line | Font |
|---|---|---|
| h1 | 48/56 | Baloo 2 ExtraBold |
| h2 | 32/40 | Baloo 2 ExtraBold |
| h3 | 24/32 | Baloo 2 Bold |
| subheading | 18/28 | Mukta Medium |
| body / bodyStrong | 16/24 | Mukta Regular / SemiBold |
| caption | 14/20 | Mukta Regular |
| small | 12/16 | Mukta Regular |
| label | 14/20 | Mukta SemiBold |

Use `<Text variant="…" tone="…">`. Headings get the screen-reader header role automatically.

## 03 Spacing and radius

Spacing 4 · 8 · 12 · 16 · 24 · 32. Radius 4 · 8 · 12 · 16 · 24 · pill.
Cards use radius 24, list rows 16, inputs 16, buttons and chips pill.

## 04 Iconography

Lucide outline icons, 2px stroke, charcoal. Screens use semantic names
(`<Icon name="vaccine" />`); the mapping lives in `Icon.tsx`.

## 05 Components

`Button` (primary · secondary · outlined · danger), `IconButton`, `TextField`,
`Checkbox`, `Toggle`, `SegmentedTabs`, `Chip` (choice or read-only tag),
`ProgressDots`, `Card` (plain · brand · calm · alert), `SectionHeader`,
`ListItem`, `IconTile`, `MetricCard` + `Sparkline`, `StatusPill`, `PetAvatar`,
`PetChip`, `Logo`, `IllustrationSlot`, `Screen`.

### Confidence labels (PRD 5.1)

| State | Style |
|---|---|
| Confirmed | Charcoal pill, cream text |
| Likely | White pill, charcoal outline |
| Not confirmed | Alert tint, alert text and border |
| Missed | Alert pill, white text |
| Matched (owner check) | Success tint |
| Due | Beige, muted |

Every pill carries its text label and an accessibility description, so colour is never the only cue.

## 07 Illustrations

The hand-drawn characters are not in the codebase yet. `IllustrationSlot` marks
where they go (onboarding hero, pet portrait). Nothing in the UI depends on art.
Supply final artwork as SVG or 2x/3x PNG and replace the slots.

## 09 Accessibility rules

- Text ≥ 4.5:1, control boundaries ≥ 3:1; enforced by `npm test`.
- Touch targets ≥ 48px.
- Yellow controls always have a charcoal border, because yellow vs beige alone is ~1.4:1.
- `maxFontSizeMultiplier` 1.6 so large-text settings scale without breaking layouts.

## Deliberate differences from the moodboard

- **Navigation** stays as the PRD's frozen five tabs (Today · Find cover · Friends · Pet · Me, PS-108), not the moodboard's Home/Care/+/Insights/Profile.
- **Alert red and success green** were added; the moodboard has no status colours, and the PRD needs them for missed tasks.
- **Fonts** were chosen for Devanagari support (see above).
