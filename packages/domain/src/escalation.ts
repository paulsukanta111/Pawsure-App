/**
 * Missed-task escalation ladder (PS-031, PS-032, PS-101, 10.4) and the emergency
 * severity matrix (PS-124, 10.6).
 *
 * These functions produce a schedule of steps. The backend stores the schedule as
 * durable, idempotent jobs; when a job fires it re-checks `shouldRun` so an owner
 * acknowledgement that arrived in between stops the remaining steps.
 *
 * "Acknowledged" everywhere means an explicit "I'm on it" tap or pressing 1 on the
 * automated call. Delivery or read receipts never count.
 */
import { addMinutes } from './time';
import type { CareRole, Channel, Severity, TaskType } from './types';

export interface LadderConfig {
  /** Minutes after due before the owner is alerted, by task type. */
  ownerAlertAfterDue: Record<TaskType, number>;
  /** Minutes after the owner alert before the backup gets the look-in link. */
  backupAfterOwner: number;
  /** Minutes after the backup step before cover is suggested. */
  coverAfterBackup: number;
  /** How long the backup look-in link stays open (PS-102). */
  lookInLinkMinutes: number;
}

export const DEFAULT_LADDER: LadderConfig = {
  ownerAlertAfterDue: { feeding: 30, water: 30, toilet_pad: 30, other: 30, medicine: 15, walk: 45 },
  backupAfterOwner: 30,
  coverAfterBackup: 15,
  lookInLinkMinutes: 15,
};

export type LadderStepKind = 'owner_alert' | 'backup_look_in' | 'suggest_cover';

export interface LadderStep {
  step: 1 | 2 | 3;
  kind: LadderStepKind;
  at: Date;
  /** Steps 2 and 3 are skipped once the owner acknowledges. */
  stopsOnOwnerAck: boolean;
  /** Idempotency key for the job: one job per task per step. */
  jobKey: string;
}

export function planLadder(taskId: string, taskType: TaskType, dueAt: Date, config = DEFAULT_LADDER): LadderStep[] {
  const ownerAt = addMinutes(dueAt, config.ownerAlertAfterDue[taskType]);
  const backupAt = addMinutes(ownerAt, config.backupAfterOwner);
  const coverAt = addMinutes(backupAt, config.coverAfterBackup);
  return [
    { step: 1, kind: 'owner_alert', at: ownerAt, stopsOnOwnerAck: false, jobKey: `${taskId}:ladder:1` },
    { step: 2, kind: 'backup_look_in', at: backupAt, stopsOnOwnerAck: true, jobKey: `${taskId}:ladder:2` },
    { step: 3, kind: 'suggest_cover', at: coverAt, stopsOnOwnerAck: true, jobKey: `${taskId}:ladder:3` },
  ];
}

export interface LadderState {
  /** Evidence arrived and the task is no longer Missed. Stops the whole ladder. */
  taskResolved: boolean;
  ownerAcknowledgedAt?: Date;
  /** A hurt/sick report moves the case to the severity matrix (PS-039). */
  severityReported?: boolean;
}

/** Called when a scheduled job fires. */
export function shouldRun(step: LadderStep, state: LadderState, now: Date): boolean {
  if (now < step.at) return false;
  if (state.taskResolved || state.severityReported) return false;
  if (step.stopsOnOwnerAck && state.ownerAcknowledgedAt && state.ownerAcknowledgedAt <= step.at) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Severity matrix (10.6)

export type IncidentCategory =
  | 'injury' | 'bite' | 'collapse' | 'breathing' | 'pet_missing' | 'door_key_security'
  | 'vomiting' | 'not_eating' | 'limping' | 'unusual_behaviour'
  | 'food_water_out' | 'toilet_pad_out' | 'pet_left_outside';

export const SEVERITY_OF: Record<IncidentCategory, Severity> = {
  injury: 'S1', bite: 'S1', collapse: 'S1', breathing: 'S1', pet_missing: 'S1', door_key_security: 'S1',
  vomiting: 'S2', not_eating: 'S2', limping: 'S2', unusual_behaviour: 'S2',
  food_water_out: 'S3', toilet_pad_out: 'S3', pet_left_outside: 'S3',
};

export interface NotifyAction {
  offsetMinutes: number;
  recipients: CareRole[] | 'all_care_circle';
  channels: Channel[];
  /** Skipped if anyone has acknowledged before it runs. */
  onlyIfUnacknowledged: boolean;
  note?: string;
  jobKey: string;
}

export function planIncidentNotifications(incidentId: string, severity: Severity): NotifyAction[] {
  const k = (n: number) => `${incidentId}:sev:${n}`;
  switch (severity) {
    case 'S1':
      return [
        { offsetMinutes: 0, recipients: ['owner', 'backup'], channels: ['whatsapp', 'phone_call'], onlyIfUnacknowledged: false, note: 'helper sees emergency card', jobKey: k(0) },
        { offsetMinutes: 5, recipients: ['owner', 'backup'], channels: ['phone_call'], onlyIfUnacknowledged: true, note: 'repeat call 1/3', jobKey: k(1) },
        { offsetMinutes: 10, recipients: ['owner', 'backup'], channels: ['phone_call'], onlyIfUnacknowledged: true, note: 'repeat call 2/3', jobKey: k(2) },
        { offsetMinutes: 15, recipients: ['owner', 'backup'], channels: ['phone_call'], onlyIfUnacknowledged: true, note: 'repeat call 3/3', jobKey: k(3) },
        { offsetMinutes: 15, recipients: 'all_care_circle', channels: ['phone_call'], onlyIfUnacknowledged: true, note: 'helper told to call the vet directly; case stays open on ops dashboard', jobKey: k(4) },
      ];
    case 'S2':
      return [
        { offsetMinutes: 0, recipients: ['owner'], channels: ['whatsapp', 'push'], onlyIfUnacknowledged: false, jobKey: k(0) },
        { offsetMinutes: 15, recipients: ['backup'], channels: ['whatsapp', 'push'], onlyIfUnacknowledged: true, jobKey: k(1) },
        { offsetMinutes: 30, recipients: ['owner', 'backup'], channels: ['phone_call'], onlyIfUnacknowledged: true, note: 'ops reviews', jobKey: k(2) },
      ];
    case 'S3':
      return [
        { offsetMinutes: 0, recipients: ['owner'], channels: ['whatsapp', 'push'], onlyIfUnacknowledged: false, jobKey: k(0) },
        { offsetMinutes: 30, recipients: ['backup'], channels: ['whatsapp', 'push'], onlyIfUnacknowledged: true, jobKey: k(1) },
      ];
  }
}
