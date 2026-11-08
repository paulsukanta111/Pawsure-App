/**
 * The helper's Pawsure chat on WhatsApp, as a hook: builds the message list and quick replies
 * from the shared demo state, so every reply updates the owner's screens.
 * Used by the in-app simulation (/helper) and by the helper experience (/helper-app).
 * W1-W5: PS-020 to PS-024, PS-027, PS-029, PS-034, PS-105, PS-110, PS-118 (task-specific templates only).
 */
import { router } from 'expo-router';
import { useState } from 'react';
import type { ChatMessage } from '../design';
import { HELPER_TEXT } from './helperStrings';
import { fmt, HELPER_ID, useProto, type HelperMethod, type Lang, type ProtoTask } from './store';

type Extra = Omit<ChatMessage, 'id' | 'replies'>;
export const HOMES = [{ id: 'demo', label: 'Neha · Bruno' }, { id: 'kapoor', label: 'Kapoor family · Coco' }];
const DISPUTE_REPLIES = ['I refilled the bowl after the photo', 'He ate, then knocked the bowl over', 'I forgot, sorry'];

export function useHelperChat() {
  const { state, dispatch, evaluations, now, code, wallet, ledger } = useProto();
  const h = state.helper;
  const T = HELPER_TEXT[h.language];
  const [log, setLog] = useState<Extra[]>([]);
  const [problemOpen, setProblemOpen] = useState(false);
  const [home, setHome] = useState('demo');
  const [uploading, setUploading] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const say = (...m: Extra[]) => setLog((l) => [...l, ...m]);
  const t = fmt(now);

  const msgs: ChatMessage[] = [];
  let openTask: ProtoTask | undefined;
  let checkIn: ((kind: 'photo' | 'old' | 'nocode' | 'voice') => void) | undefined;
  let n = 0;
  const push = (m: Omit<ChatMessage, 'id'>) => msgs.push({ ...m, id: `m${n++}` });

  if (h.consent === 'pending') {
    push({
      from: 'pawsure', time: t, text: `${T.chooseLang}\nभाषा चुनें · भाषा निवडा`,
      replies: (['mr', 'hi', 'en'] as Lang[]).map((l) => ({ label: l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'मराठी', onPress: () => dispatch({ type: 'helper', patch: { language: l } }) })),
    });
    push({
      from: 'pawsure', time: t, text: T.consent(h.name, state.profile.name, state.pet.name),
      replies: [
        { label: T.yes, onPress: () => { dispatch({ type: 'helper', patch: { consent: 'given' } }); say({ from: 'me', time: t, text: T.yes }, { from: 'pawsure', time: t, text: T.method }); } },
        { label: T.notNow, onPress: () => { dispatch({ type: 'helper', patch: { consent: 'declined' } }); say({ from: 'me', time: t, text: T.notNow }, { from: 'pawsure', time: t, text: T.declined(state.profile.name) }); } },
      ],
    });
  }

  log.forEach((m) => push(m));

  if (h.consent === 'given' && home === 'demo') {
    const setMethod = (m: HelperMethod, label: string) => { dispatch({ type: 'helper', patch: { method: m } }); say({ from: 'me', time: t, text: label }, { from: 'pawsure', time: t, text: T.methodSet }); };
    if (log.length && log[log.length - 1]?.text === T.method) {
      msgs[msgs.length - 1]!.replies = [
        { label: T.photo, onPress: () => setMethod('whatsapp_photo', T.photo) },
        { label: T.voice, onPress: () => setMethod('whatsapp_voice', T.voice) },
        { label: T.missedCall, onPress: () => setMethod('missed_call_code', T.missedCall) },
      ];
    }

    // Disputes: tasks whose points are held because Neha's return check disagreed (PS-034).
    for (const task of state.tasks.filter((x) => evaluations[x.id]?.mismatch)) {
      const d = state.disputes[task.id];
      push({
        from: 'pawsure', time: t,
        text: `${state.profile.name}'s return check didn't match your ${task.title.toLowerCase()} check-in. 5 points are on hold for up to 7 days; this is not a complaint. Would you like to explain?`,
        replies: d?.helperText ? undefined : DISPUTE_REPLIES.map((r) => ({ label: r, onPress: () => { dispatch({ type: 'dispute_response', taskId: task.id, text: r }); say({ from: 'me', time: t, text: r }, { from: 'pawsure', time: t, text: `Thanks. ${state.profile.name} will see your reply.` }); } })),
      });
      if (d?.decision) push({ from: 'pawsure', time: d.decidedAt ? fmt(d.decidedAt) : t, text: d.decision === 'release' ? `Good news: ${state.profile.name} released the 5 points. "${d.reason}"` : `The 5 points for this task were not given. Reason: "${d.reason}". Your other points are not affected.` });
    }

    // Task prompt (task-specific template, PS-023).
    const openList = state.tasks.filter((x) => !x.cancelled && ['pending', 'missed'].includes(evaluations[x.id]!.task) && x.dueAt.getTime() - now.getTime() < 45 * 60_000);
    for (const task of openList.slice(0, 1)) {
      openTask = task;
      const late = evaluations[task.id]!.task === 'missed';
      const upload = (kind: 'photo' | 'old' | 'nocode' | 'voice') => {
        setUploading(kind === 'voice' ? 'Sending voice note…' : 'Uploading photo…');
        setTimeout(() => {
          setUploading(null);
          if (kind === 'voice') {
            dispatch({ type: 'signal', taskId: task.id, signal: { type: 'voice_note', namesTask: true } });
            say({ from: 'me', time: t, voice: { seconds: 6, transcript: `${task.title} done` } }, { from: 'pawsure', time: t, text: late ? T.late : T.thanks });
          } else {
            const withCode = kind === 'photo';
            dispatch({ type: 'signal', taskId: task.id, signal: { type: 'whatsapp_photo', code: withCode ? code : undefined, imageHash: kind === 'old' ? 'img-1' : `img-${Date.now()}` } });
            say({ from: 'me', time: t, photo: { caption: kind === 'old' ? 'Old photo' : task.title, code: withCode ? code : undefined } }, { from: 'pawsure', time: t, text: late ? T.late : T.thanks });
          }
        }, 650);
      };
      checkIn = upload;
      push({
        from: 'pawsure', time: fmt(task.dueAt), text: `${T.prompt(fmt(task.dueAt), state.pet.name, task.title)}\n${task.instructions ?? ''}\n${h.method === 'whatsapp_photo' ? T.promptPhotoHint : ''}`.trim(),
        replies: h.method === 'whatsapp_photo'
          ? [{ label: T.sendPhotoCode, onPress: () => upload('photo') }, { label: T.sendPhotoNoCode, onPress: () => upload('nocode') }, { label: T.resendOld, onPress: () => upload('old') }]
          : h.method === 'whatsapp_voice'
            ? [{ label: T.sendVoice, onPress: () => upload('voice') }]
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
          { label: T.myPoints, onPress: () => { say({ from: 'me', time: t, text: T.myPoints }, { from: 'pawsure', time: t, text: T.points(wallet.spendable, state.helper.mode === 'tracked' ? 6 : 0, 41) }); setShowHistory(true); } },
          { label: T.shareRecord, onPress: () => say({ from: 'me', time: t, text: T.shareRecord }, { from: 'pawsure', time: t, text: T.shareOff }) },
          { label: T.stop, onPress: () => { dispatch({ type: 'helper', patch: { consent: 'withdrawn' } }); say({ from: 'me', time: t, text: T.stop }, { from: 'pawsure', time: t, text: T.stopped }); } },
        ],
    });
  }

  if (h.consent === 'given' && home === 'kapoor') {
    push({ from: 'pawsure', time: '9:00 am', text: 'Kapoor family · Coco: Morning walk. Thank you, recorded.' });
    push({ from: 'pawsure', time: t, text: 'No tasks for Coco right now. Points from both homes go to one wallet; each home only sees its own details.' });
  }

  if (h.consent === 'declined' || h.consent === 'withdrawn') {
    push({ from: 'pawsure', time: t, text: h.consent === 'declined' ? T.declined(state.profile.name) : T.stopped, replies: [{ label: 'Join again', onPress: () => dispatch({ type: 'helper', patch: { consent: 'pending' } }) }] });
  }

  function report(category: 'injury' | 'vomiting' | 'bite' | 'food_water_out', label: string) {
    dispatch({ type: 'incident', category, by: h.name });
    setProblemOpen(false);
    say({ from: 'me', time: t, text: label }, { from: 'pawsure', time: t, text: `${T.alerted}\n${state.pet.name} · allergies: ${state.pet.allergies} · vet ${state.pet.vet.phone}` });
  }

  const mine = ledger.filter((e) => e.helperId === HELPER_ID).sort((a, b) => b.at.getTime() - a.at.getTime());
  const restart = () => { setLog([]); dispatch({ type: 'helper', patch: { consent: 'pending' } }); };
  return { msgs, uploading, home, setHome, showHistory, mine, restart, openTask, checkIn, T, wallet };
}
