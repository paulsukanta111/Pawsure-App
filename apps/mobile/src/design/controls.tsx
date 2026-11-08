/**
 * Buttons and controls (moodboard 05). Every control:
 *  - is at least 48px tall/wide (touch target),
 *  - exposes role + state to screen readers,
 *  - uses a charcoal or control-grey boundary so it meets 3:1 non-text contrast.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { color, radius, space, touchTarget, type } from './theme';

// ---------------------------------------------------------------------------
// Button: primary (yellow), secondary (cream), outlined (transparent), danger.

export type ButtonKind = 'primary' | 'secondary' | 'outlined' | 'danger';

export function Button({
  label, onPress, kind = 'primary', icon, disabled, full, accessibilityHint,
}: {
  label: string; onPress: () => void; kind?: ButtonKind; icon?: IconName; disabled?: boolean; full?: boolean; accessibilityHint?: string;
}) {
  const k = buttonKinds[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: pressed && kind === 'primary' ? color.action.primaryPressed : k.bg, borderColor: k.border },
        full && { alignSelf: 'stretch' },
        pressed && kind !== 'primary' && { backgroundColor: color.bg.canvas },
        disabled && { opacity: 0.45 },
      ]}
    >
      {icon ? <Icon name={icon} size={20} tint={k.fg} /> : null}
      <Text variant="bodyStrong" style={{ color: k.fg }}>{label}</Text>
    </Pressable>
  );
}

const buttonKinds: Record<ButtonKind, { bg: string; fg: string; border: string }> = {
  primary: { bg: color.action.primary, fg: color.text.onAction, border: color.border.strong },
  secondary: { bg: color.bg.raised, fg: color.text.primary, border: color.border.strong },
  outlined: { bg: 'transparent', fg: color.text.primary, border: color.border.strong },
  danger: { bg: color.status.alert, fg: '#FFFFFF', border: color.status.alert },
};

export function IconButton({ name, label, onPress, filled }: { name: IconName; label: string; onPress: () => void; filled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [s.iconBtn, filled && s.iconBtnFilled, pressed && { opacity: 0.8 }]}
    >
      <Icon name={name} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Text field with optional leading icon.

export function TextField({ icon, label, style, ...rest }: TextInputProps & { icon?: IconName; label?: string; style?: ViewStyle }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={style}>
      {label ? <Text variant="label" style={{ marginBottom: space.xs }}>{label}</Text> : null}
      <View style={[s.field, focused && s.fieldFocused, rest.multiline && { alignItems: 'flex-start', paddingVertical: space.md }]}>
        {icon ? <Icon name={icon} size={20} tint={color.text.muted} /> : null}
        <TextInput
          placeholderTextColor={color.text.muted}
          accessibilityLabel={label ?? rest.placeholder}
          {...rest}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={[type.body, s.input, rest.multiline && { minHeight: 72, textAlignVertical: 'top' }]}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Checkbox and toggle.

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => onChange(!checked)} style={s.checkRow}>
      <View style={[s.box, checked && s.boxOn]}>{checked ? <Icon name="check" size={16} /> : null}</View>
      <Text variant="body">{label}</Text>
    </Pressable>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} onPress={() => onChange(!value)} style={s.toggleRow}>
      <Text variant="body" style={{ flex: 1 }}>{label}</Text>
      <View style={[s.track, value && s.trackOn]}>
        <View style={[s.knob, value && s.knobOn]} />
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Segmented tabs (moodboard "All / Health / Nutrition / Activity").

export function SegmentedTabs<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={s.segments} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[s.segment, on && s.segmentOn]}>
            <Text variant="label" tone={on ? undefined : 'muted'}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Chips: filter/choice chips and read-only tags ("Indoor", "Spayed").

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  const content = (
    <>
      {icon ? <Icon name={icon} size={16} /> : null}
      {selected && !icon ? <Icon name="check" size={16} /> : null}
      <Text variant="label">{label}</Text>
    </>
  );
  if (!onPress) return <View style={[s.chip, s.tag]}>{content}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!selected }} onPress={onPress} style={[s.chip, selected && s.chipOn]}>
      {content}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Progress dots (onboarding, multi-step forms).

export function ProgressDots({ count, index }: { count: number; index: number }) {
  return (
    <View style={s.dots} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: count, now: index + 1 }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[s.dot, i === index && s.dotOn]} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  btn: {
    minHeight: touchTarget, borderRadius: radius.pill, borderWidth: 1.5, paddingHorizontal: space.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
  },
  iconBtn: { width: touchTarget, height: touchTarget, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  iconBtnFilled: { backgroundColor: color.action.primary, borderWidth: 1.5, borderColor: color.border.strong },
  field: {
    minHeight: touchTarget, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg,
    backgroundColor: color.bg.raised, borderWidth: 1.5, borderColor: color.border.control, borderRadius: radius.lg,
  },
  fieldFocused: { borderColor: color.border.strong, borderWidth: 2 },
  input: { flex: 1, color: color.text.primary, paddingVertical: space.sm, outlineStyle: 'none' } as never,
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: touchTarget },
  box: { width: 24, height: 24, borderRadius: radius.xs, borderWidth: 1.5, borderColor: color.border.control, backgroundColor: color.bg.raised, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: color.action.primary, borderColor: color.border.strong },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: touchTarget },
  track: { width: 52, height: 30, borderRadius: radius.pill, borderWidth: 1.5, borderColor: color.border.control, backgroundColor: color.bg.canvas, padding: 2, justifyContent: 'center' },
  trackOn: { backgroundColor: color.action.primary, borderColor: color.border.strong },
  knob: { width: 22, height: 22, borderRadius: radius.pill, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: color.border.control },
  knobOn: { alignSelf: 'flex-end', borderColor: color.border.strong },
  // Mockup "Week / Month / Year": full-width beige track, yellow rounded block for the selected option.
  segments: { flexDirection: 'row', gap: space.xs, backgroundColor: color.bg.sunken, borderRadius: radius.md, padding: space.xs, alignSelf: 'stretch' },
  segment: { flex: 1, minHeight: 44, paddingHorizontal: space.md, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: color.action.primary },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: 40, paddingHorizontal: space.md,
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: color.border.control, backgroundColor: color.bg.raised,
  },
  chipOn: { backgroundColor: color.bg.selected, borderColor: color.border.strong },
  tag: { minHeight: 32, borderWidth: 1, borderColor: color.border.control, backgroundColor: 'transparent' },
  dots: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: color.border.control },
  dotOn: { width: 24, backgroundColor: color.action.primary, borderWidth: 1.5, borderColor: color.border.strong, height: 10 },
});
