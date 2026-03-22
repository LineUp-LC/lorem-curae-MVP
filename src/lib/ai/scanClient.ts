/**
 * Scan Client — client-side caller for the product-scan Edge Function.
 *
 * Handles: image capture → resize → compress → base64 → API call → response.
 * Also provides thumbnail generation for scan history persistence.
 * Guest users are blocked before any API call.
 */

import { supabase } from '../supabase-browser';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectiveSensitivity,
} from '../utils/sessionState';
import type { ScanResult, ScanResponse } from '../../types/scan';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PRODUCT_SCAN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/product-scan`;

/** Maximum dimension (longest edge) for resize — Claude's optimal input size */
const MAX_IMAGE_DIMENSION = 1568;

/** JPEG compression quality (0–1) */
const JPEG_QUALITY = 0.75;

/** Thumbnail size for scan history (longest edge) */
const THUMBNAIL_SIZE = 80;

/** Thumbnail JPEG quality */
const THUMBNAIL_QUALITY = 0.5;

// ---------------------------------------------------------------------------
// Image processing pipeline
// ---------------------------------------------------------------------------

/**
 * Load a File or Blob into an HTMLImageElement.
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize and compress an image file to JPEG base64.
 *
 * Pipeline:
 * 1. Load file into an Image element
 * 2. Calculate scale factor to fit within MAX_IMAGE_DIMENSION
 * 3. Draw onto canvas at reduced size
 * 4. Export as JPEG at JPEG_QUALITY
 * 5. Return raw base64 string (no data URL prefix)
 */
export async function compressImageToBase64(file: File | Blob): Promise<string> {
  const img = await loadImage(file);

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  // Strip "data:image/jpeg;base64," prefix
  const base64 = dataUrl.split(',')[1];

  if (!base64) throw new Error('Image compression produced empty output');

  return base64;
}

/**
 * Create a small thumbnail data URL for scan history persistence.
 * Returns a full data URL (with prefix) suitable for <img src>.
 */
export async function createScanThumbnail(file: File | Blob): Promise<string> {
  const img = await loadImage(file);

  const scale = THUMBNAIL_SIZE / Math.max(img.width, img.height);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY);
}

// ---------------------------------------------------------------------------
// API caller
// ---------------------------------------------------------------------------

export interface ScanClientResult {
  success: true;
  result: ScanResult;
  /** Compressed base64 image for deferred full scan */
  imageBase64?: string;
}

export interface ScanClientError {
  success: false;
  error: string;
}

export type ScanClientResponse = ScanClientResult | ScanClientError;

/**
 * Look up a product by UPC/EAN barcode via the product-scan Edge Function.
 * Skips image compression — sends only the barcode string.
 */
export async function scanByUpc(upc: string): Promise<ScanClientResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { success: false, error: 'Sign in to scan products' };
  }

  try {
    const response = await fetch(PRODUCT_SCAN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ upc }),
    });

    const data: ScanResponse = await response.json();

    if (!response.ok || !data.success || !data.result) {
      return { success: false, error: data.error || 'UPC lookup failed' };
    }

    return { success: true, result: data.result };
  } catch (error) {
    console.error('[ScanClient] Error calling product-scan (UPC):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Scan a product image via the product-scan Edge Function.
 *
 * Flow:
 * 1. Check auth (guest → error, no API call)
 * 2. Compress image to JPEG base64
 * 3. Build skin profile from session state
 * 4. POST to product-scan Edge Function
 * 5. Return typed result
 */
export async function scanProduct(file: File | Blob): Promise<ScanClientResponse> {
  // 1. Auth check — guest users blocked
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { success: false, error: 'Sign in to scan products' };
  }

  // 2. Compress image
  let base64: string;
  try {
    base64 = await compressImageToBase64(file);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to process image',
    };
  }

  // 3. Build skin profile for personalized ingredient relevance
  const skinType = getEffectiveSkinType() ?? undefined;
  const concerns = getEffectiveConcerns();
  const sensitivity = getEffectiveSensitivity() ?? undefined;
  const hasSkinProfile = skinType || concerns.length > 0;

  // 4. Call Edge Function
  try {
    const response = await fetch(PRODUCT_SCAN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        image: base64,
        mediaType: 'image/jpeg',
        mode: 'identify',
        ...(hasSkinProfile ? { skinProfile: { skinType, concerns, sensitivity } } : {}),
      }),
    });

    const data: ScanResponse = await response.json();

    if (!response.ok || !data.success || !data.result) {
      return {
        success: false,
        error: data.error || 'Scan failed',
      };
    }

    return {
      success: true,
      result: data.result,
      imageBase64: base64,
    };
  } catch (error) {
    console.error('[ScanClient] Error calling product-scan:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ---------------------------------------------------------------------------
// Full scan (deferred ingredient parsing)
// ---------------------------------------------------------------------------

/**
 * Run a full ingredient analysis on a previously captured image.
 *
 * Called lazily when the user taps the "Breakdown" tab — not on initial scan.
 * Sends mode: 'full' to get complete ingredient parsing with categories,
 * safety tiers, caution reasons, and personalized relevance.
 */
export async function scanProductFull(imageBase64: string): Promise<ScanClientResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { success: false, error: 'Sign in to scan products' };
  }

  const skinType = getEffectiveSkinType() ?? undefined;
  const concerns = getEffectiveConcerns();
  const sensitivity = getEffectiveSensitivity() ?? undefined;
  const hasSkinProfile = skinType || concerns.length > 0;

  try {
    const response = await fetch(PRODUCT_SCAN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        image: imageBase64,
        mediaType: 'image/jpeg',
        mode: 'full',
        ...(hasSkinProfile ? { skinProfile: { skinType, concerns, sensitivity } } : {}),
      }),
    });

    const data: ScanResponse = await response.json();

    if (!response.ok || !data.success || !data.result) {
      return { success: false, error: data.error || 'Full scan failed' };
    }

    return { success: true, result: data.result };
  } catch (error) {
    console.error('[ScanClient] Error calling product-scan (full):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
