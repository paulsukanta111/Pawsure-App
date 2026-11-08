// Navigation frozen in PS-108: Today · Find cover · Friends · Pet · Me.
// Styled after the app mockups: cream bar, bold label on the selected tab, and the primary
// action (Find cover) in a yellow circle when open, like the mockup's "+" button.
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { color, Icon, radius, Text, type IconName } from '../../design';

const TAB_ICON: Record<string, IconName> = { index: 'home', 'find-cover': 'findCover', friends: 'friends', pet: 'paw', me: 'profile' };

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
        tabBarStyle: { height: 76, paddingTop: 8, paddingBottom: 10, backgroundColor: color.bg.card, borderTopColor: color.border.subtle },
        tabBarIconStyle: { width: 44, height: 40 },
        tabBarIcon: ({ focused }) =>
          route.name === 'find-cover' ? (
            // Sits inside the bar (no overhang over the screen), icon optically centred.
            // Yellow circle only while Find cover is the open tab; otherwise a plain outline like the rest.
            <View style={{
              width: 40, height: 40, borderRadius: radius.pill, backgroundColor: focused ? color.action.primary : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="findCover" size={focused ? 24 : 26} tint={focused ? color.text.primary : color.text.muted} filled={focused} accent={false} />
            </View>
          ) : (
            // Selected tab = filled Pawsure icon; others are plain outlines.
            <Icon name={TAB_ICON[route.name] ?? 'paw'} size={26} tint={focused ? color.text.primary : color.text.muted} filled={focused} accent={focused} />
          ),
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
