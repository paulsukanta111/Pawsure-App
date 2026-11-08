/**
 * Conversational onboarding (v3): reads the owner's free-text answers into profile fields
 * (PS-002 registration, PS-003/PS-004 pet profile and care, PS-005 care circle).
 *
 * A prototype stand-in for an LLM with structured output, with the same rules:
 *  - It only extracts. Every result is shown back on an editable card and saved only when the
 *    owner confirms it; nothing here decides consent or contacts anyone.
 *  - Unclear or missing fields stay empty rather than guessed, and are listed in `missing`
 *    so the assistant can ask a follow-up.
 */

export interface Extracted<T> {
  fields: Partial<T>;
  /** Plain-language lines of what was understood, for the confirmation card. */
  understood: string[];
  /** Fields the answer did not give (the assistant may ask for them). */
  missing: (keyof T)[];
}

const cap = (s: string) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
const clean = (s: string) => s.replace(/\s+/g, ' ').trim().replace(/^[,.;:\-\s]+|[,.;:\-\s]+$/g, '');

/** Indian mobile numbers, written with or without +91, spaces or dashes. */
const PHONE = /(?:\+?91[\s-]?)?[6-9]\d(?:[\s-]?\d){8}/g;
export function formatPhone(raw: string): string | null {
  const d = raw.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(d)) return null;
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}

// ---------------------------------------------------------------------------
// Yes / no, in English, Hindi and Marathi (typed or transliterated).

// An explicit end-of-word check instead of \b, which does not work for Devanagari.
const END = '(?=$|[\\s,.!?])';
const YES = new RegExp(`^(yes|yeah|yep|yup|sure|ok(ay)?|fine|correct|right|looks good|perfect|agree|i agree|done|go ahead|send( it)?|haan?|ha|ho|हाँ|हां|हो|हो\\s?ना|ठीक)${END}`, 'i');
const NO = new RegExp(`^(no|nope|not now|later|skip|nahi|nahin|नहीं|नाही|नको)${END}`, 'i');
export function parseYesNo(text: string): 'yes' | 'no' | null {
  const t = text.trim();
  if (NO.test(t)) return 'no';
  if (YES.test(t)) return 'yes';
  return null;
}

// ---------------------------------------------------------------------------
// The owner's name.

