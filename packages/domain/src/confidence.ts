/**
 * Confidence engine, starting rule set v1 (PRD 5.1, 10.3, 10.5, PS-030, PS-122).
 *
 * Two separate questions:
 *  - visit status: did someone come? (calls, gate entry)
 *  - task state: was this task done? (task-linked photo, voice note, IVR code after a task prompt)
 * Visit evidence alone never makes a task better than Not confirmed.
 *
 * Pure and deterministic: same input, same output. Every result carries the rule
 * version and reason codes so it can be stored and explained (10.3).
 */
import { addMinutes, minutesBetween } from './time';
import type { TaskConfidence, TaskType, VisitStatus } from './types';

export const RULE_SET_VERSION = 'v1';

export type SignalType =
  | 'whatsapp_photo'
  | 'in_app_photo'
  | 'voice_note'
  | 'ivr_code'
  | 'arrival_call'
  | 'exit_call'
  | 'gate_entry';

export interface CheckInSignal {
  id: string;
  type: SignalType;
  /** When it happened (not when the webhook arrived). */
  at: Date;
  /** Code visible in a photo, or keyed on IVR. Absent if none. */
  code?: string;
  /** Perceptual/content hash of a photo, used to reject re-sent images. */
  imageHash?: string;
  /** Voice note that names the task (e.g. "fed Bruno"). Otherwise it is only an acknowledgement. */
  namesTask?: boolean;
  /** IVR code entered after the voice-guided task prompt. */
  afterTaskPrompt?: boolean;
  /** Calls count only from the registered helper number. */
  fromRegisteredNumber?: boolean;
}

export type ReturnCheckAnswer = 'done' | 'not_done';

export interface ConfidenceConfig {
  /** Evidence accepted from this many minutes before due. */
  windowBeforeMinutes: number;
  /** Grace period after due; after it, no evidence = Missed. */
  graceMinutes: number;
  /** Evidence up to this many minutes after due is accepted but labelled late; later is ignored. */
  lateCutoffMinutes: number;
  /** Minimum visit duration per task type, minutes. */
  minVisitMinutes: Record<TaskType, number>;
  /** Cap on the summed minimum for a multi-task visit. */
  minVisitCapMinutes: number;
}

export const DEFAULT_CONFIDENCE_CONFIG: ConfidenceConfig = {
  windowBeforeMinutes: 30,
  graceMinutes: 30,
  lateCutoffMinutes: 180,
  minVisitMinutes: { feeding: 5, water: 0, toilet_pad: 3, medicine: 3, walk: 15, other: 0 },
  minVisitCapMinutes: 30,
};

export interface TaskEvaluationInput {
  dueAt: Date;
  now: Date;
  signals: CheckInSignal[];
  /** Today's code from the household's code card; undefined if no card is in use. */
  expectedCode?: string;
  /** Hashes of photos already accepted earlier (any task). */
  priorImageHashes?: ReadonlySet<string>;
  /** Task types covered by the same visit, for the minimum-duration rule. */
  visitTaskTypes: TaskType[];
  returnCheck?: ReturnCheckAnswer;
  config?: ConfidenceConfig;
}

export type ReasonCode =
  | 'code_photo'
  | 'task_photo_no_code'
  | 'voice_note_names_task'
  | 'ivr_code_after_prompt'
  | 'visit_calls_ok'
  | 'visit_too_short'
  | 'single_call_only'
  | 'gate_entry'
  | 'wrong_code'
  | 'duplicate_image'
  | 'unregistered_number_ignored'
  | 'outside_window_ignored'
  | 'late_evidence'
  | 'visit_only'
  | 'no_evidence'
  | 'awaiting_evidence'
  | 'owner_check_matched'
  | 'owner_check_contradicts';

export type PointsOutcome = 'earn' | 'none' | 'held';

export interface TaskEvaluation {
  /** 'pending' = still inside the window with nothing decisive yet. */
  task: TaskConfidence | 'pending';
  visit: VisitStatus;
  points: PointsOutcome;
  /** Return check contradicted helper evidence (PS-034, PS-044). */
  mismatch: boolean;
  late: boolean;
  visitMinutes: number | null;
  reasons: ReasonCode[];
  ruleVersion: string;
}

export function minimumVisitMinutes(types: TaskType[], config = DEFAULT_CONFIDENCE_CONFIG): number {
  const sum = types.reduce((acc, t) => acc + config.minVisitMinutes[t], 0);
  return Math.min(sum, config.minVisitCapMinutes);
}

