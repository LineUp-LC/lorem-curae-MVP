/**
 * Product Data Access Layer
 *
 * Single import point for all product data across the application.
 * Initializes with mock data, then preloads from Supabase in the background.
 * If Supabase is unavailable or returns empty, mock data stays.
 *
 * All 15 consuming files import from here instead of mocks/products.
 */

import { productData } from '../../mocks/products';
import type { Product } from '../../types/product';
import type { ProductCategory } from '../utils/categoryRegistry';
import { fetchPublishedProducts } from './supabaseProducts';

/** Full published product catalog — initialized with mock data */
export const productCatalog: Product[] = [...productData];

/** Find a single product by numeric ID */
export function getProductById(id: number): Product | null {
  return productCatalog.find(p => p.id === id) ?? null;
}

/** Find a single product by URL slug */
export function getProductBySlug(slug: string): Product | null {
  return productCatalog.find(p => p.slug === slug) ?? null;
}

/** Find multiple products by their numeric IDs */
export function getProductsByIds(ids: number[]): Product[] {
  return productCatalog.filter(p => ids.includes(p.id));
}

/** Find all products in a given category */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return productCatalog.filter(p => p.category === category);
}

/** Search products by name, brand, or key ingredients */
export function searchProducts(query: string): Product[] {
  if (!query.trim()) return productCatalog;
  const q = query.toLowerCase();
  return productCatalog.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.keyIngredients.some(ing => ing.toLowerCase().includes(q))
  );
}

/**
 * Initialize product catalog from Supabase.
 *
 * Fetches published products and mutates productCatalog in place so all
 * consumers that captured the array reference see the updated data.
 * If Supabase returns empty or fails, mock data stays — the app always works.
 *
 * Call once on app mount (fire-and-forget).
 */
export async function initProductCatalog(): Promise<void> {
  try {
    const products = await fetchPublishedProducts();

    if (products.length > 0) {
      // Mutate in place — preserves the array reference across all consumers
      productCatalog.length = 0;
      productCatalog.push(...products);
      console.log(`[ProductCatalog] Loaded ${products.length} products from Supabase`);
    } else {
      console.log(`[ProductCatalog] Supabase returned empty — using ${productCatalog.length} mock products`);
    }
  } catch (err) {
    console.error('[ProductCatalog] Failed to load from Supabase, using mock data:', err);
  }
}
