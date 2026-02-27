/**
 * Product Category Registry
 *
 * Canonical source of truth for product categories across the app.
 * Adding a new category requires updating only this file.
 */

/**
 * All valid product category keys.
 */
export const CATEGORY_KEYS = [
  'cleanser',
  'toner',
  'serum',
  'essence',
  'moisturizer',
  'sunscreen',
  'treatment',
  'eye-care',
  'lip-care',
  'mask',
  'exfoliator',
  'oil',
  'mist',
  'tool',
] as const

export type ProductCategory = (typeof CATEGORY_KEYS)[number]

export interface CategoryEntry {
  value: 'all' | ProductCategory
  label: string
  icon: string
}

/**
 * Full category list including the "All Products" option.
 * Used by UI filters (Discover page, future surfaces).
 */
export const PRODUCT_CATEGORIES: CategoryEntry[] = [
  { value: 'all', label: 'All Products', icon: 'ri-grid-line' },
  { value: 'cleanser', label: 'Cleansers', icon: 'ri-drop-line' },
  { value: 'toner', label: 'Toners', icon: 'ri-contrast-drop-line' },
  { value: 'serum', label: 'Serums', icon: 'ri-flask-line' },
  { value: 'essence', label: 'Essences', icon: 'ri-water-flash-line' },
  { value: 'moisturizer', label: 'Moisturizers', icon: 'ri-contrast-drop-2-line' },
  { value: 'sunscreen', label: 'Sunscreen', icon: 'ri-sun-line' },
  { value: 'treatment', label: 'Treatments', icon: 'ri-heart-pulse-line' },
  { value: 'eye-care', label: 'Eye Care', icon: 'ri-eye-line' },
  { value: 'lip-care', label: 'Lip Care', icon: 'ri-chat-smile-3-line' },
  { value: 'mask', label: 'Masks', icon: 'ri-user-smile-line' },
  { value: 'exfoliator', label: 'Exfoliators', icon: 'ri-refresh-line' },
  { value: 'oil', label: 'Face Oils', icon: 'ri-drop-fill' },
  { value: 'mist', label: 'Mists & Sprays', icon: 'ri-cloud-line' },
  { value: 'tool', label: 'Tools & Devices', icon: 'ri-tools-line' },
]

const labelMap = new Map(PRODUCT_CATEGORIES.map(c => [c.value, c.label]))
const iconMap = new Map(PRODUCT_CATEGORIES.map(c => [c.value, c.icon]))

/**
 * Look up display label for a category value.
 * Returns the value itself (capitalized) if not found.
 */
export function getCategoryLabel(value: string): string {
  return labelMap.get(value) ?? value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Look up icon class for a category value.
 * Returns a default grid icon if not found.
 */
export function getCategoryIcon(value: string): string {
  return iconMap.get(value) ?? 'ri-grid-line'
}
