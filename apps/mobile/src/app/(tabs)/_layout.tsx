// Navigation frozen in PS-108: Today · Find cover · Friends · Pet · Me.
// Tab icons are Lucide (the shadcn default icon library), passed as components, not string keys.
// Every tab is treated the same: the open tab gets a yellow pill behind a bolder icon and a bold
// label; the others are plain muted outlines.
import { Tabs } from 'expo-router/js-tabs';
// Per-icon imports keep the bundle to these five glyphs (the package index pulls in every icon).
import type { LucideIcon } from 'lucide-react-native';
import HandHeart from 'lucide-react-native/icons/hand-heart';
import House from 'lucide-react-native/icons/house';
import PawPrint from 'lucide-react-native/icons/paw-print';
import UserRound from 'lucide-react-native/icons/user-round';
import UsersRound from 'lucide-react-native/icons/users-round';
import { View } from 'react-native';
import { color, radius, Text } from '../../design';

const TAB_ICON: Record<string, LucideIcon> = { index: House, 'find-cover': HandHeart, friends: UsersRound, pet: PawPrint, me: UserRound };

function TabIcon({ icon: Glyph, focused }: { icon: LucideIcon; focused: boolean }) {
  return (
    <View style={{ width: 56, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? color.action.primary : 'transparent' }}>
      <Glyph size={22} color={focused ? color.text.primary : color.text.muted} strokeWidth={focused ? 2.4 : 2} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: color.text.primary,
        tabBarInactiveTintColor: color.text.muted,
        tabBarLabelPosition: 'below-icon',
        tabBarLabel: ({ focused, children }) => (
          <Text variant="small" style={{ fontFamily: focused ? 'Mukta_600SemiBold' : 'Mukta_400Regular', color: focused ? color.text.primary : color.text.muted }}>{children}</Text>
        ),
        tabBarStyle: { height: 72, paddingTop: 8, paddingBottom: 8, backgroundColor: color.bg.card, borderTopColor: color.border.subtle },
        tabBarIconStyle: { width: 56, height: 32 },
        tabBarIcon: ({ focused }) => <TabIcon icon={TAB_ICON[route.name] ?? PawPrint} focused={focused} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="find-cover" options={{ title: 'Find cover' }} />
      <Tabs.Screen name="friends" options={{ title: 'Friends' }} />
      <Tabs.Screen name="pet" options={{ title: 'Pet' }} />
      <Tabs.Screen name="me" options={{ title: 'Me' }} />
    </Tabs>
  );
}
