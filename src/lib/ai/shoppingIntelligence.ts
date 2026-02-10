/**
 * Shopping, Filtering & Product Discovery Intelligence for Lorem Curae AI
 *
 * Manages product filtering, comparison, discovery workflows,
 * and personalized shopping assistance with safety checks.
 */

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Product filter criteria
 */
export interface ProductFilters {
  // Skin compatibility
  skinType?: string[];
  concerns?: string[];

  // Ingredient filters
  includeIngredients?: string[];
  excludeIngredients?: string[];

  // Preference filters
  fragranceFree?: boolean;
  nonComedogenic?: boolean;
  pregnancySafe?: boolean;
  veganCrueltyFree?: boolean;

  // Price filters
  priceMin?: number;
  priceMax?: number;
  priceRange?: 'budget' | 'mid' | 'premium';

  // Product attributes
  brand?: string[];
  category?: string[];
  texture?: string[];
  strengthLevel?: 'gentle' | 'moderate' | 'strong';

  // Source
  source?: 'marketplace' | 'discovery' | 'all';
}

/**
 * Sort options for product results
 */
export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'gentleness'
  | 'strength'
  | 'concern_match'
  | 'popularity';

/**
 * Product for filtering/comparison
 */
export interface FilterableProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price?: number;
  ingredients?: string[];
  keyIngredients?: string[];
  concerns?: string[];
  skinTypes?: string[];
  texture?: string;
  isFragranceFree?: boolean;
  isNonComedogenic?: boolean;
  isPregnancySafe?: boolean;
  strengthLevel?: 'gentle' | 'moderate' | 'strong';
  source: 'marketplace' | 'discovery';
}

/**
 * Filter result with reasoning
 */
export interface FilterResult {
  products: FilterableProduct[];
  appliedFilters: string[];
  removedCount: number;
  safetyFiltersApplied: string[];
}

/**
 * Product comparison result
 */
export interface ProductComparison {
  products: FilterableProduct[];
  differences: ComparisonDifference[];
  recommendation?: {
    productId: number;
    reason: string;
  };
}

/**
 * Individual comparison difference
 */
export interface ComparisonDifference {
  attribute: string;
  values: Record<number, string | number | boolean | undefined>;
  winner?: number;
  explanation?: string;
}

// ============================================================================
// FILTER PATTERNS
// ============================================================================

/**
 * Patterns for detecting filter intent from user messages
 */
