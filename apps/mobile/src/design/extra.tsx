/** Prototype and messaging components built on the same tokens. */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { color, radius, space, touchTarget } from './theme';

// ---------------------------------------------------------------------------
// Chat thread: how a WhatsApp/IVR conversation looks to the helper or friend.
// Deliberately Pawsure-styled, not a copy of any messaging app's look.

export interface ChatMessage {
  id: string;
  from: 'pawsure' | 'me';
  text?: string;
  /** A photo placeholder (prototype) with an optional visible code. */
  photo?: { caption: string; code?: string };
  voice?: { seconds: number; transcript?: string };
  time: string;
  replies?: { label: string; onPress: () => void }[];
}

/** Chat thread. `bare` drops the card frame and header, for a full-screen chat with its own header. */
export function ChatThread({ title, subtitle, messages, footer, bare }: { title: string; subtitle?: string; messages: ChatMessage[]; footer?: ReactNode; bare?: boolean }) {
  return (
    <View style={bare ? null : s.chat}>
      {bare ? null : (
        <View style={s.chatHead}>
          <Avatar label="P" tone="yellow" />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{title}</Text>
            {subtitle ? <Text variant="small" tone="muted">{subtitle}</Text> : null}
          </View>
        </View>
      )}
      <View style={[s.chatBody, bare && { paddingHorizontal: 0 }]}>
        {messages.map((m) => (
          <View key={m.id} style={{ alignItems: m.from === 'me' ? 'flex-end' : 'flex-start', gap: space.xs }}>
            <View style={[s.bubble, m.from === 'me' ? s.bubbleMe : s.bubbleThem]}>
              {m.photo ? (
                <View style={s.photo}>
                  <Icon name="food" size={32} tint={color.text.muted} />
                  {m.photo.code ? <View style={s.codeTag}><Text variant="label">Code {m.photo.code}</Text></View> : null}
                  <Text variant="small" tone="muted">{m.photo.caption}</Text>
                </View>
              ) : null}
              {m.voice ? (
                <View style={s.voice}>
                  <Icon name="mic" size={18} />
                  <View style={s.wave} />
                  <Text variant="small" tone="muted">0:{String(m.voice.seconds).padStart(2, '0')}</Text>
                </View>
              ) : null}
              {m.voice?.transcript ? <Text variant="small" tone="muted">"{m.voice.transcript}"</Text> : null}
              {m.text ? <Text variant="body">{m.text}</Text> : null}
              <Text variant="small" tone="muted" align="right">{m.time}</Text>
            </View>
            {m.replies?.length ? (
              <View style={s.replies}>
                {m.replies.map((r) => (
                  <Pressable key={r.label} accessibilityRole="button" onPress={r.onPress} style={({ pressed }) => [s.reply, pressed && { backgroundColor: color.bg.selected }]}>
                    <Text variant="label">{r.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>
      {footer ? <View style={s.chatFoot}>{footer}</View> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------

export function Avatar({ label, tone = 'beige', size = 40 }: { label: string; tone?: 'beige' | 'yellow' | 'dark'; size?: number }) {
  const bg = tone === 'yellow' ? color.action.primary : tone === 'dark' ? color.bg.inverse : color.bg.canvas;
  const fg = tone === 'dark' ? color.text.inverse : color.text.primary;
  return (
    <View style={[s.avatar, { width: size, height: size, backgroundColor: bg }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text variant="label" style={{ color: fg }}>{label.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
}

/** Banner for screens that preview later releases (P1/P2) or simulate another person's channel. */
export function NoticeBanner({ icon = 'leaf', title, body, tone = 'brand' }: { icon?: IconName; title: string; body?: string; tone?: 'brand' | 'alert' | 'calm' }) {
  const bg = tone === 'alert' ? color.status.alertTint : tone === 'calm' ? color.status.successTint : color.bg.selected;
  const border = 'transparent';
  return (
    <View style={[s.banner, { backgroundColor: bg, borderColor: border }]}>
      <Icon name={icon} size={20} />
      <View style={{ flex: 1 }}>
        <Text variant="label">{title}</Text>
        {body ? <Text variant="small">{body}</Text> : null}
      </View>
    </View>
  );
}

export function KeyValue({ k, v, tone }: { k: string; v: string; tone?: 'alert' | 'success' }) {
  return (
    <View style={s.kv}>
      <Text variant="caption" tone="muted" style={{ flex: 1 }}>{k}</Text>
      <Text variant="label" tone={tone ?? 'primary'} style={{ flexShrink: 1, textAlign: 'right' }}>{v}</Text>
    </View>
  );
}

export function Stat({ value, label, icon }: { value: string; label: string; icon?: IconName }) {
  return (
    <View style={s.stat}>
      {icon ? <Icon name={icon} size={20} /> : null}
      <Text variant="h3">{value}</Text>
      <Text variant="small" tone="muted" align="center">{label}</Text>
    </View>
  );
}

/** Week line chart (moodboard "Health tracking"). */
export function LineChart({ data, labels, height = 140, unit }: { data: number[]; labels: string[]; height?: number; unit?: string }) {
  const width = 300;
  const pad = { l: 28, r: 8, t: 10, b: 22 };
  const min = Math.floor(Math.min(...data)) - 1;
  const max = Math.ceil(Math.max(...data)) + 1;
  const x = (i: number) => pad.l + (i / (data.length - 1)) * (width - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (height - pad.t - pad.b);
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const ticks = [min, (min + max) / 2, max];
  return (
    <View accessible accessibilityLabel={`Chart: ${data.map((v, i) => `${labels[i]} ${v}${unit ?? ''}`).join(', ')}`}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {ticks.map((t) => (
          <Line key={t} x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={color.border.subtle} strokeWidth={1} />
        ))}
        {ticks.map((t) => (
          <SvgText key={`l${t}`} x={2} y={y(t) + 4} fontSize={10} fill={color.text.muted}>{t.toFixed(0)}</SvgText>
        ))}
        <Polyline points={pts} fill="none" stroke={color.action.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((v, i) => <Circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill={color.bg.raised} stroke={color.border.strong} strokeWidth={1.5} />)}
        {labels.map((l, i) => (
          <SvgText key={l + i} x={x(i)} y={height - 6} fontSize={10} fill={color.text.muted} textAnchor="middle">{l}</SvgText>
        ))}
      </Svg>
    </View>
  );
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: color.border.subtle }} />;
}

const s = StyleSheet.create({
  chat: { borderRadius: radius.xl, borderWidth: 1, borderColor: color.border.subtle, overflow: 'hidden', backgroundColor: color.bg.card },
  chatHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, backgroundColor: color.bg.raised, borderBottomWidth: 1, borderBottomColor: color.border.subtle },
  chatBody: { padding: space.md, gap: space.md, backgroundColor: color.bg.canvas },
  chatFoot: { padding: space.md, gap: space.sm, borderTopWidth: 1, borderTopColor: color.border.subtle, backgroundColor: color.bg.raised },
  bubble: { maxWidth: '86%', borderRadius: radius.lg, padding: space.md, gap: space.xs, borderWidth: 1 },
  bubbleThem: { backgroundColor: color.bg.raised, borderColor: color.border.subtle, borderTopLeftRadius: radius.xs },
  bubbleMe: { backgroundColor: color.bg.selected, borderColor: color.bg.selected, borderTopRightRadius: radius.xs },
  photo: { width: 200, height: 120, borderRadius: radius.md, backgroundColor: color.bg.brand, alignItems: 'center', justifyContent: 'center', gap: space.xs },
  codeTag: { backgroundColor: color.bg.raised, borderRadius: radius.sm, paddingHorizontal: space.sm, borderWidth: 1, borderColor: color.border.strong },
  voice: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  wave: { width: 110, height: 4, borderRadius: radius.pill, backgroundColor: color.border.control },
  replies: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, maxWidth: '92%' },
  reply: { minHeight: touchTarget - 8, paddingHorizontal: space.lg, borderRadius: radius.pill, borderWidth: 1.5, borderColor: color.border.strong, backgroundColor: color.bg.raised, justifyContent: 'center' },
  avatar: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.border.subtle },
  banner: { flexDirection: 'row', gap: space.md, padding: space.md, borderRadius: radius.lg, borderWidth: 1.5, alignItems: 'flex-start' },
  kv: { flexDirection: 'row', gap: space.md, alignItems: 'baseline', paddingVertical: space.xs },
  stat: { flex: 1, minWidth: 90, alignItems: 'center', gap: 2, padding: space.md, borderRadius: radius.lg, backgroundColor: color.bg.raised, borderWidth: 1, borderColor: color.border.subtle },
});
