// Navigation frozen in PS-108: Today · Find cover · Friends · Pet · Me.
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { color, Icon, radius, type, type IconName } from '../../design';

const TAB_ICON: Record<string, IconName> = { index: 'home', 'find-cover': 'care', friends: 'friends', pet: 'paw', me: 'profile' };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: color.text.primary,
        tabBarInactiveTintColor: color.text.muted,
        tabBarLabelStyle: { fontFamily: type.label.fontFamily, fontSize: 12 },
        tabBarStyle: { height: 68, paddingTop: 6, paddingBottom: 8, backgroundColor: color.bg.card, borderTopColor: color.border.subtle },
        tabBarIcon: ({ focused }) => (
          <View style={{ paddingHorizontal: 14, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: focused ? color.action.primary : 'transparent' }}>
            <Icon name={TAB_ICON[route.name] ?? 'paw'} size={22} tint={focused ? color.text.onAction : color.text.muted} />
          </View>
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
