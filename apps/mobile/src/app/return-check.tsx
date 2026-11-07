// O12 Return check: five taps, about 10 seconds (PS-033, C3).
import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Chip, ProgressDots, Screen, space, Text } from '../design';
import { pet } from '../demo/data';

const QUESTIONS: { key: string; q: string; options: string[] }[] = [
  { key: 'food', q: 'Food bowl', options: ['Empty', 'Untouched'] },
  { key: 'water', q: 'Water', options: ['Down', 'Same, dry'] },
  { key: 'pad', q: 'Toilet pad', options: ['Changed', 'Old'] },
  { key: 'state', q: pet.name, options: ['Normal', 'Very hungry or thirsty', 'Damage or problem'] },
];

export default function ReturnCheck() {
  const [a, setA] = useState<Record<string, string>>({});
  const answered = QUESTIONS.filter((q) => a[q.key]).length;
  return (
    <Screen title="Welcome back" subtitle="What do you see now you're home?">
      <ProgressDots count={QUESTIONS.length} index={Math.min(answered, QUESTIONS.length - 1)} />
      {QUESTIONS.map((q) => (
        <View key={q.key} style={{ gap: space.sm }}>
          <Text variant="subheading">{q.q}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {q.options.map((o) => <Chip key={o} label={o} selected={a[q.key] === o} onPress={() => setA((p) => ({ ...p, [q.key]: o }))} />)}
          </View>
        </View>
      ))}
      <Text variant="small" tone="muted">One mismatch is treated as a possible error, never misconduct. Your helper sees the reason and can respond.</Text>
      <Button label="Save" disabled={answered < QUESTIONS.length} onPress={() => router.back()} full />
    </Screen>
  );
}
