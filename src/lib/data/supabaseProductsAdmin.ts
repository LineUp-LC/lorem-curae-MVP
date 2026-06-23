/**
 * Supabase Product Admin Operations
 *
 * All mutation functions for the admin product management UI.
 * Separated from supabaseProducts.ts to keep the public read-only module clean.
 */

import { supabase } from '../supabase-browser';
import type { SupabaseProductRow } from './supabaseProducts';
import type { ActiveIngredient } from '../../types/product';
import { ParsedIngredient } from '@/types/scan';

// ─── Types ───────────────────────────────────────────────────

export type ProductStatus = 'draft' | 'published' | 'archived';

export interface AdminProductListItem {
  id: string;
  legacy_id: number | null;
  slug: string;
  name: string;
  brand: string;
  category: string;
  status: string;
  price: number;
  image: string;
  updated_at: string;
  in_stock: boolean;
}

export interface ProductFormData {
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  skinTypes: string[];
  concerns: string[];
  keyIngredients: string[];
  inStock: boolean;
  source: string;
  sizeValue: number | null;
  sizeUnit: string | null;
  activeIngredients: ActiveIngredient[];
  preferences: Record<string, boolean>;
  timeOfDay: string[];
  texture: string | null;
  formulation: string | null;
}

export interface ProductVersion {
  id: string;
  version_number: number;
  changed_by: string;
  change_reason: string | null;
  snapshot: Record<string, unknown>;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────

function formDataToRow(data: ProductFormData) {
  return {
    slug: data.slug,
    name: data.name,
    brand: data.brand,
    category: data.category,
    price: data.price,
    rating: data.rating,
    review_count: data.reviewCount,
    image: data.image,
    description: data.description,
    skin_types: data.skinTypes,
    concerns: data.concerns,
    key_ingredients: data.keyIngredients,
    in_stock: data.inStock,
    source: data.source || 'discovery',
    size_value: data.sizeValue,
    size_unit: data.sizeUnit,
    active_ingredients: data.activeIngredients,
    preferences: data.preferences,
    time_of_day: data.timeOfDay,
    texture: data.texture,
    formulation: data.formulation,
    updated_at: new Date().toISOString(),
  };
}

// ─── Read ────────────────────────────────────────────────────

export async function fetchAllProducts(filters?: {
  status?: ProductStatus | 'all';
  category?: string;
  search?: string;
}): Promise<AdminProductListItem[]> {
  try {
    let query = supabase
      .from('products')
      .select('id, legacy_id, slug, name, brand, category, status, price, image, updated_at, in_stock')
      .order('updated_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[adminProducts] fetchAll failed:', error.message);
      return [];
    }

    return (data ?? []) as AdminProductListItem[];
  } catch (err) {
    console.error('[adminProducts] fetchAll error:', err);
    return [];
  }
}

// ─── Verification ────────────────────────────────────────────

export interface VerificationItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  status: string;
  image: string;
  updated_at: string;
  verification_status: string | null;
  verification_confidence: string | null;
  verification_source: string | null;
  verified_at: string | null;
  hasScannedIngredients: boolean;
  hasPendingMerge: boolean;
  issues: string[];
}

export async function fetchProductsNeedingVerification(): Promise<VerificationItem[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name, brand, category, status, image, description, skin_types, concerns, updated_at, verification_status, verification_confidence, verification_source, verified_at, scanned_ingredients, scanned_ingredients_pending')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[adminProducts] fetchVerification failed:', error.message);
      return [];
    }

    const rows = (data ?? []) as any[];
    return rows.map(row => {
      const issues: string[] = [];
      if (row.verification_status === 'conflict') issues.push('Ingredient conflict — needs review');
      if (row.verification_status === 'needs_review') issues.push('Needs verification');
      if (row.scanned_ingredients_pending != null) issues.push('Pending merge available');
      if (row.scanned_ingredients == null) issues.push('No ingredients scanned');
      if (!row.image) issues.push('Missing image');
      if (!row.description) issues.push('Missing description');
      if (!row.skin_types?.length) issues.push('No skin types');
      if (!row.concerns?.length) issues.push('No concerns');
      if (row.status === 'draft') issues.push('Still draft');
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        brand: row.brand,
        category: row.category,
        status: row.status,
        image: row.image,
        updated_at: row.updated_at,
        verification_status: row.verification_status ?? null,
        verification_confidence: row.verification_confidence ?? null,
        verification_source: row.verification_source ?? null,
        verified_at: row.verified_at ?? null,
        hasScannedIngredients: row.scanned_ingredients != null,
        hasPendingMerge: row.scanned_ingredients_pending != null,
        issues,
      };
    }).filter(item => item.issues.length > 0);
  } catch (err) {
    console.error('[adminProducts] fetchVerification error:', err);
    return [];
  }
}

export async function fetchProductForEdit(id: string): Promise<SupabaseProductRow | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[adminProducts] fetchForEdit failed:', error.message);
      return null;
    }

    return data as unknown as SupabaseProductRow;
  } catch (err) {
    console.error('[adminProducts] fetchForEdit error:', err);
    return null;
  }
}

// ─── Write ───────────────────────────────────────────────────

