/**
 * Prototype store: one shared, in-memory household that every screen reads and
 * writes, so owner, helper (WhatsApp/IVR simulators) and friend flows connect.
 *
 * All business decisions come from @pawsure/domain (confidence, ladder, covered
 * day, rewards, Friend Finder). This file only holds state and wires events.
 * It will be replaced by Supabase reads/writes screen by screen.
 */
import {
  addMinutes, computePetDay, evaluateTask, expectedCodeFor, generateCodeCard, istMonthKey, newSearch, planLadder,
  reduceFriendSearch, REWARD_POLICY, SEVERITY_OF, shouldRun,
  type CheckInSignal, type CodeCard, type CoverRequest, type FriendEvent, type FriendSearch, type IncidentCategory,
  type LadderStepKind, type PetDayResult, type ReturnCheckAnswer, type Severity, type TaskEvaluation, type TaskType,
} from '@pawsure/domain';
import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { friends as seedFriends, pet as seedPet, today } from '../demo/data';

export type Lang = 'en' | 'hi' | 'mr';
export type HelperMethod = 'whatsapp_photo' | 'whatsapp_voice' | 'missed_call_code';

export interface ProtoTask {
  id: string;
  title: string;
  type: TaskType;
  dueAt: Date;
  instructions?: string;
  cancelled?: boolean;
  cancelReason?: string;
}