const FILTER_PATTERNS = {
  skinType: {
    oily: /\b(oily|oil\s*control|mattifying|shine\s*free)\b/i,
    dry: /\b(dry|hydrating|moisturizing|nourishing)\b/i,
    combination: /\b(combination|combo|t\s*-?\s*zone)\b/i,
    sensitive: /\b(sensitive|gentle|soothing|calming|irritated)\b/i,
    normal: /\b(normal|balanced)\b/i,
  },
  priceRange: {
    budget: /\b(budget|cheap|affordable|under\s*\$?\s*2[05]|drugstore|inexpensive)\b/i,
    mid: /\b(mid\s*-?\s*range|moderate|around\s*\$?\s*[34][05])\b/i,
    premium: /\b(premium|luxury|high\s*-?\s*end|splurge|over\s*\$?\s*[56]0)\b/i,
  },
  preferences: {
    fragranceFree: /\b(fragrance\s*-?\s*free|unscented|no\s*fragrance|without\s*fragrance)\b/i,
    nonComedogenic: /\b(non\s*-?\s*comedogenic|won'?t\s*clog|pore\s*-?\s*friendly)\b/i,
    pregnancySafe: /\b(pregnancy\s*-?\s*safe|pregnant|expecting|breastfeeding)\b/i,
    vegan: /\b(vegan|cruelty\s*-?\s*free|not\s*tested\s*on\s*animals)\b/i,
  },
  strength: {
    gentle: /\b(gentle|mild|soft|beginner|sensitive\s*skin|low\s*strength)\b/i,
    moderate: /\b(moderate|medium|balanced|intermediate)\b/i,
    strong: /\b(strong|potent|high\s*strength|advanced|powerful)\b/i,
  },
  texture: {
    gel: /\b(gel|gel\s*-?\s*based|lightweight\s*gel)\b/i,
    cream: /\b(cream|creamy|rich|thick)\b/i,
    oil: /\b(oil|facial\s*oil|dry\s*oil)\b/i,
    lotion: /\b(lotion|light\s*lotion|fluid)\b/i,
    serum: /\b(serum|essence|concentrate)\b/i,
    foam: /\b(foam|foaming|mousse)\b/i,
    balm: /\b(balm|salve|ointment)\b/i,
  },
  categories: {
    cleanser: /\b(cleanser|face\s*wash|cleansing|makeup\s*remover)\b/i,
    moisturizer: /\b(moisturizer|moisturiser|hydrator|face\s*cream)\b/i,
    serum: /\b(serum|treatment\s*serum|active\s*serum)\b/i,
    sunscreen: /\b(sunscreen|spf|sun\s*protection|sunblock)\b/i,
    toner: /\b(toner|tonic|essence|prep)\b/i,
    exfoliant: /\b(exfoliant|exfoliator|peel|scrub|aha|bha)\b/i,
    mask: /\b(mask|masque|sheet\s*mask|treatment\s*mask)\b/i,
    eyeCream: /\b(eye\s*cream|eye\s*treatment|under\s*eye)\b/i,
    treatment: /\b(treatment|spot\s*treatment|acne\s*treatment)\b/i,
  },
};

/**
 * Extract filters from user message
 */
export function extractFiltersFromMessage(message: string): Partial<ProductFilters> {
  const filters: Partial<ProductFilters> = {};
  const lowerMessage = message.toLowerCase();

  // Extract skin type
  for (const [type, pattern] of Object.entries(FILTER_PATTERNS.skinType)) {
    if (pattern.test(lowerMessage)) {
      filters.skinType = filters.skinType || [];
      filters.skinType.push(type);
    }
  }

  // Extract price range
  for (const [range, pattern] of Object.entries(FILTER_PATTERNS.priceRange)) {
    if (pattern.test(lowerMessage)) {
      filters.priceRange = range as 'budget' | 'mid' | 'premium';
      break;
    }
  }

  // Extract specific price
  const priceMatch = lowerMessage.match(/under\s*\$?\s*(\d+)/i);
  if (priceMatch) {
    filters.priceMax = parseInt(priceMatch[1], 10);
  }
  const priceOverMatch = lowerMessage.match(/over\s*\$?\s*(\d+)/i);
  if (priceOverMatch) {
    filters.priceMin = parseInt(priceOverMatch[1], 10);
  }

  // Extract preferences
  if (FILTER_PATTERNS.preferences.fragranceFree.test(lowerMessage)) {
    filters.fragranceFree = true;
  }
  if (FILTER_PATTERNS.preferences.nonComedogenic.test(lowerMessage)) {
    filters.nonComedogenic = true;
  }
  if (FILTER_PATTERNS.preferences.pregnancySafe.test(lowerMessage)) {
    filters.pregnancySafe = true;
  }
  if (FILTER_PATTERNS.preferences.vegan.test(lowerMessage)) {
    filters.veganCrueltyFree = true;
  }

  // Extract strength
  for (const [level, pattern] of Object.entries(FILTER_PATTERNS.strength)) {
    if (pattern.test(lowerMessage)) {
      filters.strengthLevel = level as 'gentle' | 'moderate' | 'strong';
      break;
    }
  }

  // Extract texture
  for (const [tex, pattern] of Object.entries(FILTER_PATTERNS.texture)) {
    if (pattern.test(lowerMessage)) {
      filters.texture = filters.texture || [];
      filters.texture.push(tex);
    }
  }

  // Extract category
  for (const [cat, pattern] of Object.entries(FILTER_PATTERNS.categories)) {
    if (pattern.test(lowerMessage)) {
      filters.category = filters.category || [];
      filters.category.push(cat);
    }
  }

  // Extract ingredient includes (with, containing)
  const withMatch = message.match(/\b(with|containing|has|include)\s+([a-z\s]+(?:acid|vitamin\s*c|retinol|niacinamide|hyaluronic|ceramide)s?)\b/i);
  if (withMatch) {
    filters.includeIngredients = [withMatch[2].trim().toLowerCase()];
  }

  // Extract ingredient excludes (without, no, avoid)
  const withoutMatch = message.match(/\b(without|no|avoid|free\s*of|excluding)\s+([a-z\s]+(?:acid|vitamin\s*c|retinol|niacinamide|hyaluronic|fragrance)s?)\b/i);
  if (withoutMatch) {
    filters.excludeIngredients = [withoutMatch[2].trim().toLowerCase()];
  }

  return filters;
}

// ============================================================================
// SAFETY FILTERS
// ============================================================================

/**
 * Pregnancy-unsafe ingredients
 */
const PREGNANCY_UNSAFE_INGREDIENTS = [
  'retinol', 'retinoid', 'tretinoin', 'adapalene', 'tazarotene',
  'salicylic acid', 'hydroquinone', 'benzoyl peroxide',
];

/**
 * Strong/advanced ingredients not for beginners
 */
const ADVANCED_INGREDIENTS = [
  'retinol', 'tretinoin', 'glycolic acid', 'tca',
  'hydroquinone', 'benzoyl peroxide',
];

/**
 * Photosensitizing ingredients (PM only)
 */
const PHOTOSENSITIZING_INGREDIENTS = [
  'retinol', 'retinoid', 'tretinoin', 'aha', 'glycolic acid',
  'lactic acid', 'bha', 'salicylic acid',
];

/**
 * Apply safety filters to product list
 */
export function applySafetyFilters(
  products: FilterableProduct[],
  userContext: {
    pregnancySafe?: boolean;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    sensitivities?: string[];
    timing?: 'am' | 'pm';
  }
): { products: FilterableProduct[]; filtersApplied: string[]; removed: FilterableProduct[] } {
  const filtersApplied: string[] = [];
  const removed: FilterableProduct[] = [];

  let filtered = [...products];

  // Pregnancy safety filter
  if (userContext.pregnancySafe) {
    const beforeCount = filtered.length;
    filtered = filtered.filter(p => {
      const hasUnsafe = p.ingredients?.some(ing =>
        PREGNANCY_UNSAFE_INGREDIENTS.some(unsafe => ing.toLowerCase().includes(unsafe))
      );
      if (hasUnsafe) removed.push(p);
      return !hasUnsafe;
    });
    if (filtered.length < beforeCount) {
      filtersApplied.push('Removed pregnancy-unsafe products');
    }
  }

  // Beginner safety filter
  if (userContext.experienceLevel === 'beginner') {
    const beforeCount = filtered.length;
    filtered = filtered.filter(p => {
      const hasAdvanced = p.ingredients?.some(ing =>
        ADVANCED_INGREDIENTS.some(adv => ing.toLowerCase().includes(adv))
      );
      if (hasAdvanced) removed.push(p);
      return !hasAdvanced;
    });
    if (filtered.length < beforeCount) {
      filtersApplied.push('Removed advanced-strength products (beginner-safe only)');
    }
  }

  // Sensitivity filter
  if (userContext.sensitivities && userContext.sensitivities.length > 0) {
    const beforeCount = filtered.length;
    filtered = filtered.filter(p => {
      const hasSensitivity = p.ingredients?.some(ing =>
        userContext.sensitivities!.some(sens => ing.toLowerCase().includes(sens.toLowerCase()))
      );
      if (hasSensitivity) removed.push(p);
      return !hasSensitivity;
    });
    if (filtered.length < beforeCount) {
      filtersApplied.push(`Removed products with ${userContext.sensitivities.join(', ')}`);
    }
  }

  // AM/PM timing filter
  if (userContext.timing === 'am') {
    const beforeCount = filtered.length;
    filtered = filtered.filter(p => {
      const hasPhotosensitizing = p.keyIngredients?.some(ing =>
        PHOTOSENSITIZING_INGREDIENTS.some(ps => ing.toLowerCase().includes(ps))
      );
      // Only filter treatments/actives, not products that just contain these in small amounts
      if (hasPhotosensitizing && ['serum', 'treatment', 'exfoliant'].includes(p.category)) {
        removed.push(p);
        return false;
      }
      return true;
    });
    if (filtered.length < beforeCount) {
      filtersApplied.push('Filtered photosensitizing actives for AM use');
    }
  }

  return { products: filtered, filtersApplied, removed };
}

// ============================================================================
// PRODUCT FILTERING
// ============================================================================

/**
 * Apply filters to product list
 */
export function filterProducts(
  products: FilterableProduct[],
  filters: ProductFilters
): FilterResult {
  const appliedFilters: string[] = [];
  let filtered = [...products];
  const initialCount = filtered.length;

  // Skin type filter
  if (filters.skinType && filters.skinType.length > 0) {
    filtered = filtered.filter(p =>
      p.skinTypes?.some(st => filters.skinType!.includes(st.toLowerCase()))
    );
    appliedFilters.push(`Skin type: ${filters.skinType.join(', ')}`);
  }

  // Concerns filter
  if (filters.concerns && filters.concerns.length > 0) {
    filtered = filtered.filter(p =>
      p.concerns?.some(c => filters.concerns!.some(fc => c.toLowerCase().includes(fc.toLowerCase())))
    );
    appliedFilters.push(`Concerns: ${filters.concerns.join(', ')}`);
  }

  // Include ingredients
  if (filters.includeIngredients && filters.includeIngredients.length > 0) {
    filtered = filtered.filter(p =>
      filters.includeIngredients!.every(ing =>
        p.ingredients?.some(pIng => pIng.toLowerCase().includes(ing.toLowerCase())) ||
        p.keyIngredients?.some(pIng => pIng.toLowerCase().includes(ing.toLowerCase()))
      )
    );
    appliedFilters.push(`Contains: ${filters.includeIngredients.join(', ')}`);
  }

  // Exclude ingredients
  if (filters.excludeIngredients && filters.excludeIngredients.length > 0) {
    filtered = filtered.filter(p =>
      !filters.excludeIngredients!.some(ing =>
        p.ingredients?.some(pIng => pIng.toLowerCase().includes(ing.toLowerCase()))
      )
    );
    appliedFilters.push(`Without: ${filters.excludeIngredients.join(', ')}`);
  }

  // Fragrance-free
  if (filters.fragranceFree) {
    filtered = filtered.filter(p => p.isFragranceFree === true);
    appliedFilters.push('Fragrance-free');
  }

  // Non-comedogenic
  if (filters.nonComedogenic) {
    filtered = filtered.filter(p => p.isNonComedogenic === true);
    appliedFilters.push('Non-comedogenic');
  }

  // Pregnancy-safe
  if (filters.pregnancySafe) {
    filtered = filtered.filter(p => p.isPregnancySafe === true);
    appliedFilters.push('Pregnancy-safe');
  }

  // Price range
  if (filters.priceRange) {
    const ranges = { budget: [0, 25], mid: [25, 50], premium: [50, 500] };
    const [min, max] = ranges[filters.priceRange];
    filtered = filtered.filter(p => p.price && p.price >= min && p.price <= max);
    appliedFilters.push(`Price: ${filters.priceRange}`);
  }

  // Specific price bounds
  if (filters.priceMin !== undefined) {
    filtered = filtered.filter(p => p.price && p.price >= filters.priceMin!);
    appliedFilters.push(`Price: $${filters.priceMin}+`);
  }
  if (filters.priceMax !== undefined) {
    filtered = filtered.filter(p => p.price && p.price <= filters.priceMax!);
    appliedFilters.push(`Price: under $${filters.priceMax}`);
  }

  // Brand
  if (filters.brand && filters.brand.length > 0) {
    filtered = filtered.filter(p =>
      filters.brand!.some(b => p.brand.toLowerCase().includes(b.toLowerCase()))
    );
    appliedFilters.push(`Brand: ${filters.brand.join(', ')}`);
  }

  // Category
  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter(p =>
      filters.category!.some(c => p.category.toLowerCase().includes(c.toLowerCase()))
    );
    appliedFilters.push(`Category: ${filters.category.join(', ')}`);
  }

  // Texture
  if (filters.texture && filters.texture.length > 0) {
    filtered = filtered.filter(p =>
      filters.texture!.some(t => p.texture?.toLowerCase().includes(t.toLowerCase()))
    );
    appliedFilters.push(`Texture: ${filters.texture.join(', ')}`);
  }

  // Strength level
  if (filters.strengthLevel) {
    filtered = filtered.filter(p => p.strengthLevel === filters.strengthLevel);
    appliedFilters.push(`Strength: ${filters.strengthLevel}`);
  }

  // Source
  if (filters.source && filters.source !== 'all') {
    filtered = filtered.filter(p => p.source === filters.source);
    appliedFilters.push(`Source: ${filters.source}`);
  }

  return {
    products: filtered,
    appliedFilters,
    removedCount: initialCount - filtered.length,
    safetyFiltersApplied: [],
  };
}

