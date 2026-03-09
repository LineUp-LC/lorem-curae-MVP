/**
 * Ingredient-Product Matching Utilities
 *
 * Finds products that contain a given ingredient and optionally
 * filters them by user skin profile compatibility.
 */

import type { Product } from '../../types/product'
import { productCatalog } from '../data/products'
import { isSkinTypeMatch } from './productMetadata'
import { productMatchesUserConcerns } from './matching'
import { SLUG_TO_NAME, getIngredientSlug } from './ingredientSlug'

// Re-export for consumers that import from this module
export { getIngredientSlug }

/**
 * Check if a product contains an ingredient by slug.
 * Searches keyIngredients and activeIngredients arrays.
 */
function productContainsIngredient(product: Product, ingredientSlug: string): boolean {
  const names = SLUG_TO_NAME[ingredientSlug]
  if (!names) return false

  const allIngredients: string[] = [
    ...(product.keyIngredients || []),
    ...((product.activeIngredients || []).map(ai => ai.name)),
  ]

  return allIngredients.some(ing => {
    const lower = ing.toLowerCase()
    return names.some(name => lower.includes(name) || name.includes(lower))
  })
}

/**
 * Get all products that contain a given ingredient.
 */
export function getProductsForIngredient(ingredientSlug: string): Product[] {
  return productCatalog.filter(p => productContainsIngredient(p, ingredientSlug))
}

/**
 * Get products that contain the ingredient AND match the user's skin profile.
 * Falls back to all ingredient-matching products if no profile is provided.
 */
export function getPersonalizedIngredientProducts(
  ingredientSlug: string,
  userSkinType?: string,
  userConcerns?: string[],
): Product[] {
  const ingredientProducts = getProductsForIngredient(ingredientSlug)

  if (!userSkinType && (!userConcerns || userConcerns.length === 0)) {
    return ingredientProducts
  }

  const personalized = ingredientProducts.filter(product => {
    const skinTypeOk = !userSkinType ||
      (product.skinTypes || []).some(st => isSkinTypeMatch(st, userSkinType))
    const concernsOk = !userConcerns || userConcerns.length === 0 ||
      productMatchesUserConcerns(product.concerns, userConcerns)
    return skinTypeOk || concernsOk
  })

  // If personalization filters out everything, return all ingredient products
  return personalized.length > 0 ? personalized : ingredientProducts
}
