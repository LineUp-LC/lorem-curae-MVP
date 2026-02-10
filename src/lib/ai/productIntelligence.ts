/**
 * Product Intelligence for Lorem Curae AI
 *
 * Provides deep product-level understanding including:
 * - Product safety evaluation
 * - Product-to-routine compatibility
 * - Product comparison logic
 * - Personalized recommendation explanations
 * - Product URL generation
 */

import { type RankedProduct, type ProductSource } from './retrievalPipeline';
import { checkCompatibility, PHOTOSENSITIZING_INGREDIENTS, BEGINNER_SAFE, ADVANCED_INGREDIENTS } from './ingredientIntelligence';
import { INGREDIENT_ENCYCLOPEDIA } from './knowledgeBase';

// ============================================================================
// Types
// ============================================================================

/**
 * User profile for product personalization
 */
export interface ProductUserProfile {
  skinType?: string;
  concerns?: string[];
  sensitivities?: string[];
  goals?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  avoidIngredients?: string[];
  preferences?: {
    fragranceFree?: boolean;
    crueltyFree?: boolean;
    vegan?: boolean;
    budgetRange?: 'budget' | 'mid' | 'premium';
  };
}

/**
 * Product safety evaluation result
 */
export interface ProductSafetyResult {
  safe: boolean;
  level: 'safe' | 'caution' | 'avoid';
  warnings: string[];
  recommendations: string[];
  alternativeSuggestions?: string[];
}

/**
 * Product strength classification
 */
export type ProductStrength = 'gentle' | 'moderate' | 'strong';

/**
 * Product timing suitability
 */
export type ProductTiming = 'AM' | 'PM' | 'both';

/**
 * Product explanation result
 */
export interface ProductExplanation {
  product: {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    source: ProductSource;
  };
  summary: string;
  keyIngredients: Array<{
    name: string;
    benefit: string;
    url: string;
  }>;
  concernAlignment: string[];
  skinTypeMatch: boolean;
  strengthLevel: ProductStrength;
  timing: ProductTiming;
  safety: ProductSafetyResult;
  personalizedNote?: string;
  productUrl: string;
}

/**
 * Product comparison result
 */
export interface ProductComparison {
  products: Array<{
    id: number;
    name: string;
    brand: string;
  }>;
  summary: string;
  differences: Array<{
    aspect: string;
    details: Record<string, string>;
  }>;
  recommendation: {
    winner: string;
    reason: string;
  };
  forProfile: string;
}

/**
 * Routine compatibility result
 */