// ============================================================================
// PRODUCT SORTING
// ============================================================================

/**
 * Sort products by criteria
 */
export function sortProducts(
  products: FilterableProduct[],
  sortBy: SortOption,
  userContext?: {
    concerns?: string[];
    skinType?: string;
  }
): FilterableProduct[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));

    case 'price_desc':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));

    case 'gentleness':
      const strengthOrder = { gentle: 0, moderate: 1, strong: 2 };
      return sorted.sort((a, b) =>
        (strengthOrder[a.strengthLevel || 'moderate']) - (strengthOrder[b.strengthLevel || 'moderate'])
      );

    case 'strength':
      const strengthOrderDesc = { gentle: 2, moderate: 1, strong: 0 };
      return sorted.sort((a, b) =>
        (strengthOrderDesc[a.strengthLevel || 'moderate']) - (strengthOrderDesc[b.strengthLevel || 'moderate'])
      );

    case 'concern_match':
      if (!userContext?.concerns) return sorted;
      return sorted.sort((a, b) => {
        const aMatches = a.concerns?.filter(c =>
          userContext.concerns!.some(uc => c.toLowerCase().includes(uc.toLowerCase()))
        ).length || 0;
        const bMatches = b.concerns?.filter(c =>
          userContext.concerns!.some(uc => c.toLowerCase().includes(uc.toLowerCase()))
        ).length || 0;
        return bMatches - aMatches;
      });

    case 'relevance':
    default:
      // Score by multiple factors
      return sorted.sort((a, b) => {
        let aScore = 0;
        let bScore = 0;

        // Skin type match
        if (userContext?.skinType) {
          if (a.skinTypes?.includes(userContext.skinType)) aScore += 2;
          if (b.skinTypes?.includes(userContext.skinType)) bScore += 2;
        }

        // Concern match
        if (userContext?.concerns) {
          aScore += a.concerns?.filter(c =>
            userContext.concerns!.some(uc => c.toLowerCase().includes(uc.toLowerCase()))
          ).length || 0;
          bScore += b.concerns?.filter(c =>
            userContext.concerns!.some(uc => c.toLowerCase().includes(uc.toLowerCase()))
          ).length || 0;
        }

        return bScore - aScore;
      });
  }
}

