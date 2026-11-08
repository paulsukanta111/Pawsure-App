// W4 Basic phone: registered missed calls on arrival/exit + press-a-number code (PS-025, PS-038).
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, color, Chip, NoticeBanner, radius, Screen, space, Text } from '../design';
import { DemoClock } from '../proto/DemoClock';
import { fmt, useProto } from '../proto/store';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function BasicPhone() {
  const { state, dispatch, evaluations, now, code } = useProto();
  const [registered, setRegistered] = useState(true);
  const [entry, setEntry] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const open = state.tasks.filter((t) => !t.cancelled && ['pending', 'missed', 'not_confirmed'].includes(evaluations[t.id]!.task));
  const [taskId, setTaskId] = useState(open[0]?.id ?? state.tasks[0]!.id);
  const task = state.tasks.find((t) => t.id === taskId)!;
  const add = (line: string) => setLog((l) => [`${fmt(now)} ${line}`, ...l]);

  const call = (type: 'arrival_call' | 'exit_call') => {
    dispatch({ type: 'signal', taskId, signal: { type, fromRegisteredNumber: registered } });
    add(registered
      ? `${type === 'arrival_call' ? 'Arrival' : 'Leaving'} missed call received. The call is cut automatically; it costs nothing.`
      : 'Call from an unknown number. Not counted.');
  };
  const submitCode = () => {
    dispatch({ type: 'signal', taskId, signal: { type: 'ivr_code', code: entry, afterTaskPrompt: true, fromRegisteredNumber: registered } });
    add(`Code ${entry} entered after the prompt "${task.title}, press today's code".`);
    setEntry('');
  };

  return (
    <Screen title="Basic phone" subtitle="No data, no app. Sunita calls a free number and the call is cut.">
      <NoticeBanner icon="phone" title="Simulation of a keypad phone" body="Works without mobile data; delayed or retried calls keep their real time." />
      <DemoClock compact />
      <Text variant="label">Task</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {state.tasks.filter((t) => !t.cancelled).map((t) => <Chip key={t.id} label={`${fmt(t.dueAt)} ${t.title}`} selected={taskId === t.id} onPress={() => setTaskId(t.id)} />)}
      </View>
      <Card>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Chip label="Registered number" selected={registered} onPress={() => setRegistered(true)} />
          <Chip label="Someone else's phone" selected={!registered} onPress={() => setRegistered(false)} />
        </View>
        <Button label="Missed call on arrival" icon="phone" onPress={() => call('arrival_call')} full />
        <Text variant="caption">Today's code on the food-box card: <Text variant="label">{code ?? 'no card'}</Text> (simulated)</Text>
        <View style={st.screen}>
          <Text variant="small" tone="inverse">Voice: "{state.pet.name}, {task.title}. Press today's code."</Text>
          <Text variant="h3" tone="inverse">{entry.padEnd(4, '_')}</Text>
        </View>
        <View style={st.pad}>
          {KEYS.map((k) => k ? (
            <Pressable key={k} accessibilityRole="button" accessibilityLabel={k === '⌫' ? 'Delete' : k} style={({ pressed }) => [st.key, pressed && { backgroundColor: color.bg.selected }]}
              onPress={() => setEntry((e) => (k === '⌫' ? e.slice(0, -1) : e.length < 4 ? e + k : e))}>
              <Text variant="h3">{k}</Text>
            </Pressable>
          ) : <View key="blank" style={st.key} />)}
        </View>
        <Button label="Send code" onPress={submitCode} disabled={entry.length !== 4} full />
        <Button label="Missed call when leaving" icon="phone" kind="secondary" onPress={() => call('exit_call')} full />
      </Card>
      {log.map((l) => <Text key={l} variant="caption" tone="muted">{l}</Text>)}
      <Text variant="small" tone="muted">A code alone is not proof of the whole visit. Calls show someone came; the code after the task prompt is task evidence.</Text>
    </Screen>
  );
}

const st = StyleSheet.create({
  screen: { backgroundColor: color.bg.inverse, borderRadius: radius.md, padding: space.md, gap: space.xs, alignItems: 'center' },
  pad: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  key: { width: '30%', height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.border.subtle, backgroundColor: color.bg.raised },
});
