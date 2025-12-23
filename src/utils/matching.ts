// Concern synonyms map: userConcern -> array of product concern variations
export const concernMap: Record<string, string[]> = {
  acne: ['acne', 'breakouts', 'blemishes', 'pimples'],
  aging: ['aging', 'anti-aging', 'wrinkles', 'fine lines', 'firmness'],
  dryness: ['dryness', 'dry skin', 'dehydration', 'hydration'],
  oiliness: ['oiliness', 'oily skin', 'excess oil', 'shine control'],
  sensitivity: ['sensitivity', 'sensitive skin', 'redness', 'irritation'],
  hyperpigmentation: ['hyperpigmentation', 'dark spots', 'uneven skin tone', 'discoloration', 'brightening'],
  pores: ['pores', 'large pores', 'pore minimizing'],
  dullness: ['dullness', 'dull skin', 'radiance', 'glow'],
  texture: ['texture', 'rough texture', 'smoothing', 'uneven texture'],
  'dark circles': ['dark circles', 'under-eye circles', 'eye bags'],
};

// Ingredient map: concern -> recommended ingredients
export const ingredientMap: Record<string, string[]> = {
  acne: ['salicylic acid', 'benzoyl peroxide', 'niacinamide', 'tea tree', 'zinc'],
  aging: ['retinol', 'vitamin c', 'peptides', 'hyaluronic acid', 'collagen'],
  dryness: ['hyaluronic acid', 'ceramides', 'squalane', 'glycerin', 'shea butter'],
  oiliness: ['niacinamide', 'salicylic acid', 'clay', 'zinc', 'witch hazel'],
  sensitivity: ['centella asiatica', 'aloe vera', 'chamomile', 'oat extract', 'allantoin'],
  hyperpigmentation: ['vitamin c', 'niacinamide', 'alpha arbutin', 'kojic acid', 'azelaic acid'],
  pores: ['niacinamide', 'salicylic acid', 'retinol', 'clay', 'aha'],
  dullness: ['vitamin c', 'aha', 'glycolic acid', 'lactic acid', 'niacinamide'],
  texture: ['aha', 'bha', 'retinol', 'glycolic acid', 'lactic acid'],
  'dark circles': ['vitamin c', 'caffeine', 'retinol', 'peptides', 'vitamin k'],
};

/**
 * Check if a product concern matches any of the user's concerns (with synonym support)
 */
export function matchesConcern(
  productConcern: string,
  userConcerns: string[]
): boolean {
  const normalizedProductConcern = productConcern.toLowerCase();

  return userConcerns.some((userConcern) => {
    const normalizedUserConcern = userConcern.toLowerCase();
    const synonyms = concernMap[normalizedUserConcern] || [];

    return (
      normalizedProductConcern === normalizedUserConcern ||
      synonyms.includes(normalizedProductConcern)
    );
  });
}

/**
 * Check if an ingredient is recommended for any of the user's concerns
 */
export function matchesIngredient(
  ingredient: string,
  userConcerns: string[]
): boolean {
  const normalizedIngredient = ingredient.toLowerCase();

  return userConcerns.some((userConcern) => {
    const normalizedConcern = userConcern.toLowerCase();
    const recommendedIngredients = ingredientMap[normalizedConcern] || [];

    return recommendedIngredients.some(
      (rec) =>
        normalizedIngredient.includes(rec) || rec.includes(normalizedIngredient)
    );
  });
}

/**
 * Check if a product is recommended based on synonym-aware concern matching
 */
export function isProductRecommended(
  productConcerns: string[] | undefined,
  userConcerns: string[]
): boolean {
  if (!productConcerns || productConcerns.length === 0) return false;
  if (!userConcerns || userConcerns.length === 0) return false;

  return productConcerns.some((productConcern) =>
    matchesConcern(productConcern, userConcerns)
  );
}