// ============================================================================
// PRODUCT COMPARISON
// ============================================================================

/**
 * Compare products side-by-side
 */
export function compareProducts(
  products: FilterableProduct[],
  userContext?: {
    skinType?: string;
    concerns?: string[];
    budget?: 'budget' | 'mid' | 'premium';
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  }
): ProductComparison {
  const differences: ComparisonDifference[] = [];

  // Compare price
  const priceValues: Record<number, number | undefined> = {};
  products.forEach(p => { priceValues[p.id] = p.price; });
  const lowestPrice = Math.min(...products.filter(p => p.price).map(p => p.price!));
  differences.push({
    attribute: 'Price',
    values: priceValues,
    winner: products.find(p => p.price === lowestPrice)?.id,
    explanation: userContext?.budget === 'budget' ? 'Lower price preferred' : undefined,
  });

  // Compare strength
  const strengthValues: Record<number, string | undefined> = {};
  products.forEach(p => { strengthValues[p.id] = p.strengthLevel; });
  const preferGentleLevel = userContext?.experienceLevel === 'beginner' ? 'gentle' : undefined;
  const gentleProduct = preferGentleLevel ? products.find(p => p.strengthLevel === 'gentle') : undefined;
  differences.push({
    attribute: 'Strength',
    values: strengthValues,
    winner: gentleProduct?.id,
    explanation: userContext?.experienceLevel === 'beginner' ? 'Gentler is better for beginners' : undefined,
  });

  // Compare key ingredients
  const ingredientValues: Record<number, string | undefined> = {};
  products.forEach(p => { ingredientValues[p.id] = p.keyIngredients?.join(', '); });
  differences.push({
    attribute: 'Key Ingredients',
    values: ingredientValues,
  });

  // Compare skin type suitability
  const skinTypeValues: Record<number, string | undefined> = {};
  products.forEach(p => { skinTypeValues[p.id] = p.skinTypes?.join(', '); });
  const skinTypeMatch = userContext?.skinType
    ? products.find(p => p.skinTypes?.includes(userContext.skinType!))
    : undefined;
  differences.push({
    attribute: 'Skin Types',
    values: skinTypeValues,
    winner: skinTypeMatch?.id,
    explanation: userContext?.skinType ? `Matches your ${userContext.skinType} skin` : undefined,
  });

  // Compare texture
  const textureValues: Record<number, string | undefined> = {};
  products.forEach(p => { textureValues[p.id] = p.texture; });
  differences.push({
    attribute: 'Texture',
    values: textureValues,
  });

  // Compare fragrance
  const fragranceValues: Record<number, boolean | undefined> = {};
  products.forEach(p => { fragranceValues[p.id] = p.isFragranceFree; });
  differences.push({
    attribute: 'Fragrance-Free',
    values: fragranceValues,
  });

  // Determine overall recommendation
  const scores: Record<number, number> = {};
  products.forEach(p => { scores[p.id] = 0; });

  differences.forEach(diff => {
    if (diff.winner) {
      scores[diff.winner] = (scores[diff.winner] || 0) + 1;
    }
  });

  const maxScore = Math.max(...Object.values(scores));
  const winnerId = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
  const winner = products.find(p => p.id === Number(winnerId));

  return {
    products,
    differences,
    recommendation: winner ? {
      productId: winner.id,
      reason: generateComparisonRecommendation(winner, userContext),
    } : undefined,
  };
}

