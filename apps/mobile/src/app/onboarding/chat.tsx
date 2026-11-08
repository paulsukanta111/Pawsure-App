// v3 conversational onboarding: one chat with Pawsure instead of six forms (PS-002, PS-003,
// PS-004, PS-005, PS-010, PS-020, PS-119). The owner answers in their own words; every answer
// comes back as an editable card and is saved only when confirmed. Privacy consent stays an
// explicit "I agree" (never inferred), and "Use a form instead" keeps the form steps available.
import {
  formatPhone, parseCare, parseOwnerName, parsePeople, parsePet, parseVet, parseYesNo,
  type CareFields, type PeopleFields, type PetFields, type VetFields,
} from '@pawsure/domain';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, Chip, color, Icon, KeyValue, radius, space, Text, TextField, Toggle, type } from '../../design';
import { CONSENT_VERSION } from '../../lib/auth';
import { TASK_ICON } from '../../proto/labels';
import { fmt, useProto, type Lang } from '../../proto/store';

type Step = 'name' | 'lang' | 'privacy' | 'pet' | 'care' | 'vet' | 'routine' | 'people' | 'invite' | 'done';
const STEPS: Step[] = ['name', 'privacy', 'pet', 'care', 'vet', 'routine', 'people', 'done'];
type Field = { key: string; label: string; value: string; keyboard?: 'phone-pad' };
type Card =
  | { type: 'privacy' }
  | { type: 'confirm'; topic: 'pet' | 'care' | 'vet' | 'people'; fields: Field[] }
  | { type: 'routine' }
  | { type: 'invite' }
  | { type: 'done' };
type Msg = { id: number; from: 'pawsure' | 'me'; text?: string; card?: Card; settled?: boolean };

