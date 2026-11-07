/** Shared vocabulary. Names follow the PRD glossary (Appendix B). */

export type TaskType = 'feeding' | 'water' | 'walk' | 'toilet_pad' | 'medicine' | 'other';

/** Owner-facing confidence label for one task (section 5.1). */
export type TaskConfidence = 'confirmed' | 'likely' | 'not_confirmed' | 'missed' | 'matched';

/** Whether someone came, tracked separately from the task (PS-122). */
export type VisitStatus = 'confirmed' | 'likely' | 'not_confirmed' | 'not_shown';

export type HelperMode = 'tracked' | 'trusted';

export type Severity = 'S1' | 'S2' | 'S3';

export type CareRole = 'owner' | 'co_owner' | 'helper' | 'backup' | 'friend' | 'nearby_member' | 'ops';

export type Channel = 'whatsapp' | 'ivr' | 'app' | 'push' | 'phone_call' | 'sms';