export interface Incident {
  id: string;
  category: IncidentCategory;
  severity: Severity;
  at: Date;
  by: string;
  note?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface HealthItem { id: string; kind: 'vaccine' | 'deworming' | 'check_up' | 'medication'; title: string; detail: string; dueOn: Date; done?: boolean }

export interface ProtoState {
  /** Demo clock. null = real time. */
  demoTime: Date | null;
  pet: typeof seedPet;
  tasks: ProtoTask[];
  signals: Record<string, CheckInSignal[]>;
  returnChecks: Record<string, ReturnCheckAnswer>;
  acks: Record<string, Date>;
  resolved: Record<string, Date>;
  incidents: Incident[];
  helper: { name: string; phone: string; consent: 'pending' | 'given' | 'declined'; method: HelperMethod; language: Lang; mode: 'tracked' | 'trusted'; unavailableToday: boolean };
  backup: { name: string; phone: string };
  trustedCovered: boolean | null;
  gateApp: boolean;
  rewardsEnabled: boolean;
  codeCards: CodeCard[];
  health: HealthItem[];
  friendSearch: FriendSearch | null;
  coverRequest: (CoverRequest & { summary: string }) | null;
  myFriendProfile: {
    discoverable: boolean; nearby: boolean; paused: boolean; capabilities: string[]; keyStatus: 'has_key' | 'needs_handover' | 'no_key';
    windows: string[]; liveLocation: boolean;
  };
  ownerPrivacy: { societyOnly: boolean; nearbyFallback: boolean };
  lookInOpens: Date[];
  seq: number;
}

type Action =
  | { type: 'set_clock'; at: Date | null }
  | { type: 'advance'; minutes: number }
  | { type: 'reset' }
  | { type: 'patch'; patch: Partial<ProtoState> }
  | { type: 'helper'; patch: Partial<ProtoState['helper']> }
  | { type: 'my_friend_profile'; patch: Partial<ProtoState['myFriendProfile']> }
  | { type: 'owner_privacy'; patch: Partial<ProtoState['ownerPrivacy']> }
  | { type: 'signal'; taskId: string; signal: Omit<CheckInSignal, 'id' | 'at'> & { at?: Date } }
  | { type: 'return_check'; answers: Record<string, ReturnCheckAnswer> }
  | { type: 'ack'; taskId: string }
  | { type: 'resolve'; taskId: string }
  | { type: 'incident'; category: IncidentCategory; by: string; note?: string }
  | { type: 'incident_ack'; id: string }
  | { type: 'incident_resolve'; id: string }
  | { type: 'add_task'; task: Omit<ProtoTask, 'id'> }
  | { type: 'cancel_task'; id: string; reason: string }
  | { type: 'rotate_code_card' }
  | { type: 'health_done'; id: string }
  | { type: 'pet'; patch: Partial<typeof seedPet> }
  | { type: 'start_cover'; request: CoverRequest & { summary: string } }
  | { type: 'friend'; event: FriendEvent }
  | { type: 'clear_cover' }
  | { type: 'look_in_opened' };

const rand = () => Math.floor(Math.random() * 10_000);

function initialState(): ProtoState {
  const now = today(15, 45);
  return {
    demoTime: now,
    pet: { ...seedPet },
    tasks: [
      { id: 't-lunch', title: 'Lunch + water', type: 'feeding', dueAt: today(13, 0), instructions: '1 cup kibble, refill the water bowl.' },
      { id: 't-med', title: 'Joint supplement', type: 'medicine', dueAt: today(13, 0), instructions: '1 tablet, hidden in a little food.' },
      { id: 't-walk', title: 'Afternoon walk', type: 'walk', dueAt: today(16, 0), instructions: 'Short walk around the podium. Leash on before the door opens.' },
      { id: 't-pad', title: 'Change toilet pad', type: 'toilet_pad', dueAt: today(18, 30), instructions: 'Fresh pad on the balcony.' },
    ],
    signals: {
      't-lunch': [
        { id: 's1', type: 'arrival_call', at: today(13, 4), fromRegisteredNumber: true },
        { id: 's2', type: 'whatsapp_photo', at: today(13, 9), code: undefined, imageHash: 'img-1' },
        { id: 's3', type: 'exit_call', at: today(13, 22), fromRegisteredNumber: true },
      ],
      't-med': [{ id: 's4', type: 'voice_note', at: today(13, 12), namesTask: true }],
    },
    returnChecks: {},
    acks: {},
    resolved: {},
    incidents: [],
    helper: { name: 'Sunita', phone: '+91 98200 33333', consent: 'given', method: 'whatsapp_photo', language: 'mr', mode: 'tracked', unavailableToday: false },
    backup: { name: 'Amit', phone: '+91 98200 11111' },
    trustedCovered: null,
    gateApp: false,
    rewardsEnabled: true,
    codeCards: [generateCodeCard('card-1', 'demo', istMonthKey(now), addMinutes(now, -60 * 24 * 6), rand)],
    health: [
      { id: 'h1', kind: 'vaccine', title: 'Vaccination', detail: 'Rabies booster', dueOn: addMinutes(now, 60 * 24 * 5) },
      { id: 'h2', kind: 'deworming', title: 'Deworming', detail: 'Quarterly tablet', dueOn: now },
      { id: 'h3', kind: 'check_up', title: 'Vet check-up', detail: 'Annual check-up', dueOn: addMinutes(now, 60 * 24 * 38) },
    ],
    friendSearch: null,
    coverRequest: null,
    myFriendProfile: {
      discoverable: true, nearby: false, paused: false, capabilities: ['feeding_water', 'short_walk'], keyStatus: 'no_key',
      windows: ['Weekdays 6–9 pm', 'Weekends 10 am–1 pm'], liveLocation: false,
    },
    ownerPrivacy: { societyOnly: true, nearbyFallback: false },
    lookInOpens: [],
    seq: 100,
  };
}

/** The lunch photo above carries today's code once the card exists. */
function seedLunchCode(s: ProtoState): ProtoState {
  const code = expectedCodeFor(s.codeCards, today(13, 9));
  const lunch = s.signals['t-lunch']!.map((x) => (x.type === 'whatsapp_photo' ? { ...x, code } : x));
  return { ...s, signals: { ...s.signals, 't-lunch': lunch } };
}

function reducer(s: ProtoState, a: Action): ProtoState {
  const now = s.demoTime ?? new Date();
  const id = (p: string) => `${p}-${s.seq + 1}`;
  switch (a.type) {
    case 'set_clock':
      return { ...s, demoTime: a.at };
    case 'advance':
      return { ...s, demoTime: addMinutes(now, a.minutes) };
    case 'reset':
      return seedLunchCode(initialState());
    case 'patch':
      return { ...s, ...a.patch };
    case 'helper':
      return { ...s, helper: { ...s.helper, ...a.patch } };
    case 'my_friend_profile':
      return { ...s, myFriendProfile: { ...s.myFriendProfile, ...a.patch } };
    case 'owner_privacy':
      return { ...s, ownerPrivacy: { ...s.ownerPrivacy, ...a.patch } };
    case 'signal': {
      const sig: CheckInSignal = { ...a.signal, id: id('sig'), at: a.signal.at ?? now };
      return { ...s, seq: s.seq + 1, signals: { ...s.signals, [a.taskId]: [...(s.signals[a.taskId] ?? []), sig] } };
    }
    case 'return_check':
      return { ...s, returnChecks: { ...s.returnChecks, ...a.answers } };
    case 'ack':
      return { ...s, acks: { ...s.acks, [a.taskId]: now } };
    case 'resolve':
      return { ...s, resolved: { ...s.resolved, [a.taskId]: now }, acks: { ...s.acks, [a.taskId]: s.acks[a.taskId] ?? now } };
    case 'incident':
      return {
        ...s, seq: s.seq + 1,
        incidents: [{ id: id('inc'), category: a.category, severity: SEVERITY_OF[a.category], at: now, by: a.by, note: a.note }, ...s.incidents],
      };
    case 'incident_ack':
      return { ...s, incidents: s.incidents.map((i) => (i.id === a.id ? { ...i, acknowledgedAt: i.acknowledgedAt ?? now } : i)) };
    case 'incident_resolve':
      return { ...s, incidents: s.incidents.map((i) => (i.id === a.id ? { ...i, acknowledgedAt: i.acknowledgedAt ?? now, resolvedAt: now } : i)) };
    case 'add_task':
      return { ...s, seq: s.seq + 1, tasks: [...s.tasks, { ...a.task, id: id('t') }].sort((x, y) => x.dueAt.getTime() - y.dueAt.getTime()) };
    case 'cancel_task':
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, cancelled: true, cancelReason: a.reason } : t)) };
    case 'rotate_code_card': {
      const cards = s.codeCards.map((c) => (c.revokedAt ? c : { ...c, revokedAt: now }));
      return { ...s, seq: s.seq + 1, codeCards: [...cards, generateCodeCard(id('card'), 'demo', istMonthKey(now), now, rand)] };
    }
    case 'health_done':
      return { ...s, health: s.health.map((h) => (h.id === a.id ? { ...h, done: true } : h)) };
    case 'pet':
      return { ...s, pet: { ...s.pet, ...a.patch } };
    case 'start_cover': {
      let fs = newSearch(id('fs'), a.request.window.start);
      fs = reduceFriendSearch(fs, { type: 'owner_confirms_summary', at: now }).state;
      fs = reduceFriendSearch(fs, { type: 'suggestions_shown', at: now }).state;
      return { ...s, seq: s.seq + 1, friendSearch: fs, coverRequest: a.request };
    }
    case 'friend': {
      if (!s.friendSearch) return s;
      try {
        return { ...s, friendSearch: reduceFriendSearch(s.friendSearch, a.event).state };
      } catch {
        return s; // Invalid for the current state; the UI only offers valid actions.
      }
    }
    case 'clear_cover':
      return { ...s, friendSearch: null, coverRequest: null };
    case 'look_in_opened':
      return { ...s, lookInOpens: [...s.lookInOpens, now] };
  }
}