const LANGS: { value: Lang; label: string }[] = [{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिंदी' }, { value: 'mr', label: 'मराठी' }];
const EXAMPLES: Partial<Record<Step, string[]>> = {
  name: ["I'm Neha"],
  pet: ['Bruno, a 4 year old indie dog, 12 kg, allergic to chicken'],
  care: ['1 cup kibble at 1 pm, fresh water. Joint supplement, 1 tablet with lunch.', 'Skip for now'],
  vet: ['Dr Kulkarni, Powai Pet Clinic, 98200 00000', 'Skip for now'],
  routine: ['Looks good'],
  people: ['Helper Sunita 98200 33333, backup Amit 98200 11111'],
  invite: ['Send the invite', 'Later'],
};

let nextId = 1;

export default function OnboardingChat() {
  const { state, dispatch } = useProto();
  const [step, setStep] = useState<Step>('name');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [pet, setPet] = useState<Partial<PetFields>>({});
  const [alerts, setAlerts] = useState({ whatsapp: true, push: true });
  const scroll = useRef<ScrollViewInstance>(null);
  const petName = pet.name ?? state.pet.name;

  // Pawsure "types" briefly before each reply, like a chat assistant.
  const say = (...m: Omit<Msg, 'id'>[]) => {
    setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs((all) => [...all, ...m.map((x) => ({ ...x, id: nextId++ }))]); }, 450);
  };
  const me = (text: string) => setMsgs((all) => [...all, { id: nextId++, from: 'me', text }]);
  // Freeze earlier cards of a topic once answered (or replaced by a corrected one).
  type Topic = Exclude<Card['type'], 'confirm'> | 'pet' | 'care' | 'vet' | 'people';
  const settle = (topic: Topic) => setMsgs((all) => all.map((m) => {
    const c = m.card;
    const hit = !!c && (c.type === 'confirm' ? c.topic === topic : c.type === topic);
    return hit ? { ...m, settled: true } : m;
  }));

  useEffect(() => {
    say({ from: 'pawsure', text: "Hi! I'm Pawsure. I'll set things up with a few questions. Answer in your own words, and I'll show you what I understood before saving anything." },
      { from: 'pawsure', text: 'First, what should I call you?' });
  }, []);

  // ---- confirm cards ----------------------------------------------------
  const petFields = (p: Partial<PetFields>): Field[] => [
    { key: 'name', label: 'Name', value: p.name ?? '' },
    { key: 'species', label: 'Dog or cat', value: p.species === 'cat' ? 'Cat' : p.species === 'dog' ? 'Dog' : '' },
    { key: 'breed', label: 'Breed', value: p.breed ?? '' },
    { key: 'age', label: 'Age', value: p.age ?? '' },
    { key: 'weightKg', label: 'Weight (kg)', value: p.weightKg != null ? String(p.weightKg) : '' },
    { key: 'allergies', label: 'Allergies', value: p.allergies ?? '' },
  ];
  const showPet = (p: Partial<PetFields>) => {
    if (!p.name) return say({ from: 'pawsure', text: "What's your pet's name?" });
    if (!p.species) return say({ from: 'pawsure', text: `Is ${p.name} a dog or a cat?` });
    say({ from: 'pawsure', text: `Here's what I got about ${p.name}. Fix anything that's off.`, card: { type: 'confirm', topic: 'pet', fields: petFields(p) } });
  };

  const confirm = (topic: 'pet' | 'care' | 'vet' | 'people', fields: Field[]) => {
    const v = Object.fromEntries(fields.map((f) => [f.key, f.value.trim()]));
    settle(topic);
    me('Looks right');
    if (topic === 'pet') {
      const species = /cat/i.test(v.species ?? '') ? 'cat' : 'dog';
      dispatch({ type: 'pet', patch: {
        name: v.name || state.pet.name, species, speciesLabel: species === 'cat' ? 'Cat' : 'Dog', breed: v.breed || '', age: v.age || '',
        weightKg: Number(v.weightKg) || state.pet.weightKg, allergies: v.allergies || 'None known',
      } });
      setStep('care');
      say({ from: 'pawsure', text: `Saved. What does ${v.name} eat, and does ${species === 'cat' ? 'she' : 'he'} take any medicines?` });
    } else if (topic === 'care') {
      dispatch({ type: 'pet', patch: { food: v.food || '', medicines: v.medicines || 'None', ...(v.allergies ? { allergies: v.allergies } : {}) } });
      setStep('vet');
      say({ from: 'pawsure', text: "Got it. Who's your vet? A name and phone number is enough, so the emergency card can call them." });
    } else if (topic === 'vet') {
      dispatch({ type: 'pet', patch: { vet: { name: v.name || '', phone: formatPhone(v.phone ?? '') ?? v.phone ?? '' } } });
      toRoutine();
    } else {
      if (v.helperName) dispatch({ type: 'helper', patch: { name: v.helperName, phone: formatPhone(v.helperPhone ?? '') ?? v.helperPhone ?? '' } });
      if (v.backupName) dispatch({ type: 'patch', patch: { backup: { name: v.backupName, phone: formatPhone(v.backupPhone ?? '') ?? v.backupPhone ?? '' } } });
      if (v.coName && v.coPhone) dispatch({ type: 'invite_co_owner', name: v.coName, phone: formatPhone(v.coPhone) ?? v.coPhone });
      const helper = v.helperName || state.helper.name;
      setStep('invite');
      say({ from: 'pawsure', text: `Shall I invite ${helper} on WhatsApp? She picks her language and how to check in. Nothing is recorded until she says yes.`, card: { type: 'invite' } });
    }
  };

  const toRoutine = () => {
    setStep('routine');
    say({ from: 'pawsure', text: `I've drafted a daily routine for ${petName}. Each task gets a check-in prompt for your helper, and an alert for you if nothing arrives.`, card: { type: 'routine' } });
  };
  const toPeople = () => {
    settle('routine');
    setStep('people');
    say({ from: 'pawsure', text: `Who looks after ${petName} when you're out? Tell me your helper and a backup, with their numbers. A co-owner too, if you like.` });
  };
  const agree = () => {
    settle('privacy');
    me('I agree');
    setStep('pet');
    say({ from: 'pawsure', text: 'Thank you. Now tell me about your pet: name, dog or cat, age, and anything else you think matters.' });
  };
  const invite = (send: boolean) => {
    settle('invite');
    me(send ? 'Send the invite' : 'Later');
    if (send) dispatch({ type: 'helper', patch: { consent: 'pending', mode: 'tracked' } });
    setStep('done');
    say({ from: 'pawsure', text: send ? `Done. ${state.helper.name}'s invite is ready (simulated, no message sent).` : 'No problem, you can invite her any time from Me.',
      card: { type: 'done' } });
  };

  // ---- typed answers ----------------------------------------------------
  const submit = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    setInput('');
    me(text);
    const yn = parseYesNo(text);
    const skip = /^skip/i.test(text);
    switch (step) {
      case 'name': {
        const name = parseOwnerName(text);
        if (!name) return say({ from: 'pawsure', text: "Sorry, I didn't catch your name. What should I call you?" });
        dispatch({ type: 'profile', patch: { name } });
        setStep('lang');
        return say({ from: 'pawsure', text: `Nice to meet you, ${name}! Which language would you like? Helper and friend messages can be in Hindi or Marathi either way.` });
      }
      case 'lang': {
        const lang = LANGS.find((l) => l.label.toLowerCase() === text.toLowerCase() || l.value === text.toLowerCase().slice(0, 2))?.value
          ?? (/hindi/i.test(text) ? 'hi' : /marathi/i.test(text) ? 'mr' : 'en');
        dispatch({ type: 'profile', patch: { language: lang } });
        setStep('privacy');
        return say({ from: 'pawsure', text: 'Before we go on, here is what Pawsure collects and why. Please read it and agree if you are happy.', card: { type: 'privacy' } });
      }
      case 'privacy':
        if (yn === 'yes') return agree();
        return say({ from: 'pawsure', text: 'I need your agreement to the privacy notice to continue. You can withdraw it any time from Me → Privacy.' });
      case 'pet': {
        // Merge, so "she's a cat" or "actually 5 years" corrects what we already have.
        const r = parsePet(text);
        if (!r.fields.species && /^(dog|cat)$/i.test(text)) r.fields.species = text.toLowerCase() as 'dog' | 'cat';
        const merged = { ...pet, ...r.fields };
        if (pet.name && r.fields.name && !r.fields.species && !/name/i.test(text)) merged.name = pet.name;
        setPet(merged);
        settle('pet');
        return showPet(merged);
      }
      case 'care': {
        if (skip) { dispatch({ type: 'pet', patch: { food: '', medicines: '' } }); setStep('vet'); return say({ from: 'pawsure', text: "Okay, you can add food and medicines later. Who's your vet? A name and phone number is enough." }); }
        const r = parseCare(text);
        settle('care');
        return say({ from: 'pawsure', text: "Here's the care I'll show your helper and friends:", card: { type: 'confirm', topic: 'care', fields: [
          { key: 'food', label: 'Food', value: r.fields.food ?? '' },
          { key: 'medicines', label: 'Medicines', value: r.fields.medicines ?? '' },
          { key: 'allergies', label: 'Allergies', value: r.fields.allergies ?? state.pet.allergies ?? '' },
        ] } });
      }
      case 'vet': {
        if (skip) return toRoutine();
        const r = parseVet(text);
        settle('vet');
        return say({ from: 'pawsure', text: r.fields.phone ? 'Your vet:' : "I didn't see a phone number. Add it below if you have it:", card: { type: 'confirm', topic: 'vet', fields: [
          { key: 'name', label: 'Vet or clinic', value: r.fields.name ?? '' },
          { key: 'phone', label: 'Phone', value: r.fields.phone ?? '', keyboard: 'phone-pad' },
        ] } });
      }
      case 'routine':
        if (yn === 'yes') return toPeople();
        return say({ from: 'pawsure', text: 'You can change times and instructions with "Edit routine", or say "looks good" to keep it.' });
      case 'people': {
        const r = parsePeople(text);
        if (!r.fields.helper && !r.fields.backup) return say({ from: 'pawsure', text: 'Who are they? A name and a mobile number for each, e.g. "Helper Sunita 98200 33333, backup Amit 98200 11111".' });
        settle('people');
        const p = r.fields as Partial<PeopleFields>;
        return say({ from: 'pawsure', text: `Here's your care circle for ${petName}:`, card: { type: 'confirm', topic: 'people', fields: [
          { key: 'helperName', label: 'Helper', value: p.helper?.name ?? '' },
          { key: 'helperPhone', label: "Helper's number", value: p.helper?.phone ?? '', keyboard: 'phone-pad' },
          { key: 'backupName', label: 'Backup', value: p.backup?.name ?? '' },
          { key: 'backupPhone', label: "Backup's number", value: p.backup?.phone ?? '', keyboard: 'phone-pad' },
          ...(p.coOwner ? [{ key: 'coName', label: 'Co-owner', value: p.coOwner.name }, { key: 'coPhone', label: "Co-owner's number", value: p.coOwner.phone ?? '', keyboard: 'phone-pad' as const }] : []),
        ] } });
      }
      case 'invite':
        if (yn === 'yes' || /send|invite/i.test(text)) return invite(true);
        if (yn === 'no') return invite(false);
        return say({ from: 'pawsure', text: 'Shall I send the invite? Say "send" or "later".' });
      default:
        return say({ from: 'pawsure', text: 'All set! Tap "Go to my Today" when you are ready.' });
    }
  };

  const finish = () => { dispatch({ type: 'finish_onboarding' }); router.replace('/'); };
  const progress = Math.max(0, STEPS.indexOf(step === 'lang' ? 'name' : step === 'invite' ? 'people' : step)) / (STEPS.length - 1);
  const chips = step === 'lang' ? LANGS.map((l) => l.label) : step === 'pet' && pet.name && !pet.species ? ['Dog', 'Cat'] : EXAMPLES[step] ?? [];

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <View style={st.head}>
        <Avatar label="P" tone="yellow" size={36} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">Set up with Pawsure</Text>
          <View style={st.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
            <View style={[st.fill, { width: `${Math.max(6, Math.round(progress * 100))}%` }]} />
          </View>
        </View>
        <Pressable accessibilityRole="link" onPress={() => router.push('/onboarding/profile')} hitSlop={8}>
          <Text variant="label" style={{ color: color.text.link }}>Use a form</Text>
        </Pressable>
      </View>

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={st.body} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled">
        {msgs.map((m) => (m.from === 'me' ? (
          <View key={m.id} style={st.mine}><Text variant="body">{m.text}</Text></View>
        ) : (
          <View key={m.id} style={st.theirs}>
            <Avatar label="P" tone="yellow" size={28} />
            <View style={{ flex: 1, gap: space.md }}>
              {m.text ? <Text variant="body">{m.text}</Text> : null}
              {m.card ? (
                <ChatCard card={m.card} settled={!!m.settled} petName={petName} alerts={alerts} setAlerts={setAlerts}
                  onAgree={agree} onConfirm={confirm} onRoutineOk={() => { me('Looks good'); toPeople(); }} onInvite={invite} onFinish={finish} />
              ) : null}
            </View>
          </View>
        )))}
        {typing ? (
          <View style={st.theirs} accessibilityLabel="Pawsure is typing">
            <Avatar label="P" tone="yellow" size={28} />
            <View style={st.dots}>{[0, 1, 2].map((i) => <View key={i} style={[st.dot, { opacity: 0.35 + i * 0.25 }]} />)}</View>
          </View>
        ) : null}
      </ScrollView>

      <View style={st.foot}>
        {chips.length && !typing ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }} keyboardShouldPersistTaps="handled">
            {chips.map((c) => <Chip key={c} label={c} onPress={() => submit(c)} />)}
          </ScrollView>
        ) : null}
        <View style={st.composer}>
          <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => submit(input)} placeholder={step === 'done' ? 'Anything else?' : 'Type your answer…'}
            placeholderTextColor={color.text.muted} accessibilityLabel="Your answer" style={[type.body, st.input]} returnKeyType="send" />
          <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={!input.trim() || typing} onPress={() => submit(input)}
            style={[st.send, (!input.trim() || typing) && { opacity: 0.4 }]}>
            <Icon name="arrowUp" size={20} accent={false} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Cards inside Pawsure's messages.

