/**
 * Prototype-only bar above the app (not part of the product): a dropdown to switch between
 * Neha's app (owner) and Sunita's phone (helper). Both views share one demo state, so a helper
 * check-in shows up on the owner's Today at once.
 */
import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { color, Icon, radius, space, Text } from '../design';
import { useProto } from './store';

type Option = { id: 'owner' | 'helper'; title: string; detail: string; go: () => void };

export function ExperienceBar() {
  const path = usePathname();
  const { state } = useProto();
  const [open, setOpen] = useState(false);
  const current: Option['id'] = path.startsWith('/helper-app') ? 'helper' : 'owner';
  const options: Option[] = [
    { id: 'owner', title: `${state.profile.name || 'Neha'}'s app`, detail: 'Pet owner · the Pawsure app', go: () => router.navigate('/') },
    { id: 'helper', title: `${state.helper.name}'s phone`, detail: 'Helper · WhatsApp (simulated), no app', go: () => router.navigate('/helper-app') },
  ];
  const sel = options.find((o) => o.id === current)!;

  return (
    <View style={st.bar}>
      <Text variant="small" style={st.tag}>PROTOTYPE</Text>
      <Text variant="small" style={{ color: color.text.inverse }}>Viewing</Text>
      <View style={{ flex: 1, maxWidth: 320 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Viewing ${sel.title}. Change view`} accessibilityState={{ expanded: open }}
          onPress={() => setOpen((o) => !o)} style={st.select}>
          <Icon name={current === 'helper' ? 'phone' : 'paw'} size={18} />
          <Text variant="label" style={{ flex: 1 }} numberOfLines={1}>{sel.title}</Text>
          <View style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }}><Icon name="chevronRight" size={16} /></View>
        </Pressable>
        {open ? (
          <View style={st.menu} accessibilityRole="menu">
            {options.map((o) => (
              <Pressable key={o.id} accessibilityRole="menuitem" accessibilityState={{ selected: o.id === current }}
                onPress={() => { setOpen(false); if (o.id !== current) o.go(); }}
                style={({ pressed }) => [st.item, o.id === current && { backgroundColor: color.bg.selected }, pressed && { backgroundColor: color.bg.sunken }]}>
                <Icon name={o.id === 'helper' ? 'phone' : 'paw'} size={20} />
                <View style={{ flex: 1 }}>
                  <Text variant="label">{o.title}</Text>
                  <Text variant="small" tone="muted">{o.detail}</Text>
                </View>
                {o.id === current ? <Icon name="check" size={18} /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm, backgroundColor: color.bg.inverse, zIndex: 10 },
  tag: { color: color.text.inverse, fontFamily: 'Mukta_600SemiBold', letterSpacing: 1, paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.xs, borderWidth: 1, borderColor: color.text.inverse },
  select: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 40, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: color.bg.card },
  menu: { position: 'absolute', top: 46, left: 0, right: 0, minWidth: 260, backgroundColor: color.bg.card, borderRadius: radius.lg, padding: space.xs, borderWidth: 1, borderColor: color.border.subtle,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, minHeight: 56 },
});
