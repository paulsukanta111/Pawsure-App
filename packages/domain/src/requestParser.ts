/**
 * Prototype stand-in for the LLM parse step of Ask Pawsure (PS-055, PS-056, PS-065, PS-067, PS-125).
 *
 * In production an LLM with structured output fills these same fields. The rules
 * around it are the PRD's and stay here:
 *  - The parser only extracts. It never decides who is eligible or contacts anyone.
 *  - Material fields (time, am/pm, access, medicine) are never silently guessed:
 *    anything uncertain becomes a `blocking` question the owner must answer
 *    before search runs (C2: "search is blocked until clarified").
 */
import { addMinutes, ist, istDateKey } from './time';
import type { TaskType } from './types';

export type BlockingField = 'tasks' | 'time' | 'ampm' | 'access' | 'medicine';

export interface BlockingQuestion {
  field: BlockingField;
  question: string;
  options?: string[];
}

export interface ParsedCoverRequest {
  tasks: TaskType[];
  day: 'today' | 'tomorrow';
  start: Date | null;
  end: Date | null;
  /** null = not mentioned. */
  needsKey: boolean | null;
  /** Plain-language summary of what was understood, for the editable card. */
  understood: string[];
  blocking: BlockingQuestion[];
  /** Hours mentioned without am/pm, kept so the owner can pick. */
  pendingHours?: { startHour: number; startMinute: number; endHour?: number; endMinute?: number };
}

const TASK_WORDS: [TaskType, RegExp][] = [
  ['feeding', /\b(feed|feeding|food|lunch|dinner|breakfast|meal|khana|jevan)\b/],
  ['water', /\b(water|paani|pani)\b/],
  ['walk', /\b(walk|walks|walking|take (him|her|them) (down|out)|stroll|potty)\b/],
  ['medicine', /\b(medicine|medicines|meds|tablet|pill|dose|dawai|davai)\b/],
  ['toilet_pad', /\b(toilet|pad|pads)\b/],
];

const TIME = String.raw`(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?`;

interface T { h: number; m: number; mer: 'am' | 'pm' | null }
const tok = (h: string, m: string | undefined, mer: string | undefined): T => ({
  h: Number(h), m: m ? Number(m) : 0, mer: mer ? (mer.startsWith('a') ? 'am' : 'pm') : null,
});
const to24 = (t: T) => (t.mer === 'pm' ? (t.h % 12) + 12 : t.mer === 'am' ? t.h % 12 : t.h);

export function parseCoverText(text: string, now: Date, petName = 'your pet'): ParsedCoverRequest {
  const s = ` ${text.toLowerCase().replace(/\s+/g, ' ')} `;
  const tasks = TASK_WORDS.filter(([, re]) => re.test(s)).map(([t]) => t);
  const day: 'today' | 'tomorrow' = /\btomorrow|kal\b/.test(s) ? 'tomorrow' : 'today';
  const [y, mo, d] = istDateKey(now).split('-').map(Number) as [number, number, number];
  const dd = day === 'tomorrow' ? d + 1 : d;
  const at = (h: number, m: number) => ist(y, mo, dd, h, m);

  // Ignore the owner's own absence ("stuck till 8", "until 8") when reading the task time.
  const cleaned = s.replace(new RegExp(String.raw`\b(till|until|upto|up to)\s+${TIME}`, 'g'), ' ');
  const range = new RegExp(String.raw`(?:between|from)?\s*${TIME}\s*(?:and|to|-|–)\s*${TIME}`).exec(cleaned);
  const single = new RegExp(String.raw`\b(?:at|by|around|after)\s+${TIME}`).exec(cleaned);

  let a: T | null = null;
  let b: T | null = null;
  if (range && (range[3] || range[6] || /between|from/.test(range[0]))) {
    a = tok(range[1]!, range[2], range[3]);
    b = tok(range[4]!, range[5], range[6]);
    if (!a.mer && b.mer) {
      a.mer = b.mer;
      if (to24(a) > to24(b)) a.mer = 'am'; // "10-1 pm" means 10 am to 1 pm
    }
    if (a.mer && !b.mer) b.mer = to24(a) > to24({ ...b, mer: a.mer }) ? 'pm' : a.mer;
  } else if (single) {
    a = tok(single[1]!, single[2], single[3]);
  }

  const blocking: BlockingQuestion[] = [];
  const understood: string[] = [];
  let start: Date | null = null;
  let end: Date | null = null;
  let pendingHours: ParsedCoverRequest['pendingHours'];

  if (!tasks.length) blocking.push({ field: 'tasks', question: `What should they do for ${petName}?`, options: ['Feed', 'Water', 'Walk', 'Medicine'] });
  else understood.push(`Tasks: ${tasks.join(', ').replace('toilet_pad', 'toilet pad')}`);

  const valid = (t: T) => t.h >= 0 && t.h <= 23 && t.m < 60 && !(t.mer && (t.h < 1 || t.h > 12));
  if (!a || !valid(a) || (b && !valid(b))) {
    blocking.push({ field: 'time', question: 'What time should they come?' });
  } else if (!a.mer && a.h <= 12) {
    pendingHours = { startHour: a.h, startMinute: a.m, endHour: b?.h, endMinute: b?.m };
    blocking.push({ field: 'ampm', question: `${a.h}:${String(a.m).padStart(2, '0')} in the morning or evening?`, options: ['am', 'pm'] });
  } else {
    start = at(to24(a), a.m);
    end = b && b.mer ? at(to24(b), b.m) : addMinutes(start, 30);
    if (end <= start) end = addMinutes(start, 30);
    understood.push(`${day === 'tomorrow' ? 'Tomorrow' : 'Today'}, ${fmt(start)}–${fmt(end)}`);
  }

  let needsKey: boolean | null = null;
  if (/\b(no key|someone (is|will be) (at )?home|door (is )?open)\b/.test(s)) needsKey = false;
  else if (/\b(key|keys|chaabi|chavi)\b/.test(s)) needsKey = true;
  if (needsKey === null) blocking.push({ field: 'access', question: 'Will they need a key to get in?', options: ['Yes, key needed', 'No, someone is home'] });
  else understood.push(needsKey ? 'Key needed' : 'No key needed');

  if (tasks.includes('medicine')) {
    blocking.push({ field: 'medicine', question: `Use the medicine instructions from ${petName}'s profile? Only friends who opted into medicines will be asked.`, options: ['Yes, use profile instructions'] });
  }

  return { tasks, day, start, end, needsKey, understood, blocking, pendingHours };
}

