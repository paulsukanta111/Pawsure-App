/** Sample data for P1 (graded day cares) and P2 (verified carers) previews. Not live in the pilot. */

export interface DayCare {
  id: string; name: string; grade: 'A' | 'B' | 'C'; score: number; distance: string; price: number;
  freeRoamHours: number; crateHours: number; staffRatio: string; lastAudit: string; certificateUntil: string;
  registration: 'Verified' | 'Declared' | 'Not applicable' | 'Unknown';
  categories: { name: string; points: number; max: number }[];
}

export const DAY_CARES: DayCare[] = [
  {
    id: 'dc-paws', name: 'Happy Paws Powai', grade: 'A', score: 88, distance: '1.2 km', price: 700, freeRoamHours: 5, crateHours: 1,
    staffRatio: '1 staff : 6 dogs', lastAudit: '12 Oct 2026', certificateUntil: '12 Jan 2027', registration: 'Verified',
    categories: [
      { name: 'Safety and premises', points: 18, max: 20 }, { name: 'Health', points: 13, max: 15 }, { name: 'Staff', points: 13, max: 15 },
      { name: 'Space, play and rest', points: 13, max: 15 }, { name: 'Hygiene', points: 13, max: 15 }, { name: 'Transparency', points: 9, max: 10 },
      { name: 'Owner experience', points: 9, max: 10 },
    ],
  },
  {
    id: 'dc-tails', name: 'Tails & Trails Andheri', grade: 'B', score: 76, distance: '3.4 km', price: 600, freeRoamHours: 4, crateHours: 2,
    staffRatio: '1 staff : 8 dogs', lastAudit: '28 Sep 2026', certificateUntil: '28 Dec 2026', registration: 'Declared',
    categories: [
      { name: 'Safety and premises', points: 16, max: 20 }, { name: 'Health', points: 12, max: 15 }, { name: 'Staff', points: 11, max: 15 },
      { name: 'Space, play and rest', points: 11, max: 15 }, { name: 'Hygiene', points: 12, max: 15 }, { name: 'Transparency', points: 7, max: 10 },
      { name: 'Owner experience', points: 7, max: 10 },
    ],
  },
];

export const RED_LINES = ['Vaccination check', 'Supervised dogs', 'No punishment', 'Water always available', 'Emergency vet tie-up', 'No escape risk', 'No overheating', 'Incidents recorded'];

export interface Carer { id: string; name: string; level: 'Verified' | 'Trained' | 'Trusted'; visits: number; confirmedShare: number; firstAid: boolean; price: number; distance: string }

export const CARERS: Carer[] = [
  { id: 'c-ravi', name: 'Ravi', level: 'Trusted', visits: 64, confirmedShare: 94, firstAid: true, price: 350, distance: 'Same society' },
  { id: 'c-asha', name: 'Asha', level: 'Trained', visits: 22, confirmedShare: 91, firstAid: true, price: 300, distance: '1 km' },
  { id: 'c-dev', name: 'Dev', level: 'Verified', visits: 4, confirmedShare: 100, firstAid: false, price: 280, distance: '2 km' },
];
