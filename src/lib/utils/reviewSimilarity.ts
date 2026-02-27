// Shared Similarity Weight scoring for review matching
// Canonical implementation — all review surfaces must use this function (12.15)

import { matchesConcern } from './matching';

/** Ordered Fitzpatrick complexion tiers — canonical reference for ±1 tier matching */
export const COMPLEXION_TIERS = [
  'Type I - Very Fair',
  'Type II - Fair',
  'Type III - Medium',
  'Type IV - Olive',
  'Type V - Brown',
  'Type VI - Dark Brown/Black',
];

/**
 * Check if two complexion values are within ±1 tier.
 * Returns 'exact' | 'close' | 'none'.
 */
export function isComplexionMatch(a: string, b: string): 'exact' | 'close' | 'none' {
  if (!a || !b) return 'none';
  const idxA = COMPLEXION_TIERS.findIndex(t => t.toLowerCase() === a.toLowerCase());
  const idxB = COMPLEXION_TIERS.findIndex(t => t.toLowerCase() === b.toLowerCase());
  if (idxA === -1 || idxB === -1) return 'none';
  const diff = Math.abs(idxA - idxB);
  if (diff === 0) return 'exact';
  if (diff === 1) return 'close';
  return 'none';
}

export type MatchTier = 'full' | 'strong' | 'partial' | 'related' | 'none';

export interface SimilarityResult {
  score: number;
  matchTier: MatchTier;
  matchDetails: string[];
}

export interface ReviewProfile {
  skinType: string;
  skinConcerns: string[];
  complexion?: string;
  sensitivity?: string;
  lifestyle?: string[];
  age: number;
}

export interface UserProfile {
  skinType: string;
  primaryConcerns: string[];
  complexion: string;
  sensitivity: string;
  lifestyle: string[];
  age: number;
}

/**
 * Calculate Similarity Weight between a reviewer's profile and the user's profile.
 * Returns a 0–100% score, match tier, and detail chips.
 *
 * Weights:
 *   Skin Type Match     +40  (binary)
 *   Concern Match       +15  (per matching concern, synonym-aware)
 *   Complexion Match    +10  (within ±1 Fitzpatrick tier)
 *   Sensitivity Match   +10  (binary)
 *   Lifestyle Match      +5  (binary — any overlap)
 *   Age Range Match      +5  (binary — within 5 years)
 *
 * Tiers:  ≥70 Full  |  ≥50 Strong  |  ≥30 Partial  |  ≥15 Related  |  <15 None
 */
export function calculateSimilarityWeight(
  review: ReviewProfile,
  user: UserProfile,
): SimilarityResult {
  let score = 0;
  const matchDetails: string[] = [];

  // 1. Skin Type Match (+40)
  if (review.skinType.toLowerCase() === user.skinType.toLowerCase()) {
    score += 40;
    matchDetails.push('Skin type');
  }

  // 2. Concern Match (+15 per concern) — synonym-aware
  let concernMatchCount = 0;
  review.skinConcerns.forEach(rc => {
    if (matchesConcern(rc, user.primaryConcerns)) concernMatchCount++;
  });
  score += concernMatchCount * 15;
  if (concernMatchCount > 0) {
    matchDetails.push(`${concernMatchCount} concern${concernMatchCount > 1 ? 's' : ''}`);
  }

  // 3. Complexion Match (+10) — within ±1 Fitzpatrick tier
  const complexionResult = isComplexionMatch(review.complexion || '', user.complexion);
  if (complexionResult !== 'none') {
    score += 10;
    matchDetails.push(complexionResult === 'exact' ? 'Complexion' : 'Close complexion');
  }

  // 4. Sensitivity Match (+10)
  if (review.sensitivity && user.sensitivity && review.sensitivity === user.sensitivity) {
    score += 10;
    matchDetails.push('Sensitivity');
  }

  // 5. Lifestyle Match (+5) — binary (any overlap)
  if (review.lifestyle && user.lifestyle.length > 0) {
    if (review.lifestyle.some(l => user.lifestyle.includes(l))) {
      score += 5;
      matchDetails.push('Lifestyle');
    }
  }

  // 6. Age Range Match (+5) — within 5 years
  if (Math.abs(review.age - user.age) <= 5) {
    score += 5;
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Derive tier from score
  let matchTier: MatchTier = 'none';
  if (score >= 70) matchTier = 'full';
  else if (score >= 50) matchTier = 'strong';
  else if (score >= 30) matchTier = 'partial';
  else if (score >= 15) matchTier = 'related';

  return { score, matchTier, matchDetails };
}

/** Format a tier badge label with percentage */
export function getTierBadgeInfo(tier: MatchTier, score: number) {
  const pct = `${Math.min(score, 100)}%`;
  switch (tier) {
    case 'full': return { label: `Full Match · ${pct}`, color: 'bg-light/30 text-primary-700 border border-primary-300 font-medium', icon: 'ri-user-heart-fill' };
    case 'strong': return { label: `Strong Match · ${pct}`, color: 'bg-taupe-100 text-taupe-800', icon: 'ri-user-heart-line' };
    case 'partial': return { label: `Partial Match · ${pct}`, color: 'bg-taupe-100 text-taupe-800', icon: 'ri-user-line' };
    case 'related': return { label: `Related · ${pct}`, color: 'bg-gray-100 text-gray-700', icon: 'ri-user-shared-line' };
    default: return null;
  }
}
