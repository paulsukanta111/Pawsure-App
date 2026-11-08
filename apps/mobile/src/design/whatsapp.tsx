/**
 * Simulated WhatsApp screens for the helper and friend (PS-020, PS-060, PS-110): Pawsure reaches
 * them only on WhatsApp, so the prototype shows exactly that channel. Prototype-only; every
 * screen using these is labelled as a simulation and no message is sent.
 * Colours come from `chatSim` tokens (contrast-tested); icons from the Pawsure library.
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import type { ChatMessage } from './extra';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { chatSim as wa, color, radius, space } from './theme';

const C = { color: wa.text };

/** Business profile picture: the Pawsure mark on yellow. */
export function WaAvatar({ size = 40, label = 'P', tone = 'brand' }: { size?: number; label?: string; tone?: 'brand' | 'grey' }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius.pill, backgroundColor: tone === 'brand' ? color.action.primary : wa.avatarGrey, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="bodyStrong" style={{ color: wa.text, fontSize: size * 0.42, lineHeight: size * 0.5 }}>{label}</Text>
    </View>
  );
}

/** Green verified-business badge. */
export function WaVerified({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Verified business">
      <Path d="M12 1.8l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.9 1 2.9-2.5 1.7-.9 2.9-3-.2L12 22.2l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.9-1-2.9 2.5-1.7.9-2.9 3 .2z" fill={wa.badge} />
      <Polyline points="7.5,12.3 10.6,15.2 16.6,9" fill="none" stroke={wa.onHeader} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Ticks() {
  return (
    <Svg width={16} height={11} viewBox="0 0 16 11" accessibilityLabel="Read">
      <Polyline points="1,6 4,9 10,2" fill="none" stroke={wa.tick} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="6,8 7,9 14,2" fill="none" stroke={wa.tick} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Green chat header: back, profile picture, name with badge, status line, call actions. */
export function WaHeader({ title, subtitle, onBack, verified, avatar, backLabel = 'Back' }: {
  title: string; subtitle?: string; onBack: () => void; verified?: boolean; avatar?: ReactNode; backLabel?: string;
}) {
  return (
    <View style={st.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={backLabel} onPress={onBack} hitSlop={8} style={st.headBtn}>
        <Icon accent={false} name="chevronLeft" tint={wa.onHeader} />
      </Pressable>
      {avatar ?? <WaAvatar size={38} />}
      <View style={{ flex: 1, marginLeft: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text variant="bodyStrong" style={{ color: wa.onHeader }} numberOfLines={1}>{title}</Text>
          {verified ? <WaVerified /> : null}
        </View>
        {subtitle ? <Text variant="small" style={{ color: wa.onHeader }} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={st.headBtn} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Icon accent={false} name="phone" size={22} tint={wa.onHeader} /></View>
      <View style={st.headBtn} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Icon accent={false} name="more" size={22} tint={wa.onHeader} /></View>
    </View>
  );
}

/** The conversation on the beige wallpaper: date chip, bubbles with tails, reply buttons, link previews. */
export function WaThread({ messages, footer, dateLabel = 'Today' }: { messages: ChatMessage[]; footer?: ReactNode; dateLabel?: string }) {
  return (
    <View style={st.thread}>
      <View style={st.dateChip}><Text variant="small" style={{ color: wa.muted }}>{dateLabel}</Text></View>
      {messages.map((m) => {
        const out = m.from === 'me';
        return (
          <View key={m.id} style={{ alignItems: out ? 'flex-end' : 'flex-start', gap: 3 }}>
            <View style={[st.bubble, out ? st.out : st.in]}>
              <Svg width={9} height={13} viewBox="0 0 9 13" style={[st.tail, out ? { right: -8 } : { left: -8, transform: [{ scaleX: -1 }] }]}>
                <Path d="M0 0 H9 L0.5 12 Z" fill={out ? wa.bubbleOut : wa.bubbleIn} />
              </Svg>
              {m.photo ? (
                <View style={st.photo}>
                  <Icon accent={false} name="food" size={40} tint={wa.muted} />
                  {m.photo.code ? <View style={st.code}><Text variant="label" style={C}>Code {m.photo.code}</Text></View> : null}
                  <Text variant="small" style={{ color: wa.muted }}>{m.photo.caption}</Text>
                </View>
              ) : null}
              {m.voice ? (
                <View style={st.voice}>
                  <WaAvatar size={34} label="S" tone="grey" />
                  <Svg width={14} height={16} viewBox="0 0 14 16"><Path d="M1 1 L13 8 L1 15 Z" fill={wa.muted} /></Svg>
                  <View style={st.wave}>
                    {[4, 9, 6, 12, 8, 14, 7, 10, 5, 11, 6, 9, 4, 8, 12, 6, 9, 5].map((h, i) => <View key={i} style={{ width: 2.5, height: h, borderRadius: 2, backgroundColor: wa.muted }} />)}
                  </View>
                  <Text variant="small" style={{ color: wa.muted }}>0:{String(m.voice.seconds).padStart(2, '0')}</Text>
                </View>
              ) : null}
              {m.voice?.transcript ? <Text variant="small" style={{ color: wa.muted, fontStyle: 'italic' }}>"{m.voice.transcript}"</Text> : null}
              {m.link ? (
                <Pressable accessibilityRole="link" accessibilityLabel={`${m.link.title}, ${m.link.url}`} onPress={m.link.onPress} style={st.linkCard}>
                  <View style={st.linkArt}><Icon name="rewards" size={28} /></View>
                  <View style={{ flex: 1, padding: space.sm }}>
                    <Text variant="label" style={C}>{m.link.title}</Text>
                    {m.link.description ? <Text variant="small" style={{ color: wa.muted }} numberOfLines={2}>{m.link.description}</Text> : null}
                    <Text variant="small" style={{ color: wa.muted }}>{m.link.url}</Text>
                  </View>
                </Pressable>
              ) : null}
              {m.text ? <Text variant="body" style={C}>{m.text}</Text> : null}
              {m.link ? <Text variant="body" style={{ color: wa.action, textDecorationLine: 'underline' }} onPress={m.link.onPress}>https://{m.link.url}</Text> : null}
              <View style={st.meta}>
                <Text variant="small" style={{ color: wa.muted, fontSize: 11 }}>{m.time}</Text>
                {out ? <Ticks /> : null}
              </View>
            </View>
            {m.replies?.length ? (
              <View style={st.buttons}>
                {m.replies.map((r) => (
                  <Pressable key={r.label} accessibilityRole="button" onPress={r.onPress} style={({ pressed }) => [st.button, pressed && { backgroundColor: wa.divider }]}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                      <Path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" fill={wa.action} />
                    </Svg>
                    <Text variant="label" style={{ color: wa.action }}>{r.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
      {footer}
    </View>
  );
}

/** Message bar: emoji, text field, attach, camera, and the round green mic. */
export function WaComposer({ placeholder = 'Message', onCamera, onMic, cameraLabel = 'Camera', micLabel = 'Voice message' }: {
  placeholder?: string; onCamera: () => void; onMic: () => void; cameraLabel?: string; micLabel?: string;
}) {
  return (
    <View style={st.composer}>
      <View style={st.field}>
        <Icon accent={false} name="smile" size={22} tint={wa.muted} />
        <Text variant="body" style={{ color: wa.muted, flex: 1 }}>{placeholder}</Text>
        <Icon accent={false} name="plus" size={22} tint={wa.muted} />
        <Pressable accessibilityRole="button" accessibilityLabel={cameraLabel} onPress={onCamera} hitSlop={10}>
          <Icon accent={false} name="camera" size={22} tint={wa.muted} />
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={micLabel} onPress={onMic} style={({ pressed }) => [st.mic, pressed && { opacity: 0.85 }]}>
        <Icon accent={false} name="mic" size={22} tint={wa.onHeader} />
      </Pressable>
    </View>
  );
}

/** A row in the Chats list. */
export function WaChatRow({ name, preview, time, unread, verified, onPress, avatar, sent }: {
  name: string; preview: string; time: string; unread?: number; verified?: boolean; onPress?: () => void; avatar?: ReactNode; sent?: boolean;
}) {
  const body = (
    <>
      {avatar ?? <WaAvatar size={50} />}
      <View style={st.rowText}>
        <View style={st.rowLine}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
            <Text variant="bodyStrong" style={C} numberOfLines={1}>{name}</Text>
            {verified ? <WaVerified /> : null}
          </View>
          <Text variant="small" style={{ color: unread ? wa.action : wa.muted, fontFamily: unread ? 'Mukta_600SemiBold' : undefined }}>{time}</Text>
        </View>
        <View style={st.rowLine}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
            {sent ? <Ticks /> : null}
            <Text variant="caption" style={{ color: wa.muted, flex: 1 }} numberOfLines={1}>{preview}</Text>
          </View>
          {unread ? <View style={st.unread}><Text variant="small" style={{ color: wa.onBadge, fontFamily: 'Mukta_600SemiBold' }}>{unread}</Text></View> : null}
        </View>
      </View>
    </>
  );
  if (!onPress) return <View style={st.row}>{body}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${name} chat${unread ? `, ${unread} unread` : ''}`} onPress={onPress}
      style={({ pressed }) => [st.row, pressed && { backgroundColor: wa.divider }]}>
      {body}
    </Pressable>
  );
}

/** Bottom navigation of the Chats screen. */
export function WaBottomNav({ items }: { items: { icon: IconName; label: string; active?: boolean; badge?: number }[] }) {
  return (
    <View style={st.nav} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {items.map((it) => (
        <View key={it.label} style={{ alignItems: 'center', gap: 2, flex: 1 }}>
          <View style={[st.navPill, it.active && { backgroundColor: wa.navActive }]}>
            <Icon name={it.icon} size={22} tint={wa.text} filled={it.active} accent={!!it.active} />
            {it.badge ? <View style={[st.unread, st.navBadge]}><Text variant="small" style={{ color: wa.onBadge, fontSize: 10, lineHeight: 14 }}>{it.badge}</Text></View> : null}
          </View>
          <Text variant="small" style={{ color: wa.text, fontFamily: it.active ? 'Mukta_600SemiBold' : undefined }}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: wa.header, paddingHorizontal: space.xs, minHeight: 60 },
  headBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  thread: { backgroundColor: wa.wallpaper, paddingHorizontal: space.md, paddingVertical: space.md, gap: space.sm, flexGrow: 1 },
  dateChip: { alignSelf: 'center', backgroundColor: wa.surface, borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: 2, marginBottom: space.xs },
  bubble: { maxWidth: '82%', minWidth: 90, paddingHorizontal: space.sm + 2, paddingTop: 6, paddingBottom: 4, borderRadius: radius.sm, gap: 4,
    shadowColor: wa.shadow, shadowOpacity: 0.08, shadowRadius: 1, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  in: { backgroundColor: wa.bubbleIn, borderTopLeftRadius: 0 },
  out: { backgroundColor: wa.bubbleOut, borderTopRightRadius: 0 },
  tail: { position: 'absolute', top: 0 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-end' },
  photo: { width: 230, height: 170, borderRadius: radius.sm, backgroundColor: wa.media, alignItems: 'center', justifyContent: 'center', gap: space.xs, marginHorizontal: -4 },
  code: { backgroundColor: wa.surface, borderRadius: radius.xs, paddingHorizontal: space.sm },
  voice: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minWidth: 220 },
  wave: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkCard: { flexDirection: 'row', backgroundColor: wa.linkBg, borderRadius: radius.sm, overflow: 'hidden', minWidth: 230 },
  linkArt: { width: 64, backgroundColor: color.bg.selected, alignItems: 'center', justifyContent: 'center' },
  buttons: { gap: 2, width: '82%', maxWidth: 360 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, minHeight: 44, borderRadius: radius.sm, backgroundColor: wa.surface,
    shadowColor: wa.shadow, shadowOpacity: 0.08, shadowRadius: 1, shadowOffset: { width: 0, height: 1 }, elevation: 1, paddingHorizontal: space.md },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: space.xs, padding: space.xs + 2, backgroundColor: wa.wallpaper },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: wa.surface },
  mic: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: wa.header, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 72, backgroundColor: wa.surface },
  rowText: { flex: 1, gap: 2 },
  rowLine: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  unread: { minWidth: 22, height: 22, borderRadius: radius.pill, backgroundColor: wa.badge, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  nav: { flexDirection: 'row', paddingTop: space.sm, paddingBottom: space.md, backgroundColor: wa.surface, borderTopWidth: 1, borderTopColor: wa.divider },
  navPill: { width: 60, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  navBadge: { position: 'absolute', top: -4, right: 6, minWidth: 18, height: 18 },
});

/** A WhatsApp chat framed as a phone screen inside another page (simulations within the owner's prototype). */
export function WaPhoneChat({ title, subtitle, messages, footer, onBack }: { title: string; subtitle?: string; messages: ChatMessage[]; footer?: ReactNode; onBack: () => void }) {
  return (
    <View style={{ borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: wa.divider }}>
      <WaHeader title={title} subtitle={subtitle} verified onBack={onBack} />
      <WaThread messages={messages} footer={footer} />
    </View>
  );
}
