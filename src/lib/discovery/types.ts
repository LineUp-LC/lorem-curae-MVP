/**
 * Curated Discovery Engine — Type Definitions
 *
 * Types for the deterministic, auditable product scoring system.
 * Used by scoringEngine.ts, ingredientLinks.ts, and consuming UI components.
 */

import type { Product } from '../../types/product';

/** User profile data used by the discovery scoring engine */
export interface DiscoveryProfile {
  skinType: string | undefined;
  concerns: string[];
  preferences: Record<string, boolean>;
}

/** A single scoring factor contributing to the total score */
export interface ScoreFactor {
  /** Machine-readable key */
  key: 'skin-type' | 'concerns' | 'ingredients' | 'preferences' | 'rating';
  /** Human-readable explanation */
  label: string;
  /** Points awarded (0 to maxPoints) */
  points: number;
  /** Maximum possible for this factor */
  maxPoints: number;
}

/** Match quality tier derived from total score */
export type MatchTier = 'excellent' | 'great' | 'good' | 'fair';

/** Complete discovery score for a product-profile pair */
export interface DiscoveryScore {
  /** Normalized total (0-100) */
  total: number;
  /** Quality tier */
  tier: MatchTier;
  /** Breakdown of all scoring factors */
  factors: ScoreFactor[];
  /** Top 3 human-readable match reasons (factors with >0 points, sorted by contribution) */
  topReasons: string[];
}

/** Product paired with its discovery score */
export interface ScoredDiscoveryProduct {
  product: Product;
  score: DiscoveryScore;
}