// ---------------------------------------------------------------------------
// Friend replies (PS-060, PS-067): "5:30 la jamel" -> proposed time, owner must confirm.

export interface ParsedReply {
  intent: 'yes' | 'no' | 'propose' | 'unclear';
  proposedTime?: Date;
  interpretation: string;
}

// \b only knows Latin letters, so Hindi/Marathi words use explicit separators.
const SEP = String.raw`(?:^|$|[\s,.!?।])`;
const deva = (words: string) => new RegExp(`${SEP}(?:${words})(?=${SEP})`);
const YES_LATIN = /\b(yes|yeah|yep|yup|ok|okay|sure|haan|han|ha|ho|hoy|chalega|done|will do|can do)\b|👍/;
const NO_LATIN = /\b(no|nope|nahi|nahin|nai|cant|can't|cannot|sorry|busy|nako)\b/;
const YES_DEVA = deva('हाँ|हां|हा|हो|होय|ठीक|ठीक है|चलेगा|चालेल|जमेल');
const NO_DEVA = deva('नहीं|नही|नाही|नको|माफ़|माफ|माफी|माफ़ी|व्यस्त');
const YES = { test: (s: string) => YES_LATIN.test(s) || YES_DEVA.test(s) };
const NO = { test: (s: string) => NO_LATIN.test(s) || NO_DEVA.test(s) };

export function parseFriendReply(text: string, taskStart: Date): ParsedReply {
  const s = ` ${text.toLowerCase().trim()} `;
  const tm = new RegExp(String.raw`\b${TIME}\b`).exec(s);
  if (tm && /\d/.test(tm[0]) && (tm[2] || tm[3] || /\b(la|ko|at|by|pe|nantar|baad)\b/.test(s) || !YES.test(s))) {
    const t = tok(tm[1]!, tm[2], tm[3]);
    if (t.h <= 23 && t.m < 60) {
      const [y, mo, d] = istDateKey(taskStart).split('-').map(Number) as [number, number, number];
      const taskHour = Number(new Date(taskStart.getTime() + 330 * 60_000).toISOString().slice(11, 13));
      let h = to24(t);
      if (!t.mer && h < 12 && taskHour >= 12) h += 12; // same half of the day as the task
      const proposed = ist(y, mo, d, h, t.m);
      if (proposed.getTime() === taskStart.getTime()) return { intent: 'yes', interpretation: `Yes, at the requested time (${fmt(proposed)})` };
      return { intent: 'propose', proposedTime: proposed, interpretation: `Can come at ${fmt(proposed)} instead. Needs your confirmation.` };
    }
  }
  if (NO.test(s)) return { intent: 'no', interpretation: "Can't help this time" };
  if (YES.test(s)) return { intent: 'yes', interpretation: 'Yes, can help' };
  return { intent: 'unclear', interpretation: "Couldn't tell. Pawsure asked them to reply Yes, No or a time." };
}

function fmt(d: Date): string {
  const t = new Date(d.getTime() + 330 * 60_000);
  const h = t.getUTCHours();
  return `${h % 12 || 12}:${String(t.getUTCMinutes()).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
}
