/**
 * Ingredient Category Registry
 *
 * Canonical source of truth for ingredient categories across the app.
 * Adding a new category requires updating only this file.
 */

/**
 * All valid ingredient category keys.
 */
export const INGREDIENT_CATEGORY_KEYS = [
  'hydration',
  'brightening',
  'antiaging',
  'soothing',
  'exfoliation',
] as const

export type IngredientCategory = (typeof INGREDIENT_CATEGORY_KEYS)[number]

export interface IngredientCategoryEntry {
  value: 'all' | IngredientCategory
  label: string
  icon: string
}

/**
 * Full category list including the "All Ingredients" option.
 * Used by UI filters (Ingredient Library, future surfaces).
 */
export const INGREDIENT_CATEGORIES: IngredientCategoryEntry[] = [
  { value: 'all', label: 'All Ingredients', icon: 'ri-grid-line' },
  { value: 'hydration', label: 'Hydration', icon: 'ri-drop-line' },
  { value: 'brightening', label: 'Brightening', icon: 'ri-sun-line' },
  { value: 'antiaging', label: 'Anti-Aging', icon: 'ri-time-line' },
  { value: 'soothing', label: 'Soothing', icon: 'ri-heart-line' },
  { value: 'exfoliation', label: 'Exfoliation', icon: 'ri-contrast-drop-2-line' },
]

const labelMap = new Map(INGREDIENT_CATEGORIES.map(c => [c.value, c.label]))
const iconMap = new Map(INGREDIENT_CATEGORIES.map(c => [c.value, c.icon]))

/**
 * Look up display label for an ingredient category value.
 * Returns the value itself (capitalized) if not found.
 */
export function getIngredientCategoryLabel(value: string): string {
  return labelMap.get(value) ?? value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Look up icon class for an ingredient category value.
 * Returns a default grid icon if not found.
 */
export function getIngredientCategoryIcon(value: string): string {
  return iconMap.get(value) ?? 'ri-grid-line'
}
