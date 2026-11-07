// O12 Return check: five taps, about 10 seconds, mainly for tasks that are not Confirmed or Likely (PS-033, C3).
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import type { ReturnCheckAnswer, TaskType } from '@pawsure/domain';
import { Button, Chip, NoticeBanner, ProgressDots, Screen, space, StatusPill, Text } from '../design';
import { useProto } from '../proto/store';

interface Q { key: string; q: string; options: { label: string; answer?: ReturnCheckAnswer }[]; covers: TaskType[] }

export default function ReturnCheck() {
  const { state, dispatch, evaluations } = useProto();
  const QUESTIONS: Q[] = [
    { key: 'food', q: 'Food bowl', covers: ['feeding'], options: [{ label: 'Empty', answer: 'done' }, { label: 'Untouched', answer: 'not_done' }] },
    { key: 'water', q: 'Water', covers: ['water'], options: [{ label: 'Down', answer: 'done' }, { label: 'Same, dry', answer: 'not_done' }] },
    { key: 'pad', q: 'Toilet pad', covers: ['toilet_pad'], options: [{ label: 'Changed', answer: 'done' }, { label: 'Old', answer: 'not_done' }] },
    { key: 'state', q: state.pet.name, covers: [], options: [{ label: 'Normal' }, { label: 'Very hungry or thirsty' }, { label: 'Damage or problem' }] },
  ];
  const [a, setA] = useState<Record<string, string>>({});
  const answered = QUESTIONS.filter((q) => a[q.key]).length;
  const unsure = state.tasks.filter((t) => !t.cancelled && !['confirmed', 'likely'].includes(evaluations[t.id]!.task));

  const save = () => {
    const answers: Record<string, ReturnCheckAnswer> = {};
    for (const q of QUESTIONS) {
      const opt = q.options.find((o) => o.label === a[q.key]);
      if (!opt?.answer) continue;
      for (const t of state.tasks.filter((x) => q.covers.includes(x.type) && !x.cancelled)) answers[t.id] = opt.answer;
    }
    dispatch({ type: 'return_check', answers });
    if (a.state === 'Damage or problem') dispatch({ type: 'incident', category: 'unusual_behaviour', by: 'Neha', note: 'Found on return check' });
    router.back();
  };

  return (
    <Screen title="Welcome back" subtitle="What do you see now you're home?">
      <ProgressDots count={QUESTIONS.length} index={Math.min(answered, QUESTIONS.length - 1)} />
      {unsure.length ? (
        <View style={{ gap: space.xs }}>
          <Text variant="label">Not confirmed yet</Text>
          {unsure.map((t) => (
            <View key={t.id} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              <StatusPill value={evaluations[t.id]!.task} />
              <Text variant="caption">{t.title}</Text>
            </View>
          ))}
        </View>
      ) : <NoticeBanner icon="check" tone="calm" title="Everything already has evidence" body="This check is optional today." />}
      {QUESTIONS.map((q) => (
        <View key={q.key} style={{ gap: space.sm }}>
          <Text variant="subheading">{q.q}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {q.options.map((o) => <Chip key={o.label} label={o.label} selected={a[q.key] === o.label} onPress={() => setA((p) => ({ ...p, [q.key]: o.label }))} />)}
          </View>
        </View>
      ))}
      <Text variant="small" tone="muted">What you see beats helper evidence. One mismatch is treated as a possible error, never misconduct; the helper sees the reason and can respond.</Text>
      <Button label="Save" disabled={answered < QUESTIONS.length} onPress={save} full />
    </Screen>
  );
}