const NAME_LEAD = /^(hi|hello|hey|namaste)?[,!\s]*(i am|i'm|im|my name is|this is|call me|it's|its|me)?\s*/i;
export function parseOwnerName(text: string): string | null {
  const rest = clean(text.replace(NAME_LEAD, ''));
  const words = rest.split(/\s+/).filter((w) => /^\p{L}[\p{L}'.-]*$/u.test(w)).slice(0, 3);
  if (!words.length || words.join(' ').length > 40) return null;
  return cap(words.join(' '));
}

// ---------------------------------------------------------------------------
// The pet: name, species, breed, age, weight, allergies.

export interface PetFields { name: string; species: 'dog' | 'cat'; breed: string; age: string; weightKg: number; allergies: string }

const BREEDS: [RegExp, string][] = [
  [/\b(indie|desi|indian (street|pariah)|street (dog|cat)|stray)\b/i, 'Indie'],
  [/\b(labrador|lab)\b/i, 'Labrador'], [/\bgolden retriever\b/i, 'Golden Retriever'], [/\bbeagle\b/i, 'Beagle'],
  [/\bpug\b/i, 'Pug'], [/\bshih ?tzu\b/i, 'Shih Tzu'], [/\bgerman shepherd\b/i, 'German Shepherd'], [/\bpomeranian\b/i, 'Pomeranian'],
  [/\bspitz\b/i, 'Spitz'], [/\bhusky\b/i, 'Husky'], [/\bpersian\b/i, 'Persian'], [/\bsiamese\b/i, 'Siamese'], [/\bbengal\b/i, 'Bengal'],
];
const NOT_NAMES = new Set(['he', 'she', 'it', 'my', 'our', 'his', 'her', 'its', 'a', 'an', 'the', 'is', 'and', 'dog', 'cat', 'puppy', 'kitten',
  'year', 'years', 'old', 'indie', 'desi', 'male', 'female', 'boy', 'girl', 'very', 'loves', 'likes', 'allergic', 'i', 'we', 'have', 'got', 'this', 'that', 'yes', 'no']);

export function parsePet(text: string): Extracted<PetFields> {
  const f: Partial<PetFields> = {};
  const t = text.trim();
  if (/\b(dog|puppy|pup|doggo)\b/i.test(t)) f.species = 'dog';
  else if (/\b(cat|kitten|kitty)\b/i.test(t)) f.species = 'cat';
  for (const [re, label] of BREEDS) if (re.test(t)) { f.breed = label; break; }
  const age = t.match(/(\d+(?:\.\d+)?)\s*(?:-|\s)?\s*(years?|yrs?|y\/o|months?|mos?)\b/i);
  if (age) {
    const n = Number(age[1]);
    const months = /^mo/i.test(age[2]!);
    f.age = months ? `${n} month${n === 1 ? '' : 's'}` : `${n} year${n === 1 ? '' : 's'}`;
  }
  const kg = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilos?)\b/i);
  if (kg) f.weightKg = Number(kg[1]);
  const allergy = t.match(/allergic to ([\p{L} ,&]+?)(?:[.;!]|\band\s+(?:he|she|it)\b|$)/iu);
  if (allergy) f.allergies = cap(clean(allergy[1]!));
  else if (/\bno allerg/i.test(t)) f.allergies = 'None';

  const named = t.match(/\b(?:name is|named|called|call (?:him|her|it))\s+(\p{L}+)/iu) ?? t.match(/\b(\p{L}+) is (?:my|our|a|an)\b/iu);
  let name = named?.[1];
  if (!name) {
    const words = t.split(/[\s,.;!]+/).filter(Boolean);
    // A capitalised word that isn't a common word; for very short answers ("bruno"), the first word.
    name = words.find((w) => /^\p{Lu}\p{Ll}+$/u.test(w) && !NOT_NAMES.has(w.toLowerCase()))
      ?? (words.length <= 2 && words[0] && !NOT_NAMES.has(words[0].toLowerCase()) ? words[0] : undefined);
  }
  if (name && !NOT_NAMES.has(name.toLowerCase())) f.name = cap(name.toLowerCase());

  const understood = [
    f.name && `Name: ${f.name}`,
    f.species && `${f.species === 'dog' ? 'Dog' : 'Cat'}${f.breed ? `, ${f.breed}` : ''}`,
    !f.species && f.breed && `Breed: ${f.breed}`,
    f.age && `Age: ${f.age}`,
    f.weightKg != null && `Weight: ${f.weightKg} kg`,
    f.allergies && `Allergies: ${f.allergies}`,
  ].filter(Boolean) as string[];
  const missing = (['name', 'species'] as const).filter((k) => f[k] == null);
  return { fields: f, understood, missing };
}

// ---------------------------------------------------------------------------
// Daily care: food, medicines, allergies.

export interface CareFields { food: string; medicines: string; allergies: string }

const MED = /\b(medicine|medication|tablet|pill|capsule|syrup|drops|supplement|dose|mg|insulin|injection)s?\b/i;
const FOOD = /\b(eat|eats|food|kibble|meal|cup|cups|rice|curd|roti|chapati|biscuit|wet food|dry food|pedigree|royal canin|drools|feed|fed|breakfast|dinner|lunch|water)\b/i;
export function parseCare(text: string): Extracted<CareFields> {
  const f: Partial<CareFields> = {};
  const parts = text.split(/(?<=[.;!\n])\s*|,\s*(?=(?:and\s+)?(?:he|she|it|takes|no |gets|on )\b)/i).map(clean).filter(Boolean);
  const food: string[] = [];
  const meds: string[] = [];
  for (const p of parts) {
    if (/\bno (medicines?|meds|medication)\b|\bnot on any\b/i.test(p)) { f.medicines = 'None'; continue; }
    const allergy = p.match(/allergic to ([\p{L} ,&]+)/iu);
    if (allergy) { f.allergies = cap(clean(allergy[1]!)); continue; }
    if (MED.test(p)) meds.push(p.replace(/^(and\s+)?(he|she|it)\s+(takes|gets|is on)\s+/i, ''));
    else if (FOOD.test(p) || !food.length) food.push(p.replace(/^(he|she|it)\s+(eats|has|gets)\s+/i, ''));
  }
  if (food.length) f.food = food.join(', ').replace(/^./, (c) => c.toUpperCase());
  if (meds.length) f.medicines = meds.join(', ').replace(/^./, (c) => c.toUpperCase());
  const understood = [
    f.food && `Food: ${f.food}`, f.medicines && `Medicines: ${f.medicines}`, f.allergies && `Allergies: ${f.allergies}`,
  ].filter(Boolean) as string[];
  return { fields: f, understood, missing: (['food'] as const).filter((k) => !f[k]) };
}