export async function createProduct(
  data: ProductFormData,
): Promise<{ id: string } | { error: string }> {
  try {
    const row = {
      ...formDataToRow(data),
      status: 'draft',
    };

    const { data: result, error } = await supabase
      .from('products')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      return { error: error.message };
    }

    // Create initial version snapshot
    await createVersionSnapshot(result.id, row, 'admin', 'Initial creation');

    return { id: result.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateProduct(
  id: string,
  data: ProductFormData,
  changeReason?: string,
): Promise<{ success: boolean } | { error: string }> {
  try {
    // Fetch current state for snapshot before overwriting
    const current = await fetchProductForEdit(id);
    if (current) {
      await createVersionSnapshot(
        id,
        current as unknown as Record<string, unknown>,
        'admin',
        changeReason || 'Product updated',
      );
    }

    const row = formDataToRow(data);

    const { error } = await supabase
      .from('products')
      .update(row)
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateProductStatus(
  id: string,
  newStatus: ProductStatus,
): Promise<{ success: boolean } | { error: string }> {
  try {
    // Snapshot before status change
    const current = await fetchProductForEdit(id);
    if (current) {
      await createVersionSnapshot(
        id,
        current as unknown as Record<string, unknown>,
        'admin',
        `Status changed to ${newStatus}`,
      );
    }

    const { error } = await supabase
      .from('products')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ─── Version History ─────────────────────────────────────────

export async function createVersionSnapshot(
  productId: string,
  snapshot: Record<string, unknown>,
  changedBy: string,
  reason?: string,
): Promise<void> {
  try {
    // Get next version number
    const { data: versions } = await supabase
      .from('product_versions')
      .select('version_number')
      .eq('product_id', productId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = versions && versions.length > 0
      ? (versions[0].version_number as number) + 1
      : 1;

    await supabase.from('product_versions').insert({
      product_id: productId,
      version_number: nextVersion,
      changed_by: changedBy,
      change_reason: reason ?? null,
      snapshot,
    });
  } catch (err) {
    console.error('[adminProducts] createVersionSnapshot error:', err);
  }
}

export async function fetchVersionHistory(
  productId: string,
): Promise<ProductVersion[]> {
  try {
    const { data, error } = await supabase
      .from('product_versions')
      .select('*')
      .eq('product_id', productId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('[adminProducts] fetchVersionHistory failed:', error.message);
      return [];
    }

    return (data ?? []) as ProductVersion[];
  } catch (err) {
    console.error('[adminProducts] fetchVersionHistory error:', err);
    return [];
  }
}

// ─── Ingredient Links ────────────────────────────────────────

export async function syncIngredientLinks(
  productId: string,
  slugs: string[],
): Promise<void> {
  try {
    // Delete all existing links
    await supabase
      .from('product_ingredient_links')
      .delete()
      .eq('product_id', productId);

    // Insert new links
    if (slugs.length > 0) {
      const rows = slugs.map(slug => ({
        product_id: productId,
        ingredient_slug: slug,
      }));

      await supabase.from('product_ingredient_links').insert(rows);
    }
  } catch (err) {
    console.error('[adminProducts] syncIngredientLinks error:', err);
  }
}

export async function fetchIngredientLinks(
  productId: string,
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('product_ingredient_links')
      .select('ingredient_slug')
      .eq('product_id', productId);

    if (error) {
      console.error('[adminProducts] fetchIngredientLinks failed:', error.message);
      return [];
    }

    return (data ?? []).map(row => row.ingredient_slug);
  } catch (err) {
    console.error('[adminProducts] fetchIngredientLinks error:', err);
    return [];
  }
}

// ─── Image Upload ────────────────────────────────────────────

export async function uploadProductImage(
  file: File,
  productId: string,
): Promise<string | { error: string }> {
  try {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `products/${productId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true });

    if (error) {
      return { error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Upload failed' };
  }
}

// ─── Ingredient Merge Review ─────────────────────────────────

export async function fetchProductIngredients(productId: string): Promise<{
  scanned: ParsedIngredient[] | null;
  pending: ParsedIngredient[] | null;
}> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('scanned_ingredients, scanned_ingredients_pending')
      .eq('id', productId)
      .single();
    if (error) {
      console.error('[adminProducts] fetchProductIngredients failed:', error.message);
      return { scanned: null, pending: null };
    }
    return {
      scanned: (data?.scanned_ingredients as ParsedIngredient[] | null) ?? null,
      pending: (data?.scanned_ingredients_pending as ParsedIngredient[] | null) ?? null,
    };
  } catch (err) {
    console.error('[adminProducts] fetchProductIngredients error:', err);
    return { scanned: null, pending: null };
  }
}

export async function approvePendingMerge(productId: string, pendingIngredients: ParsedIngredient[]): Promise<{ success: boolean; result?: string; error?: string }> {
  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'resolve_product_ingredients_safe',
      {
        p_id: productId,
        p_new_ingredients: pendingIngredients,
        p_source: 'admin_merge',
        p_authority_tier: 'A',
      }
    );
    if (rpcError) {
      console.error('[adminProducts] approvePendingMerge RPC failed:', rpcError.message);
      return { success: false, error: rpcError.message };
    }
    const { error: clearError } = await supabase
      .from('products')
      .update({ scanned_ingredients_pending: null })
      .eq('id', productId);
    if (clearError) {
      console.error('[adminProducts] approvePendingMerge clear pending failed:', clearError.message);
      return { success: false, error: clearError.message };
    }
    return { success: true, result: rpcResult as string };
  } catch (err) {
    console.error('[adminProducts] approvePendingMerge error:', err);
    return { success: false, error: String(err) };
  }
}

export async function rejectPendingMerge(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ scanned_ingredients_pending: null })
      .eq('id', productId);
    if (error) {
      console.error('[adminProducts] rejectPendingMerge failed:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('[adminProducts] rejectPendingMerge error:', err);
    return { success: false, error: String(err) };
  }
}
