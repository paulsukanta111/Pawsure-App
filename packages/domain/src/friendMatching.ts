/**
 * Friend Finder matching (9.2, PS-057, PS-058, PS-065, PS-066).
 * Stage 2: deterministic eligibility filter. Stage 3: nearest-first, explainable ranking.
 * The LLM never decides who is eligible or how they rank; it only parses the request.
 * Thank-you points, paid placement and sensitive attributes are never ranking inputs.
 */
import type { TaskType } from './types';

export type Capability = 'feeding_water' | 'short_walk' | 'medicine' | 'large_anxious_dog';
export type DistanceBand = 'same_tower' | 'same_society' | 'nearby';
export type KeyStatus = 'has_key' | 'needs_handover' | 'no_key';

export interface TimeWindow { start: Date; end: Date }

export interface FriendCandidate {
  id: string;
  displayName: string;
  discoveryOptIn: boolean;
  paused: boolean;
  blockedWithOwner: boolean;
  availability: TimeWindow[];
  capabilities: ReadonlySet<Capability>;
  distanceBand: DistanceBand;
  /** Coarse label shown to the owner, e.g. "same tower", "about 2 min away". Never an exact pin. */
  distanceLabel: string;
  keyStatus: KeyStatus;
  openRequests: number;
  maxOpenRequests: number;
  /** Consented history (PS-069); undefined if the friend has not opted in to show it. */
  pastHelps?: number;
  medianResponseMinutes?: number;
}

export interface CoverRequest {
  taskTypes: TaskType[];
  window: TimeWindow;
  needsKey: boolean;
  largeOrAnxiousDog: boolean;
}

export type ExclusionReason =
  | 'not_opted_in' | 'paused' | 'blocked' | 'unavailable' | 'over_capacity' | `missing_capability:${Capability}`;

export interface RankedMatch {
  friend: FriendCandidate;
  score: number;
  reasons: string[];
}

export interface MatchResult {
  ranked: RankedMatch[];
  excluded: { friendId: string; reasons: ExclusionReason[] }[];
}

export interface RankWeights {
  distance: Record<DistanceBand, number>;
  keyReady: number;
  fastResponder: number;
  pastHelpEach: number;
  pastHelpCap: number;
}

/** Visible to product/ops and configurable (9.2 stage 3). Distance dominates: nearest first. */
export const DEFAULT_RANK_WEIGHTS: RankWeights = {
  distance: { same_tower: 100, same_society: 60, nearby: 20 },
  keyReady: 15,
  fastResponder: 5,
  pastHelpEach: 1,
  pastHelpCap: 5,
};

export function requiredCapabilities(req: CoverRequest): Capability[] {
  const caps = new Set<Capability>();
  for (const t of req.taskTypes) {
    if (t === 'feeding' || t === 'water') caps.add('feeding_water');
    if (t === 'walk') caps.add('short_walk');
    if (t === 'medicine') caps.add('medicine');
  }
  if (req.largeOrAnxiousDog) caps.add('large_anxious_dog');
  return [...caps];
}

const covers = (w: TimeWindow, need: TimeWindow) => w.start <= need.start && w.end >= need.end;

export function eligibilityExclusions(f: FriendCandidate, req: CoverRequest): ExclusionReason[] {
  const out: ExclusionReason[] = [];
  if (!f.discoveryOptIn) out.push('not_opted_in');
  if (f.paused) out.push('paused');
  if (f.blockedWithOwner) out.push('blocked');
  if (!f.availability.some((w) => covers(w, req.window))) out.push('unavailable');
  if (f.openRequests >= f.maxOpenRequests) out.push('over_capacity');
  for (const c of requiredCapabilities(req)) if (!f.capabilities.has(c)) out.push(`missing_capability:${c}`);
  return out;
}

export function matchFriends(
  friends: FriendCandidate[],
  req: CoverRequest,
  weights = DEFAULT_RANK_WEIGHTS,
  limit = 3,
): MatchResult {
  const excluded: MatchResult['excluded'] = [];
  const ranked: RankedMatch[] = [];
  for (const f of friends) {
    const ex = eligibilityExclusions(f, req);
    if (ex.length) {
      excluded.push({ friendId: f.id, reasons: ex });
      continue;
    }
    const reasons = ['Free at that time', f.distanceLabel];
    let score = weights.distance[f.distanceBand];
    if (req.needsKey && f.keyStatus === 'has_key') {
      score += weights.keyReady;
      reasons.push('Has a key');
    } else if (req.needsKey && f.keyStatus === 'needs_handover') {
      reasons.push('Needs key handover');
    }
    const caps = requiredCapabilities(req);
    if (caps.length) reasons.push(`Comfortable with ${caps.map(capLabel).join(', ')}`);
    if (f.medianResponseMinutes !== undefined && f.medianResponseMinutes <= 15) {
      score += weights.fastResponder;
      reasons.push(`Usually replies in ~${Math.round(f.medianResponseMinutes)} min`);
    }
    if (f.pastHelps) {
      score += Math.min(f.pastHelps * weights.pastHelpEach, weights.pastHelpCap);
      reasons.push(`Helped ${f.pastHelps} time${f.pastHelps === 1 ? '' : 's'} before`);
    }
    ranked.push({ friend: f, score, reasons });
  }
  // Deterministic order: score, then id, so equal candidates never shuffle between runs.
  ranked.sort((a, b) => b.score - a.score || a.friend.id.localeCompare(b.friend.id));
  return { ranked: ranked.slice(0, limit), excluded };
}

function capLabel(c: Capability): string {
  return { feeding_water: 'feeding', short_walk: 'walks', medicine: 'medicine', large_anxious_dog: 'large/anxious dogs' }[c];
}
