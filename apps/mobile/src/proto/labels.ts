import type { SignalType, TaskType } from '@pawsure/domain';
import type { IconName } from '../design';

export const TASK_ICON: Record<TaskType, IconName> = { feeding: 'food', water: 'water', walk: 'activity', toilet_pad: 'home', medicine: 'medication', other: 'paw' };
/** Colour bar per task type on list rows (decorative; the row text carries the meaning). */
export const TASK_ACCENT: Record<TaskType, 'orange' | 'sky' | 'green' | 'teal' | 'lilac' | 'yellow'> = {
  feeding: 'orange', water: 'sky', walk: 'green', toilet_pad: 'teal', medicine: 'lilac', other: 'yellow',
};
/** Colour bar per health reminder kind. */
export const HEALTH_ACCENT = (kind: string) => (kind === 'vaccine' ? 'sky' : kind === 'deworming' ? 'lilac' : 'green') as 'sky' | 'lilac' | 'green';
export const TASK_LABEL: Record<TaskType, string> = { feeding: 'Feeding', water: 'Water', walk: 'Walk', toilet_pad: 'Toilet pad', medicine: 'Medicine', other: 'Other' };

export const SIGNAL_LABEL: Record<SignalType, { label: string; icon: IconName; kind: 'task' | 'visit' }> = {
  whatsapp_photo: { label: 'WhatsApp photo', icon: 'food', kind: 'task' },
  in_app_photo: { label: 'In-app photo', icon: 'food', kind: 'task' },
  voice_note: { label: 'Voice note', icon: 'mic', kind: 'task' },
  ivr_code: { label: 'Code keyed on the phone', icon: 'phone', kind: 'task' },
  arrival_call: { label: 'Arrival missed call', icon: 'phone', kind: 'visit' },
  exit_call: { label: 'Leaving missed call', icon: 'phone', kind: 'visit' },
  gate_entry: { label: 'Gate-app entry (owner-provided)', icon: 'shield', kind: 'visit' },
};

/** Plain-language versions of the confidence engine's reason codes. */
export const REASON_TEXT: Record<string, string> = {
  code_photo: "Photo shows today's code",
  task_photo_no_code: 'Photo without a code',
  voice_note_names_task: 'Voice note names the task',
  ivr_code_after_prompt: 'Code keyed after the task prompt',
  visit_calls_ok: 'Arrival and leaving calls, long enough visit',
  visit_too_short: 'Visit was shorter than the task needs',
  single_call_only: 'Only one missed call arrived',
  gate_entry: 'Gate-app entry (owner-provided)',
  wrong_code: 'Code did not match today',
  duplicate_image: 'Same photo was sent before, so it was not counted',
  unregistered_number_ignored: 'Call from an unregistered number was ignored',
  outside_window_ignored: 'Something arrived outside the time window and was ignored',
  late_evidence: 'Evidence arrived late',
  visit_only: 'Someone came, but nothing shows the task was done',
  no_evidence: 'Nothing arrived by the end of the grace period',
  awaiting_evidence: 'Waiting for a check-in',
  owner_check_matched: 'You confirmed it on return',
  owner_check_contradicts: 'Your return check disagreed, so points are held',
};
