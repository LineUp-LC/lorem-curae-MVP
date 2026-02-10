/**
 * Retrieval Pipeline for Lorem Curae AI Engine
 *
 * Combines vector similarity search with attribute-based ranking
 * to find the most relevant products for a user's skin profile.
 */

import {
  generateSurveyEmbedding,
  generateQueryEmbedding,
  cosineSimilarity,
} from './embeddings';
import { vectorStore, type VectorDocument, type SearchResult } from './vectorStore';
import { initializeProductIngestion } from './productIngestion';

/**
 * User skin survey input
 */
export interface SkinSurvey {
  skinType?: string;
  concerns?: string[];
  sensitivities?: string[];
  goals?: string[];
  preferences?: {
    crueltyFree?: boolean;
    vegan?: boolean;
    fragranceFree?: boolean;
    alcoholFree?: boolean;
    budgetRange?: 'budget' | 'mid' | 'premium';
  };
}

/**
 * Source filter intent
 */
export type SourceIntent = 'marketplace-only' | 'discovery-only' | 'all';

/**
 * Retrieval query options
 */
export interface RetrievalOptions {
  category?: string;
  limit?: number;
  minSimilarity?: number;
  naturalLanguageQuery?: string;
  /** Filter products by source */
  sourceFilter?: SourceIntent;
}

/**
 * Product source type
 */
export type ProductSource = 'marketplace' | 'discovery';

/**
 * Ranked product result
 */
export interface RankedProduct {
  productId: number;
  brand: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  skinTypes: string[];
  concerns: string[];
  keyIngredients: string[];
  preferences: Record<string, boolean>;
  image: string;
  description: string;
  /** Where the product is available */
  source: ProductSource;
  /** URL to the product page */
  productUrl: string;
  /** @deprecated Use productUrl instead */
  marketplaceUrl: string;
  // Scoring
  similarityScore: number;
  attributeScore: number;
  finalScore: number;
  matchReasons: string[];
}

/**
 * Retrieval result
 */
export interface RetrievalResult {
  products: RankedProduct[];
  query: {
    skinType?: string;
    concerns?: string[];
    category?: string;
  };
  totalCandidates: number;
  processingTimeMs: number;
}

// Price ranges for budget filtering
const BUDGET_RANGES = {
  budget: { min: 0, max: 30 },
  mid: { min: 25, max: 50 },
  premium: { min: 45, max: Infinity },
};

/**
 * Calculate attribute-based score for ranking
 */
function calculateAttributeScore(
  doc: VectorDocument,
  survey: SkinSurvey
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const meta = doc.metadata;

  // Skin type match (25 points)
  if (survey.skinType) {
    const skinTypeMatch = meta.skinTypes?.some(
      (st: string) =>
        st.toLowerCase() === survey.skinType?.toLowerCase() || st === 'all'
    );
    if (skinTypeMatch) {
      score += 25;
      reasons.push(`Suitable for ${survey.skinType} skin`);
    }
  }

  // Concern match (20 points per concern, max 60)
  if (survey.concerns && survey.concerns.length > 0) {
    let concernScore = 0;
    const matchedConcerns: string[] = [];

    survey.concerns.forEach((userConcern) => {
      const concernMatch = meta.concerns?.some((pc: string) =>
        pc.toLowerCase().includes(userConcern.toLowerCase()) ||
        userConcern.toLowerCase().includes(pc.toLowerCase())
      );
      if (concernMatch) {
        concernScore += 20;
        matchedConcerns.push(userConcern);
      }
    });

    score += Math.min(concernScore, 60);
    if (matchedConcerns.length > 0) {
      reasons.push(`Addresses: ${matchedConcerns.join(', ')}`);
    }
  }

  // Preference matches (10 points each)
  if (survey.preferences) {
    if (survey.preferences.crueltyFree && meta.preferences?.crueltyFree) {
      score += 10;
      reasons.push('Cruelty-free');
    }
    if (survey.preferences.vegan && meta.preferences?.vegan) {
      score += 10;
      reasons.push('Vegan');
    }
    if (survey.preferences.fragranceFree && meta.preferences?.fragranceFree) {
      score += 10;
      reasons.push('Fragrance-free');
    }
    if (survey.preferences.alcoholFree && meta.preferences?.alcoholFree) {
      score += 10;
      reasons.push('Alcohol-free');
    }
  }

  // Sensitivity penalties (-30 points for each sensitivity violation)
  if (survey.sensitivities && survey.sensitivities.length > 0) {
    survey.sensitivities.forEach((sensitivity) => {
      const hasSensitivity = checkSensitivityViolation(meta, sensitivity);
      if (hasSensitivity) {
        score -= 30;
        reasons.push(`Warning: May contain ${sensitivity}`);
      }
    });
  }

  // Budget match (15 points)
  if (survey.preferences?.budgetRange) {
    const range = BUDGET_RANGES[survey.preferences.budgetRange];
    if (meta.price >= range.min && meta.price <= range.max) {
      score += 15;
      reasons.push(`Within ${survey.preferences.budgetRange} budget`);
    }
  }

  // Rating bonus (up to 10 points)
  if (meta.rating >= 4.8) {
    score += 10;
    reasons.push('Highly rated (4.8+)');
  } else if (meta.rating >= 4.5) {
    score += 5;
  }

  // In-stock bonus (5 points)
  if (meta.inStock) {
    score += 5;
  }

  return { score, reasons };
}