// ---------------------------------------------------------------------------
// Derived views

export interface AlertItem {
  id: string;
  at: Date;
  kind: LadderStepKind | 'incident';
  taskId?: string;
  incidentId?: string;
  title: string;
  body: string;
  severity?: Severity;
  acknowledged: boolean;
}

export interface Derived {
  now: Date;
  code: string | undefined;
  evaluations: Record<string, TaskEvaluation>;
  activeTasks: ProtoTask[];
  alerts: AlertItem[];
  day: PetDayResult;
  pointsThisMonth: number;
  verifiedVisits: number;
  streakDays: number;
}

function derive(s: ProtoState): Derived {
  const now = s.demoTime ?? new Date();
  const code = expectedCodeFor(s.codeCards, now);
  const activeTasks = s.tasks.filter((t) => !t.cancelled);
  const priorHashes = new Set<string>();
  const evaluations: Record<string, TaskEvaluation> = {};
  for (const t of [...s.tasks].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())) {
    const sigs = (s.signals[t.id] ?? []).filter((x) => x.at <= now);
    evaluations[t.id] = evaluateTask({
      dueAt: t.dueAt, now, signals: sigs, expectedCode: expectedCodeFor(s.codeCards, t.dueAt),
      priorImageHashes: new Set(priorHashes), visitTaskTypes: [t.type], returnCheck: s.returnChecks[t.id],
    });
    sigs.forEach((x) => x.imageHash && priorHashes.add(x.imageHash));
  }

  const alerts: AlertItem[] = [];
  if (s.helper.mode === 'tracked') {
    for (const t of activeTasks) {
      const ev = evaluations[t.id]!;
      const missed = ev.task === 'missed';
      for (const step of planLadder(t.id, t.type, t.dueAt)) {
        const run = shouldRun(step, { taskResolved: !missed || !!s.resolved[t.id], ownerAcknowledgedAt: s.acks[t.id] }, now);
        if (!run) continue;
        alerts.push({
          id: step.jobKey, at: step.at, kind: step.kind, taskId: t.id, acknowledged: !!s.acks[t.id],
          title: step.kind === 'owner_alert' ? `${t.title}: no check-in yet` : step.kind === 'backup_look_in' ? `${s.backup.name} was sent a 15-minute look-in link` : 'Find cover?',
          body: step.kind === 'owner_alert'
            ? `${s.pet.name}'s ${t.title.toLowerCase()} was due at ${fmt(t.dueAt)}. Tap "I'm on it" if you're handling it.`
            : step.kind === 'backup_look_in'
              ? `You hadn't acknowledged, so your backup can now see the missed task, the emergency card and the spare-key note.`
              : 'Ask a friend nearby to cover this task.',
        });
      }
    }
  }
  for (const i of s.incidents) {
    alerts.push({
      id: i.id, at: i.at, kind: 'incident', incidentId: i.id, severity: i.severity, acknowledged: !!i.acknowledgedAt,
      title: `${i.severity === 'S1' ? 'Urgent' : i.severity === 'S2' ? 'Pet unwell' : 'Practical issue'}: ${CATEGORY_LABEL[i.category]}`,
      body: `${i.by} reported this at ${fmt(i.at)}.${i.note ? ` "${i.note}"` : ''}`,
    });
  }
  alerts.sort((a, b) => b.at.getTime() - a.at.getTime());

  const day = s.helper.mode === 'trusted'
    ? computePetDay({ mode: 'trusted', date: now, plannedTaskCount: activeTasks.length, ownerMarkedCovered: s.trustedCovered })
    : computePetDay({
      mode: 'tracked', date: now,
      tasks: s.tasks.map((t) => ({
        cancelled: !!t.cancelled, confidence: evaluations[t.id]!.task,
        escalationResolvedAt: s.resolved[t.id],
      })),
    });

  const earned = s.helper.mode === 'tracked' && s.rewardsEnabled
    ? activeTasks.filter((t) => evaluations[t.id]!.points === 'earn').length
    : 0;
  return {
    now, code, evaluations, activeTasks, alerts, day,
    // Sample baseline earlier this month (60) plus today's earned points, capped per PS-126.
    pointsThisMonth: Math.min(60 + earned * REWARD_POLICY.pointsPerTask, REWARD_POLICY.monthlyCapPerHousehold),
    verifiedVisits: 41 + earned,
    streakDays: 6,
  };
}

