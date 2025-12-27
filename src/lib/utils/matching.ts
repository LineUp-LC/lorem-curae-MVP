// =============================================================================
// CONCERN MAPPING
// =============================================================================

// Quiz concern labels -> normalized keys
// Maps the exact strings from QuizFlow.tsx to our internal concern keys
const quizConcernToKey: Record<string, string> = {
  'uneven skin tone': 'hyperpigmentation',
  'dullness': 'dullness',
  'enlarged pores': 'pores',
  'textural irregularities': 'texture',
  'damaged skin barrier': 'sensitivity',
  'signs of aging': 'aging',
  'acne prone': 'acne',
  'sun protection': 'sun protection',
  'exzema': 'sensitivity',
  'eczema': 'sensitivity',
  'lack of hydration': 'dryness',
  'sun damage': 'hyperpigmentation',
  'rosacea': 'sensitivity',
  'dark circles': 'dark circles',
  'congested skin': 'pores',
  'scarring': 'scarring',
  'looking for gentle products': 'sensitivity',
};

// Concern synonyms map: normalized concern key -> array of product concern variations
export const concernMap: Record<string, string[]> = {
  acne: ['acne', 'breakouts', 'blemishes', 'pimples', 'acne prone'],
  aging: ['aging', 'anti-aging', 'wrinkles', 'fine lines', 'firmness', 'signs of aging'],
  dryness: ['dryness', 'dry skin', 'dehydration', 'hydration', 'lack of hydration', 'moisturizing'],
  oiliness: ['oiliness', 'oily skin', 'excess oil', 'shine control'],
  sensitivity: ['sensitivity', 'sensitive skin', 'redness', 'irritation', 'rosacea', 'barrier repair', 'calming', 'gentle'],
  hyperpigmentation: ['hyperpigmentation', 'dark spots', 'uneven skin tone', 'discoloration', 'brightening', 'sun damage', 'tone'],
  pores: ['pores', 'large pores', 'pore minimizing', 'enlarged pores', 'congestion', 'congested'],
  dullness: ['dullness', 'dull skin', 'radiance', 'glow', 'brightening'],
  texture: ['texture', 'rough texture', 'smoothing', 'uneven texture', 'textural irregularities', 'exfoliation'],
  'dark circles': ['dark circles', 'under-eye circles', 'eye bags', 'eye care'],
  'sun protection': ['sun protection', 'spf', 'uv', 'sunscreen'],
  scarring: ['scarring', 'scars', 'healing', 'post-acne'],
};

// Ingredient map: concern -> recommended ingredients
export const ingredientMap: Record<string, string[]> = {
  acne: ['salicylic acid', 'benzoyl peroxide', 'niacinamide', 'tea tree', 'zinc'],
  aging: ['retinol', 'vitamin c', 'peptides', 'hyaluronic acid', 'collagen'],
  dryness: ['hyaluronic acid', 'ceramides', 'squalane', 'glycerin', 'shea butter'],
  oiliness: ['niacinamide', 'salicylic acid', 'clay', 'zinc', 'witch hazel'],
  sensitivity: ['centella asiatica', 'aloe vera', 'chamomile', 'oat extract', 'allantoin', 'ceramides'],
  hyperpigmentation: ['vitamin c', 'niacinamide', 'alpha arbutin', 'kojic acid', 'azelaic acid'],
  pores: ['niacinamide', 'salicylic acid', 'retinol', 'clay', 'aha'],
  dullness: ['vitamin c', 'aha', 'glycolic acid', 'lactic acid', 'niacinamide'],
  texture: ['aha', 'bha', 'retinol', 'glycolic acid', 'lactic acid'],
  'dark circles': ['vitamin c', 'caffeine', 'retinol', 'peptides', 'vitamin k'],
  'sun protection': ['zinc oxide', 'titanium dioxide', 'avobenzone', 'vitamin e'],
  scarring: ['retinol', 'vitamin c', 'niacinamide', 'aha', 'centella asiatica'],
};

/**
 * Normalize a user concern from the quiz to our internal key
 * e.g., "Acne Prone" -> "acne", "Signs of Aging" -> "aging"
 */
export function normalizeUserConcern(userConcern: string): string {
  const lowered = userConcern.toLowerCase().trim();
  return quizConcernToKey[lowered] || lowered;
}

/**
 * Get all product concern variations for a user concern
 * e.g., "Acne Prone" -> ['acne', 'breakouts', 'blemishes', 'pimples', 'acne prone']
 */
export function getProductConcernVariations(userConcern: string): string[] {
  const normalizedKey = normalizeUserConcern(userConcern);
  return concernMap[normalizedKey] || [normalizedKey, userConcern.toLowerCase()];
}

/**
 * Check if a single product concern matches any of the user's concerns (with synonym support)
 */
export function matchesConcern(
  productConcern: string,
  userConcerns: string[]
): boolean {
  const normalizedProductConcern = productConcern.toLowerCase().trim();

  return userConcerns.some((userConcern) => {
    const variations = getProductConcernVariations(userConcern);
    
    // Check exact match or if product concern is in our variations list
    return variations.some(
      (variation) =>
        normalizedProductConcern === variation ||
        normalizedProductConcern.includes(variation) ||
        variation.includes(normalizedProductConcern)
    );
  });
}

/**
 * Check if a product's concerns array matches any user concerns
 * This is the main function to use for filtering products
 */
export function productMatchesUserConcerns(
  productConcerns: string[] | undefined,
  userConcerns: string[]
): boolean {
  if (!productConcerns || productConcerns.length === 0) return false;
  if (!userConcerns || userConcerns.length === 0) return false;

  return productConcerns.some((productConcern) =>
    matchesConcern(productConcern, userConcerns)
  );
}

/**
 * Check if an ingredient is recommended for any of the user's concerns
 */
export function matchesIngredient(
  ingredient: string,
  userConcerns: string[]
): boolean {
  const normalizedIngredient = ingredient.toLowerCase().trim();

  return userConcerns.some((userConcern) => {
    const normalizedKey = normalizeUserConcern(userConcern);
    const recommendedIngredients = ingredientMap[normalizedKey] || [];

    return recommendedIngredients.some(
      (rec) =>
        normalizedIngredient.includes(rec) || rec.includes(normalizedIngredient)
    );
  });
}

/**
 * Check if a product is recommended based on synonym-aware concern matching
 * @deprecated Use productMatchesUserConcerns instead
 */
export function isProductRecommended(
  productConcerns: string[] | undefined,
  userConcerns: string[]
): boolean {
  return productMatchesUserConcerns(productConcerns, userConcerns);
}