export function evaluateTask(input: TaskEvaluationInput): TaskEvaluation {
  const config = input.config ?? DEFAULT_CONFIDENCE_CONFIG;
  const reasons: ReasonCode[] = [];
  const windowStart = addMinutes(input.dueAt, -config.windowBeforeMinutes);
  const graceEnd = addMinutes(input.dueAt, config.graceMinutes);
  const lateEnd = addMinutes(input.dueAt, config.lateCutoffMinutes);

  // 1. Keep signals inside the accepted window; note late ones.
  let late = false;
  const seenHashes = new Set(input.priorImageHashes ?? []);
  const accepted: CheckInSignal[] = [];
  for (const s of [...input.signals].sort((a, b) => a.at.getTime() - b.at.getTime())) {
    if (s.at < windowStart || s.at > lateEnd || s.at > input.now) {
      pushOnce(reasons, 'outside_window_ignored');
      continue;
    }
    if ((s.type === 'arrival_call' || s.type === 'exit_call') && s.fromRegisteredNumber === false) {
      pushOnce(reasons, 'unregistered_number_ignored');
      continue;
    }
    if (s.imageHash) {
      if (seenHashes.has(s.imageHash)) {
        pushOnce(reasons, 'duplicate_image');
        continue;
      }
      seenHashes.add(s.imageHash);
    }
    accepted.push(s);
  }

  // 2. Task evidence and conflicts.
  let strongTask = false;
  let weakTask = false;
  let conflict = false;
  for (const s of accepted) {
    const isPhoto = s.type === 'whatsapp_photo' || s.type === 'in_app_photo';
    const hasCode = s.code !== undefined && s.code !== '';
    const codeOk = hasCode && input.expectedCode !== undefined && s.code === input.expectedCode;
    if (hasCode && !codeOk && (isPhoto || s.type === 'ivr_code')) {
      conflict = true;
      pushOnce(reasons, 'wrong_code');
      continue;
    }
    let counts = false;
    if (isPhoto && codeOk) {
      strongTask = true;
      counts = true;
      pushOnce(reasons, 'code_photo');
    } else if (isPhoto) {
      weakTask = true;
      counts = true;
      pushOnce(reasons, 'task_photo_no_code');
    } else if (s.type === 'voice_note' && s.namesTask) {
      weakTask = true;
      counts = true;
      pushOnce(reasons, 'voice_note_names_task');
    } else if (s.type === 'ivr_code' && codeOk && s.afterTaskPrompt) {
      weakTask = true;
      counts = true;
      pushOnce(reasons, 'ivr_code_after_prompt');
    }
    if (counts && s.at > graceEnd) late = true;
  }

  // 3. Visit evidence.
  const gate = accepted.some((s) => s.type === 'gate_entry');
  const arrival = accepted.find((s) => s.type === 'arrival_call');
  const exit = arrival
    ? [...accepted].reverse().find((s) => s.type === 'exit_call' && s.at >= arrival.at)
    : undefined;
  const anyCall = accepted.some((s) => s.type === 'arrival_call' || s.type === 'exit_call');
  const visitMinutes = arrival && exit ? minutesBetween(arrival.at, exit.at) : null;
  const minMinutes = minimumVisitMinutes(input.visitTaskTypes, config);
  let visitEvidence: 'full' | 'partial' | 'none' = 'none';
  if (gate) {
    visitEvidence = 'full';
    pushOnce(reasons, 'gate_entry');
  }
  if (visitMinutes !== null) {
    if (visitMinutes >= minMinutes) {
      visitEvidence = 'full';
      pushOnce(reasons, 'visit_calls_ok');
    } else if (visitEvidence === 'none') {
      visitEvidence = 'partial';
      pushOnce(reasons, 'visit_too_short');
    }
  } else if (anyCall && visitEvidence === 'none') {
    visitEvidence = 'partial';
    pushOnce(reasons, 'single_call_only');
  }

  // 4. Decide (table in 10.5).
  let task: TaskEvaluation['task'];
  let visit: VisitStatus;
  if (conflict) {
    task = 'not_confirmed';
    visit = 'not_confirmed';
  } else if (strongTask && visitEvidence === 'full') {
    task = 'confirmed';
    visit = 'confirmed';
  } else if (strongTask || weakTask) {
    task = 'likely';
    visit = visitEvidence === 'full' ? 'likely' : visitEvidence === 'partial' ? 'not_confirmed' : 'not_shown';
  } else if (visitEvidence === 'full') {
    task = 'not_confirmed';
    visit = 'likely';
    pushOnce(reasons, 'visit_only');
  } else if (visitEvidence === 'partial') {
    task = 'not_confirmed';
    visit = 'not_confirmed';
  } else if (input.now > graceEnd) {
    task = 'missed';
    visit = 'not_shown';
    pushOnce(reasons, 'no_evidence');
  } else {
    task = 'pending';
    visit = 'not_shown';
    pushOnce(reasons, 'awaiting_evidence');
  }
  if (late) pushOnce(reasons, 'late_evidence');

  // 5. Owner return check overrides helper evidence (10.5 "Conflicts").
  let mismatch = false;
  if (input.returnCheck === 'done' && task !== 'confirmed' && task !== 'likely') {
    task = 'matched';
    pushOnce(reasons, 'owner_check_matched');
  } else if (input.returnCheck === 'not_done' && (task === 'confirmed' || task === 'likely')) {
    task = 'not_confirmed';
    mismatch = true;
    pushOnce(reasons, 'owner_check_contradicts');
  }

  const points: PointsOutcome = mismatch ? 'held' : task === 'confirmed' || task === 'likely' ? 'earn' : 'none';
  return { task, visit, points, mismatch, late, visitMinutes, reasons, ruleVersion: RULE_SET_VERSION };
}

function pushOnce<T>(arr: T[], v: T) {
  if (!arr.includes(v)) arr.push(v);
}
