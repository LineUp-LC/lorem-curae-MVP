// Intelligent product similarity scoring and ingredient compatibility
// Used by SimilarProducts and CompatibleWith components on product detail pages

import { productData } from '../../mocks/products';
import type { Product } from '../../types/product';
import { matchesConcern, matchesIngredient } from './matching';
import { checkCompatibility } from '../ai/ingredientIntelligence';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface ScoredProduct extends Product {
  matchScore: number;
  matchReasons: string[];
}

export interface CompatibleProduct extends Product {
  compatibilityLevel: 'fully-compatible' | 'use-with-care';
  compatibilityReasons: string[];
  cautionNotes: string[];
  compatibilityScore: number;
}

// --------------------------------------------------------------------------
// Similar Products Scoring
// --------------------------------------------------------------------------

/**
 * Score and rank products by relevance to the current product + user profile.
 * Returns top `limit` products sorted by score (highest first).
 */
export function scoreSimilarProducts(
  currentProduct: Product,
  userConcerns: string[],
  userSkinType: string | undefined,
  userPreferences: Record<string, boolean>,
  limit = 4,
): ScoredProduct[] {
  const scored: ScoredProduct[] = [];

  for (const product of productData) {
    if (product.id === currentProduct.id) continue;

    let score = 0;
    const reasons: string[] = [];

    // 1. Category match — direct alternatives
    if (product.category === currentProduct.category) {
      score += 20;
      reasons.push(`Same category: ${product.category}`);
    }

    // 2. Shared concerns with current product
    if (product.concerns && currentProduct.concerns) {
      const shared = product.concerns.filter(pc =>
        currentProduct.concerns.some(
          cc => cc.toLowerCase() === pc.toLowerCase(),
        ),
      );
      if (shared.length > 0) {
        score += shared.length * 10;
        reasons.push(`Addresses: ${shared.join(', ')}`);
      }
    }

    // 3. User concern match (survey-aware via matchesConcern)
    if (userConcerns.length > 0 && product.concerns) {
      const matched = product.concerns.filter(pc =>
        matchesConcern(pc, userConcerns),
      );
      if (matched.length > 0) {
        score += matched.length * 12;
        reasons.push(`Matches your concerns`);
      }
    }

    // 4. User skin type match
    if (userSkinType && product.skinTypes) {
      const skinLower = userSkinType.toLowerCase();
      const matches = product.skinTypes.some(
        st => st.toLowerCase() === skinLower || st.toLowerCase() === 'all',
      );
      if (matches) {
        score += 15;
        reasons.push(`Suits ${userSkinType} skin`);
      }
    }

    // 5. Ingredient overlap with current product
    if (product.keyIngredients && currentProduct.keyIngredients) {
      const shared = product.keyIngredients.filter(pi =>
        currentProduct.keyIngredients.some(
          ci => ci.toLowerCase() === pi.toLowerCase(),
        ),
      );
      if (shared.length > 0) {
        score += shared.length * 8;
        reasons.push(`Shared ingredients: ${shared.join(', ')}`);
      }
    }

    // 6. User ingredient match (ingredients that address user concerns)
    if (userConcerns.length > 0 && product.keyIngredients) {
      const beneficial = product.keyIngredients.filter(ing =>
        matchesIngredient(ing, userConcerns),
      );
      if (beneficial.length > 0) {
        score += beneficial.length * 6;
      }
    }

    // 7. Preference match
    if (product.preferences) {
      const prefKeys = Object.keys(userPreferences).filter(
        k => userPreferences[k],
      );
      for (const key of prefKeys) {
        if ((product.preferences as Record<string, boolean>)[key]) {
          score += 6;
        }
      }
    }

    // 8. Rating boost
    if (product.rating >= 4.8) {
      score += 10;
      reasons.push('Highly rated');
    } else if (product.rating >= 4.5) {
      score += 5;
    }

    if (score > 0) {
      scored.push({ ...product, matchScore: score, matchReasons: reasons });
    }
  }

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}