function ChatCard({ card, settled, petName, alerts, setAlerts, onAgree, onConfirm, onRoutineOk, onInvite, onFinish }: {
  card: Card; settled: boolean; petName: string; alerts: { whatsapp: boolean; push: boolean }; setAlerts: (a: { whatsapp: boolean; push: boolean }) => void;
  onAgree: () => void; onConfirm: (topic: 'pet' | 'care' | 'vet' | 'people', fields: Field[]) => void; onRoutineOk: () => void; onInvite: (send: boolean) => void; onFinish: () => void;
}) {
  const { state } = useProto();
  const [fields, setFields] = useState<Field[]>(card.type === 'confirm' ? card.fields : []);
  const [editing, setEditing] = useState(false);
  const [more, setMore] = useState(false);

  if (card.type === 'privacy') {
    return (
      <View style={[st.card, { backgroundColor: color.bg.sky }]}>
        <Text variant="label">What we collect and why</Text>
        <Text variant="caption">• Pet profile, routine and health dates: to run daily care.</Text>
        <Text variant="caption">• Helper check-in photos and voice notes: as evidence. Never faces.</Text>
        <Text variant="caption">• Society and tower: so nearby friends can help. Never your flat number in public.</Text>
        <Text variant="caption">• Call and message times: for evidence and security.</Text>
        {more ? (
          <View style={{ gap: 2 }}>
            <KeyValue k="Photos and voice notes" v="90 days" />
            <KeyValue k="Call and message records" v="12 months" />
            <KeyValue k="Incident records" v="3 years" />
            <KeyValue k="Live location in a visit" v="24 hours" />
            <Text variant="small" tone="muted">Proposed periods, pending legal review. Notice {CONSENT_VERSION}.</Text>
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setMore(true)}><Text variant="label" style={{ color: color.text.link }}>How long we keep it</Text></Pressable>
        )}
        <Toggle label="Alerts on WhatsApp" value={alerts.whatsapp} onChange={(v) => setAlerts({ ...alerts, whatsapp: v })} />
        <Toggle label="Push notifications" value={alerts.push} onChange={(v) => setAlerts({ ...alerts, push: v })} />
        {!alerts.whatsapp && !alerts.push ? <Text variant="caption" tone="alert">Keep at least one on, or you won't hear about missed tasks.</Text> : null}
        {settled ? <Text variant="label" tone="success">✓ Agreed</Text> : <Button label="I agree" disabled={!alerts.whatsapp && !alerts.push} onPress={onAgree} full />}
      </View>
    );
  }

  if (card.type === 'confirm') {
    const set = (k: string, v: string) => setFields((fs) => fs.map((f) => (f.key === k ? { ...f, value: v } : f)));
    return (
      <View style={st.card}>
        {editing && !settled ? (
          <>
            {fields.map((f) => <TextField key={f.key} label={f.label} value={f.value} onChangeText={(v) => set(f.key, v)} keyboardType={f.keyboard} />)}
            <Button label="Save" onPress={() => setEditing(false)} full />
          </>
        ) : (
          <>
            {fields.map((f) => (
              <View key={f.key} style={st.row}>
                <Text variant="caption" tone="muted" style={{ width: 120 }}>{f.label}</Text>
                <Text variant="bodyStrong" style={{ flex: 1, color: f.value ? color.text.primary : color.text.muted }}>{f.value || 'Not given'}</Text>
              </View>
            ))}
            {settled ? <Text variant="label" tone="success">✓ Saved</Text> : (
              <View style={st.actions}>
                <View style={{ flex: 1 }}><Button label="Edit" kind="outlined" onPress={() => setEditing(true)} full /></View>
                <View style={{ flex: 1 }}><Button label="Looks right" onPress={() => onConfirm(card.topic, fields)} full /></View>
              </View>
            )}
          </>
        )}
      </View>
    );
  }

  if (card.type === 'routine') {
    return (
      <View style={st.card}>
        {state.tasks.map((t) => (
          <View key={t.id} style={st.row}>
            <Icon name={TASK_ICON[t.type]} size={22} />
            <Text variant="bodyStrong" style={{ flex: 1 }}>{t.title}</Text>
            <Text variant="caption" tone="muted">{fmt(t.dueAt)}</Text>
          </View>
        ))}
        {settled ? <Text variant="label" tone="success">✓ Kept</Text> : (
          <View style={st.actions}>
            <View style={{ flex: 1 }}><Button label="Edit routine" kind="outlined" onPress={() => router.push('/routine')} full /></View>
            <View style={{ flex: 1 }}><Button label="Looks good" onPress={onRoutineOk} full /></View>
          </View>
        )}
      </View>
    );
  }

  if (card.type === 'invite') {
    return (
      <View style={[st.card, { backgroundColor: color.bg.mint }]}>
        <Text variant="small" tone="muted">Preview of her WhatsApp message</Text>
        <Text variant="caption">Hi {state.helper.name}! {state.profile.name} invited you to Pawsure to share {petName}'s care updates. Your work gets a record. Only the bowl or the pet, never your face. You can stop any time.</Text>
        {settled ? <Text variant="label" tone="success">✓ Answered</Text> : (
          <View style={st.actions}>
            <View style={{ flex: 1 }}><Button label="Later" kind="outlined" onPress={() => onInvite(false)} full /></View>
            <View style={{ flex: 1 }}><Button label="Send invite" onPress={() => onInvite(true)} full /></View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[st.card, { backgroundColor: color.bg.lilac }]}>
      <Text variant="bodyStrong">You're all set, {state.profile.name}.</Text>
      <KeyValue k="Pet" v={`${petName} · ${state.pet.speciesLabel}`} />
      <KeyValue k="Routine" v={`${state.tasks.length} daily tasks`} />
      <KeyValue k="Helper" v={state.helper.name} />
      <KeyValue k="Backup" v={state.backup.name} />
      <Button label="Go to my Today" onPress={onFinish} full />
    </View>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg.canvas },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: color.border.subtle },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: color.bg.sunken, overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', backgroundColor: color.action.select, borderRadius: radius.pill },
  body: { padding: space.lg, gap: space.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  theirs: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  mine: { alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: color.bg.sunken, borderRadius: radius.lg, borderBottomRightRadius: radius.xs, paddingHorizontal: space.lg, paddingVertical: space.sm },
  card: { backgroundColor: color.bg.card, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border.subtle, padding: space.lg, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 28 },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
  dots: { flexDirection: 'row', gap: 5, paddingVertical: space.sm },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: color.text.muted },
  foot: { gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.md, borderTopWidth: 1, borderTopColor: color.border.subtle, backgroundColor: color.bg.canvas },
  composer: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 52, paddingLeft: space.lg, paddingRight: 6, borderRadius: radius.xl, backgroundColor: color.bg.raised, borderWidth: 1.5, borderColor: color.border.control },
  input: { flex: 1, color: color.text.primary, paddingVertical: space.sm, outlineStyle: 'none' } as never,
  send: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: color.action.primary, alignItems: 'center', justifyContent: 'center' },
});
