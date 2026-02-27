/**
 * Search Index Builder
 *
 * Builds a unified, dynamic search index from product data, ingredient data,
 * and page registry. Provides category filtering utilities.
 *
 * All search results follow a consistent shape and link to canonical routes.
 */

import { productData } from '../../mocks/products'

export interface SearchResult {
  id: number | string
  title: string
  category: 'Product' | 'Ingredient' | 'Page'
  description: string
  image?: string
  link: string
}

/**
 * Ingredient registry — canonical list matching IngredientLibrary.
 * IDs are normalized slugs matching the `?id=` param the ingredients page expects.
 */
const ingredientRegistry: { id: string; name: string; description: string }[] = [
  { id: 'hyaluronic-acid', name: 'Hyaluronic Acid', description: 'Powerful humectant that attracts and retains moisture in the skin' },
  { id: 'niacinamide', name: 'Niacinamide', description: 'Versatile vitamin B3 for pore refinement and brightening' },
  { id: 'retinol', name: 'Retinol', description: 'Gold-standard vitamin A derivative for anti-aging and texture' },
  { id: 'vitamin-c', name: 'Vitamin C', description: 'Antioxidant that brightens and protects against environmental damage' },
  { id: 'ceramides', name: 'Ceramides', description: 'Essential lipids that restore and maintain the skin barrier' },
  { id: 'peptides', name: 'Peptides', description: 'Amino acid chains that support collagen production and firming' },
  { id: 'centella-asiatica', name: 'Centella Asiatica', description: 'Calming botanical extract for soothing and healing' },
  { id: 'salicylic-acid', name: 'Salicylic Acid', description: 'BHA that clears pore congestion and prevents breakouts' },
  { id: 'glycolic-acid', name: 'Glycolic Acid', description: 'AHA that exfoliates the surface for brighter, smoother skin' },
]

/**
 * Page registry — key navigable pages in the app.
 */
const pageRegistry: { id: string; title: string; description: string; link: string }[] = [
  { id: 'discover', title: 'Product Discovery', description: 'Discover your perfect skincare routine', link: '/discover' },
  { id: 'ingredients', title: 'Ingredient Library', description: 'Explore skincare ingredients and their benefits', link: '/ingredients' },
  { id: 'skin-survey', title: 'Skin Survey', description: 'Complete your skin profile assessment', link: '/skin-survey' },
  { id: 'ai-chat', title: 'AI Skin Advisor', description: 'Get personalized skincare guidance', link: '/ai-chat' },
  { id: 'routines', title: 'Routine Builder', description: 'Build and track your skincare routine', link: '/routines' },
  { id: 'community', title: 'Community', description: 'Connect with the skincare community', link: '/community' },
]

/**
 * Builds the full search index from all data sources.
 * Products come from productData (scales to Supabase).
 * Ingredients come from the canonical registry.
 * Pages come from the page registry.
 */
export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = []

  // Products — dynamically built from productData
  for (const product of productData) {
    results.push({
      id: product.id,
      title: product.name,
      category: 'Product',
      description: product.description,
      image: product.image,
      link: `/product-detail?id=${product.id}`,
    })
  }

  // Ingredients — from canonical registry
  for (const ingredient of ingredientRegistry) {
    results.push({
      id: ingredient.id,
      title: ingredient.name,
      category: 'Ingredient',
      description: ingredient.description,
      link: `/ingredients?id=${ingredient.id}`,
    })
  }

  // Pages — from page registry
  for (const page of pageRegistry) {
    results.push({
      id: page.id,
      title: page.title,
      category: 'Page',
      description: page.description,
      link: page.link,
    })
  }

  return results
}

/**
 * Category filter map — eliminates fragile string manipulation.
 * Maps display labels to the SearchResult.category value, or null for "All".
 */
const CATEGORY_FILTER_MAP: Record<string, string | null> = {
  All: null,
  Products: 'Product',
  Ingredients: 'Ingredient',
  Pages: 'Page',
}

/**
 * Returns the SearchResult.category value for a given filter label,
 * or null if the filter is "All" (show everything).
 */
export function getCategoryFilter(filterLabel: string): string | null {
  return CATEGORY_FILTER_MAP[filterLabel] ?? null
}

/**
 * Returns true if the first letter of the query matches the first letter of the name.
 * Case-insensitive, trims leading whitespace.
 * Returns true if query is empty (no constraint).
 * Entity-agnostic — works for any searchable type.
 */
export function matchesFirstLetter(query: string, name: string): boolean {
  const q = query.trimStart()
  if (q.length === 0) return true
  const n = name.trimStart()
  if (n.length === 0) return false
  return q[0].toLowerCase() === n[0].toLowerCase()
}