// ---------------------------------------------------------------------------
// Vet: a name or clinic and a phone number.

export interface VetFields { name: string; phone: string }
export function parseVet(text: string): Extracted<VetFields> {
  const f: Partial<VetFields> = {};
  const phones = text.match(PHONE) ?? [];
  const phone = phones.map(formatPhone).find(Boolean);
  if (phone) f.phone = phone;
  let rest = text;
  for (const p of phones) rest = rest.replace(p, ' ');
  rest = clean(rest.replace(/\b(our|my|the)?\s*vet( is| name is|'s)?\b|\b(phone|number|no\.?|mobile|call|contact)( is)?\b|:/gi, ' ').replace(/\s+(and|,)\s*$/i, ''));
  if (rest.length >= 2) f.name = rest.replace(/\bdr\.?\s*/i, 'Dr. ').replace(/^./, (c) => c.toUpperCase());
  const understood = [f.name && `Vet: ${f.name}`, f.phone && `Phone: ${f.phone}`].filter(Boolean) as string[];
  return { fields: f, understood, missing: (['name', 'phone'] as const).filter((k) => !f[k]) };
}

// ---------------------------------------------------------------------------
// People: helper, backup and co-owner, each a name and a number.

export interface Person { name: string; phone: string | null }
export interface PeopleFields { helper: Person; backup: Person; coOwner: Person }

const ROLE: [RegExp, keyof PeopleFields][] = [
  [/\b(backup|back-up|emergency|neighbou?r)\b/i, 'backup'],
  [/\b(co-?owner|husband|wife|partner|spouse|flatmate|roommate)\b/i, 'coOwner'],
  [/\b(helper|maid|didi|bai|tai|walker|nanny|cook)\b/i, 'helper'],
];
const ROLE_WORDS = /^(helper|maid|didi|bai|tai|walker|nanny|cook|backup|husband|wife|partner|spouse|flatmate|roommate|neighbou?r|co-?owner|emergency)$/i;
export function parsePeople(text: string): Extracted<PeopleFields> {
  const f: Partial<PeopleFields> = {};
  const order: (keyof PeopleFields)[] = ['helper', 'backup', 'coOwner'];
  // One person per segment: each phone number closes a segment ("helper Sunita 98… and backup Amit 98…").
  // Text after the last number (or an answer without numbers) is split on commas, "and" and full stops.
  const segments: string[] = [];
  let last = 0;
  for (const m of text.matchAll(PHONE)) { segments.push(text.slice(last, m.index! + m[0].length)); last = m.index! + m[0].length; }
  segments.push(...text.slice(last).split(/[.;\n,]|\s+and\s+/));
  let prev: keyof PeopleFields | null = null;
  for (const seg of segments.map(clean).filter(Boolean)) {
    const raw = seg.match(PHONE)?.[0];
    const phone = raw ? formatPhone(raw) : null;
    const role = ROLE.find(([re]) => re.test(seg))?.[1];
    // The first capitalised word that is not a common or role word ("My helper Sunita" -> Sunita).
    const name = (seg.replace(raw ?? '', ' ').match(/\p{Lu}\p{Ll}+/gu) ?? []).find((w) => !NOT_NAMES.has(w.toLowerCase()) && !ROLE_WORDS.test(w));
    if (!name) {
      // "…Amit 98200 11111 is the backup": a role with no name re-labels the person just before it.
      if (role && prev && prev !== role && !f[role]) { f[role] = f[prev]; delete f[prev]; prev = role; }
      continue;
    }
    const slot = role && !f[role] ? role : order.find((r) => !f[r]);
    if (!slot) continue;
    f[slot] = { name, phone };
    prev = slot;
  }
  const label = { helper: 'Helper', backup: 'Backup', coOwner: 'Co-owner' } as const;
  const understood = order.filter((r) => f[r]).map((r) => `${label[r]}: ${f[r]!.name}${f[r]!.phone ? ` · ${f[r]!.phone}` : ' · no number yet'}`);
  return { fields: f, understood, missing: order.filter((r) => !f[r]) };
}
