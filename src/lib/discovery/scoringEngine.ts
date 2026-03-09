/**
 * Curated Discovery Engine — Scoring Engine
 *
 * Deterministic, auditable multi-factor scoring for product-profile matching.
 * All weights are constants. All functions are pure (no side effects, no randomness).
 * Given the same product and profile, the score is always identical.
 *
 * Scoring factors (max 100):
 *   Skin type match:       0 or 25  (binary)
 *   Concern overlap:       0–30     (10 per match, max 3)
 *   Ingredient relevance:  0–25     (5 per beneficial ingredient, max 5)
 *   Preference alignment:  0–15     (5 per match, max 3)
 *   Rating quality:        0–5      (proportional to rating/5)
 */

import type { Product } from '../../types/product';
import type {
  DiscoveryProfile,
  DiscoveryScore,
  MatchTier,
  ScoreFactor,
  ScoredDiscoveryProduct,
} from './types';
import { matchesConcern, matchesIngredient } from '../utils/matching';
import { isSkinTypeMatch, normalizeSkinTypes } from '../utils/productMetadata';

// ---------------------------------------------------------------------------
// Auditable scoring weights
// ---------------------------------------------------------------------------

export const SCORING_WEIGHTS = {
  /** Binary: product skinTypes includes user's skin type */
  SKIN_TYPE: 25,
  /** Per matching concern (capped at CONCERN_MAX) */
  CONCERN_PER: 10,
  CONCERN_MAX: 30,
  /** Per beneficial ingredient for user concerns (capped at INGREDIENT_MAX) */
  INGREDIENT_PER: 5,
  INGREDIENT_MAX: 25,
  /** Per matching preference (capped at PREFERENCE_MAX) */
  PREFERENCE_PER: 5,
  PREFERENCE_MAX: 15,
  /** Rating quality — proportional to rating / 5 */
  RATING_MAX: 5,
} as const;

/** Total maximum score: 25 + 30 + 25 + 15 + 5 = 100 */
export const MAX_SCORE =
  SCORING_WEIGHTS.SKIN_TYPE +
  SCORING_WEIGHTS.CONCERN_MAX +
  SCORING_WEIGHTS.INGREDIENT_MAX +
  SCORING_WEIGHTS.PREFERENCE_MAX +
  SCORING_WEIGHTS.RATING_MAX;

// ---------------------------------------------------------------------------
// Preference display labels (camelCase key → user-facing label)
// ---------------------------------------------------------------------------

const PREF_DISPLAY: Record<string, string> = {
  vegan: 'Vegan',
  crueltyFree: 'Cruelty-Free',
  fragranceFree: 'Fragrance-Free',
  glutenFree: 'Gluten-Free',
  alcoholFree: 'Alcohol-Free',
  siliconeFree: 'Silicone-Free',
  plantBased: 'Plant-Based',
  chemicalFree: 'Chemical-Free',
};

// ---------------------------------------------------------------------------
// Tier classification
// ---------------------------------------------------------------------------

function getTier(score: number): MatchTier {
  if (score >= 70) return 'excellent';
  if (score >= 50) return 'great';
  if (score >= 25) return 'good';
  return 'fair';
}

// ---------------------------------------------------------------------------
// Core scoring function
// ---------------------------------------------------------------------------

/**
 * Score a single product against a user profile.
 * Pure function — deterministic, no side effects.
 */