/**
 * Generate recommendation reason for comparison winner
 */
function generateComparisonRecommendation(
  product: FilterableProduct,
  userContext?: {
    skinType?: string;
    concerns?: string[];
    budget?: 'budget' | 'mid' | 'premium';
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  }
): string {
  const reasons: string[] = [];

  if (userContext?.skinType && product.skinTypes?.includes(userContext.skinType)) {
    reasons.push(`suits your ${userContext.skinType} skin`);
  }

  if (userContext?.experienceLevel === 'beginner' && product.strengthLevel === 'gentle') {
    reasons.push('gentle enough for beginners');
  }

  if (userContext?.budget === 'budget' && product.price && product.price < 25) {
    reasons.push('fits your budget');
  }

  if (product.isFragranceFree) {
    reasons.push('fragrance-free');
  }

  if (reasons.length === 0) {
    reasons.push('best overall match for your profile');
  }

  return `${product.name} is recommended because it ${reasons.join(', ')}.`;
}

// ============================================================================
// PRODUCT LINKS
// ============================================================================

/**
 * Generate correct product link based on source
 */
export function getProductLink(product: FilterableProduct): string {
  if (product.source === 'marketplace') {
    return `/marketplace/product/${product.id}`;
  }
  return `/product-detail/${product.id}`;
}