export interface RoutineCompatibility {
  compatible: boolean;
  conflicts: Array<{
    product1: string;
    product2: string;
    reason: string;
    resolution: string;
  }>;
  suggestions: string[];
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Strong actives that require experience
 */
const STRONG_ACTIVES = [
  'retinol', 'tretinoin', 'adapalene',
  'glycolic acid', 'tca',
  'benzoyl peroxide',
  'hydroquinone',
  'high-concentration vitamin c',
];

/**
 * Ingredients that may cause fragrance sensitivity
 */
const FRAGRANCE_INDICATORS = [
  'fragrance', 'parfum', 'linalool', 'limonene',
  'citronellol', 'geraniol', 'eugenol',
];

/**
 * AM-safe categories (no photosensitizing actives)
 */
const AM_SAFE_CATEGORIES = ['cleanser', 'toner', 'moisturizer', 'sunscreen', 'eye cream'];

/**
 * PM-preferred categories
 */
const PM_PREFERRED_CATEGORIES = ['treatment', 'exfoliant', 'mask', 'oil'];

/**
 * Budget price thresholds
 */
const PRICE_TIERS = {
  budget: { max: 25 },
  mid: { min: 20, max: 50 },
  premium: { min: 45 },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert ingredient name to URL slug
 */
function toIngredientSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Get product URL based on source
 */
export function getProductUrl(productId: number, source: ProductSource): string {
  if (source === 'marketplace') {
    return `/marketplace/product/${productId}`;
  }
  return `/product-detail/${productId}`;
}

/**
 * Determine product strength from ingredients
 */
export function determineProductStrength(keyIngredients: string[]): ProductStrength {
  const lowerIngredients = keyIngredients.map(i => i.toLowerCase());

  // Check for strong actives
  const hasStrongActive = lowerIngredients.some(i =>
    STRONG_ACTIVES.some(sa => i.includes(sa))
  );
  if (hasStrongActive) {
    return 'strong';
  }

  // Check for gentle ingredients only
  const allGentle = lowerIngredients.every(i =>
    BEGINNER_SAFE.some(bs => i.includes(bs)) ||
    !ADVANCED_INGREDIENTS.some(ai => i.includes(ai))
  );
  if (allGentle && lowerIngredients.length > 0) {
    return 'gentle';
  }

  return 'moderate';
}

/**
 * Determine product timing suitability
 */
export function determineProductTiming(
  category: string,
  keyIngredients: string[]
): ProductTiming {
  const lowerCategory = category.toLowerCase();
  const lowerIngredients = keyIngredients.map(i => i.toLowerCase());

  // Sunscreen is AM only
  if (lowerCategory.includes('sunscreen') || lowerCategory.includes('spf')) {
    return 'AM';
  }

  // Check for photosensitizing ingredients
  const hasPhotosensitizing = lowerIngredients.some(i =>
    PHOTOSENSITIZING_INGREDIENTS.some(pi => i.includes(pi))
  );
  if (hasPhotosensitizing) {
    return 'PM';
  }

  // PM-preferred categories
  if (PM_PREFERRED_CATEGORIES.some(c => lowerCategory.includes(c))) {
    return 'PM';
  }

  return 'both';
}

/**
 * Check if product contains fragrance
 */
export function hasFragrance(keyIngredients: string[]): boolean {
  const lowerIngredients = keyIngredients.map(i => i.toLowerCase());
  return lowerIngredients.some(i =>
    FRAGRANCE_INDICATORS.some(fi => i.includes(fi))
  );
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Evaluate product safety for a user
 */
export function evaluateProductSafety(
  product: RankedProduct,
  userProfile: ProductUserProfile,
  existingProducts?: RankedProduct[]
): ProductSafetyResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const alternativeSuggestions: string[] = [];
  let level: 'safe' | 'caution' | 'avoid' = 'safe';

  const lowerIngredients = product.keyIngredients.map(i => i.toLowerCase());

  // Check experience level vs product strength
  const strength = determineProductStrength(product.keyIngredients);
  if (userProfile.experienceLevel === 'beginner' && strength === 'strong') {
    level = 'caution';
    warnings.push('This product contains strong actives that may be intense for beginners');
    recommendations.push('Start with 1-2 times per week and gradually increase');
    alternativeSuggestions.push('Consider a gentler alternative with lower concentration');
  }

  // Check for sensitivity conflicts
  if (userProfile.sensitivities && userProfile.sensitivities.length > 0) {
    for (const sensitivity of userProfile.sensitivities) {
      const lowerSensitivity = sensitivity.toLowerCase();
      if (lowerIngredients.some(i => i.includes(lowerSensitivity))) {
        level = 'avoid';
        warnings.push(`Contains ${sensitivity}, which you've listed as a sensitivity`);
        recommendations.push('Choose a product without this ingredient');
      }
    }
  }

  // Check for avoided ingredients
  if (userProfile.avoidIngredients && userProfile.avoidIngredients.length > 0) {
    for (const avoid of userProfile.avoidIngredients) {
      const lowerAvoid = avoid.toLowerCase();
      if (lowerIngredients.some(i => i.includes(lowerAvoid))) {
        level = level === 'safe' ? 'caution' : level;
        warnings.push(`Contains ${avoid}, which is on your avoid list`);
      }
    }
  }

  // Check fragrance for sensitive skin
  if (userProfile.skinType?.toLowerCase() === 'sensitive' || userProfile.sensitivities?.length) {
    if (hasFragrance(product.keyIngredients)) {
      level = level === 'safe' ? 'caution' : level;
      warnings.push('Contains fragrance, which may irritate sensitive skin');
      recommendations.push('Patch test before full application');
      alternativeSuggestions.push('Look for fragrance-free alternatives');
    }
  }

  // Check fragrance-free preference
  if (userProfile.preferences?.fragranceFree && hasFragrance(product.keyIngredients)) {
    level = level === 'safe' ? 'caution' : level;
    warnings.push('Contains fragrance despite your fragrance-free preference');
  }

  // Check conflicts with existing products
  if (existingProducts && existingProducts.length > 0) {
    for (const existing of existingProducts) {
      for (const newIngredient of product.keyIngredients) {
        for (const existingIngredient of existing.keyIngredients) {
          const compatibility = checkCompatibility(newIngredient, existingIngredient);
          if (compatibility.level === 'avoid') {
            level = 'caution';
            warnings.push(`${newIngredient} may conflict with ${existingIngredient} in ${existing.name}`);
            if (compatibility.resolution) {
              recommendations.push(compatibility.resolution);
            }
          }
        }
      }
    }
  }

  // Check photosensitivity
  const timing = determineProductTiming(product.category, product.keyIngredients);
  if (timing === 'PM') {
    recommendations.push('Use in PM routine only - contains photosensitizing ingredients');
    recommendations.push('Always use SPF during the day when using this product');
  }

  // Add general safety recommendations
  if (strength === 'strong' || strength === 'moderate') {
    recommendations.push('Patch test before first use');
  }

  return {
    safe: level === 'safe',
    level,
    warnings,
    recommendations,
    alternativeSuggestions: alternativeSuggestions.length > 0 ? alternativeSuggestions : undefined,
  };
}

/**
 * Generate personalized product explanation
 */
export function explainProduct(
  product: RankedProduct,
  userProfile?: ProductUserProfile
): ProductExplanation {
  const strength = determineProductStrength(product.keyIngredients);
  const timing = determineProductTiming(product.category, product.keyIngredients);
  const safety = userProfile
    ? evaluateProductSafety(product, userProfile)
    : { safe: true, level: 'safe' as const, warnings: [], recommendations: [] };

  // Build key ingredients with benefits
  const keyIngredients = product.keyIngredients.slice(0, 5).map(name => {
    const slug = toIngredientSlug(name);
    const knowledge = INGREDIENT_ENCYCLOPEDIA[slug];
    return {
      name,
      benefit: knowledge?.benefits[0] || 'Supports skin health',
      url: `/ingredients/${slug}`,
    };
  });

  // Check skin type match
  const skinTypeMatch = !userProfile?.skinType ||
    product.skinTypes.some(st =>
      st.toLowerCase() === userProfile.skinType?.toLowerCase() || st.toLowerCase() === 'all'
    );

  // Build concern alignment
  const concernAlignment = userProfile?.concerns
    ? product.concerns.filter(pc =>
        userProfile.concerns!.some(uc =>
          pc.toLowerCase().includes(uc.toLowerCase()) ||
          uc.toLowerCase().includes(pc.toLowerCase())
        )
      )
    : product.concerns;

  // Build personalized note
  let personalizedNote: string | undefined;
  if (userProfile) {
    const notes: string[] = [];

    if (skinTypeMatch && userProfile.skinType) {
      notes.push(`suitable for your ${userProfile.skinType} skin`);
    }

    if (concernAlignment.length > 0) {
      notes.push(`addresses your ${concernAlignment.slice(0, 2).join(' and ')} concerns`);
    }

    if (userProfile.experienceLevel === 'beginner' && strength === 'gentle') {
      notes.push('beginner-friendly formula');
    }

    if (notes.length > 0) {
      personalizedNote = `This product is ${notes.join(', ')}.`;
    }
  }

  // Build summary
  const summary = `${product.brand} ${product.name} is a ${strength} ${product.category.toLowerCase()} ` +
    `featuring ${keyIngredients.slice(0, 3).map(i => i.name).join(', ')}. ` +
    `Best used in your ${timing === 'both' ? 'AM or PM' : timing} routine.`;

  return {
    product: {
      id: product.productId,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      source: product.source,
    },
    summary,
    keyIngredients,
    concernAlignment,
    skinTypeMatch,
    strengthLevel: strength,
    timing,
    safety,
    personalizedNote,
    productUrl: product.productUrl,
  };
}

/**
 * Compare two or more products
 */
export function compareProducts(
  products: RankedProduct[],
  userProfile?: ProductUserProfile
): ProductComparison | null {
  if (products.length < 2) {
    return null;
  }

  const differences: Array<{ aspect: string; details: Record<string, string> }> = [];

  // Compare strength
  const strengthDetails: Record<string, string> = {};
  products.forEach(p => {
    strengthDetails[`${p.brand} ${p.name}`] = determineProductStrength(p.keyIngredients);
  });
  differences.push({ aspect: 'Strength', details: strengthDetails });

  // Compare price tier
  const priceDetails: Record<string, string> = {};
  products.forEach(p => {
    let tier = 'mid';
    if (p.price < PRICE_TIERS.budget.max) tier = 'budget';
    else if (p.price >= PRICE_TIERS.premium.min) tier = 'premium';
    priceDetails[`${p.brand} ${p.name}`] = `$${p.price.toFixed(2)} (${tier})`;
  });
  differences.push({ aspect: 'Price', details: priceDetails });

  // Compare timing
  const timingDetails: Record<string, string> = {};
  products.forEach(p => {
    const timing = determineProductTiming(p.category, p.keyIngredients);
    timingDetails[`${p.brand} ${p.name}`] = timing === 'both' ? 'AM or PM' : `${timing} only`;
  });
  differences.push({ aspect: 'Best Timing', details: timingDetails });

  // Compare key ingredients
  const ingredientDetails: Record<string, string> = {};
  products.forEach(p => {
    ingredientDetails[`${p.brand} ${p.name}`] = p.keyIngredients.slice(0, 3).join(', ');
  });
  differences.push({ aspect: 'Key Ingredients', details: ingredientDetails });

  // Compare concerns addressed
  const concernDetails: Record<string, string> = {};
  products.forEach(p => {
    concernDetails[`${p.brand} ${p.name}`] = p.concerns.slice(0, 3).join(', ');
  });
  differences.push({ aspect: 'Addresses', details: concernDetails });

  // Determine recommendation based on user profile
  let winner = products[0];
  let winnerReason = 'First option with good overall fit';

  if (userProfile) {
    const scores: Map<RankedProduct, number> = new Map();

    products.forEach(p => {
      let score = 0;

      // Skin type match
      if (userProfile.skinType && p.skinTypes.some(st =>
        st.toLowerCase() === userProfile.skinType?.toLowerCase() || st === 'all'
      )) {
        score += 20;
      }

      // Concern match
      if (userProfile.concerns) {
        const matches = p.concerns.filter(pc =>
          userProfile.concerns!.some(uc => pc.toLowerCase().includes(uc.toLowerCase()))
        );
        score += matches.length * 15;
      }

      // Experience level
      const strength = determineProductStrength(p.keyIngredients);
      if (userProfile.experienceLevel === 'beginner') {
        if (strength === 'gentle') score += 15;
        if (strength === 'strong') score -= 10;
      }

      // Sensitivity check
      if (userProfile.sensitivities && userProfile.sensitivities.length > 0) {
        const hasSensitivityConflict = p.keyIngredients.some(i =>
          userProfile.sensitivities!.some(s => i.toLowerCase().includes(s.toLowerCase()))
        );
        if (hasSensitivityConflict) score -= 30;
      }

      // Fragrance preference
      if (userProfile.preferences?.fragranceFree && hasFragrance(p.keyIngredients)) {
        score -= 10;
      }

      // Budget preference
      if (userProfile.preferences?.budgetRange) {
        const budget = userProfile.preferences.budgetRange;
        if (budget === 'budget' && p.price <= PRICE_TIERS.budget.max) score += 10;
        if (budget === 'premium' && p.price >= PRICE_TIERS.premium.min) score += 5;
      }

      scores.set(p, score);
    });

    // Find winner
    let maxScore = -Infinity;
    scores.forEach((score, product) => {
      if (score > maxScore) {
        maxScore = score;
        winner = product;
      }
    });

    // Build reason
    const reasons: string[] = [];
    if (userProfile.skinType && winner.skinTypes.some(st =>
      st.toLowerCase() === userProfile.skinType?.toLowerCase()
    )) {
      reasons.push(`matches your ${userProfile.skinType} skin`);
    }
    const strength = determineProductStrength(winner.keyIngredients);
    if (userProfile.experienceLevel === 'beginner' && strength === 'gentle') {
      reasons.push('gentle enough for beginners');
    }
    if (reasons.length > 0) {
      winnerReason = `Best fit because it ${reasons.join(' and ')}`;
    }
  }

  return {
    products: products.map(p => ({
      id: p.productId,
      name: p.name,
      brand: p.brand,
    })),
    summary: `Comparing ${products.length} products: ${products.map(p => p.name).join(' vs ')}`,
    differences,
    recommendation: {
      winner: `${winner.brand} ${winner.name}`,
      reason: winnerReason,
    },
    forProfile: userProfile?.skinType
      ? `For ${userProfile.skinType} skin${userProfile.concerns?.length ? ` with ${userProfile.concerns[0]}` : ''}`
      : 'General comparison',
  };
}

/**
 * Check routine compatibility for a set of products
 */
export function checkRoutineCompatibility(
  products: RankedProduct[],
  timing: 'AM' | 'PM'
): RoutineCompatibility {
  const conflicts: RoutineCompatibility['conflicts'] = [];
  const suggestions: string[] = [];

  // Check each pair of products for conflicts
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const p1 = products[i];
      const p2 = products[j];

      // Check ingredient conflicts
      for (const ing1 of p1.keyIngredients) {
        for (const ing2 of p2.keyIngredients) {
          const compatibility = checkCompatibility(ing1, ing2);
          if (compatibility.level === 'avoid') {
            conflicts.push({
              product1: `${p1.brand} ${p1.name}`,
              product2: `${p2.brand} ${p2.name}`,
              reason: `${ing1} and ${ing2}: ${compatibility.reason}`,
              resolution: compatibility.resolution || 'Use on alternate days',
            });
          } else if (compatibility.level === 'caution') {
            suggestions.push(`${ing1} and ${ing2} in same routine: ${compatibility.reason}`);
          }
        }
      }
    }
  }

