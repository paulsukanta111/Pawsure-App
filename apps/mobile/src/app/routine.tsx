// O3 Routine: tasks, due times, instructions, alone-window warning (PS-010, PS-011, PS-012).
import { useState } from 'react';
import { View } from 'react-native';
import { longestAloneWindow, type TaskType } from '@pawsure/domain';
import { Button, Card, Chip, ListItem, NoticeBanner, Screen, SectionHeader, space, Text, TextField } from '../design';
import { today } from '../demo/data';
import { TASK_ICON, TASK_LABEL } from '../proto/labels';
import { fmt, useProto } from '../proto/store';

const TYPES: TaskType[] = ['feeding', 'water', 'walk', 'toilet_pad', 'medicine', 'other'];
const HOURS = [8, 10, 12, 13, 15, 16, 17, 18, 20];

export default function Routine() {
  const { state, dispatch } = useProto();
  const [leave, setLeave] = useState(9);
  const [back, setBack] = useState(19);
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<TaskType>('water');
  const [hour, setHour] = useState(15);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');

  const active = state.tasks.filter((t) => !t.cancelled);
  const visitTimes = [...new Set(active.map((t) => t.dueAt.getTime()))].map((ms) => new Date(ms));
  const alone = back > leave ? longestAloneWindow(today(leave), today(back), visitTimes) : null;

  const save = () => {
    dispatch({ type: 'add_task', task: { title: title.trim() || TASK_LABEL[type], type, dueAt: today(hour), instructions: instructions.trim() || undefined } });
    setAdding(false); setTitle(''); setInstructions('');
  };

  return (
    <Screen title="Routine" subtitle={`${state.pet.name}'s daily tasks. Changes apply from today; past tasks keep their history.`}>
      <Card>
        <Text variant="subheading">When you're out</Text>
        <Text variant="label">Leave</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {[7, 8, 9, 10].map((h) => <Chip key={h} label={fmt(today(h))} selected={leave === h} onPress={() => setLeave(h)} />)}
        </View>
        <Text variant="label">Back</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {[17, 18, 19, 20, 21].map((h) => <Chip key={h} label={fmt(today(h))} selected={back === h} onPress={() => setBack(h)} />)}
        </View>
        {alone ? (
          <NoticeBanner
            icon={alone.exceeds ? 'alert' : 'check'}
            tone={alone.exceeds ? 'alert' : 'calm'}
            title={`Longest time alone: ${Math.floor(alone.longestMinutes / 60)} h ${alone.longestMinutes % 60 ? `${alone.longestMinutes % 60} min` : ''}`.trim()}
            body={`${fmt(alone.from)} to ${fmt(alone.to)}.${alone.exceeds ? ' Consider adding a visit in that stretch.' : ''} Ask your vet what suits ${state.pet.name}.`}
          />
        ) : null}
      </Card>

      <SectionHeader title="Tasks" />
      {state.tasks.map((t) => (
        <ListItem key={t.id} icon={TASK_ICON[t.type]} title={t.title} subtitle={`${fmt(t.dueAt)} daily${t.cancelled ? ' · cancelled today' : ''}`}
          meta={t.instructions} onPress={() => {}} />
      ))}

      {adding ? (
        <Card>
          <Text variant="subheading">New task</Text>
          <Text variant="label">Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {TYPES.map((t) => <Chip key={t} icon={TASK_ICON[t]} label={TASK_LABEL[t]} selected={type === t} onPress={() => setType(t)} />)}
          </View>
          <Text variant="label">Time</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {HOURS.map((h) => <Chip key={h} label={fmt(today(h))} selected={hour === h} onPress={() => setHour(h)} />)}
          </View>
          <TextField label="Name (optional)" placeholder={TASK_LABEL[type]} value={title} onChangeText={setTitle} />
          <TextField label="Instructions for the helper" placeholder="What exactly to do" value={instructions} onChangeText={setInstructions} multiline />
          {type === 'medicine' ? <Text variant="small" tone="muted">Medicine alerts are tighter: you're told 15 minutes after the due time. Only friends who opted into medicines can cover it.</Text> : null}
          <Button label="Add task" onPress={save} full />
          <Button label="Cancel" kind="outlined" onPress={() => setAdding(false)} full />
        </Card>
      ) : (
        <Button label="Add a task" icon="plus" kind="secondary" onPress={() => setAdding(true)} full />
      )}
    </Screen>
  );
}