/**
 * Check if product violates a sensitivity
 */
function checkSensitivityViolation(
  meta: VectorDocument['metadata'],
  sensitivity: string
): boolean {
  const lowerSensitivity = sensitivity.toLowerCase();

  // Check if the sensitivity is about fragrance
  if (lowerSensitivity.includes('fragrance')) {
    return !meta.preferences?.fragranceFree;
  }

  // Check if the sensitivity is about alcohol
  if (lowerSensitivity.includes('alcohol')) {
    return !meta.preferences?.alcoholFree;
  }

  // Check ingredients for other sensitivities
  const ingredients = [
    ...(meta.keyIngredients || []),
    ...(meta.activeIngredients?.map((i: any) => i.name) || []),
  ].map((i) => i.toLowerCase());

  return ingredients.some((ing) => ing.includes(lowerSensitivity));
}

/**
 * Main retrieval function
 */
export async function retrieveProducts(
  survey: SkinSurvey,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const startTime = Date.now();
  const { category, limit = 10, minSimilarity = 0.05, naturalLanguageQuery, sourceFilter = 'all' } = options;

  // Ensure products are ingested
  await initializeProductIngestion();

  // Generate query embedding
  let queryVector: number[];
  if (naturalLanguageQuery) {
    // Combine survey embedding with natural language query
    const surveyVector = generateSurveyEmbedding(survey);
    const queryVectorNL = generateQueryEmbedding(naturalLanguageQuery);
    // Weighted combination (70% survey, 30% query)
    queryVector = surveyVector.map((v, i) => v * 0.7 + queryVectorNL[i] * 0.3);
  } else {
    queryVector = generateSurveyEmbedding(survey);
  }

  // Build filter function (category + source filtering)
  const filter = (doc: VectorDocument) => {
    // Category filter
    if (category && doc.metadata.category !== category) {
      return false;
    }
    // Source filter
    if (sourceFilter === 'marketplace-only' && doc.metadata.source !== 'marketplace') {
      return false;
    }
    if (sourceFilter === 'discovery-only' && doc.metadata.source !== 'discovery') {
      return false;
    }
    return true;
  };

  // Perform similarity search
  const searchResults = await vectorStore.search(queryVector, {
    topK: limit * 3, // Get more candidates for re-ranking
    minSimilarity,
    filter,
  });

  // Re-rank with attribute scoring
  const rankedProducts: RankedProduct[] = searchResults.map((result) => {
    const { score: attributeScore, reasons } = calculateAttributeScore(
      result.document,
      survey
    );

    // Combine scores (60% similarity, 40% attributes)
    const similarityScore = result.similarity * 100;
    const finalScore = similarityScore * 0.6 + attributeScore * 0.4;

    const meta = result.document.metadata;

    return {
      productId: meta.productId,
      brand: meta.brand,
      name: meta.name,
      category: meta.category,
      price: meta.price,
      rating: meta.rating,
      reviewCount: meta.reviewCount,
      skinTypes: meta.skinTypes,
      concerns: meta.concerns,
      keyIngredients: meta.keyIngredients,
      preferences: meta.preferences,
      image: meta.image,
      description: meta.description,
      source: meta.source || 'discovery',
      productUrl: meta.productUrl || meta.marketplaceUrl,
      marketplaceUrl: meta.marketplaceUrl,
      similarityScore,
      attributeScore,
      finalScore,
      matchReasons: reasons,
    };
  });

  // Sort by final score and take top results
  rankedProducts.sort((a, b) => b.finalScore - a.finalScore);
  const topProducts = rankedProducts.slice(0, limit);

  return {
    products: topProducts,
    query: {
      skinType: survey.skinType,
      concerns: survey.concerns,
      category,
    },
    totalCandidates: searchResults.length,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Retrieve products by category
 */
export async function retrieveByCategory(
  survey: SkinSurvey,
  category: string,
  limit: number = 3
): Promise<RankedProduct[]> {
  const result = await retrieveProducts(survey, { category, limit });
  return result.products;
}

/**
 * Retrieve complete routine (cleanser, serum, moisturizer, sunscreen)
 */
export async function retrieveRoutine(
  survey: SkinSurvey
): Promise<Record<string, RankedProduct[]>> {
  const categories = ['cleanser', 'serum', 'moisturizer', 'sunscreen'];
  const routine: Record<string, RankedProduct[]> = {};

  await Promise.all(
    categories.map(async (category) => {
      routine[category] = await retrieveByCategory(survey, category, 2);
    })
  );

  return routine;
}

/**
 * Search products with natural language query
 */
export async function searchProducts(
  query: string,
  survey?: SkinSurvey,
  limit: number = 5
): Promise<RankedProduct[]> {
  const result = await retrieveProducts(survey || {}, {
    naturalLanguageQuery: query,
    limit,
  });
  return result.products;
}

/**
 * Format products as JSON for AI response
 */
export function formatProductsAsJSON(products: RankedProduct[]): string {
  return JSON.stringify(
    products.map((p) => ({
      brand: p.brand,
      name: p.name,
      category: p.category,
      price: `$${p.price.toFixed(2)}`,
      rating: `${p.rating}/5`,
      whyItFits: p.matchReasons,
      availableIn: p.source === 'marketplace' ? 'Marketplace' : 'Discovery',
      productUrl: p.productUrl,
      keyIngredients: p.keyIngredients,
    })),
    null,
    2
  );
}

/**
 * Format products for display in AI chat
 */
export function formatProductsForChat(products: RankedProduct[]): string {
  if (products.length === 0) {
    return "I couldn't find products matching your criteria. Could you tell me more about your skin type and concerns?";
  }

  let response = '';

  products.forEach((product, index) => {
    const label =
      index === 0
        ? '**Best Match**'
        : index === 1
          ? '**Alternative Option**'
          : '**Budget-Friendly Option**';

    // Differentiate between marketplace and discovery
    const availabilityLabel = product.source === 'marketplace'
      ? 'Available on Marketplace'
      : 'Available in Discovery';

    const locationInfo = product.source === 'marketplace'
      ? `Buy on Lorem Curae Marketplace (${product.productUrl})`
      : `View in Discovery (${product.productUrl})`;

    response += `${label}\n`;
    response += `**${product.brand}** - ${product.name}\n`;
    response += `- Category: ${product.category}\n`;
    response += `- Price: $${product.price.toFixed(2)}\n`;
    response += `- Rating: ${product.rating}/5 (${product.reviewCount.toLocaleString()} reviews)\n`;
    response += `- Key ingredients: ${product.keyIngredients.join(', ')}\n`;
    response += `- Why it fits: ${product.matchReasons.join('; ')}\n`;
    response += `- ${availabilityLabel}: ${locationInfo}\n\n`;
  });

  return response.trim();
}
