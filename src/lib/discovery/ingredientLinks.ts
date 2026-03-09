/**
 * Curated Discovery Engine — Ingredient Links
 *
 * Manages the mapping between products and canonical ingredient slugs.
 * Primary source: Supabase product_ingredient_links table.
 * Fallback: derived from product.keyIngredients via getIngredientSlug().
 *
 * Used for ingredient-aware filtering on the discover page and for
 * ingredient relevance scoring in the scoring engine.
 */

import type { Product } from '../../types/product';
import { SLUG_TO_NAME, getIngredientSlug } from '../utils/ingredientSlug';
import { supabase } from '../supabase-browser';

/** Map of product numeric ID to array of canonical ingredient slugs */
export type ProductIngredientMap = Map<number, string[]>;

/** A single ingredient option for the filter UI */
export interface IngredientOption {
  slug: string;
  label: string;
  productCount: number;
}

// ---------------------------------------------------------------------------
// Local derivation (always works, no Supabase needed)
// ---------------------------------------------------------------------------

/**
 * Build ingredient links by resolving each product's keyIngredients
 * through the canonical slug registry.
 * Pure function — deterministic, no side effects.
 */
export function deriveIngredientLinks(products: Product[]): ProductIngredientMap {
  const map: ProductIngredientMap = new Map();

  for (const product of products) {
    const slugs: string[] = [];
    for (const ingredient of product.keyIngredients ?? []) {
      const slug = getIngredientSlug(ingredient);
      if (slug && !slugs.includes(slug)) {
        slugs.push(slug);
      }
    }
    if (slugs.length > 0) {
      map.set(product.id, slugs);
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Supabase fetch (overlays curated links when available)
// ---------------------------------------------------------------------------

/**
 * Fetch curated ingredient links from Supabase product_ingredient_links table.
 * Returns null if Supabase is unavailable or table is empty.
 */
export async function fetchIngredientLinks(): Promise<ProductIngredientMap | null> {
  try {
    const { data, error } = await supabase
      .from('product_ingredient_links')
      .select('ingredient_slug, products!inner(legacy_id)');

    if (error || !data || data.length === 0) return null;

    const map: ProductIngredientMap = new Map();

    for (const row of data) {
      const legacyId = (row as Record<string, any>).products?.legacy_id;
      if (legacyId == null) continue;

      const existing = map.get(legacyId) ?? [];
      if (!existing.includes(row.ingredient_slug)) {
        existing.push(row.ingredient_slug);
      }
      map.set(legacyId, existing);
    }

    return map.size > 0 ? map : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

/**
 * Filter products to those containing at least one of the required ingredient slugs.
 * Uses OR logic: product must have ANY of the selected slugs (not ALL).
 */
export function filterByIngredientSlugs(
  products: Product[],
  links: ProductIngredientMap,
  requiredSlugs: string[],
): Product[] {
  if (requiredSlugs.length === 0) return products;

  return products.filter(product => {
    const productSlugs = links.get(product.id) ?? [];
    return requiredSlugs.some(slug => productSlugs.includes(slug));
  });
}

// ---------------------------------------------------------------------------
// Filter option builder
// ---------------------------------------------------------------------------

/**
 * Convert a slug to a capitalized display label.
 */
function slugToLabel(slug: string): string {
  const names = SLUG_TO_NAME[slug];
  const baseName = names?.[0] ?? slug.replace(/-/g, ' ');
  return baseName.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Generate ingredient filter options with product counts.
 * Sorted by product count descending.
 */
export function buildIngredientOptions(
  products: Product[],
  links: ProductIngredientMap,
): IngredientOption[] {
  const counts = new Map<string, number>();

  for (const product of products) {
    const slugs = links.get(product.id) ?? [];
    for (const slug of slugs) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([slug, count]) => ({
      slug,
      label: slugToLabel(slug),
      productCount: count,
    }))
    .sort((a, b) => b.productCount - a.productCount);
}
