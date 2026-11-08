// Conversational onboarding parser (v3; PS-002, PS-003, PS-004, PS-005).
import { describe, expect, it } from 'vitest';
import { formatPhone, parseCare, parseOwnerName, parsePeople, parsePet, parseVet, parseYesNo } from '../src/onboardingParser';

describe('parseOwnerName', () => {
  it('takes the name out of a sentence', () => {
    expect(parseOwnerName("Hi, I'm Neha")).toBe('Neha');
    expect(parseOwnerName('my name is neha sharma')).toBe('Neha Sharma');
    expect(parseOwnerName('Neha')).toBe('Neha');
  });
  it('returns null when there is no name', () => {
    expect(parseOwnerName('   ')).toBeNull();
    expect(parseOwnerName('123')).toBeNull();
  });
});

describe('parsePet', () => {
  it('reads a full description', () => {
    const r = parsePet('Bruno, a 4 year old indie dog, about 12 kg. He is allergic to chicken.');
    expect(r.fields).toMatchObject({ name: 'Bruno', species: 'dog', breed: 'Indie', age: '4 years', weightKg: 12, allergies: 'Chicken' });
    expect(r.missing).toEqual([]);
  });
  it('reads "her name is" and kittens in months', () => {
    expect(parsePet('her name is mochi, 8 months old kitten').fields).toMatchObject({ name: 'Mochi', species: 'cat', age: '8 months' });
  });
  it('a one-word answer is the name; species is then missing, not guessed', () => {
    const r = parsePet('bruno');
    expect(r.fields.name).toBe('Bruno');
    expect(r.fields.species).toBeUndefined();
    expect(r.missing).toContain('species');
  });
  it('does not take common words as the name', () => {
    expect(parsePet('He is a 3 year old Labrador dog').fields.name).toBeUndefined();
  });
});

describe('parseCare', () => {
  it('splits food from medicines', () => {
    const r = parseCare('1 cup kibble at 1 pm and dinner at 8. He takes a joint supplement, 1 tablet with lunch.');
    expect(r.fields.food).toMatch(/^1 cup kibble at 1 pm/);
    expect(r.fields.medicines).toMatch(/supplement/i);
  });
  it('understands "no medicines"', () => {
    expect(parseCare('Rice and curd twice a day. No medicines.').fields).toMatchObject({ medicines: 'None' });
  });
});

describe('parseVet', () => {
  it('reads name and phone', () => {
    const r = parseVet('Dr Kulkarni at Powai Pet Clinic, 98200 00000');
    expect(r.fields.phone).toBe('+91 98200 00000');
    expect(r.fields.name).toMatch(/^Dr\. Kulkarni at Powai Pet Clinic$/);
  });
  it('flags a missing number instead of guessing', () => {
    expect(parseVet('Dr Mehta').missing).toEqual(['phone']);
  });
});

describe('parsePeople', () => {
  it('assigns roles from words like helper and backup', () => {
    const r = parsePeople('My helper Sunita 98200 33333 and my husband Amit +91 98200 11111 is the backup');
    expect(r.fields.helper).toEqual({ name: 'Sunita', phone: '+91 98200 33333' });
    expect(r.fields.backup).toEqual({ name: 'Amit', phone: '+91 98200 11111' });
  });
  it('splits at each number so role words stay with their person', () => {
    const r = parsePeople('My helper Lata 98200 33333 and backup Rohan 98200 11111');
    expect(r.fields.helper).toEqual({ name: 'Lata', phone: '+91 98200 33333' });
    expect(r.fields.backup).toEqual({ name: 'Rohan', phone: '+91 98200 11111' });
  });
  it('without role words, first is helper then backup', () => {
    const r = parsePeople('Sunita 9820033333, Amit 9820011111');
    expect(r.fields.helper?.name).toBe('Sunita');
    expect(r.fields.backup?.name).toBe('Amit');
  });
  it('keeps a person without a number but says so', () => {
    expect(parsePeople('Helper is Sunita').understood[0]).toBe('Helper: Sunita · no number yet');
  });
});

describe('yes/no and phones', () => {
  it('understands English, Hindi and Marathi', () => {
    expect(parseYesNo('Looks good')).toBe('yes');
    expect(parseYesNo('haan')).toBe('yes');
    expect(parseYesNo('हो')).toBe('yes');
    expect(parseYesNo('not now')).toBe('no');
    expect(parseYesNo('maybe tomorrow?')).toBeNull();
  });
  it('rejects numbers that are not Indian mobiles', () => {
    expect(formatPhone('12345')).toBeNull();
    expect(formatPhone('+91-98200-12345')).toBe('+91 98200 12345');
  });
});
