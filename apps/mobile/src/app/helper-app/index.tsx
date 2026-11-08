// Helper experience: Sunita's WhatsApp, Chats screen (simulated). Pawsure is one verified
// business chat in her ordinary WhatsApp; she never installs an app (PS-020, PS-110).
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatSim as wa, Icon, radius, space, Text, WaBottomNav, WaChatRow } from '../../design';
import { HELPER_APP_TEXT } from '../../proto/helperAppStrings';
import { useProto } from '../../proto/store';
import { useHelperChat } from '../../proto/useHelperChat';

const CHIPS = { en: ['All', 'Unread', 'Favourites', 'Groups'], hi: ['सभी', 'अनपढ़े', 'पसंदीदा', 'ग्रुप'], mr: ['सर्व', 'न वाचलेले', 'आवडते', 'ग्रुप'] } as const;
const SEARCH = { en: 'Search', hi: 'खोजें', mr: 'शोधा' } as const;
const E2E = { en: 'Your personal messages are end-to-end encrypted', hi: 'आपके निजी संदेश एंड-टू-एंड एन्क्रिप्टेड हैं', mr: 'तुमचे वैयक्तिक संदेश एंड-टू-एंड एन्क्रिप्टेड आहेत' } as const;
const NAV = { en: ['Chats', 'Updates', 'Communities', 'Calls'], hi: ['चैट', 'अपडेट', 'कम्युनिटी', 'कॉल'], mr: ['चॅट', 'अपडेट', 'कम्युनिटी', 'कॉल'] } as const;

export default function HelperChats() {
  const { state } = useProto();
  const h = state.helper;
  const A = HELPER_APP_TEXT[h.language];
  const { msgs } = useHelperChat();
  const last = [...msgs].reverse().find((m) => m.text || m.photo || m.voice || m.link);
  const unread = msgs.filter((m) => m.from === 'pawsure' && m.replies?.length).length;
  const preview = last?.text?.split('\n')[0] ?? (last?.photo ? '📷 Photo' : last?.voice ? '🎤 Voice message' : last?.link ? last.link.url : '');
  const chips = CHIPS[h.language];
  const nav = NAV[h.language];

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <View style={st.top}>
        <Text style={st.brand}>WhatsApp</Text>
        <View style={st.topIcons} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Icon accent={false} name="camera" size={22} tint={wa.text} />
          <Icon accent={false} name="more" size={22} tint={wa.text} />
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: space.xl }}>
        <View style={st.search}><Icon accent={false} name="search" size={20} tint={wa.muted} /><Text variant="body" style={{ color: wa.muted }}>{SEARCH[h.language]}</Text></View>
        <View style={st.chips} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {chips.map((c, i) => (
            <View key={c} style={[st.chip, i === 0 && { backgroundColor: wa.navActive, borderColor: wa.navActive }]}>
              <Text variant="label" style={{ color: i === 0 ? wa.header : wa.muted }}>{c}{i === 1 && unread ? ` ${unread}` : ''}</Text>
            </View>
          ))}
        </View>
        {h.consent === 'not_invited' ? (
          <View style={st.empty}>
            <Text variant="bodyStrong" style={{ color: wa.text }}>{A.noInvite}</Text>
            <Text variant="caption" style={{ color: wa.muted, textAlign: 'center' }}>{A.noInviteBody}</Text>
          </View>
        ) : (
          <WaChatRow name="Pawsure" verified preview={preview} time={last?.time ?? ''} unread={unread || undefined} sent={last?.from === 'me'}
            onPress={() => router.push('/helper-app/chat')} />
        )}
        <View style={st.e2e}>
          <Icon accent={false} name="shield" size={14} tint={wa.muted} />
          <Text variant="small" style={{ color: wa.muted }}>{E2E[h.language]}</Text>
        </View>
      </ScrollView>
      <WaBottomNav items={[
        { icon: 'community', label: nav[0], active: true, badge: unread || undefined },
        { icon: 'reminder', label: nav[1] },
        { icon: 'friends', label: nav[2] },
        { icon: 'phone', label: nav[3] },
      ]} />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: wa.surface },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.md },
  brand: { fontFamily: 'Mukta_600SemiBold', fontSize: 26, lineHeight: 34, color: wa.header },
  topIcons: { flexDirection: 'row', gap: space.xl },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginHorizontal: space.lg, paddingHorizontal: space.lg, minHeight: 44, borderRadius: radius.pill, backgroundColor: wa.linkBg },
  chips: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md, flexWrap: 'wrap' },
  chip: { paddingHorizontal: space.md, minHeight: 32, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: wa.linkBg, borderWidth: 1, borderColor: wa.linkBg },
  empty: { alignItems: 'center', gap: space.xs, padding: space.xl },
  e2e: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, paddingVertical: space.lg },
});
