// Helper experience, the Pawsure chat full screen: prompts, quick replies, and a composer whose
// camera and mic send the check-in for the task that is waiting (W2-W5).
import { router } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, ChatThread, Chip, color, Icon, IconButton, Loading, radius, space, Text, useToast } from '../../design';
import { HELPER_APP_TEXT } from '../../proto/helperAppStrings';
import { useProto } from '../../proto/store';
import { HOMES, useHelperChat } from '../../proto/useHelperChat';

const LANG_NAME = { en: 'English', hi: 'हिंदी', mr: 'मराठी' } as const;

export default function HelperChat() {
  const { state } = useProto();
  const h = state.helper;
  const A = HELPER_APP_TEXT[h.language];
  const toast = useToast();
  const { msgs, uploading, home, setHome, openTask, checkIn } = useHelperChat();
  const scroll = useRef<ScrollViewInstance>(null);
  const send = (kind: 'photo' | 'voice') => (openTask && checkIn ? checkIn(kind) : toast(A.noTask));

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <View style={st.head}>
        <IconButton name="chevronLeft" label="Back to chats" onPress={() => (router.canGoBack() ? router.back() : router.replace('/helper-app'))} />
        <Avatar label="P" tone="yellow" />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">Pawsure</Text>
          <Text variant="small" tone="muted">{A.business} · {LANG_NAME[h.language]}</Text>
        </View>
      </View>
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={st.body} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        {h.consent === 'given' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {HOMES.map((x) => <Chip key={x.id} label={x.label} selected={home === x.id} onPress={() => setHome(x.id)} />)}
          </View>
        ) : null}
        <ChatThread bare title="Pawsure" messages={msgs} footer={uploading ? <Loading label={uploading} /> : undefined} />
      </ScrollView>
      {h.consent === 'given' ? (
        <View style={st.composer}>
          <View style={st.input}><Text variant="body" tone="muted">{A.message}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={A.camera} onPress={() => send('photo')} style={st.round}><Icon name="camera" size={22} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={A.voiceBtn} onPress={() => send('voice')} style={[st.round, st.mic]}><Icon name="mic" size={22} /></Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg.canvas },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm, paddingVertical: space.sm, backgroundColor: color.bg.card, borderBottomWidth: 1, borderBottomColor: color.border.subtle },
  body: { padding: space.lg, gap: space.md, width: '100%', maxWidth: 640, alignSelf: 'center' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm, paddingHorizontal: space.md, backgroundColor: color.bg.card, borderTopWidth: 1, borderTopColor: color.border.subtle },
  input: { flex: 1, minHeight: 44, justifyContent: 'center', paddingHorizontal: space.lg, borderRadius: radius.pill, backgroundColor: color.bg.raised, borderWidth: 1, borderColor: color.border.subtle },
  round: { width: 48, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg.raised, borderWidth: 1, borderColor: color.border.subtle },
  mic: { backgroundColor: color.action.primary, borderColor: color.action.primary },
});
