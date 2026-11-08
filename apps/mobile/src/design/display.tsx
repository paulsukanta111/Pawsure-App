/** Layout and display components (moodboard 05 and 06). */
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Polyline } from 'react-native-svg';
import type { TaskConfidence } from '@pawsure/domain';
import { CrewAvatar } from './Character';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { color, confidenceStyle, radius, space, touchTarget } from './theme';

/**
 * Screen: scrolling content, plus an optional `footer` pinned to the bottom of the screen
 * (onboarding's Continue, etc.) so the main action is always in view, never only after scrolling.
 */
export function Screen({ title, subtitle, header, children, background, footer }: { title?: string; subtitle?: string; header?: ReactNode; children: ReactNode; background?: string; footer?: ReactNode }) {
  return (
    <SafeAreaView style={[s.safe, background ? { backgroundColor: background } : null]} edges={footer ? ['top', 'bottom'] : ['top']}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.inner}>
          {header}
          {title ? <Text variant="h2">{title}</Text> : null}
          {subtitle ? <Text variant="caption" tone="muted" style={{ marginTop: -space.sm }}>{subtitle}</Text> : null}
          {children}
        </View>
      </ScrollView>
      {footer ? (
        <View style={[s.footer, background ? { backgroundColor: background } : null]}>
          <View style={s.footerInner}>{footer}</View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function Card({ children, tone = 'plain', style }: { children: ReactNode; tone?: 'plain' | 'alert' | 'calm' | 'brand'; style?: ViewStyle }) {
  return <View style={[s.card, tones[tone], style]}>{children}</View>;
}
const tones: Record<string, ViewStyle> = {
  plain: {},
  // Tinted cards carry no outline: the fill, icon and words mark them, not a dark border.
  alert: { backgroundColor: color.status.alertTint, borderColor: 'transparent' },
  calm: { backgroundColor: color.status.successTint, borderColor: 'transparent' },
  brand: { backgroundColor: color.bg.selected, borderColor: 'transparent' },
};

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <Text variant="subheading" style={{ fontFamily: 'Mukta_600SemiBold' }}>{title}</Text>
      {action && onAction ? (
        <Pressable accessibilityRole="link" onPress={onAction} hitSlop={12}>
          <Text variant="label" style={{ color: color.text.link }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Rounded icon tile used at the start of list rows and in category grids. */
export function IconTile({ name, size = 44, tone = 'beige' }: { name: IconName; size?: number; tone?: 'beige' | 'yellow' }) {
  return (
    <View style={[s.tile, { width: size, height: size }, tone === 'yellow' && { backgroundColor: color.bg.selected, borderColor: color.border.strong }]}>
      <Icon name={name} size={Math.round(size * 0.5)} />
    </View>
  );
}

/** Card / list item (moodboard "Vaccination Due"). */
export function ListItem({
  icon, title, subtitle, meta, metaTone = 'muted', right, onPress, accent,
}: {
  icon?: IconName; title: string; subtitle?: string; meta?: string; metaTone?: 'muted' | 'alert' | 'success'; right?: ReactNode; onPress?: () => void;
  /** Yellow bar on the leading edge: the item that needs attention first. */
  accent?: boolean;
}) {
  const body = (
    <>
      {accent ? <View style={s.accentBar} /> : null}
      {icon ? <View style={s.listIcon}><Icon name={icon} size={28} /></View> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? <Text variant="caption" tone="muted">{subtitle}</Text> : null}
        {meta ? <Text variant="small" tone={metaTone} style={{ fontFamily: 'Mukta_600SemiBold' }}>{meta}</Text> : null}
      </View>
      {right}
      {onPress ? <Icon name="chevronRight" size={20} tint={color.text.muted} /> : null}
    </>
  );
  if (!onPress) return <View style={s.listItem}>{body}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.listItem, pressed && { backgroundColor: color.bg.canvas }]}>
      {body}
    </Pressable>
  );
}

/** Daily metric row (mockup "Food intake 240 kcal · Good"): yellow edge, icon, value, status word. */
export function MetricRow({ icon, title, value, status, statusTone = 'success', onPress }: {
  icon: IconName; title: string; value: string; status?: string; statusTone?: 'success' | 'alert' | 'muted'; onPress?: () => void;
}) {
  const body = (
    <>
      <View style={s.accentBar} />
      <View style={s.listIcon}><Icon name={icon} size={28} /></View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" tone="muted">{value}</Text>
      </View>
      {status ? <Text variant="bodyStrong" tone={statusTone}>{status}</Text> : null}
    </>
  );
  if (!onPress) return <View style={s.listItem} accessible accessibilityLabel={`${title}, ${value}${status ? `, ${status}` : ''}`}>{body}</View>;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.listItem, pressed && { backgroundColor: color.bg.canvas }]}>{body}</Pressable>;
}

/** Round quick action under the pet profile (mockup "Health / Nutrition / Activity / Records"). */
export function QuickAction({ icon, label, selected, onPress }: { icon: IconName; label: string; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!selected }} accessibilityLabel={label} onPress={onPress} style={s.quick}>
      {({ pressed }) => (
        <>
          <View style={[s.quickCircle, selected && s.quickCircleOn, pressed && { opacity: 0.8 }]}><Icon name={icon} size={28} /></View>
          <Text variant="small">{label}</Text>
        </>
      )}
    </Pressable>
  );
}
/** Health metric card with sparkline (moodboard "Weight 12.4 kg +0.3 kg"). */
export function MetricCard({ icon, label, value, delta, series, style }: { icon: IconName; label: string; value: string; delta?: string; series: number[]; style?: ViewStyle }) {
  return (
    <Card style={style}>
      <View style={s.row}>
        <Icon name={icon} size={20} />
        <Text variant="label">{label}</Text>
      </View>
      <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-end' }]}>
        <View>
          <Text variant="h3">{value}</Text>
          {delta ? (
            <View style={s.row}>
              <Icon name="arrowUp" size={14} tint={color.text.success} />
              <Text variant="small" tone="success">{delta}</Text>
            </View>
          ) : null}
        </View>
        <Sparkline data={series} />
      </View>
    </Card>
  );
}