/**
 * Format product with link for display
 */
export function formatProductWithLink(product: FilterableProduct): string {
  const link = getProductLink(product);
  const price = product.price ? ` ($${product.price})` : '';
  return `[${product.brand} ${product.name}](${link})${price}`;
}

// ============================================================================
// ALTERNATIVES
// ============================================================================

/**
 * Find alternative products when one is unsuitable
 */
export function findAlternatives(
  unsuitableProduct: FilterableProduct,
  allProducts: FilterableProduct[],
  reason: 'pregnancy' | 'sensitivity' | 'strength' | 'price' | 'ingredient',
  userContext?: {
    sensitivities?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    priceMax?: number;
  }
): FilterableProduct[] {
  // Start with same category
  let alternatives = allProducts.filter(p =>
    p.id !== unsuitableProduct.id &&
    p.category === unsuitableProduct.category
  );

  // Apply reason-specific filters
  switch (reason) {
    case 'pregnancy':
      alternatives = alternatives.filter(p => p.isPregnancySafe === true);
      break;

    case 'sensitivity':
      if (userContext?.sensitivities) {
        alternatives = alternatives.filter(p =>
          !p.ingredients?.some(ing =>
            userContext.sensitivities!.some(s => ing.toLowerCase().includes(s.toLowerCase()))
          )
        );
      }
      break;

    case 'strength':
      if (userContext?.experienceLevel === 'beginner') {
        alternatives = alternatives.filter(p => p.strengthLevel === 'gentle');
      }
      break;

    case 'price':
      if (userContext?.priceMax) {
        alternatives = alternatives.filter(p => p.price && p.price <= userContext.priceMax!);
      }
      break;

    case 'ingredient':
      // Find products with similar benefits but different active ingredients
      alternatives = alternatives.filter(p =>
        p.concerns?.some(c => unsuitableProduct.concerns?.includes(c))
      );
      break;
  }

  // Sort by relevance to original product's concerns
  return alternatives.slice(0, 5);
}

