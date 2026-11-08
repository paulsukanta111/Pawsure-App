// Helper experience, home: Sunita's phone. She never installs an app; Pawsure is one chat on
// WhatsApp, a free missed call on a basic phone, and a card page opened from a link (PS-020, PS-110).
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar, color, EmptyState, Icon, ListItem, radius, Screen, space, Text } from '../../design';
import { HELPER_APP_TEXT } from '../../proto/helperAppStrings';
import { fmt, useProto } from '../../proto/store';
import { useHelperChat } from '../../proto/useHelperChat';

export default function HelperHome() {
  const { state, now, evaluations } = useProto();
  const h = state.helper;
  const A = HELPER_APP_TEXT[h.language];
  const { msgs, openTask } = useHelperChat();
  const last = [...msgs].reverse().find((m) => m.text || m.photo || m.voice);
  const waiting = msgs.filter((m) => m.from === 'pawsure' && m.replies?.length).length;
  const next = state.tasks.filter((t) => !t.cancelled && evaluations[t.id]?.task === 'pending').sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())[0];

  return (
    <Screen>
      <View style={st.top}>
        <Text variant="h2">{A.chats}</Text>
        <Text variant="label" tone="muted">{fmt(now)}</Text>
      </View>

      {h.consent === 'not_invited' ? (
        <EmptyState art="no-messages" title={A.noInvite} body={A.noInviteBody} />
      ) : (
        <>
          <Pressable accessibilityRole="button" accessibilityLabel={`Pawsure chat${waiting ? `, ${waiting} waiting` : ''}`} onPress={() => router.push('/helper-app/chat')}
            style={({ pressed }) => [st.chat, pressed && { backgroundColor: color.bg.sunken }]}>
            <Avatar label="P" tone="yellow" size={52} />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={st.rowBetween}>
                <Text variant="bodyStrong">Pawsure</Text>
                <Text variant="small" tone="muted">{last?.time ?? ''}</Text>
              </View>
              <View style={st.rowBetween}>
                <Text variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
                  {last?.from === 'me' ? '✓ ' : ''}{last?.text?.split('\n')[0] ?? (last?.photo ? '📷 Photo' : last?.voice ? '🎤 Voice note' : '')}
                </Text>
                {waiting ? <View style={st.badge}><Text variant="small" style={{ fontFamily: 'Mukta_600SemiBold' }}>{waiting}</Text></View> : null}
              </View>
            </View>
          </Pressable>

          {h.consent === 'given' ? (
            <View style={st.next}>
              <Icon name="clock" size={22} />
              <Text variant="caption" style={{ flex: 1 }}>
                {openTask ? `${fmt(openTask.dueAt)} · ${state.pet.name}: ${openTask.title} · ${A.waiting}` : next ? `${A.nextTask}: ${fmt(next.dueAt)} · ${next.title}` : A.noneNow}
              </Text>
            </View>
          ) : null}

          <ListItem icon="rewards" title={A.card} subtitle={A.cardSub} onPress={() => router.push('/helper-app/card')} />
          <ListItem icon="phone" title={A.basicPhone} subtitle={A.basicPhoneSub} onPress={() => router.push('/basic-phone')} />
        </>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chat: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.lg, backgroundColor: color.bg.card, borderWidth: 1, borderColor: color.border.subtle, minHeight: 76 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  badge: { minWidth: 22, height: 22, borderRadius: radius.pill, backgroundColor: color.action.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  next: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg, backgroundColor: color.bg.selected },
});