export function Sparkline({ data, width = 96, height = 36 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - 4 - ((v - min) / span) * (height - 8)}`).join(' ');
  return (
    <Svg width={width} height={height} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Polyline points={pts} fill="none" stroke={color.action.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points={pts} fill="none" stroke={color.border.strong} strokeWidth={1} strokeDasharray="1 5" strokeLinecap="round" />
    </Svg>
  );
}

/** Confidence label (PRD 5.1). Always text, never colour alone. */
export function StatusPill({ value }: { value: TaskConfidence | 'pending' }) {
  const c = confidenceStyle[value];
  return (
    <View style={[s.pill, { backgroundColor: c.bg, borderColor: c.border }]} accessible accessibilityLabel={`${c.label}. ${c.explain}`}>
      <Text variant="small" style={{ color: c.fg, fontFamily: 'Mukta_600SemiBold' }}>{c.label}</Text>
    </View>
  );
}

/** Pet avatar: the owner's photo once added; until then the Pet Crew avatar for the species. */
export function PetAvatar({ species, size = 48 }: { species: 'dog' | 'cat'; size?: number }) {
  return <CrewAvatar species={species} size={size} />;
}

/** Pet switcher pill (moodboard dashboard "Mochi / Bruno"). */
export function PetChip({ name, detail, species, selected, onPress }: { name: string; detail: string; species: 'dog' | 'cat'; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!selected }} onPress={onPress} style={[s.petChip, selected && s.petChipOn]}>
      <PetAvatar species={species} size={44} />
      <View>
        <Text variant="label">{name}</Text>
        <Text variant="small" tone="muted">{detail}</Text>
      </View>
    </Pressable>
  );
}

/** Wordmark: rounded bold "Pawsure" with a yellow paw accent. */
export function Logo({ size = 40, tagline }: { size?: number; tagline?: boolean }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Pawsure">
      <View style={[s.row, { gap: space.xs }]}>
        <Text style={{ fontFamily: 'Baloo2_800ExtraBold', fontSize: size, lineHeight: size * 1.15 }}>Pawsure</Text>
        <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" style={{ marginTop: -size * 0.35 }}>
          <Path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" fill={color.action.primary} stroke={color.border.strong} strokeWidth={1.5} />
        </Svg>
      </View>
      {tagline ? <Text variant="caption" tone="muted">Be sure, whoever's caring.</Text> : null}
    </View>
  );
}

/** Placeholder frame for the hand-drawn illustrations (moodboard 07) until final art is supplied. */
export function IllustrationSlot({ name, height = 160 }: { name: string; height?: number }) {
  return (
    <View style={[s.illustration, { height }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Icon name="paw" size={40} tint={color.text.muted} />
      <Text variant="small" tone="muted">{name} (simulated)</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg.canvas },
  scroll: { paddingBottom: space.xxl },
  footer: { borderTopWidth: 1, borderTopColor: color.border.subtle, backgroundColor: color.bg.canvas, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg,
    shadowColor: color.bg.inverse, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  footerInner: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: space.sm },
  inner: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.lg },
  card: { backgroundColor: color.bg.card, borderRadius: radius.lg, padding: space.lg, gap: space.md, borderWidth: 1, borderColor: color.border.subtle },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  tile: { borderRadius: radius.md, backgroundColor: color.bg.canvas, borderWidth: 1, borderColor: color.border.subtle, alignItems: 'center', justifyContent: 'center' },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: touchTarget + 20, paddingVertical: space.md, paddingHorizontal: space.lg, backgroundColor: color.bg.card, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border.subtle, overflow: 'hidden' },
  listIcon: { width: 32, alignItems: 'center' },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: color.action.primary },
  quick: { alignItems: 'center', gap: space.xs, minWidth: 64 },
  quickCircle: { width: 56, height: 56, borderRadius: radius.pill, borderWidth: 1.5, borderColor: color.border.subtle, backgroundColor: color.bg.card, alignItems: 'center', justifyContent: 'center' },
  quickCircleOn: { backgroundColor: color.bg.selected, borderColor: color.action.primary, borderWidth: 2 },
  pill: { alignSelf: 'flex-start', borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: 2 },
  petChip: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, paddingLeft: space.sm, paddingRight: space.lg, borderRadius: radius.lg, borderWidth: 2, borderColor: 'transparent', minHeight: touchTarget },
  petChipOn: { borderColor: color.action.primary, backgroundColor: color.bg.selected },
  illustration: { borderRadius: radius.xl, backgroundColor: color.bg.brand, alignItems: 'center', justifyContent: 'center', gap: space.xs, borderWidth: 1, borderColor: color.border.subtle },
});
