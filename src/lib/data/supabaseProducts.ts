/**
 * Supabase Product Queries
 *
 * Fetches published products from the Supabase `products` table.
 * Maps snake_case DB columns to camelCase Product interface fields.
 * Returns [] on any error (graceful fallback to mock data).
 */

import { supabase } from '../supabase-browser';
import type { Product, ActiveIngredient, ProductSize, ProductSource } from '../../types/product';
import type { ProductCategory } from '../utils/categoryRegistry';

/** Shape returned by a Supabase SELECT on the products table */
export interface SupabaseProductRow {
  id: string;
  legacy_id: number | null;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  review_count: number;
  image: string;
  description: string;
  skin_types: string[];
  concerns: string[];
  key_ingredients: string[];
  in_stock: boolean;
  source: string;
  size_value: number | null;
  size_unit: string | null;
  active_ingredients: ActiveIngredient[];
  preferences: Record<string, boolean>;
  time_of_day: string[] | null;
  texture: string | null;
  formulation: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Map a Supabase row to the canonical Product type.
 */
export function mapRowToProduct(row: SupabaseProductRow): Product {
  const product: Product = {
    id: row.legacy_id ?? hashId(row.id),
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category as ProductCategory,
    price: row.price,
    rating: row.rating,
    reviewCount: row.review_count,
    image: row.image,
    description: row.description,
    skinTypes: row.skin_types ?? [],
    concerns: row.concerns ?? [],
    keyIngredients: row.key_ingredients ?? [],
    inStock: row.in_stock,
  };

  // Optional fields — only set when present
  if (row.source) {
    product.source = row.source as ProductSource;
  }

  if (row.size_value != null && row.size_unit) {
    product.size = {
      value: row.size_value,
      unit: row.size_unit,
    } as ProductSize;
  }

  if (row.active_ingredients && Array.isArray(row.active_ingredients) && row.active_ingredients.length > 0) {
    product.activeIngredients = row.active_ingredients;
  }

  if (row.preferences && Object.keys(row.preferences).length > 0) {
    product.preferences = row.preferences as Product['preferences'];
  }

  if (row.time_of_day && row.time_of_day.length > 0) {
    product.timeOfDay = row.time_of_day as ('am' | 'pm')[];
  }

  if (row.texture) {
    product.texture = row.texture as Product['texture'];
  }

  if (row.formulation) {
    product.formulation = row.formulation as Product['formulation'];
  }

  return product;
}

/**
 * Fetch all published products from Supabase.
 * Returns [] on any error (Supabase unavailable, network failure, etc.).
 */
export async function fetchPublishedProducts(): Promise<Product[]> {
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'published')
        .order('legacy_id', { ascending: true });

      if (error) {
        console.error('[supabaseProducts] Query failed:', error.message);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return (data as unknown as SupabaseProductRow[]).map(mapRowToProduct);
    } catch (err) {
      // Retry on transient network errors (ERR_CONNECTION_CLOSED, etc.)
      if (attempt < MAX_RETRIES) {
        console.warn(`[supabaseProducts] Fetch error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying...`);
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      console.error('[supabaseProducts] Fetch error after retries:', err);
      return [];
    }
  }
  return [];
}

/**
 * Convert a UUID string to a stable numeric ID.
 * Only used as fallback when legacy_id is null.
 */
function hashId(uuid: string): number {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) - hash + uuid.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
