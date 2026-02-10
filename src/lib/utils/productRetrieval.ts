// Product retrieval engine for AI recommendations
// Matches products from catalog based on user profile, concerns, and preferences

import { productData } from '../../mocks/products';
import type { Product } from '../../types/product';

export interface UserSkinProfile {
  skinType?: string;
  concerns?: string[];
  goals?: string[];
  sensitivities?: string[];
  preferences?: {
    crueltyFree?: boolean;
    vegan?: boolean;
    fragranceFree?: boolean;
    budgetRange?: 'budget' | 'mid' | 'premium';
  };
}

export interface RetrievedProduct extends Product {
  relevanceScore: number;
  matchReasons: string[];
}

export interface RetrievalResult {
  products: RetrievedProduct[];
  totalMatches: number;
  query: {
    skinType?: string;
    concerns?: string[];
    category?: string;
  };
}

// Price ranges for budget filtering
const BUDGET_RANGES = {
  budget: { min: 0, max: 30 },
  mid: { min: 25, max: 50 },
  premium: { min: 45, max: Infinity },
};

// Concern mappings to help with fuzzy matching
const CONCERN_MAPPINGS: Record<string, string[]> = {
  'acne': ['acne', 'breakouts', 'blemishes', 'pimples'],
  'aging': ['anti-aging', 'fine lines', 'wrinkles', 'mature'],
  'dark spots': ['dark spots', 'hyperpigmentation', 'brightening', 'uneven tone'],
  'dryness': ['hydration', 'dry', 'moisture', 'dehydration'],
  'oiliness': ['oil control', 'oily', 'sebum', 'shine'],
  'sensitivity': ['sensitivity', 'sensitive', 'redness', 'irritation', 'calm'],
  'pores': ['pores', 'texture', 'enlarged pores'],
  'dullness': ['dullness', 'brightening', 'radiance', 'glow'],
};

/**
 * Calculate relevance score for a product based on user profile
 */
function calculateRelevanceScore(
  product: Product,
  profile: UserSkinProfile,
  category?: string
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Category match (highest priority if specified)
  if (category && product.category.toLowerCase() === category.toLowerCase()) {
    score += 30;
    reasons.push(`Matches requested category: ${category}`);
  }

  // Skin type match
  if (profile.skinType) {
    const skinTypeMatch = product.skinTypes?.some(
      (st) => st.toLowerCase() === profile.skinType?.toLowerCase() || st === 'all'
    );
    if (skinTypeMatch) {
      score += 25;
      reasons.push(`Suitable for ${profile.skinType} skin`);
    }
  }

  // Concern matching
  if (profile.concerns && profile.concerns.length > 0) {
    const matchedConcerns: string[] = [];
    profile.concerns.forEach((userConcern) => {
      const normalizedConcern = userConcern.toLowerCase();
      const relatedTerms = CONCERN_MAPPINGS[normalizedConcern] || [normalizedConcern];

      const concernMatch = product.concerns?.some((pc) =>
        relatedTerms.some((term) => pc.toLowerCase().includes(term))
      );

      if (concernMatch) {
        matchedConcerns.push(userConcern);
        score += 20;
      }
    });
    if (matchedConcerns.length > 0) {
      reasons.push(`Addresses concerns: ${matchedConcerns.join(', ')}`);
    }
  }

  // Preference matching
  if (profile.preferences) {
    if (profile.preferences.crueltyFree && product.preferences?.crueltyFree) {
      score += 10;
      reasons.push('Cruelty-free');
    }
    if (profile.preferences.vegan && product.preferences?.vegan) {
      score += 10;
      reasons.push('Vegan');
    }
    if (profile.preferences.fragranceFree && product.preferences?.fragranceFree) {
      score += 10;
      reasons.push('Fragrance-free');
    }

    // Budget range
    if (profile.preferences.budgetRange) {
      const range = BUDGET_RANGES[profile.preferences.budgetRange];
      if (product.price >= range.min && product.price <= range.max) {
        score += 15;
        reasons.push(`Within ${profile.preferences.budgetRange} budget`);
      }
    }
  }

  // Boost for high ratings
  if (product.rating >= 4.8) {
    score += 10;
    reasons.push('Highly rated');
  } else if (product.rating >= 4.5) {
    score += 5;
  }

  // Boost for in-stock items
  if (product.inStock) {
    score += 5;
  }

  return { score, reasons };
}

