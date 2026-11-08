/** Demo clock bar: move time forward so missed check-ins and alerts happen on cue. */
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { color, Icon, radius, space, Text } from '../design';
import { today } from '../demo/data';
import { fmt, useProto } from './store';

const JUMPS: { label: string; h: number; m: number }[] = [
  { label: '8:30', h: 8, m: 30 },
  { label: '1:30', h: 13, m: 30 },
  { label: '3:45', h: 15, m: 45 },
  { label: '4:45', h: 16, m: 45 },
  { label: '5:15', h: 17, m: 15 },
  { label: '5:30', h: 17, m: 30 },
  { label: '7:30', h: 19, m: 30 },
];

export function DemoClock({ compact }: { compact?: boolean }) {
  const { now, state, dispatch } = useProto();
  return (
    <View style={s.bar} accessibilityLabel={`Demo clock ${fmt(now)}`}>
      <Icon name="clock" size={18} />
      <Text variant="label">Demo time {fmt(now)}</Text>
      <View style={s.row}>
        {JUMPS.map((j) => {
          const on = state.demoTime?.getTime() === today(j.h, j.m).getTime();
          return (
            <Pressable key={j.label} accessibilityRole="button" accessibilityLabel={`Jump to ${j.label} ${j.h < 12 ? 'am' : 'pm'}`} onPress={() => dispatch({ type: 'set_clock', at: today(j.h, j.m) })} style={[s.chip, on && s.on]}>
              <Text variant="small" style={{ fontFamily: 'Mukta_600SemiBold' }}>{j.label}</Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" accessibilityLabel="Add 15 minutes" onPress={() => dispatch({ type: 'advance', minutes: 15 })} style={s.chip}>
          <Text variant="small" style={{ fontFamily: 'Mukta_600SemiBold' }}>+15m</Text>
        </Pressable>
        {!compact ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/prototype')} style={s.chip}>
            <Text variant="small" style={{ fontFamily: 'Mukta_600SemiBold' }}>All screens</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm, padding: space.sm, paddingHorizontal: space.md, borderRadius: radius.lg, backgroundColor: color.bg.raised, borderWidth: 1, borderStyle: 'dashed', borderColor: color.border.control },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, width: '100%' },
  chip: { minHeight: 32, minWidth: 40, paddingHorizontal: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: color.border.control, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg.card },
  on: { backgroundColor: color.action.primary, borderColor: color.border.strong },
});