  // Check timing conflicts
  for (const product of products) {
    const productTiming = determineProductTiming(product.category, product.keyIngredients);
    if (timing === 'AM' && productTiming === 'PM') {
      conflicts.push({
        product1: `${product.brand} ${product.name}`,
        product2: 'AM Routine',
        reason: 'Contains photosensitizing ingredients',
        resolution: 'Move to PM routine',
      });
    }
  }

  // Check for multiple exfoliants
  const exfoliants = products.filter(p =>
    p.category.toLowerCase().includes('exfoliant') ||
    p.keyIngredients.some(i =>
      ['glycolic', 'lactic', 'salicylic', 'aha', 'bha'].some(e => i.toLowerCase().includes(e))
    )
  );
  if (exfoliants.length > 1) {
    suggestions.push('Multiple exfoliating products detected - risk of over-exfoliation');
    suggestions.push('Consider using only one exfoliant per routine');
  }

  // Check for sunscreen in AM
  if (timing === 'AM') {
    const hasSunscreen = products.some(p =>
      p.category.toLowerCase().includes('sunscreen') ||
      p.category.toLowerCase().includes('spf')
    );
    if (!hasSunscreen) {
      suggestions.push('No sunscreen detected in AM routine - add SPF 30+ as final step');
    }
  }