/**
 * Retrieve products matching user profile and optional filters
 */
export function retrieveProducts(
  profile: UserSkinProfile,
  options?: {
    category?: string;
    limit?: number;
    minScore?: number;
  }
): RetrievalResult {
  const { category, limit = 4, minScore = 10 } = options || {};

  // Score all products
  const scoredProducts: RetrievedProduct[] = productData
    .map((product) => {
      const { score, reasons } = calculateRelevanceScore(product, profile, category);
      return {
        ...product,
        relevanceScore: score,
        matchReasons: reasons,
      };
    })
    .filter((p) => p.relevanceScore >= minScore)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    products: scoredProducts.slice(0, limit),
    totalMatches: scoredProducts.length,
    query: {
      skinType: profile.skinType,
      concerns: profile.concerns,
      category,
    },
  };
}

/**
 * Retrieve products by specific category
 */
export function retrieveByCategory(
  category: string,
  profile: UserSkinProfile,
  limit = 3
): RetrievedProduct[] {
  return retrieveProducts(profile, { category, limit }).products;
}

/**
 * Retrieve products for a complete routine
 */
export function retrieveRoutineProducts(
  profile: UserSkinProfile
): Record<string, RetrievedProduct[]> {
  const routineCategories = ['cleanser', 'serum', 'moisturizer', 'sunscreen'];
  const routine: Record<string, RetrievedProduct[]> = {};

  routineCategories.forEach((category) => {
    routine[category] = retrieveByCategory(category, profile, 2);
  });

  return routine;
}

/**
 * Search products by ingredient
 */
export function searchByIngredient(
  ingredient: string,
  profile?: UserSkinProfile,
  limit = 4
): RetrievedProduct[] {
  const normalizedIngredient = ingredient.toLowerCase();

  const matchingProducts = productData.filter((product) =>
    product.keyIngredients?.some((ing) =>
      ing.toLowerCase().includes(normalizedIngredient)
    ) ||
    product.activeIngredients?.some((ing) =>
      ing.name.toLowerCase().includes(normalizedIngredient)
    )
  );

  if (profile) {
    // Score and sort by relevance to profile
    return matchingProducts
      .map((product) => {
        const { score, reasons } = calculateRelevanceScore(product, profile);
        reasons.unshift(`Contains ${ingredient}`);
        return {
          ...product,
          relevanceScore: score + 20, // Boost for ingredient match
          matchReasons: reasons,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  return matchingProducts.slice(0, limit).map((product) => ({
    ...product,
    relevanceScore: 50,
    matchReasons: [`Contains ${ingredient}`],
  }));
}

/**
 * Format product for AI response
 */
export function formatProductForResponse(product: RetrievedProduct): string {
  const priceStr = `$${product.price.toFixed(2)}`;
  const ratingStr = `${product.rating}/5 (${product.reviewCount.toLocaleString()} reviews)`;

  let response = `**${product.brand}** - ${product.name}\n`;
  response += `- Category: ${product.category}\n`;
  response += `- Price: ${priceStr}\n`;
  response += `- Rating: ${ratingStr}\n`;
  response += `- Key ingredients: ${product.keyIngredients?.join(', ')}\n`;
  response += `- Why it fits: ${product.matchReasons.join('; ')}\n`;
  response += `- Where to buy: Available on Lorem Curae Marketplace (/marketplace/product/${product.id})`;

  return response;
}

/**
 * Format multiple products as a recommendation list
 */
export function formatRecommendations(
  products: RetrievedProduct[],
  context?: string
): string {
  if (products.length === 0) {
    return "I couldn't find products matching your specific criteria. Let me know your skin type and concerns, and I'll find the best options for you.";
  }

  let response = context ? `${context}\n\n` : '';

  products.forEach((product, index) => {
    const label = index === 0 ? '**Best Match**' :
                  index === 1 ? '**Alternative Option**' :
                  '**Budget-Friendly Option**';
    response += `${label}\n${formatProductForResponse(product)}\n\n`;
  });

  return response.trim();
}
