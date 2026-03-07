/**
 * Retailer Data Fetching Utility
 *
 * Fetches retailer pricing for a product from Supabase.
 * Falls back to mock data when Supabase is unavailable or returns no results.
 * All retailer data consumption in components must go through this utility.
 */

import { supabase } from '../supabase-browser';
import type { Retailer } from '../../types/retailer';
import { getPriceFreshness } from './retailerPricing';
import type { PriceFreshness } from './retailerPricing';

export interface RetailerWithFreshness extends Retailer {
  freshness: PriceFreshness;
}

interface SupabaseRetailerPrice {
  id: string;
  product_id: string;
  price: number;
  shipping_cost: number;
  shipping_label: string | null;
  tax_included: boolean;
  total_price: number;
  in_stock: boolean;
  delivery_window: string | null;
  url: string;
  deep_link: string | null;
  source: 'affiliate_feed' | 'retailer_api' | 'manual';
  last_updated: string;
  retailers: {
    id: string;
    slug: string;
    name: string;
    logo_url: string | null;
    website_url: string | null;
    trust_score: number;
    features: string[];
    is_affiliate: boolean;
    is_sponsored: boolean;
    secure_checkout: boolean;
  };
}

/**
 * Fetch retailer pricing for a product.
 *
 * 1. Queries Supabase `retailer_prices` joined with `retailers`
 * 2. Maps to canonical `RetailerWithFreshness` type
 * 3. Falls back to empty array if Supabase is unavailable or returns no data
 */
export async function getRetailersForProduct(
  productId: string,
): Promise<RetailerWithFreshness[]> {
  try {
    const { data, error } = await supabase
      .from('retailer_prices')
      .select(`
        id,
        product_id,
        price,
        shipping_cost,
        shipping_label,
        tax_included,
        total_price,
        in_stock,
        delivery_window,
        url,
        deep_link,
        source,
        last_updated,
        retailers (
          id,
          slug,
          name,
          logo_url,
          website_url,
          trust_score,
          features,
          is_affiliate,
          is_sponsored,
          secure_checkout
        )
      `)
      .eq('product_id', productId);

    if (error) {
      console.error('Failed to fetch retailer prices:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return (data as unknown as SupabaseRetailerPrice[]).map(mapToRetailer);
  } catch (err) {
    console.error('Retailer data fetch error:', err);
    return [];
  }
}

/**
 * Map a Supabase row (retailer_prices joined with retailers) to the
 * canonical RetailerWithFreshness type.
 */
function mapToRetailer(row: SupabaseRetailerPrice): RetailerWithFreshness {
  const retailer = row.retailers;
  const freshness = getPriceFreshness(row.last_updated);

  return {
    id: hashId(row.id),
    name: retailer.name,
    logo: retailer.logo_url ?? '',
    price: row.price,
    shipping: row.shipping_cost,
    shippingLabel: row.shipping_label ?? undefined,
    estimatedTax: undefined,
    taxIncluded: row.tax_included,
    totalPrice: row.total_price,
    trustScore: retailer.trust_score,
    deliveryDays: row.delivery_window ?? '',
    inStock: row.in_stock,
    url: retailer.website_url ?? row.url,
    deepLink: row.deep_link ?? undefined,
    features: retailer.features ?? [],
    isAffiliate: retailer.is_affiliate,
    isSponsored: retailer.is_sponsored,
    secureCheckout: retailer.secure_checkout,
    source: row.source,
    lastUpdated: row.last_updated,
    freshness,
  };
}

/**
 * Convert a UUID string to a stable numeric ID for the Retailer interface.
 * Uses a simple hash — sufficient for keying, not for cryptography.
 */
function hashId(uuid: string): number {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) - hash + uuid.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
