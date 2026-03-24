/**
 * Camera Scan types for product identification + ingredient parsing via Claude Vision.
 */

/** Confidence level of AI product identification */
export type ScanConfidence = 'high' | 'medium' | 'low';

/** Safety tier for a parsed ingredient */
export type IngredientSafetyTier = 'safe' | 'caution' | 'avoid';

/** A single ingredient parsed from a product label by Claude Vision */
export interface ParsedIngredient {
  /** Ingredient name as it appears on the label */
  name: string;
  /** Primary skincare function in plain language */
  function: string;
  /** Safety classification */
  safetyTier: IngredientSafetyTier;
  /** Functional category assigned by Claude (e.g., "Hydration/Moisture", "Active Exfoliant", "Preservative") */
  category: string;
  /** Personalized relevance note (present when user skin profile is available) */
  relevance?: string;
  /** Why this ingredient is flagged caution/avoid — risks, precautions, affected skin types */
  cautionReason?: string;
}

/** Result of a product scan via Claude Vision */
export interface ScanResult {
  /** Whether the scanned product matches one in our catalog */
  match: boolean;
  /** Matched product ID (from mock data or Supabase) — present when match is true */
  productId?: number;
  /** AI confidence in the identification */
  confidence: ScanConfidence;
  /** Detected product name (shown when no catalog match) */
  detectedProduct?: string;
  /** Detected brand name */
  detectedBrand?: string;
  /** Detected product category */
  detectedCategory?: string;
  /** Parsed ingredients from the product label */
  ingredients?: ParsedIngredient[];
  /** Total number of ingredients detected */
  ingredientCount?: number;
  /** True when the AI response hit the token limit and ingredients may be incomplete */
  ingredientsTruncated?: boolean;
  /** UPC/EAN barcode (present when scanned via barcode mode) */
  upc?: string;
  /** ISO timestamp of when the scan was processed */
  timestamp: string;
}

/** Request payload sent to the product-scan Edge Function */
export interface ScanRequest {
  /** Base64-encoded JPEG image (no data URL prefix) — required for photo mode */
  image?: string;
  /** MIME type of the image */
  mediaType?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** UPC/EAN barcode string — when present, skips Vision and does catalog lookup */
  upc?: string;
  /** 'identify' = fast ID only (no ingredients), 'full' = complete ingredient analysis */
  mode?: 'identify' | 'full';
  /** Optional user skin profile for personalized ingredient relevance */
  skinProfile?: {
    skinType?: string;
    concerns?: string[];
    sensitivity?: string;
  };
}

/** Response from the product-scan Edge Function */
export interface ScanResponse {
  success: boolean;
  result?: ScanResult;
  error?: string;
  meta: {
    authenticated: boolean;
    tokensUsed?: number;
    timestamp: string;
  };
}

/** A persisted scan history entry (stored in localStorage) */
export interface ScanHistoryEntry {
  /** Unique identifier (timestamp-based) */
  id: string;
  /** The scan result data */
  result: ScanResult;
  /** Small base64 JPEG thumbnail for display (~5-10KB) */
  thumbnail: string;
  /** Compressed JPEG base64 for re-running full scan (~200-400KB). Only kept for 5 most recent entries. */
  imageBase64?: string;
  /** Cached full ingredient parse — avoids re-fetching when revisiting from history */
  fullScanResult?: ScanResult;
  /** ISO timestamp */
  timestamp: string;
}
