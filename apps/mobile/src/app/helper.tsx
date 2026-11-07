// W1-W5 Helper on WhatsApp (simulated): language, consent, method, task prompts with code, points, problem report.
// PS-020 to PS-024, PS-027, PS-105, PS-110, PS-118 (task-specific templates only, no open chat).
import { router } from 'expo-router';
import { useState } from 'react';
import { ChatThread, NoticeBanner, Screen, Button, type ChatMessage } from '../design';
import { DemoClock } from '../proto/DemoClock';
import { HELPER_TEXT } from '../proto/helperStrings';
import { fmt, useProto, type HelperMethod, type Lang } from '../proto/store';

type Extra = Omit<ChatMessage, 'id' | 'replies'>;

export default function HelperWhatsApp() {
  const { state, dispatch, evaluations, now, code, pointsThisMonth, streakDays, verifiedVisits } = useProto();
  const h = state.helper;
  const T = HELPER_TEXT[h.language];
  const [log, setLog] = useState<Extra[]>([]);
  const [problemOpen, setProblemOpen] = useState(false);
  const say = (...m: Extra[]) => setLog((l) => [...l, ...m]);
  const t = fmt(now);

  const msgs: ChatMessage[] = [];
  let n = 0;
  const push = (m: Omit<ChatMessage, 'id'>) => msgs.push({ ...m, id: `m${n++}` });

  if (h.consent === 'pending') {
    push({
      from: 'pawsure', time: t, text: `${T.chooseLang}\nभाषा चुनें · भाषा निवडा`,
      replies: (['en', 'hi', 'mr'] as Lang[]).map((l) => ({ label: l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'मराठी', onPress: () => dispatch({ type: 'helper', patch: { language: l } }) })),
    });
    push({
      from: 'pawsure', time: t, text: T.consent(h.name, 'Neha', state.pet.name),
      replies: [
        { label: T.yes, onPress: () => { dispatch({ type: 'helper', patch: { consent: 'given' } }); say({ from: 'me', time: t, text: T.yes }, { from: 'pawsure', time: t, text: T.method }); } },
        { label: T.notNow, onPress: () => { dispatch({ type: 'helper', patch: { consent: 'declined' } }); say({ from: 'me', time: t, text: T.notNow }, { from: 'pawsure', time: t, text: T.declined('Neha') }); } },
      ],
    });
  }

  log.forEach((m) => push(m));

  if (h.consent === 'given') {
    const setMethod = (m: HelperMethod, label: string) => { dispatch({ type: 'helper', patch: { method: m } }); say({ from: 'me', time: t, text: label }, { from: 'pawsure', time: t, text: T.methodSet }); };
    if (log.length && log[log.length - 1]?.text === T.method) {
      msgs[msgs.length - 1]!.replies = [
        { label: T.photo, onPress: () => setMethod('whatsapp_photo', T.photo) },
        { label: T.voice, onPress: () => setMethod('whatsapp_voice', T.voice) },
        { label: T.missedCall, onPress: () => setMethod('missed_call_code', T.missedCall) },
      ];
    }

    // W3: the current task prompt (task-specific template, PS-023).
    const open = state.tasks.filter((x) => !x.cancelled && ['pending', 'missed'].includes(evaluations[x.id]!.task) && x.dueAt.getTime() - now.getTime() < 45 * 60_000);
    for (const task of open.slice(0, 1)) {
      const late = evaluations[task.id]!.task === 'missed';
      const photo = (withCode: boolean, old = false) => {
        dispatch({ type: 'signal', taskId: task.id, signal: { type: 'whatsapp_photo', code: withCode ? code : undefined, imageHash: old ? 'img-1' : `img-${Date.now()}` } });
        say({ from: 'me', time: t, photo: { caption: old ? 'Old photo' : task.title, code: withCode ? code : undefined } }, { from: 'pawsure', time: t, text: late ? T.late : T.thanks });
      };
      push({
        from: 'pawsure', time: fmt(task.dueAt), text: `${T.prompt(fmt(task.dueAt), state.pet.name, task.title)}\n${task.instructions ?? ''}\n${h.method === 'whatsapp_photo' ? T.promptPhotoHint : ''}`.trim(),
        replies: h.method === 'whatsapp_photo'
          ? [{ label: T.sendPhotoCode, onPress: () => photo(true) }, { label: T.sendPhotoNoCode, onPress: () => photo(false) }, { label: T.resendOld, onPress: () => photo(false, true) }]
          : h.method === 'whatsapp_voice'
            ? [{ label: T.sendVoice, onPress: () => { dispatch({ type: 'signal', taskId: task.id, signal: { type: 'voice_note', namesTask: true } }); say({ from: 'me', time: t, voice: { seconds: 6, transcript: `${task.title} done` } }, { from: 'pawsure', time: t, text: late ? T.late : T.thanks }); } }]
            : [{ label: T.missedCall, onPress: () => router.push('/basic-phone') }],
      });
    }

    push({
      from: 'pawsure', time: t, text: T.problem,
      replies: problemOpen
        ? [
          { label: T.hurt, onPress: () => report('injury', T.hurt) },
          { label: T.sick, onPress: () => report('vomiting', T.sick) },
          { label: T.bit, onPress: () => report('bite', T.bit) },
          { label: T.foodOut, onPress: () => report('food_water_out', T.foodOut) },
        ]
        : [
          { label: T.problem, onPress: () => setProblemOpen(true) },
          { label: T.myPoints, onPress: () => say({ from: 'me', time: t, text: T.myPoints }, { from: 'pawsure', time: t, text: T.points(pointsThisMonth, streakDays, verifiedVisits) }) },
          { label: T.shareRecord, onPress: () => say({ from: 'me', time: t, text: T.shareRecord }, { from: 'pawsure', time: t, text: T.shareOff }) },
          { label: T.stop, onPress: () => { dispatch({ type: 'helper', patch: { consent: 'declined' } }); say({ from: 'me', time: t, text: T.stop }, { from: 'pawsure', time: t, text: T.stopped }); } },
        ],
    });
  }

  function report(category: 'injury' | 'vomiting' | 'bite' | 'food_water_out', label: string) {
    dispatch({ type: 'incident', category, by: h.name });
    setProblemOpen(false);
    say({ from: 'me', time: t, text: label }, { from: 'pawsure', time: t, text: `${T.alerted}\n${state.pet.name} · allergies: ${state.pet.allergies} · vet ${state.pet.vet.phone}` });
  }

  return (
    <Screen>
      <NoticeBanner icon="phone" title="Simulation of Sunita's phone" body="She never installs an app. Everything she sends here updates Neha's screens." />
      <DemoClock compact />
      <ChatThread title="Pawsure" subtitle={`Business account · ${h.language === 'en' ? 'English' : h.language === 'hi' ? 'Hindi' : 'Marathi'}`} messages={msgs} />
      {h.consent !== 'pending' ? <Button label="Restart the invite (W1)" kind="outlined" onPress={() => { setLog([]); dispatch({ type: 'helper', patch: { consent: 'pending' } }); }} full /> : null}
      <Button label="See Neha's Today screen" kind="secondary" onPress={() => router.dismissTo('/')} full />
    </Screen>
  );
}