// --------------------------------------------------------------------------
// Compatible Products (ingredient safety)
// --------------------------------------------------------------------------

/**
 * Find products from different categories that are ingredient-compatible
 * with the current product (safe to layer in a routine).
 * Ranked: fully compatible first, then use-with-care.
 * Products with avoid conflicts are excluded.
 */
export function findCompatibleProducts(
  currentProduct: Product,
  userConcerns: string[],
  userSkinType: string | undefined,
  limit = 8,
): CompatibleProduct[] {
  const currentIngredients = (currentProduct.keyIngredients || []).map(i =>
    i.toLowerCase(),
  );

  if (currentIngredients.length === 0) return [];

  const candidates: CompatibleProduct[] = [];

  for (const product of productData) {
    if (product.id === currentProduct.id) continue;
    // Prefer complementary categories (different from current)
    if (product.category === currentProduct.category) continue;

    const productIngredients = (product.keyIngredients || []).map(i =>
      i.toLowerCase(),
    );
    if (productIngredients.length === 0) continue;

    let safeCount = 0;
    let cautionCount = 0;
    let avoidCount = 0;
    const compatReasons: string[] = [];
    const cautionNotes: string[] = [];

    // Cross-check every ingredient pair
    for (const ci of currentIngredients) {
      for (const pi of productIngredients) {
        if (ci === pi) continue; // same ingredient, skip
        const result = checkCompatibility(ci, pi);
        if (result.level === 'avoid') {
          avoidCount++;
        } else if (result.level === 'caution') {
          cautionCount++;
          cautionNotes.push(result.reason);
          if (result.resolution) {
            cautionNotes.push(result.resolution);
          }
        } else {
          safeCount++;
          // Only add meaningful safe reasons (not generic "no known conflicts")
          if (!result.reason.includes('No known conflicts')) {
            compatReasons.push(result.reason);
          }
        }
      }
    }

    // Skip products with avoid conflicts — not compatible
    if (avoidCount > 0) continue;

    const level: 'fully-compatible' | 'use-with-care' =
      cautionCount === 0 ? 'fully-compatible' : 'use-with-care';

    const totalPairs = safeCount + cautionCount;
    const compatScore =
      totalPairs > 0 ? ((safeCount * 100) / totalPairs) : 100;

    // Boost score if product addresses user concerns
    let userBoost = 0;
    if (userConcerns.length > 0 && product.concerns) {
      const matched = product.concerns.filter(pc =>
        matchesConcern(pc, userConcerns),
      );
      userBoost = matched.length * 10;
    }

    // Boost if product suits user skin type
    if (userSkinType && product.skinTypes) {
      const skinLower = userSkinType.toLowerCase();
      if (
        product.skinTypes.some(
          st => st.toLowerCase() === skinLower || st.toLowerCase() === 'all',
        )
      ) {
        userBoost += 10;
      }
    }

    // Deduplicate reasons
    const uniqueReasons = [...new Set(compatReasons)].slice(0, 2);
    const uniqueCaution = [...new Set(cautionNotes)].slice(0, 2);

    // If no specific safe reasons, add a generic one
    if (uniqueReasons.length === 0) {
      const currentNames = currentProduct.keyIngredients.slice(0, 2).join(' & ');
      const productNames = product.keyIngredients.slice(0, 2).join(' & ');
      uniqueReasons.push(
        `${productNames} pairs safely with ${currentNames}`,
      );
    }

    candidates.push({
      ...product,
      compatibilityLevel: level,
      compatibilityReasons: uniqueReasons,
      cautionNotes: uniqueCaution,
      compatibilityScore: compatScore + userBoost,
    });
  }

  // Sort: fully-compatible first, then use-with-care, then by score
  candidates.sort((a, b) => {
    if (a.compatibilityLevel !== b.compatibilityLevel) {
      return a.compatibilityLevel === 'fully-compatible' ? -1 : 1;
    }
    return b.compatibilityScore - a.compatibilityScore;
  });

  return candidates.slice(0, limit);
}