  return {
    compatible: conflicts.length === 0,
    conflicts,
    suggestions,
  };
}

/**
 * Generate product recommendation explanation
 */
export function generateRecommendationReasoning(
  product: RankedProduct,
  userProfile: ProductUserProfile,
  userHistory?: {
    viewedProducts?: string[];
    savedProducts?: string[];
    purchasedProducts?: string[];
  }
): string {
  const reasons: string[] = [];

  // Profile-based reasoning
  if (userProfile.skinType && product.skinTypes.some(st =>
    st.toLowerCase() === userProfile.skinType?.toLowerCase()
  )) {
    reasons.push(`formulated for ${userProfile.skinType} skin`);
  }

  // Concern-based reasoning
  if (userProfile.concerns) {
    const matchedConcerns = product.concerns.filter(pc =>
      userProfile.concerns!.some(uc => pc.toLowerCase().includes(uc.toLowerCase()))
    );
    if (matchedConcerns.length > 0) {
      reasons.push(`targets your ${matchedConcerns[0]} concern`);
    }
  }

  // History-based reasoning
  if (userHistory) {
    if (userHistory.viewedProducts?.some(v => v.toLowerCase().includes(product.category.toLowerCase()))) {
      reasons.push(`you've been exploring ${product.category.toLowerCase()}s`);
    }
    if (userHistory.savedProducts?.some(s =>
      product.keyIngredients.some(i => s.toLowerCase().includes(i.toLowerCase()))
    )) {
      reasons.push('contains ingredients from products you\'ve saved');
    }
  }

  // Ingredient-based reasoning
  const strength = determineProductStrength(product.keyIngredients);
  if (userProfile.experienceLevel === 'beginner' && strength === 'gentle') {
    reasons.push('gentle enough for your experience level');
  }

  // Build final sentence
  if (reasons.length === 0) {
    return `${product.brand} ${product.name} is a well-reviewed ${product.category.toLowerCase()} with ${product.keyIngredients[0]}.`;
  }

  return `${product.brand} ${product.name} because it's ${reasons.slice(0, 2).join(' and ')}.`;
}

