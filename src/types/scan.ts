/**
 * Camera Scan types for product identification via Claude Vision.
 */

/** Confidence level of AI product identification */
export type ScanConfidence = 'high' | 'medium' | 'low';

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
  /** ISO timestamp of when the scan was processed */
  timestamp: string;
}

/** Request payload sent to the product-scan Edge Function */
export interface ScanRequest {
  /** Base64-encoded JPEG image (no data URL prefix) */
  image: string;
  /** MIME type of the image */
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
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
