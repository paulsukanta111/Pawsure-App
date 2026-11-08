// Helper experience: the Pawsure business chat in Sunita's WhatsApp (simulated). Prompts,
// reply buttons, and the message bar's camera and mic send the check-in for the waiting task (W2-W5).
import { router } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatSim as wa, Loading, radius, space, Text, useToast, WaComposer, WaHeader, WaThread } from '../../design';
import { HELPER_APP_TEXT } from '../../proto/helperAppStrings';
import { useProto } from '../../proto/store';
import { HOMES, useHelperChat } from '../../proto/useHelperChat';

const TODAY = { en: 'Today', hi: 'आज', mr: 'आज' } as const;

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
      <WaHeader title="Pawsure" verified subtitle={A.business} backLabel="Back to chats"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/helper-app'))} />
      <ScrollView ref={scroll} style={{ flex: 1, backgroundColor: wa.wallpaper }} contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        {h.consent === 'given' ? (
          // Prototype control: Sunita works in two homes; one Pawsure chat serves both.
          <View style={st.homes}>
            {HOMES.map((x) => (
              <Pressable key={x.id} accessibilityRole="button" accessibilityState={{ selected: home === x.id }} onPress={() => setHome(x.id)}
                style={[st.home, home === x.id && { backgroundColor: wa.navActive }]}>
                <Text variant="small" style={{ color: wa.text, fontFamily: home === x.id ? 'Mukta_600SemiBold' : undefined }}>{x.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <WaThread messages={msgs} dateLabel={TODAY[h.language]} footer={uploading ? <View style={st.loading}><Loading label={uploading} /></View> : undefined} />
      </ScrollView>
      {h.consent === 'given' ? (
        <WaComposer placeholder={A.message} cameraLabel={A.camera} micLabel={A.voiceBtn} onCamera={() => send('photo')} onMic={() => send('voice')} />
      ) : null}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: wa.header },
  homes: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, justifyContent: 'center', paddingTop: space.sm, backgroundColor: wa.wallpaper },
  home: { paddingHorizontal: space.md, minHeight: 32, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: wa.surface },
  loading: { alignSelf: 'flex-end', backgroundColor: wa.bubbleOut, borderRadius: radius.sm, padding: space.sm },
});