// ============================================================================
// BUNDLE / STARTER ROUTINE
// ============================================================================

/**
 * Build a starter routine bundle
 */
export function buildStarterBundle(
  products: FilterableProduct[],
  userContext: {
    skinType?: string;
    concerns?: string[];
    budget?: 'budget' | 'mid' | 'premium';
    routineType: 'minimal' | 'basic' | 'complete';
  }
): { bundle: FilterableProduct[]; totalPrice: number; explanation: string } {
  const bundle: FilterableProduct[] = [];

  // Define required categories by routine type
  const categoryNeeds: Record<string, string[]> = {
    minimal: ['cleanser', 'moisturizer', 'sunscreen'],
    basic: ['cleanser', 'serum', 'moisturizer', 'sunscreen'],
    complete: ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment'],
  };

  const categories = categoryNeeds[userContext.routineType];

  // Filter products by budget and skin type first
  let availableProducts = [...products];
  if (userContext.budget) {
    const priceRanges = { budget: 25, mid: 50, premium: 500 };
    const maxPrice = priceRanges[userContext.budget];
    availableProducts = availableProducts.filter(p => !p.price || p.price <= maxPrice);
  }
  if (userContext.skinType) {
    availableProducts = availableProducts.filter(p =>
      !p.skinTypes || p.skinTypes.includes(userContext.skinType!)
    );
  }

  // Select one product per category
  for (const category of categories) {
    const options = availableProducts.filter(p =>
      p.category.toLowerCase().includes(category)
    );

    if (options.length > 0) {
      // Sort by concern match
      const sorted = sortProducts(options, 'relevance', {
        concerns: userContext.concerns,
        skinType: userContext.skinType,
      });
      bundle.push(sorted[0]);
    }
  }

  const totalPrice = bundle.reduce((sum, p) => sum + (p.price || 0), 0);

  const explanation = userContext.routineType === 'minimal'
    ? 'A simple 3-step routine covering the essentials: cleanse, moisturize, protect.'
    : userContext.routineType === 'basic'
    ? 'A 4-step routine adding a targeted treatment to address your concerns.'
    : 'A complete routine for comprehensive skincare coverage.';

  return { bundle, totalPrice, explanation };
}

