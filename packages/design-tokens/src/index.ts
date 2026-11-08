/**
 * Pawsure design tokens, from the moodboard (sections 01-03, 09).
 *
 * Layer 1, primitives: the five brand colours plus the few status hues the PRD needs.
 * Layer 2, semantic: what each colour is for. Components use semantic tokens only.
 *
 * Accessibility rules (WCAG 2.2 AA), enforced by test/contrast.test.ts:
 *  - Text pairs >= 4.5:1. Golden Yellow is a fill colour, never a text colour on light.
 *  - UI boundaries (toggle track, input border, focus ring) >= 3:1 against their surface.
 *  - Confidence states always carry a text label; colour is never the only cue (PRD 5.1).
 */

export const palette = {
  stone: '#C3BEA8',
  goldenYellow: '#FFC400',
  cream: '#FFFDF0',
  /** Warm cream screen background from the app screen mockups (v2.1). */
  creamCanvas: '#FFF8E6',
  /** Near-white card surface on the cream canvas. */
  creamCard: '#FFFDF7',
  softBeige: '#F4EED8',
  /** Warm paper behind the welcome illustration (matches the supplied artwork). */
  paper: '#FEF8F1',
  charcoal: '#20201D',
  // Supporting hues (not on the moodboard; needed for alerts and progress).
  charcoalMuted: '#5A574C',
  yellowTint: '#FFF0B3',
  alert: '#B3261E',
  alertTint: '#FBE3DF',
  success: '#2E6B34',
  successTint: '#E3F0DF',
  white: '#FFFFFF',
} as const;

export const color = {
  bg: {
    canvas: palette.creamCanvas,   // screen background
    paper: palette.paper,          // welcome screen, behind the illustration
    card: palette.creamCard,       // cards & panels
    sunken: palette.softBeige,     // segmented-control tracks, inactive tiles
    raised: palette.white,         // inputs, list rows inside cards
    brand: palette.stone,          // illustration backdrops, onboarding
    inverse: palette.charcoal,
    selected: palette.yellowTint,
  },
  text: {
    primary: palette.charcoal,
    muted: palette.charcoalMuted,
    inverse: palette.cream,
    onAction: palette.charcoal,    // text on Golden Yellow buttons
    alert: palette.alert,
    success: palette.success,
    /** "See all" links: a dark amber that reads as the brand yellow but passes 4.5:1. */
    link: '#8A5A00',
  },
  action: {
    primary: palette.goldenYellow,
    primaryPressed: '#E6B000',
    border: palette.charcoal,
  },
  border: {
    subtle: '#E4DCC2',             // decorative dividers between cards (non-essential)
    control: '#7A7666',            // input/toggle boundaries: >= 3:1 on cream and beige
    strong: palette.charcoal,
  },
  status: {
    alert: palette.alert,
    alertTint: palette.alertTint,
    success: palette.success,
    successTint: palette.successTint,
  },
} as const;

/**
 * Icon fills, sampled from the Pawsure iconography sheet. Always used inside a charcoal
 * outline (the outline carries the 3:1 non-text contrast), so they are decorative.
 */
export const iconFill = {
  yellow: palette.goldenYellow,
  orange: '#F98442',
  amber: '#FCBA4E',
  green: '#8ADB4A',
  lime: '#C6EA6C',
  sky: '#B4E4F6',
  teal: '#3DBFA8',
  white: '#FFFFFF',
  paper: '#FEF8F1',
} as const;

/** Icon geometry: 24x24 UI icons, 48x48 feature illustrations, one stroke weight. */
export const iconSpec = { grid: 24, largeGrid: 48, stroke: 2, largeStroke: 2.5, sizes: { xs: 16, sm: 20, md: 24, lg: 32, xl: 48 } } as const;

/** Spacing scale (px): 4 8 12 16 24 32. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Corner radius (px): 4 8 12 16 24, plus pill. */
export const radius = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

/**
 * Font families. Baloo 2 (rounded, bold headings) and Mukta (body) both cover
 * Latin and Devanagari, which Hindi and Marathi need (PRD 15, localisation).
 */
export const fontFamily = {
  headingExtraBold: 'Baloo2_800ExtraBold',
  headingBold: 'Baloo2_700Bold',
  medium: 'Mukta_500Medium',
  regular: 'Mukta_400Regular',
  semibold: 'Mukta_600SemiBold',
} as const;

export interface TypeStyle { fontFamily: string; fontSize: number; lineHeight: number }

/** Type scale from the moodboard: size / line height. */
export const type = {
  h1: { fontFamily: fontFamily.headingExtraBold, fontSize: 48, lineHeight: 56 },
  h2: { fontFamily: fontFamily.headingExtraBold, fontSize: 32, lineHeight: 40 },
  h3: { fontFamily: fontFamily.headingBold, fontSize: 24, lineHeight: 32 },
  subheading: { fontFamily: fontFamily.medium, fontSize: 18, lineHeight: 28 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 20 },
} as const satisfies Record<string, TypeStyle>;

/** Minimum touch target (Android guideline 48dp). */
export const touchTarget = 48;

/** Icon sizes and stroke, matching the moodboard's rounded outline icons. */
export const icon = { sm: 16, md: 24, lg: 32, stroke: 2 } as const;

// ---------------------------------------------------------------------------
// Contrast helpers (WCAG 2.x relative luminance)

export function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255) as [number, number, number];
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
