/**
 * Supabase Review Queries
 *
 * CRUD operations for the product_reviews table.
 * Uses supabase-browser client with RLS enforcement.
 * Returns null/[] on errors (graceful fallback).
 */

import { supabase } from '../supabase-browser';
import type { ProductReview, ProductReviewInput } from '@/types/review';

/**
 * Fetch all reviews for a product, ordered by created_at desc.
 */
export async function fetchReviewsForProduct(
  productId: number,
): Promise<ProductReview[]> {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[reviews] fetchReviewsForProduct failed:', error.message);
      return [];
    }

    return (data as ProductReview[]) ?? [];
  } catch (err) {
    console.error('[reviews] fetchReviewsForProduct error:', err);
    return [];
  }
}

/**
 * Fetch the current user's review for a specific product.
 * Returns null if no review exists or on error.
 */
export async function fetchUserReview(
  productId: number,
  userId: string,
): Promise<ProductReview | null> {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[reviews] fetchUserReview failed:', error.message);
      return null;
    }

    return data as ProductReview | null;
  } catch (err) {
    console.error('[reviews] fetchUserReview error:', err);
    return null;
  }
}

/**
 * Submit (upsert) a review. If the user already reviewed this product,
 * updates the existing review via the (user_id, product_id) unique constraint.
 */
export async function submitReview(
  review: ProductReviewInput,
): Promise<ProductReview | null> {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .upsert(review, { onConflict: 'user_id,product_id' })
      .select()
      .single();

    if (error) {
      console.error('[reviews] submitReview failed:', error.message);
      return null;
    }

    return data as ProductReview;
  } catch (err) {
    console.error('[reviews] submitReview error:', err);
    return null;
  }
}

/**
 * Delete a review by its ID. RLS ensures only the owner can delete.
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('[reviews] deleteReview failed:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[reviews] deleteReview error:', err);
    return false;
  }
}