// ============================================================================
// SHOPPING CONTEXT
// ============================================================================

/**
 * Full shopping context for AI
 */
export interface ShoppingContext {
  filters: ProductFilters;
  sortBy: SortOption;
  results: FilterableProduct[];
  appliedFilters: string[];
  safetyFiltersApplied: string[];
  totalAvailable: number;
  comparison?: ProductComparison;
}

/**
 * Build shopping context from user message and products
 */
export function buildShoppingContext(
  message: string,
  products: FilterableProduct[],
  userProfile?: {
    skinType?: string;
    concerns?: string[];
    sensitivities?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    pregnancySafe?: boolean;
  }
): ShoppingContext {
  // Extract filters from message
  const messageFilters = extractFiltersFromMessage(message);

  // Merge with user profile
  const filters: ProductFilters = {
    ...messageFilters,
    skinType: messageFilters.skinType || (userProfile?.skinType ? [userProfile.skinType] : undefined),
    concerns: messageFilters.concerns || userProfile?.concerns,
    pregnancySafe: messageFilters.pregnancySafe || userProfile?.pregnancySafe,
  };

  // Apply filters
  const filterResult = filterProducts(products, filters);

  // Apply safety filters
  const safetyResult = applySafetyFilters(filterResult.products, {
    pregnancySafe: userProfile?.pregnancySafe,
    experienceLevel: userProfile?.experienceLevel,
    sensitivities: userProfile?.sensitivities,
  });

  // Sort results
  const sortBy: SortOption = 'relevance';
  const sorted = sortProducts(safetyResult.products, sortBy, {
    concerns: userProfile?.concerns,
    skinType: userProfile?.skinType,
  });

  return {
    filters,
    sortBy,
    results: sorted,
    appliedFilters: filterResult.appliedFilters,
    safetyFiltersApplied: safetyResult.filtersApplied,
    totalAvailable: products.length,
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Shopping intelligence principles
 */
export const SHOPPING_PRINCIPLES = {
  personalization: [
    'Prioritize products matching skin type and concerns',
    'Avoid ingredients user is sensitive to',
    'Adjust strength based on experience level',
    'Consider browsing and purchase history',
    'Respect stated preferences',
  ],
  safety: [
    'Remove pregnancy-unsafe products when applicable',
    'Filter advanced products for beginners',
    'Flag photosensitizing ingredients for AM',
    'Prevent multiple exfoliants in same routine',
  ],
  comparison: [
    'Highlight ingredient differences',
    'Compare strength and gentleness',
    'Note price differences',
    'Provide clear recommendation',
    'Avoid brand bias',
  ],
  output: [
    'Explain why each product fits',
    'Include correct product links',
    'Add safety notes when relevant',
    'Keep recommendations concise',
  ],
} as const;