/**
 * Format product for chat response
 */
export function formatProductForChat(
  explanation: ProductExplanation,
  includeAlternatives?: RankedProduct[]
): string {
  const lines: string[] = [];

  // Header
  lines.push(`## ${explanation.product.brand} ${explanation.product.name}`);
  lines.push(`**${explanation.product.category}** · $${explanation.product.price.toFixed(2)}\n`);

  // Summary
  lines.push(explanation.summary);
  lines.push('');

  // Personalized note
  if (explanation.personalizedNote) {
    lines.push(`*${explanation.personalizedNote}*\n`);
  }

  // Key ingredients
  lines.push('### Key Ingredients');
  explanation.keyIngredients.slice(0, 4).forEach(({ name, benefit, url }) => {
    lines.push(`- [${name}](${url}): ${benefit}`);
  });

  // Concerns addressed
  if (explanation.concernAlignment.length > 0) {
    lines.push(`\n### Addresses`);
    lines.push(explanation.concernAlignment.join(', '));
  }

  // Usage
  lines.push(`\n### Usage`);
  lines.push(`- **Timing:** ${explanation.timing === 'both' ? 'AM or PM' : `${explanation.timing} only`}`);
  lines.push(`- **Strength:** ${explanation.strengthLevel}`);

  // Safety warnings
  if (explanation.safety.warnings.length > 0) {
    lines.push(`\n### Cautions`);
    explanation.safety.warnings.forEach(w => lines.push(`- ${w}`));
  }

  // Recommendations
  if (explanation.safety.recommendations.length > 0) {
    lines.push(`\n### Tips`);
    explanation.safety.recommendations.slice(0, 3).forEach(r => lines.push(`- ${r}`));
  }

  // Alternatives
  if (includeAlternatives && includeAlternatives.length > 0) {
    lines.push(`\n### Alternatives`);
    includeAlternatives.slice(0, 2).forEach(alt => {
      lines.push(`- **${alt.brand} ${alt.name}** ($${alt.price.toFixed(2)}) - [View](${alt.productUrl})`);
    });
  }

  // Navigation
  lines.push(`\n---`);
  lines.push(`[View Product](${explanation.productUrl})`);

  return lines.join('\n');
}
