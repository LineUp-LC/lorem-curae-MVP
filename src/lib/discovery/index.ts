/**
 * Curated Discovery Engine — Public API
 */

// Types
export type {
  DiscoveryProfile,
  DiscoveryScore,
  MatchTier,
  ScoreFactor,
  ScoredDiscoveryProduct,
} from './types';

// Scoring engine
export {
  SCORING_WEIGHTS,
  MAX_SCORE,
  scoreProduct,
  rankProducts,
  hasProfileData,
} from './scoringEngine';

// Ingredient links
export type { ProductIngredientMap, IngredientOption } from './ingredientLinks';
export {
  deriveIngredientLinks,
  fetchIngredientLinks,
  filterByIngredientSlugs,
  buildIngredientOptions,
} from './ingredientLinks';
