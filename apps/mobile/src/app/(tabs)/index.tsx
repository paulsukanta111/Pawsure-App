// O5 Home / O6 Timeline / O13 Day report summary (PS-007, PS-013 to PS-016, PS-031).
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  Button, Card, CharacterAvatar, Checkbox, Chip, color, confidenceStyle, EmptyState, Icon, IconButton, ListItem, NoticeBanner, PetChip, radius, Screen,
  SectionHeader, space, StatusPill, Text, visitLabel,
} from '../../design';
import { CONSENT_TEXT } from '../../proto/HelperInvite';
import { TASK_ICON } from '../../proto/labels';
import { fmt, useProto } from '../../proto/store';

const LEAVING_CHECKS = ['Water bowl full', 'Balcony and door secured', 'Expected return time set'];

function greeting(d: Date) {
  const h = (d.getUTCHours() + 5.5) % 24;
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Today() {
  const { now, state, dispatch, evaluations, activeTasks, alerts, day } = useProto();
  const [checked, setChecked] = useState<string[]>([]);
  const [left, setLeft] = useState(false);
  const [petIdx, setPetIdx] = useState(0);
  const { helper, pet } = state;
  const trusted = helper.mode === 'trusted';
  const openAlerts = alerts.filter((a) => !a.acknowledged);
  const withEvidence = activeTasks.filter((t) => ['confirmed', 'likely'].includes(evaluations[t.id]!.task)).length;
  const next = activeTasks.find((t) => evaluations[t.id]!.task === 'pending');
  const carer = state.friendSearch?.state === 'confirmed' ? 'friend' : helper.unavailableToday ? 'none' : 'helper';

  return (
    <Screen
      header={
        <View style={st.header}>
          <View>
            <Text variant="caption" tone="muted">{greeting(now)},</Text>
            <Text variant="h2">{state.profile.name}! 👋</Text>
          </View>
          <View style={st.row}>
            <View>
              <IconButton name="reminder" label={`Alerts, ${openAlerts.length} new`} onPress={() => router.push('/notifications')} />
              {openAlerts.length ? <View style={st.badge}><Text variant="small" tone="inverse">{openAlerts.length}</Text></View> : null}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Your profile" onPress={() => router.navigate('/me')}>
              <CharacterAvatar name="avatarToby" size={48} />
            </Pressable>
          </View>
        </View>
      }
    >

      {openAlerts.slice(0, 2).map((a) => (
        <Pressable key={a.id} accessibilityRole="button" onPress={() => router.push(a.taskId ? `/missed/${a.taskId}` : '/emergency')}>
          <Card tone="alert">
            <View style={st.row}>
              <Icon name="alert" tint={color.text.alert} />
              <Text variant="bodyStrong" style={{ flex: 1 }}>{a.title}</Text>
              <Text variant="small" tone="muted">{fmt(a.at)}</Text>
            </View>
            <Text variant="caption">{a.body}</Text>
            <View style={st.row}>
              <Button label="I'm on it" onPress={() => (a.taskId ? dispatch({ type: 'ack', taskId: a.taskId }) : dispatch({ type: 'incident_ack', id: a.incidentId! }))} />
              <Button label="Details" kind="outlined" onPress={() => router.push(a.taskId ? `/missed/${a.taskId}` : '/emergency')} />
            </View>
          </Card>
        </Pressable>
      ))}

      <View style={st.row}>
        <PetChip name={pet.name} detail={`${pet.speciesLabel} · ${pet.age}`} species={pet.species} selected={petIdx === 0} onPress={() => setPetIdx(0)} />
        {state.extraPets.map((p, i) => <PetChip key={p.name} name={p.name} detail={p.species === 'cat' ? 'Cat' : 'Dog'} species={p.species} selected={petIdx === i + 1} onPress={() => setPetIdx(i + 1)} />)}
        <IconButton name="plus" label="Add a pet" onPress={() => router.push('/add-pet')} />
      </View>

      {petIdx > 0 ? (
        <EmptyState art="nothing-to-track" title={`No routine for ${state.extraPets[petIdx - 1]!.name} yet`} body="Add feeding, walks or medicine and your helper gets a prompt for each." action="Add a task" onAction={() => router.push('/routine')} />
      ) : null}

      {petIdx === 0 && helper.mode === 'tracked' && helper.consent !== 'given' ? (
        <NoticeBanner icon="community" tone={helper.consent === 'declined' || helper.consent === 'withdrawn' ? 'alert' : 'brand'}
          title={CONSENT_TEXT[helper.consent].title} body={CONSENT_TEXT[helper.consent].body} />
      ) : null}
      {petIdx === 0 && helper.mode === 'tracked' && helper.consent !== 'given' ? (
        <Button label={helper.consent === 'not_invited' ? `Invite ${helper.name}` : `${helper.name}: invite and consent`} kind="secondary" icon="community" onPress={() => router.push('/helper-invite')} full />
      ) : null}

      {petIdx === 0 ? (<>
      <Card tone="brand">
        <Text variant="h3">Who's caring today?</Text>
        <View style={st.row}>
          <Chip label={`${helper.name} (helper)`} selected={carer === 'helper' && !trusted} onPress={() => dispatch({ type: 'helper', patch: { mode: 'tracked', unavailableToday: false } })} />
          <Chip label="Trusted helper mode" selected={trusted} onPress={() => dispatch({ type: 'helper', patch: { mode: 'trusted', unavailableToday: false } })} />
          {carer === 'friend' ? <Chip label="Friend cover" selected /> : null}
        </View>
        {helper.unavailableToday && carer !== 'friend' ? (
          <NoticeBanner icon="care" title={`${helper.name} can't come today`} body="Your original plan is kept for the record. Find cover so the tasks are still done." tone="alert" />
        ) : trusted ? (
          <Text variant="caption">No check-ins, alerts or points for {helper.name}. Tap "Covered" tonight to count the day.</Text>
        ) : (
          <Text variant="caption">
            {withEvidence} of {activeTasks.length} tasks have evidence.{next ? ` Next: ${next.title} at ${fmt(next.dueAt)}.` : ''}
          </Text>
        )}
        {helper.unavailableToday ? (
          <Button label="Find cover" icon="care" onPress={() => router.push('/find-cover')} />
        ) : (
          <Button label={`${helper.name} can't come today`} kind="secondary" icon="care" onPress={() => { dispatch({ type: 'helper', patch: { unavailableToday: true } }); router.push('/find-cover'); }} />
        )}
      </Card>

      {!left ? (
        <Card>
          <Text variant="subheading">Leaving check · 30 seconds</Text>
          {LEAVING_CHECKS.map((c) => (
            <Checkbox key={c} label={c} checked={checked.includes(c)} onChange={(v) => setChecked((p) => (v ? [...p, c] : p.filter((x) => x !== c)))} />
          ))}
          <Text variant="small" tone="muted">This is a reminder list, not a safety guarantee.</Text>
          <View style={st.row}>
            <Button label="I'm leaving" onPress={() => setLeft(true)} />
            <Button label="Skip" kind="outlined" onPress={() => setLeft(true)} />
          </View>
        </Card>
      ) : null}

      <SectionHeader title="Today's care" action="Routine" onAction={() => router.push('/routine')} />
      {state.tasks.map((t) => {
        const ev = evaluations[t.id]!;
        const visit = visitLabel[ev.visit];
        const meta = t.cancelled
          ? `Cancelled: ${t.cancelReason}`
          : trusted
            ? 'Trusted helper mode: no check-in expected'
            : ev.task === 'pending'
              ? `Due ${fmt(t.dueAt)}. If nothing arrives you're alerted at ${fmt(new Date(t.dueAt.getTime() + (t.type === 'medicine' ? 15 : t.type === 'walk' ? 45 : 30) * 60_000))}.`
              : [confidenceStyle[ev.task].explain, visit, ev.late ? 'Late' : ''].filter(Boolean).join(' · ');
        return (
          <ListItem
            key={t.id}
            icon={TASK_ICON[t.type]}
            title={t.title}
            subtitle={`${fmt(t.dueAt)} · ${carer === 'friend' ? 'Friend cover' : helper.name}`}
            meta={meta}
            metaTone={!trusted && !t.cancelled && (ev.task === 'missed' || ev.task === 'not_confirmed') ? 'alert' : 'muted'}
            right={trusted || t.cancelled ? undefined : <StatusPill value={ev.task} />}
            onPress={() => router.push(`/task/${t.id}`)}
          />
        );
      })}

      <SectionHeader title="Upcoming care" action="See all" onAction={() => router.push('/health')} />
      {state.health.filter((h) => !h.done).slice(0, 3).map((h, i) => {
        const days = Math.round((h.dueOn.getTime() - now.getTime()) / 86_400_000);
        return (
          <ListItem key={h.id} icon={h.kind === 'vaccine' ? 'vaccine' : h.kind === 'deworming' ? 'medication' : 'calendar'} title={h.title} subtitle={h.detail}
            meta={days <= 0 ? 'Today' : `Due in ${days} days`} metaTone={days <= 7 ? 'alert' : 'muted'} accent={i === 0} onPress={() => router.push('/health')} />
        );
      })}

      </>) : null}

      {petIdx === 0 ? (
      <Card tone={day.outcome === 'covered' ? 'calm' : 'plain'}>
        <Text variant="subheading">
          {day.outcome === 'covered' ? 'Covered care day' : day.outcome === 'unknown' ? 'Not marked yet' : 'Not covered yet'}
        </Text>
        {trusted ? (
          <>
            <Text variant="caption" tone="muted">In Trusted helper mode a day counts only when you mark it covered.</Text>
            <View style={st.row}>
              <Button label="Covered" onPress={() => dispatch({ type: 'patch', patch: { trustedCovered: true } })} />
              <Button label="Not covered" kind="outlined" onPress={() => dispatch({ type: 'patch', patch: { trustedCovered: false } })} />
            </View>
          </>
        ) : (
          <>
            <Text variant="caption" tone="muted">A day counts when every task is Confirmed, Likely or checked by you on return, or a missed task was handled through alerts.</Text>
            <View style={st.row}>
              <Button label="Return check" kind="secondary" onPress={() => router.push('/return-check')} />
              <Button label="Day report" kind="outlined" onPress={() => router.push('/day-report')} />
            </View>
          </>
        )}
      </Card>
      ) : null}
    </Screen>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  badge: { position: 'absolute', top: 4, right: 4, minWidth: 20, height: 20, borderRadius: radius.pill, backgroundColor: color.status.alert, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
});
