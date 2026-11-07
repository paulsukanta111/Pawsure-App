// PS-024 / PS-109 Food-box code card: one random code per day; new card monthly or after suspected copying.
import { StyleSheet, View } from 'react-native';
import { istDateKey } from '@pawsure/domain';
import { Button, Card, color, NoticeBanner, radius, Screen, space, Text } from '../design';
import { fmt, useProto } from '../proto/store';

export default function CodeCardScreen() {
  const { state, dispatch, now } = useProto();
  const card = [...state.codeCards].reverse().find((c) => !c.revokedAt);
  const todayDay = Number(istDateKey(now).slice(8, 10));
  if (!card) return <Screen title="No card"><Button label="Create card" onPress={() => dispatch({ type: 'rotate_code_card' })} /></Screen>;
  return (
    <Screen title="Food-box code card" subtitle={`${card.month} · keep it inside ${state.pet.name}'s food box`}>
      <NoticeBanner icon="key" title="How it helps" body="The helper includes today's code in the feeding photo. A photo with the code plus a second signal, like the arrival and leaving calls, makes a task Confirmed." />
      <Card>
        <View style={st.grid} accessibilityLabel="Codes for this month">
          {Object.entries(card.codes).map(([d, code]) => {
            const isToday = Number(d) === todayDay;
            return (
              <View key={d} style={[st.cell, isToday && st.today]}>
                <Text variant="small" tone="muted">{d}</Text>
                <Text variant="label">{isToday ? code : '••••'}</Text>
              </View>
            );
          })}
        </View>
        <Text variant="small" tone="muted">Codes are hidden here except today's, and never appear in notification previews. The printed card shows all of them.</Text>
      </Card>
      <Button label="Print or download card" icon="key" onPress={() => {}} full />
      <Button label="I think the card was copied: replace it" kind="outlined" onPress={() => dispatch({ type: 'rotate_code_card' })} full />
      {state.codeCards.filter((c) => c.revokedAt).length ? (
        <Text variant="small" tone="muted">Previous card replaced at {fmt(state.codeCards.find((c) => c.revokedAt)!.revokedAt!)}; its codes no longer count.</Text>
      ) : null}
    </Screen>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  cell: { width: 52, height: 48, borderRadius: radius.sm, borderWidth: 1, borderColor: color.border.subtle, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg.raised },
  today: { backgroundColor: color.action.primary, borderColor: color.border.strong, borderWidth: 1.5 },
});
