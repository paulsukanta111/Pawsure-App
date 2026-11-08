/**
 * Empty, error, loading and success states, toasts, OTP input, simulated photo
 * picker and onboarding stepper (master prompt §2 design system).
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Character, type CharacterName } from './Character';
import { Button } from './controls';
import { Icon, type IconName } from './Icon';
import { ProgressDots } from './controls';
import { Text } from './Text';
import { color, radius, space, touchTarget, type } from './theme';

/** Which Pet Crew illustration each empty state uses (from the team's iconography sheet). */
export type EmptyArt = 'no-results' | 'nothing-to-track' | 'no-appointments' | 'no-messages';
const EMPTY_ART: Record<EmptyArt, CharacterName> = {
  'no-results': 'emptyNoResults',
  'nothing-to-track': 'emptyNothingToTrack',
  'no-appointments': 'emptyNoAppointments',
  'no-messages': 'emptyNoMessages',
};

export function EmptyState({ art = 'nothing-to-track', title, body, action, onAction }: { art?: EmptyArt; title: string; body?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.state} accessibilityRole="summary">
      <Character name={EMPTY_ART[art]} height={130} />
      <Text variant="subheading" align="center">{title}</Text>
      {body ? <Text variant="caption" tone="muted" align="center">{body}</Text> : null}
      {action && onAction ? <Button label={action} onPress={onAction} /> : null}
    </View>
  );
}

export function ErrorState({ title, body, retry, onRetry }: { title: string; body: string; retry?: string; onRetry?: () => void }) {
  return (
    <View style={[s.state, s.error]} accessibilityRole="alert">
      <Icon name="alert" tint={color.text.alert} size={32} />
      <Text variant="subheading" align="center">{title}</Text>
      <Text variant="caption" align="center">{body}</Text>
      {retry && onRetry ? <Button label={retry} kind="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

/** Three pulsing dots with a label, for short simulated waits. */
export function Loading({ label }: { label: string }) {
  const a = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    const loops = a.map((v, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 150),
      Animated.timing(v, { toValue: 1, duration: 350, useNativeDriver: false }),
      Animated.timing(v, { toValue: 0.3, duration: 350, useNativeDriver: false }),
    ])));
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [a]);
  return (
    <View style={s.loading} accessibilityRole="progressbar" accessibilityLabel={label}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {a.map((v, i) => <Animated.View key={i} style={[s.dot, { opacity: v }]} />)}
      </View>
      <Text variant="caption" tone="muted">{label}</Text>
    </View>
  );
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <View style={{ gap: space.sm }} accessibilityLabel="Loading">
      {Array.from({ length: lines }, (_, i) => <View key={i} style={[s.skel, { width: `${90 - i * 18}%` }]} />)}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Toasts

type ToastTone = 'success' | 'info' | 'alert';
const ToastCtx = createContext<(msg: string, tone?: ToastTone) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; tone: ToastTone; id: number } | null>(null);
  const show = useCallback((msg: string, tone: ToastTone = 'success') => setToast({ msg, tone, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={s.toastWrap}>
          <Pressable onPress={() => setToast(null)} accessibilityRole="alert" accessibilityLiveRegion="polite"
            style={[s.toast, toast.tone === 'alert' && { backgroundColor: color.status.alert }]}>
            <Icon name={toast.tone === 'alert' ? 'alert' : 'check'} size={18} tint={color.text.inverse} />
            <Text variant="label" tone="inverse" style={{ flex: 1 }}>{toast.msg}</Text>
          </Pressable>
        </View>
      ) : null}
    </ToastCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// OTP input: six boxes over one real input, so paste and SMS autofill work.

export function OtpInput({ value, onChange, error, onSubmit }: { value: string; onChange: (v: string) => void; error?: boolean; onSubmit?: () => void }) {
  const ref = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityRole="none" style={{ gap: space.sm }}>
      <View style={s.otpRow}>
        {Array.from({ length: 6 }, (_, i) => {
          const filled = i < value.length;
          const active = i === Math.min(value.length, 5);
          return (
            <View key={i} style={[s.otpBox, filled && s.otpFilled, active && s.otpActive, error && s.otpError]}>
              <Text variant="h3">{value[i] ?? ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={6}
        autoFocus
        onSubmitEditing={onSubmit}
        accessibilityLabel="6-digit code"
        style={s.otpHidden}
      />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Simulated photo picker: a real app opens the camera; the prototype shows a sample.

export function PhotoPicker({ label, value, onPick, art }: { label: string; value: boolean; onPick: () => void; art: ReactNode }) {
  const [busy, setBusy] = useState(false);
  return (
    <View style={{ alignItems: 'center', gap: space.sm }}>
      <View style={s.photo}>{value ? art : busy ? <Loading label="Uploading…" /> : <Icon name="plus" size={32} tint={color.text.muted} />}</View>
      <Button label={value ? 'Change photo' : label} kind="outlined" icon="search" onPress={() => { setBusy(true); setTimeout(() => { setBusy(false); onPick(); }, 700); }} />
      {value ? <Text variant="small" tone="muted">Sample photo (simulated upload)</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------

export function StepHeader({ step, of, title, body }: { step: number; of: number; title: string; body?: string }) {
  return (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ProgressDots count={of} index={step - 1} />
        <Text variant="small" tone="muted">Step {step} of {of}</Text>
      </View>
      <Text variant="h2">{title}</Text>
      {body ? <Text variant="caption" tone="muted">{body}</Text> : null}
    </View>
  );
}

export function IconBadge({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={s.badge}>
      <Icon name={icon} size={14} />
      <Text variant="small" style={{ fontFamily: type.label.fontFamily }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  state: { alignItems: 'center', gap: space.sm, padding: space.lg, borderRadius: radius.xl, backgroundColor: color.bg.card, borderWidth: 1, borderColor: color.border.subtle },
  error: { backgroundColor: color.status.alertTint, borderColor: 'transparent' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: color.text.primary },
  skel: { height: 14, borderRadius: radius.sm, backgroundColor: color.border.subtle },
  toastWrap: { position: 'absolute', left: 0, right: 0, bottom: 84, alignItems: 'center', paddingHorizontal: space.lg },
  toast: { flexDirection: 'row', alignItems: 'center', gap: space.sm, maxWidth: 520, width: '100%', paddingVertical: space.md, paddingHorizontal: space.lg, borderRadius: radius.lg, backgroundColor: color.bg.inverse },
  otpRow: { flexDirection: 'row', gap: space.sm, justifyContent: 'center' },
  otpBox: { width: 46, height: 56, borderRadius: radius.md, borderWidth: 1.5, borderColor: color.border.control, backgroundColor: color.bg.raised, alignItems: 'center', justifyContent: 'center' },
  otpFilled: { borderColor: color.border.strong },
  otpActive: { borderColor: color.border.strong, borderWidth: 2.5, backgroundColor: color.bg.selected },
  otpError: { borderColor: color.status.alert },
  otpHidden: { position: 'absolute', opacity: 0.01, width: '100%', height: touchTarget, top: 0 },
  photo: { width: 132, height: 132, borderRadius: radius.pill, backgroundColor: color.bg.selected, borderWidth: 2, borderColor: color.border.strong, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: color.bg.canvas, borderWidth: 1, borderColor: color.border.subtle },
});
