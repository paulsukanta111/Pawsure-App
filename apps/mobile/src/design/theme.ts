/**
 * App-level theme built on @pawsure/design-tokens.
 *
 * Confidence styling keeps the PRD 5.1 visual rule in the moodboard's palette:
 * dark pill = Confirmed, outline = Likely, alert colour = Not confirmed / Missed.
 * Every state also has a text label and a one-line explanation.
 */
import { color } from '@pawsure/design-tokens';
import type { TaskConfidence, VisitStatus } from '@pawsure/domain';

export * from '@pawsure/design-tokens';

export interface StatusStyle { label: string; explain: string; bg: string; fg: string; border: string }

export const confidenceStyle: Record<TaskConfidence | 'pending', StatusStyle> = {
  confirmed: { label: 'Confirmed', explain: 'The planned task has strong supporting evidence.', bg: color.bg.inverse, fg: color.text.inverse, border: color.bg.inverse },
  likely: { label: 'Likely', explain: 'We have some evidence the task was done.', bg: color.bg.raised, fg: color.text.primary, border: color.border.strong },
  not_confirmed: { label: 'Not confirmed', explain: 'We could not confirm this task. Please check.', bg: color.status.alertTint, fg: color.text.alert, border: color.status.alert },
  missed: { label: 'Missed', explain: 'No check-in arrived by the end of the grace period.', bg: color.status.alert, fg: '#FFFFFF', border: color.status.alert },
  matched: { label: 'Matched (owner check)', explain: 'You checked this on return.', bg: color.status.successTint, fg: color.text.success, border: color.status.success },
  pending: { label: 'Due', explain: 'Waiting for a check-in.', bg: color.bg.canvas, fg: color.text.muted, border: color.border.control },
};

export const visitLabel: Record<VisitStatus, string> = {
  confirmed: 'Visit confirmed',
  likely: 'Visit likely',
  not_confirmed: 'Visit not confirmed',
  not_shown: '',
};
