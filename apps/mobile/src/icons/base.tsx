/**
 * Pawsure icon system: one factory, shared shapes, no duplicated SVG markup.
 *
 * - 24x24 grid for UI icons, 48x48 for feature illustrations (iconSpec).
 * - One stroke weight, round caps and joins, outlines in `currentColor`.
 * - Flat fills from `iconFill` tokens; `accent={false}` gives a plain outline.
 * - `filled` switches to the selected variant (navigation, like/save).
 * - Decorative by default (hidden from screen readers); pass `label` when the icon
 *   carries meaning on its own.
 */
import { color as tokens, iconFill, iconSpec } from '@pawsure/design-tokens';
import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

export type IconCategory =
  | 'Navigation' | 'Action' | 'Health' | 'Care' | 'PetProfile' | 'Reminder'
  | 'Community' | 'Location' | 'Status' | 'Utility' | 'Illustration';

export type FillKey = keyof typeof iconFill;

export interface IconProps {
  /** Rendered size in px (default 24, or 48 for illustrations). */
  size?: number;
  /** Outline colour; flows to every stroke via currentColor. Default charcoal. */
  color?: string;
  /** Selected/active variant. */
  filled?: boolean;
  /** Show flat accent fills (default true). */
  accent?: boolean;
  /** Accessibility label. Omit for decorative icons. */
  label?: string;
  /** Override stroke width (rarely needed). */
  strokeWidth?: number;
}

export interface DrawContext {
  /** Accent fill colour, or 'none' when accents are off. */
  f: (k: FillKey) => string;
  filled: boolean;
}

export interface IconComponent {
  (props: IconProps): ReactNode;
  iconName: string;
  category: IconCategory;
  grid: 24 | 48;
}

export function createIcon(name: string, category: IconCategory, draw: (c: DrawContext) => ReactNode, opts: { grid?: 24 | 48 } = {}): IconComponent {
  const grid = opts.grid ?? 24;
  const Icon = ({ size, color, filled = false, accent = true, label, strokeWidth }: IconProps) => {
    const ctx: DrawContext = { f: (k) => (accent || filled ? iconFill[k] : 'none'), filled };
    return (
      <Svg
        width={size ?? grid}
        height={size ?? grid}
        viewBox={`0 0 ${grid} ${grid}`}
        color={color ?? tokens.text.primary}
        accessible={!!label}
        accessibilityLabel={label}
        accessibilityRole={label ? 'image' : undefined}
        importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
        accessibilityElementsHidden={!label}
      >
        <G fill="none" stroke="currentColor" strokeWidth={strokeWidth ?? (grid === 48 ? iconSpec.largeStroke : iconSpec.stroke)} strokeLinecap="round" strokeLinejoin="round">
          {draw(ctx)}
        </G>
      </Svg>
    );
  };
  Icon.iconName = name;
  Icon.category = category;
  Icon.grid = grid;
  Icon.displayName = name;
  return Icon as IconComponent;
}

// ---------------------------------------------------------------------------
// Shared shapes (24 grid unless noted)

export const HEART = 'M12 20 C5 15.2 3 11.6 3 8.6 A4.6 4.6 0 0 1 12 6.4 A4.6 4.6 0 0 1 21 8.6 C21 11.6 19 15.2 12 20 Z';
export const PIN = 'M12 21.5 C8 17 5 13.4 5 9.8 A7 7 0 0 1 19 9.8 C19 13.4 16 17 12 21.5 Z';
export const SHIELD = 'M12 3 L19 6 V11 C19 16 16 19.5 12 21 C8 19.5 5 16 5 11 V6 Z';
export const BELL = 'M6 16.5 V11 A6 6 0 0 1 18 11 V16.5 L19.5 18.5 H4.5 Z';

/** Small solid paw centred on (cx, cy); s=1 is about 8px wide. */
export function Paw({ cx, cy, s = 1, fill = 'currentColor' }: { cx: number; cy: number; s?: number; fill?: string }) {
  return (
    <G transform={`translate(${cx} ${cy}) scale(${s})`} fill={fill} stroke="none">
      <Ellipse cx={0} cy={1.6} rx={2.6} ry={2.1} />
      <Circle cx={-2.9} cy={-1.4} r={1.05} />
      <Circle cx={-1.05} cy={-3.1} r={1.05} />
      <Circle cx={1.05} cy={-3.1} r={1.05} />
      <Circle cx={2.9} cy={-1.4} r={1.05} />
    </G>
  );
}

export function Bell({ fill }: { fill: string }) {
  return (
    <G>
      <Path d={BELL} fill={fill} />
      <Path d="M10 20.5 A2 2 0 0 0 14 20.5" />
      <Path d="M12 3.5 V5" />
    </G>
  );
}

/** Open hand (palm up) holding a small heart: help request / find cover. */
export function HandHeart({ heart, hand, cuff }: { heart: string; hand: string; cuff: string }) {
  return (
    <G>
      <Path d="M12 11.2 C8.6 8.8 7.6 7.2 7.6 5.8 A2.2 2.2 0 0 1 12 4.9 A2.2 2.2 0 0 1 16.4 5.8 C16.4 7.2 15.4 8.8 12 11.2 Z" fill={heart} strokeWidth={1.8} />
      <Path d="M6.5 14.2 L9.8 13.6 C11 13.4 12.2 13.9 12.9 14.6 H16.2 A1.5 1.5 0 0 1 16.2 17.6 H12 M16.4 16.2 L19.4 14.6 A1.5 1.5 0 0 1 20.8 17.2 L15.6 20.4 H6.5 Z" fill={hand} />
      <Path d="M2.8 13.4 H6.5 V21 H2.8 Z" fill={cuff} />
    </G>
  );
}

/** Round badge in the lower-right corner (status overlays on bells, people). */
export function Badge({ fill, children }: { fill: string; children: ReactNode }) {
  return (
    <G>
      <Circle cx={17.5} cy={17.5} r={4.5} fill={fill} />
      {children}
    </G>
  );
}

export { Circle, Ellipse, G, Path };
