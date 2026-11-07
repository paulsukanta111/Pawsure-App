// O5 Home / O6 Timeline / O13 Day report: "Who's caring today?" (PS-013 to PS-016, PS-007).
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { computePetDay, evaluateTask, planLadder, type TaskType } from '@pawsure/domain';
import {
  Button, Card, Checkbox, Chip, color, confidenceStyle, IconButton, ListItem, PetChip, Screen, SectionHeader, space,
  StatusPill, Text, visitLabel, type IconName,
} from '../../design';
import { health, helper, owner, pet, tasks, todaysCode } from '../../demo/data';
import { fmtTime } from '../../format';

type Carer = 'helper' | 'trusted';
const LEAVING_CHECKS = ['Water bowl full', 'Balcony and door secured', 'Expected return time set'];
const TASK_ICON: Record<TaskType, IconName> = { feeding: 'food', water: 'water', walk: 'activity', toilet_pad: 'home', medicine: 'medication', other: 'paw' };

function greeting(d: Date) {
  const h = (d.getUTCHours() + 5.5) % 24; // IST
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Today() {
  const [carer, setCarer] = useState<Carer>('helper');
  const [checked, setChecked] = useState<string[]>([]);
  const [left, setLeft] = useState(false);
  const now = useMemo(() => new Date(), []);

  const evaluated = useMemo(
    () => tasks.map((t) => ({ task: t, result: evaluateTask({ dueAt: t.dueAt, now, signals: t.signals, expectedCode: todaysCode, visitTaskTypes: [t.type] }) })),
    [now],
  );
  const day = computePetDay({ mode: 'tracked', date: now, tasks: evaluated.map(({ result }) => ({ cancelled: false, confidence: result.task })) });
  const withEvidence = evaluated.filter(({ result }) => result.task === 'confirmed' || result.task === 'likely').length;
  const next = evaluated.find(({ result }) => result.task === 'pending');

  return (
    <Screen
      header={
        <View style={st.header}>
          <View>
            <Text variant="caption" tone="muted">{greeting(now)},</Text>
            <Text variant="h2">{owner.name}!</Text>
          </View>
          <IconButton name="reminder" label="Notifications" onPress={() => {}} />
        </View>
      }
    >
      <View style={st.row}>
        <PetChip name={pet.name} detail={`${pet.speciesLabel} · ${pet.age}`} species={pet.species} selected onPress={() => {}} />
        <IconButton name="plus" label="Add a pet" onPress={() => {}} />
      </View>

      <Card tone="brand">
        <Text variant="h3">Who's caring today?</Text>
        <View style={st.row}>
          <Chip label={`${helper.name} (helper)`} selected={carer === 'helper'} onPress={() => setCarer('helper')} />
          <Chip label="Trusted helper mode" selected={carer === 'trusted'} onPress={() => setCarer('trusted')} />
        </View>
        {carer === 'trusted' ? (
          <Text variant="caption">No check-ins, alerts or points for {helper.name} today. Tap "Covered" tonight to count the day.</Text>
        ) : (
          <Text variant="caption">
            {withEvidence} of {tasks.length} tasks have evidence.{next ? ` Next: ${next.task.title} at ${fmtTime(next.task.dueAt)}.` : ''}
          </Text>
        )}
        <Button label={`${helper.name} can't come today`} kind="secondary" icon="care" onPress={() => router.push('/find-cover')} />
      </Card>

      {!left ? (
        <Card>
          <Text variant="subheading">Leaving check · 30 seconds</Text>
          {LEAVING_CHECKS.map((c) => (
            <Checkbox key={c} label={c} checked={checked.includes(c)} onChange={(v) => setChecked((p) => (v ? [...p, c] : p.filter((x) => x !== c)))} />
          ))}
          <View style={st.row}>
            <Button label="I'm leaving" onPress={() => setLeft(true)} />
            <Button label="Skip" kind="outlined" onPress={() => setLeft(true)} />
          </View>
        </Card>
      ) : null}

      <SectionHeader title="Today's care" />
      {evaluated.map(({ task, result }) => {
        const ladder = planLadder(task.id, task.type, task.dueAt);
        const visit = visitLabel[result.visit];
        const meta =
          result.task === 'pending'
            ? `If nothing arrives, you're alerted at ${fmtTime(ladder[0]!.at)}`
            : [confidenceStyle[result.task].explain, visit, result.late ? 'Late' : ''].filter(Boolean).join(' · ');
        return (
          <ListItem
            key={task.id}
            icon={TASK_ICON[task.type]}
            title={task.title}
            subtitle={`${fmtTime(task.dueAt)} · ${helper.name}`}
            meta={meta}
            metaTone={result.task === 'missed' || result.task === 'not_confirmed' ? 'alert' : 'muted'}
            right={<StatusPill value={result.task} />}
          />
        );
      })}

      <SectionHeader title="Upcoming health" action="See all" onAction={() => router.push('/pet')} />
      {health.slice(0, 2).map((h) => (
        <ListItem
          key={h.id}
          icon={h.icon}
          title={h.title}
          subtitle={h.subtitle}
          meta={h.dueInDays === 0 ? 'Today' : `Due in ${h.dueInDays} days`}
          metaTone={h.dueInDays <= 7 ? 'alert' : 'muted'}
          onPress={() => router.push('/pet')}
        />
      ))}

      <Card tone={day.outcome === 'covered' ? 'calm' : 'plain'}>
        <Text variant="subheading">{day.outcome === 'covered' ? 'Covered care day' : 'Not covered yet'}</Text>
        <Text variant="caption" tone="muted">
          A day counts when every task is Confirmed, Likely or checked by you on return, or a missed task was handled through alerts.
        </Text>
        <Button label="10-second return check" kind="outlined" onPress={() => router.push('/return-check')} />
      </Card>
      <Text variant="small" tone="muted" align="center" style={{ color: color.text.muted, marginTop: space.sm }}>
        Rule {day.ruleVersion} · confidence rules {evaluated[0]?.result.ruleVersion}
      </Text>
    </Screen>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
});
