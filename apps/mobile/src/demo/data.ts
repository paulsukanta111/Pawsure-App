/**
 * Demo household (Neha, Bruno, Sunita) used until the Supabase backend is wired.
 * Times are built relative to "today" in IST so the screens always look live.
 */
import { ist, istDateKey, type CheckInSignal, type FriendCandidate, type TaskType } from '@pawsure/domain';

const [y, m, d] = istDateKey(new Date()).split('-').map(Number) as [number, number, number];
export const today = (h: number, min = 0) => ist(y, m, d, h, min);

export const household = { name: "Neha's home", society: 'Hiranandani Gardens', tower: 'Tower B' };

export const pet = {
  name: 'Bruno',
  species: 'dog' as const,
  speciesLabel: 'Dog',
  weightKg: 12.4,
  weightSeries: [11.8, 11.9, 12.0, 11.9, 12.1, 12.3, 12.4],
  tags: ['Indoor', 'Neutered', 'Microchipped'],
  about: 'Playful and curious. Loves the evening walk and anyone with treats.',
  breed: 'Indie',
  age: '4 years',
  food: '1 cup kibble at 1 pm, fresh water',
  allergies: 'Chicken',
  medicines: 'Joint supplement, 1 tablet with lunch',
  fears: 'Scared of fireworks; pulls on the leash near the gate',
  vet: { name: 'Dr. Kulkarni, Powai Pet Clinic', phone: '+91 98200 00000' },
  clinic24x7: 'Mumbai Vet 24x7, Andheri East',
  backup: { name: 'Amit (husband)', phone: '+91 98200 11111' },
};

export const owner = { name: 'Neha' };

export const health = [
  { id: 'h1', icon: 'vaccine' as const, title: 'Vaccination', subtitle: 'Rabies booster', dueInDays: 5 },
  { id: 'h2', icon: 'medication' as const, title: 'Deworming', subtitle: 'Quarterly tablet', dueInDays: 0 },
  { id: 'h3', icon: 'calendar' as const, title: 'Vet check-up', subtitle: 'Annual check-up', dueInDays: 38 },
];

export const helper = { name: 'Sunita', method: 'WhatsApp photo' as const, language: 'Marathi' };

export interface DemoTask {
  id: string;
  title: string;
  type: TaskType;
  dueAt: Date;
  signals: CheckInSignal[];
}

export const todaysCode = '4821';

export const tasks: DemoTask[] = [
  {
    id: 't-lunch',
    title: 'Lunch + water',
    type: 'feeding',
    dueAt: today(13, 0),
    signals: [
      { id: 's1', type: 'arrival_call', at: today(13, 4), fromRegisteredNumber: true },
      { id: 's2', type: 'whatsapp_photo', at: today(13, 9), code: todaysCode, imageHash: 'img-1' },
      { id: 's3', type: 'exit_call', at: today(13, 22), fromRegisteredNumber: true },
    ],
  },
  {
    id: 't-med',
    title: 'Joint supplement',
    type: 'medicine',
    dueAt: today(13, 0),
    signals: [{ id: 's4', type: 'voice_note', at: today(13, 12), namesTask: true }],
  },
  {
    id: 't-walk',
    title: 'Afternoon walk',
    type: 'walk',
    dueAt: today(16, 0),
    signals: [],
  },
  {
    id: 't-pad',
    title: 'Change toilet pad',
    type: 'toilet_pad',
    dueAt: today(18, 30),
    signals: [],
  },
];

const always = [{ start: today(0, 0), end: today(23, 59) }];

export const friends: FriendCandidate[] = [
  {
    id: 'f-priya', displayName: 'Priya', discoveryOptIn: true, paused: false, blockedWithOwner: false,
    availability: [{ start: today(15, 0), end: today(20, 0) }],
    capabilities: new Set(['feeding_water', 'short_walk']), distanceBand: 'same_tower', distanceLabel: 'Same tower',
    keyStatus: 'has_key', openRequests: 0, maxOpenRequests: 2, pastHelps: 3, medianResponseMinutes: 6,
  },
  {
    id: 'f-arjun', displayName: 'Arjun', discoveryOptIn: true, paused: false, blockedWithOwner: false,
    availability: always, capabilities: new Set(['feeding_water', 'short_walk', 'large_anxious_dog']),
    distanceBand: 'same_society', distanceLabel: 'About 2 min away', keyStatus: 'needs_handover',
    openRequests: 0, maxOpenRequests: 2, pastHelps: 1, medianResponseMinutes: 12,
  },
  {
    id: 'f-meera', displayName: 'Meera', discoveryOptIn: true, paused: false, blockedWithOwner: false,
    availability: always, capabilities: new Set(['feeding_water', 'short_walk', 'medicine']),
    distanceBand: 'same_society', distanceLabel: 'About 4 min away', keyStatus: 'no_key',
    openRequests: 0, maxOpenRequests: 2,
  },
  {
    id: 'f-kabir', displayName: 'Kabir', discoveryOptIn: true, paused: true, blockedWithOwner: false,
    availability: always, capabilities: new Set(['feeding_water']), distanceBand: 'same_tower', distanceLabel: 'Same tower',
    keyStatus: 'no_key', openRequests: 0, maxOpenRequests: 2,
  },
];