export const CATEGORY_LABEL: Record<IncidentCategory, string> = {
  injury: 'Hurt', bite: 'Bit someone', collapse: 'Collapsed', breathing: 'Breathing trouble', pet_missing: 'Pet missing',
  door_key_security: 'Door or key problem', vomiting: 'Vomiting', not_eating: 'Not eating', limping: 'Limping',
  unusual_behaviour: 'Unusual behaviour', food_water_out: 'Food or water ran out', toilet_pad_out: 'Toilet pads ran out',
  pet_left_outside: 'Pet left outside',
};

const IST = 330 * 60_000;
export function fmt(d: Date): string {
  const t = new Date(d.getTime() + IST);
  const h = t.getUTCHours();
  return `${h % 12 || 12}:${String(t.getUTCMinutes()).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
}

// ---------------------------------------------------------------------------

interface ProtoValue extends Derived {
  state: ProtoState;
  dispatch: (a: Action) => void;
  friends: typeof seedFriends;
}

const Ctx = createContext<ProtoValue | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => seedLunchCode(initialState()));
  const derived = useMemo(() => derive(state), [state]);
  const value = useMemo(() => ({ ...derived, state, dispatch, friends: seedFriends }), [derived, state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProto(): ProtoValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProto must be used inside <PrototypeProvider>');
  return v;
}