export function scoreProduct(
  product: Product,
  profile: DiscoveryProfile,
): DiscoveryScore {
  const factors: ScoreFactor[] = [];

  // 1. Skin type match (binary: 0 or 25)
  let skinPoints = 0;
  let skinLabel = '';
  if (profile.skinType && product.skinTypes) {
    const normalized = normalizeSkinTypes(product.skinTypes);
    const matches = normalized.some(st => isSkinTypeMatch(st, profile.skinType));
    if (matches) {
      skinPoints = SCORING_WEIGHTS.SKIN_TYPE;
      skinLabel = `Suits your ${profile.skinType} skin`;
    }
  }
  factors.push({
    key: 'skin-type',
    label: skinLabel || 'Skin type not matched',
    points: skinPoints,
    maxPoints: SCORING_WEIGHTS.SKIN_TYPE,
  });

  // 2. Concern overlap (10 per match, capped at 30)
  let concernPoints = 0;
  const matchedConcernLabels: string[] = [];
  if (profile.concerns.length > 0 && product.concerns) {
    for (const pc of product.concerns) {
      if (matchesConcern(pc, profile.concerns)) {
        concernPoints = Math.min(
          concernPoints + SCORING_WEIGHTS.CONCERN_PER,
          SCORING_WEIGHTS.CONCERN_MAX,
        );
        matchedConcernLabels.push(pc);
      }
    }
  }
  factors.push({
    key: 'concerns',
    label:
      matchedConcernLabels.length > 0
        ? `Addresses ${matchedConcernLabels.slice(0, 3).join(', ')}`
        : 'No matching concerns',
    points: concernPoints,
    maxPoints: SCORING_WEIGHTS.CONCERN_MAX,
  });

  // 3. Ingredient relevance (5 per beneficial ingredient, capped at 25)
  let ingredientPoints = 0;
  const beneficialIngredients: string[] = [];
  if (profile.concerns.length > 0 && product.keyIngredients) {
    for (const ing of product.keyIngredients) {
      if (matchesIngredient(ing, profile.concerns)) {
        ingredientPoints = Math.min(
          ingredientPoints + SCORING_WEIGHTS.INGREDIENT_PER,
          SCORING_WEIGHTS.INGREDIENT_MAX,
        );
        beneficialIngredients.push(ing);
      }
    }
  }
  factors.push({
    key: 'ingredients',
    label:
      beneficialIngredients.length > 0
        ? `Contains ${beneficialIngredients.slice(0, 3).join(', ')}`
        : 'No targeted ingredients identified',
    points: ingredientPoints,
    maxPoints: SCORING_WEIGHTS.INGREDIENT_MAX,
  });

  // 4. Preference alignment (5 per match, capped at 15)
  let preferencePoints = 0;
  const matchedPrefLabels: string[] = [];
  const activeUserPrefs = Object.entries(profile.preferences).filter(
    ([, v]) => v,
  );
  if (activeUserPrefs.length > 0 && product.preferences) {
    const productPrefs = product.preferences as Record<string, boolean>;
    for (const [key] of activeUserPrefs) {
      if (productPrefs[key]) {
        preferencePoints = Math.min(
          preferencePoints + SCORING_WEIGHTS.PREFERENCE_PER,
          SCORING_WEIGHTS.PREFERENCE_MAX,
        );
        matchedPrefLabels.push(PREF_DISPLAY[key] || key);
      }
    }
  }
  factors.push({
    key: 'preferences',
    label:
      matchedPrefLabels.length > 0
        ? `Matches: ${matchedPrefLabels.join(', ')}`
        : 'No preference data',
    points: preferencePoints,
    maxPoints: SCORING_WEIGHTS.PREFERENCE_MAX,
  });

  // 5. Rating quality (proportional: rating / 5 * 5, rounded)
  const ratingPoints = Math.round(
    (product.rating / 5) * SCORING_WEIGHTS.RATING_MAX,
  );
  factors.push({
    key: 'rating',
    label: `Rated ${product.rating}/5 (${product.reviewCount} reviews)`,
    points: ratingPoints,
    maxPoints: SCORING_WEIGHTS.RATING_MAX,
  });

  // Total and tier
  const total = factors.reduce((sum, f) => sum + f.points, 0);
  const tier = getTier(total);

  // Top reasons: factors with >0 points, sorted by contribution, top 3
  const topReasons = factors
    .filter(f => f.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map(f => f.label);

  return { total, tier, factors, topReasons };
}

// ---------------------------------------------------------------------------
// Batch ranking
// ---------------------------------------------------------------------------

/**
 * Score and rank all products for a user profile.
 * Returns products sorted by total score descending.
 */
export function rankProducts(
  products: Product[],
  profile: DiscoveryProfile,
): ScoredDiscoveryProduct[] {
  return products
    .map(product => ({ product, score: scoreProduct(product, profile) }))
    .sort((a, b) => b.score.total - a.score.total);
}

// ---------------------------------------------------------------------------
// Profile validation
// ---------------------------------------------------------------------------

/**
 * Check whether the profile has enough data for meaningful scoring.
 * If false, "Best Match" sort should degrade to rating sort.
 */
export function hasProfileData(profile: DiscoveryProfile): boolean {
  return !!(profile.skinType || profile.concerns.length > 0);
}
