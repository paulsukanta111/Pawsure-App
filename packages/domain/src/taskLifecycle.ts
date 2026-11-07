/**
 * Task lifecycle (PS-121). One status per task; every change is appended to the
 * history and never overwrites it.
 */

export type TaskStatus =
  | 'planned'
  | 'reassigned'
  | 'cancelled'
  | 'done_with_evidence'
  | 'done_reported'
  | 'partly_done'
  | 'skipped_with_reason'
  | 'missed';

export interface TaskStatusChange {
  from: TaskStatus | null;
  to: TaskStatus;
  at: Date;
  by: string;
  /** Required for cancelled, skipped, reassigned (named person) and partly done (what was skipped). */
  reason?: string;
  reassignedTo?: string;
}

export interface TaskRecord {
  id: string;
  status: TaskStatus;
  history: readonly TaskStatusChange[];
}

const OPEN: TaskStatus[] = ['planned', 'reassigned', 'missed'];
const ALLOWED: Record<TaskStatus, TaskStatus[]> = {
  planned: ['reassigned', 'cancelled', 'done_with_evidence', 'done_reported', 'partly_done', 'skipped_with_reason', 'missed'],
  reassigned: ['reassigned', 'cancelled', 'done_with_evidence', 'done_reported', 'partly_done', 'skipped_with_reason', 'missed'],
  // Late evidence or a late report can still close a missed task (labelled late by the confidence engine).
  missed: ['done_with_evidence', 'done_reported', 'partly_done', 'skipped_with_reason'],
  // Task evidence may arrive after a helper's plain "done" report.
  done_reported: ['done_with_evidence'],
  partly_done: [],
  done_with_evidence: [],
  skipped_with_reason: [],
  cancelled: [],
};

const NEEDS_REASON: TaskStatus[] = ['cancelled', 'skipped_with_reason', 'partly_done', 'reassigned'];

export class TaskTransitionError extends Error {}

export function createTask(id: string, at: Date, by: string): TaskRecord {
  return { id, status: 'planned', history: [{ from: null, to: 'planned', at, by }] };
}

export function transitionTask(task: TaskRecord, change: Omit<TaskStatusChange, 'from'>): TaskRecord {
  if (!ALLOWED[task.status].includes(change.to)) {
    throw new TaskTransitionError(`Cannot move task ${task.id} from ${task.status} to ${change.to}`);
  }
  if (NEEDS_REASON.includes(change.to) && !change.reason?.trim()) {
    throw new TaskTransitionError(`${change.to} needs a reason`);
  }
  if (change.to === 'reassigned' && !change.reassignedTo) {
    throw new TaskTransitionError('reassigned needs a named person');
  }
  const entry: TaskStatusChange = { ...change, from: task.status };
  return { id: task.id, status: change.to, history: [...task.history, entry] };
}

export const isOpen = (s: TaskStatus) => OPEN.includes(s);
