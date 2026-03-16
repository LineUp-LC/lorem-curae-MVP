/**
 * Product Scan Edge Function for Lorem Curae
 *
 * Accepts a base64-encoded product photo, sends it to Claude Vision
 * for identification, and matches against the product catalog.
 *
 * Model: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
 * Auth: Required — guest users receive CTA on the client side.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 512;

// Maximum base64 payload size: ~5 MB decoded → ~6.7 MB base64
const MAX_IMAGE_SIZE_BYTES = 7 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Product catalog — embedded for prompt injection into Claude Vision
// ---------------------------------------------------------------------------

const PRODUCT_CATALOG = [
  { id: 1, name: 'Gentle Hydrating Cleanser', brand: 'Pure Essence', category: 'cleanser', keyIngredients: ['Hyaluronic Acid', 'Ceramides', 'Glycerin'] },
  { id: 2, name: 'Brightening Vitamin C Serum', brand: 'Glow Naturals', category: 'serum', keyIngredients: ['Vitamin C', 'Ferulic Acid', 'Vitamin E'] },
  { id: 3, name: 'Barrier Repair Moisturizer', brand: 'Skin Harmony', category: 'moisturizer', keyIngredients: ['Ceramides', 'Niacinamide', 'Squalane'] },
  { id: 4, name: 'Clear Skin Salicylic Acid Treatment', brand: 'Clarity Labs', category: 'treatment', keyIngredients: ['Salicylic Acid', 'Niacinamide', 'Zinc'] },
  { id: 5, name: 'Mineral Sunscreen SPF 50', brand: 'Sun Shield', category: 'sunscreen', keyIngredients: ['Zinc Oxide', 'Titanium Dioxide', 'Vitamin E'] },
  { id: 6, name: 'Retinol Night Renewal Serum', brand: 'Youth Restore', category: 'serum', keyIngredients: ['Retinol', 'Peptides', 'Hyaluronic Acid'] },
  { id: 7, name: 'Hydrating Clay Mask', brand: 'Earth Glow', category: 'mask', keyIngredients: ['Kaolin Clay', 'Hyaluronic Acid', 'Aloe Vera'] },
  { id: 8, name: 'Niacinamide Pore Refining Serum', brand: 'Pore Perfect', category: 'serum', keyIngredients: ['Niacinamide', 'Zinc', 'Hyaluronic Acid'] },
  { id: 9, name: 'Soothing Centella Cream', brand: 'Calm Skin Co.', category: 'moisturizer', keyIngredients: ['Centella Asiatica', 'Ceramides', 'Panthenol'] },
  { id: 10, name: 'Exfoliating AHA/BHA Toner', brand: 'Glow Labs', category: 'treatment', keyIngredients: ['Glycolic Acid', 'Salicylic Acid', 'Witch Hazel'] },
  { id: 11, name: 'Peptide Eye Cream', brand: 'Youth Restore', category: 'treatment', keyIngredients: ['Peptides', 'Caffeine', 'Hyaluronic Acid'] },
  { id: 12, name: 'Hydrating Gel Cleanser', brand: 'Fresh Start', category: 'cleanser', keyIngredients: ['Hyaluronic Acid', 'Aloe Vera', 'Green Tea'] },
];

const CATALOG_TEXT = PRODUCT_CATALOG
  .map(p => `${p.id}. "${p.name}" by ${p.brand} (${p.category}) — Key ingredients: ${p.keyIngredients.join(', ')}`)
  .join('\n');

const SYSTEM_PROMPT = `You are a skincare product identifier for Lorem Curae. You receive a photo of a skincare product and must identify it.

Our product catalog:
${CATALOG_TEXT}

Instructions:
1. Read the product name, brand, and any visible text on the packaging.
2. If the product matches one in our catalog, respond with a JSON object containing match: true and the productId.
3. If the product does NOT match any catalog product, respond with match: false and include whatever product details you can detect.
4. Be conservative — only mark match: true if you are reasonably confident.
5. For confidence: use "high" if brand and product name are clearly visible and match, "medium" if partially visible, "low" if you are guessing from packaging/category alone.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):

For a match:
{"match":true,"productId":1,"confidence":"high","detectedProduct":"Gentle Hydrating Cleanser","detectedBrand":"Pure Essence","detectedCategory":"cleanser"}

For no match:
{"match":false,"confidence":"medium","detectedProduct":"Some Product Name","detectedBrand":"Some Brand","detectedCategory":"serum"}

If the image does not show a skincare product:
{"match":false,"confidence":"low","detectedProduct":null,"detectedBrand":null,"detectedCategory":null}`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScanRequestBody {
  image: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
}

interface ClaudeVisionResult {
  match: boolean;
  productId?: number;
  confidence: 'high' | 'medium' | 'low';
  detectedProduct?: string | null;
  detectedBrand?: string | null;
  detectedCategory?: string | null;
}

// ---------------------------------------------------------------------------
// Claude Vision API caller
// ---------------------------------------------------------------------------

async function callClaudeVision(
  imageBase64: string,
  mediaType: string,
): Promise<{ success: true; result: ClaudeVisionResult; tokensUsed: number } | { success: false; error: string }> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    console.error('[Product-Scan] ANTHROPIC_API_KEY not configured');
    return { success: false, error: 'AI service not configured' };
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Identify this skincare product. Respond with JSON only.',
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Product-Scan] Claude API error:', response.status, errorText);
      return { success: false, error: `AI service error: ${response.status}` };
    }

    const data = await response.json();
    const textContent = data.content?.find(
      (block: { type: string }) => block.type === 'text',
    );

    if (!textContent?.text) {
      console.error('[Product-Scan] Unexpected response format:', data);
      return { success: false, error: 'Unexpected AI response format' };
    }

    const tokensUsed =
      (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0);

    // Parse the JSON response
    try {
      const parsed: ClaudeVisionResult = JSON.parse(textContent.text.trim());

      // Validate productId is in catalog if match is true
      if (parsed.match && parsed.productId) {
        const inCatalog = PRODUCT_CATALOG.some(p => p.id === parsed.productId);
        if (!inCatalog) {
          parsed.match = false;
          parsed.productId = undefined;
        }
      }

      return { success: true, result: parsed, tokensUsed };
    } catch {
      console.error('[Product-Scan] Failed to parse Claude response as JSON:', textContent.text);
      return { success: false, error: 'Failed to parse AI response' };
    }
  } catch (error) {
    console.error('[Product-Scan] Claude API call failed:', error);
    return { success: false, error: 'AI service unavailable' };
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    // Authenticate — required for scan calls
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    let isAuthenticated = false;
    if (token) {
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (!error && data.user) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Parse request
    const body: ScanRequestBody = await req.json();

    // Validate image
    if (!body.image || typeof body.image !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing or invalid image data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Validate media type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!body.mediaType || !validTypes.includes(body.mediaType)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid media type. Supported: image/jpeg, image/png, image/webp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Check image size (base64 is ~33% larger than raw)
    if (body.image.length > MAX_IMAGE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image too large. Maximum 5 MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Call Claude Vision
    const result = await callClaudeVision(body.image, body.mediaType);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error,
          meta: {
            authenticated: isAuthenticated,
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Build ScanResult
    const scanResult = {
      match: result.result.match,
      productId: result.result.productId ?? undefined,
      confidence: result.result.confidence,
      detectedProduct: result.result.detectedProduct ?? undefined,
      detectedBrand: result.result.detectedBrand ?? undefined,
      detectedCategory: result.result.detectedCategory ?? undefined,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        result: scanResult,
        meta: {
          authenticated: isAuthenticated,
          tokensUsed: result.tokensUsed,
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[Product-Scan] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
