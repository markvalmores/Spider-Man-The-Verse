import { TEKKEN_RANKS, TekkenRank, FighterId } from './FightingTypes';

export interface RankedProfile {
  rankTier: number;
  currentRP: number;
  wins: number;
  losses: number;
  winStreak: number;
  highestWinStreak: number;
  highestRankTier: number;
  preferredFighter: FighterId;
  totalDamageDealt: number;
  perfectRounds: number;
  rageArtFinishes: number;
  wallSplatsCount: number;
}

const STORAGE_KEY = 'tekken_spidey_ranked_profile_v1';

export function getRankedProfile(): RankedProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }

  return {
    rankTier: 1, // Beginner
    currentRP: 150,
    wins: 0,
    losses: 0,
    winStreak: 0,
    highestWinStreak: 0,
    highestRankTier: 1,
    preferredFighter: 'spiderman_peter',
    totalDamageDealt: 0,
    perfectRounds: 0,
    rageArtFinishes: 0,
    wallSplatsCount: 0,
  };
}

export function saveRankedProfile(profile: RankedProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore
  }
}

export function getRankByTier(tier: number): TekkenRank {
  const found = TEKKEN_RANKS.find((r) => r.tier === tier);
  return found || TEKKEN_RANKS[0];
}

export function getRankByRP(rp: number): TekkenRank {
  for (let i = TEKKEN_RANKS.length - 1; i >= 0; i--) {
    if (rp >= TEKKEN_RANKS[i].requiredRP) {
      return TEKKEN_RANKS[i];
    }
  }
  return TEKKEN_RANKS[0];
}

export function calculateMatchRP(
  playerTier: number,
  opponentTier: number,
  isVictory: boolean,
  winStreak: number,
  isPerfect: boolean
): { rpDelta: number; isPromotion: boolean; isDemotion: boolean } {
  const tierDiff = opponentTier - playerTier;
  let baseRP = 0;

  if (isVictory) {
    baseRP = 450 + Math.max(-100, Math.min(250, tierDiff * 60));
    // Win streak bonus in Tekken 8
    if (winStreak >= 3) baseRP += 150;
    if (winStreak >= 5) baseRP += 250;
    if (isPerfect) baseRP += 100;
  } else {
    // Losses at low ranks (Dan/Teal) have forgiving point loss
    if (playerTier <= 4) {
      baseRP = -50;
    } else if (playerTier <= 13) {
      baseRP = -280;
    } else {
      // Red/Ruler/Blue ranks
      baseRP = -420;
    }
  }

  const currentProfile = getRankedProfile();
  const nextRank = TEKKEN_RANKS.find((r) => r.tier === playerTier + 1);
  const currentRank = getRankByTier(playerTier);

  const newRP = Math.max(0, currentProfile.currentRP + baseRP);
  const isPromotion = nextRank ? newRP >= nextRank.requiredRP : false;
  const isDemotion = !isVictory && playerTier > 1 && newRP < currentRank.requiredRP - 200;

  return { rpDelta: baseRP, isPromotion, isDemotion };
}

export interface MatchLogEntry {
  id: string;
  timestamp: number;
  opponentName: string;
  opponentAvatar: string;
  opponentRank: string;
  isVictory: boolean;
  roundsWon: number;
  roundsLost: number;
  damageDealt: number;
  maxCombo: number;
  rpDelta: number;
  gameMode: string;
}

const MATCH_HISTORY_STORAGE_KEY = 'tekken_spidey_match_history_v1';

export function getMatchHistory(): MatchLogEntry[] {
  try {
    const raw = localStorage.getItem(MATCH_HISTORY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return [];
}

export function saveMatchToHistory(entry: Omit<MatchLogEntry, 'id' | 'timestamp'>): void {
  try {
    const history = getMatchHistory();
    const newEntry: MatchLogEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    // Keep last 3 matches played
    const updated = [newEntry, ...history].slice(0, 3);
    localStorage.setItem(MATCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}
