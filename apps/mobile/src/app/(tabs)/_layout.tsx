// Navigation frozen in PS-108: Today · Find cover · Friends · Pet · Me.
import { Tabs } from 'expo-router/js-tabs';
import { color, Icon, type, type IconName } from '../../design';

const TAB_ICON: Record<string, IconName> = { index: 'home', 'find-cover': 'findCover', friends: 'friends', pet: 'paw', me: 'profile' };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: color.text.primary,
        tabBarInactiveTintColor: color.text.muted,
        tabBarLabelStyle: { fontFamily: type.label.fontFamily, fontSize: 12 },
        // Labels under icons at every width, so the active pill never overlaps the label on tablets.
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: { height: 68, paddingTop: 6, paddingBottom: 8, backgroundColor: color.bg.card, borderTopColor: color.border.subtle },
        // Selected tab = filled Pawsure icon; others are plain outlines.
        tabBarIcon: ({ focused }) => (
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
