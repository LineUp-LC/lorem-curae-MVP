/**
 * Product Scan Edge Function for Lorem Curae
 *
 * Accepts a base64-encoded product photo, sends it to Claude Vision
 * for identification + full ingredient parsing, and matches against the product catalog.
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
const MAX_TOKENS_IDENTIFY = 512;
const MAX_TOKENS_FULL = 8192;

// Maximum base64 payload size: ~5 MB decoded → ~6.7 MB base64
const MAX_IMAGE_SIZE_BYTES = 7 * 1024 * 1024;

const VALID_CATEGORIES = new Set([
  'Active Exfoliant', 'Hydration/Moisture', 'Soothing/Botanical', 'Antioxidant',
  'Brightening', 'Anti-Aging', 'Acne Treatment', 'Sun Protection', 'Preservative',
  'Base/Solvent', 'Emulsifier', 'Surfactant/Cleanser', 'Fragrance', 'pH Adjuster',
  'Thickener/Texture', 'Vitamin/Nutrient', 'Barrier Repair',
]);

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

interface SkinProfile {
  skinType?: string;
  concerns?: string[];
  sensitivity?: string;
}

function buildIdentifyPrompt(): string {
  return `You are a skincare product analyzer for Lorem Curae. Identify the product from the photo.

INSTRUCTIONS:
1. Read the product name, brand, and any visible text on the packaging.
2. Common skincare brands: CeraVe, Cetaphil, Neutrogena, La Roche-Posay, The Ordinary, Paula's Choice, Drunk Elephant, Tatcha, COSRX, Vanicream, Aveeno, Olay, Kiehl's, Clinique, SK-II, EltaMD, Supergoop, First Aid Beauty, Sunday Riley, Glossier, Peter Thomas Roth, Dr. Dennis Gross, Murad, Origins, Laneige, Innisfree, Bioderma, Avène, Vichy.
3. Confidence: "high" if brand and product name are clearly readable, "medium" if partially visible, "low" if guessing.
4. Do NOT parse ingredients — set ingredients to [] and ingredientCount to 0.

Respond ONLY with valid JSON (no markdown, no explanation):
{"match":false,"confidence":"high","detectedProduct":"Product Name","detectedBrand":"Brand","detectedCategory":"serum","ingredients":[],"ingredientCount":0}`;
}

function buildSystemPrompt(skinProfile?: SkinProfile): string {
  let profileContext = '';
  if (skinProfile?.skinType || (skinProfile?.concerns && skinProfile.concerns.length > 0)) {
    const parts: string[] = [];
    if (skinProfile.skinType) parts.push(`- Skin type: ${skinProfile.skinType}`);
    if (skinProfile.concerns?.length) parts.push(`- Concerns: ${skinProfile.concerns.join(', ')}`);
    if (skinProfile.sensitivity) parts.push(`- Sensitivity: ${skinProfile.sensitivity}`);
    profileContext = `

USER SKIN PROFILE:
${parts.join('\n')}
For each ingredient, add a "relevance" field: a short phrase explaining how it relates to this user's skin (e.g., "helps with dryness", "may irritate sensitive skin"). If no specific relevance to this user, omit the relevance field for that ingredient.`;
  }

  return `You are a skincare product analyzer for Lorem Curae. You receive a photo of a skincare product and must:
1. Identify the product — brand name, product name, and category
2. Parse the full ingredient list visible on the product label
3. Optionally match against our internal catalog (most products will NOT be in it — that is expected)

IDENTIFICATION INSTRUCTIONS:
1. Read the product name, brand, and any visible text on the packaging.
2. If you can see ANY text on the product packaging — even partial brand names, partial product names, or ingredient lists — report what you can see. Do not return null for detectedProduct or detectedBrand unless you literally cannot read any text.
3. Common skincare brands to look for: CeraVe, Cetaphil, Neutrogena, La Roche-Posay, The Ordinary, Paula's Choice, Drunk Elephant, Tatcha, COSRX, Vanicream, Aveeno, Olay, Kiehl's, Clinique, SK-II, EltaMD, Supergoop, First Aid Beauty, Sunday Riley, Glossier, Peter Thomas Roth, Dr. Dennis Gross, Murad, Origins, Laneige, Innisfree, Bioderma, Avène, Vichy. If you recognize any of these brands or similar ones, always include the brand name.
4. If the image is blurry or partially obscured, still attempt identification with confidence: "low". A low-confidence result with a brand name is more useful than null.
5. Confidence: "high" if brand and product name are clearly readable, "medium" if partially visible or inferred from context, "low" if guessing from partial text or packaging shape alone.

INGREDIENT PARSING INSTRUCTIONS:
1. Read every ingredient visible on the product label (usually in the ingredients list / INCI list).
2. For each ingredient provide:
   - name: the ingredient name as written on the label
   - function: its primary skincare function in plain language (e.g., "moisturizes and attracts water to skin", "helps protect from sun damage", "gentle surfactant that cleanses skin")
   - safetyTier: "safe", "caution", or "avoid"
   - category: EVERY ingredient MUST have a category — never leave it blank or null. Choose from these primary categories based on what the ingredient actually does: Active Exfoliant, Hydration/Moisture, Soothing/Botanical, Antioxidant, Brightening, Anti-Aging, Acne Treatment, Sun Protection, Preservative, Base/Solvent, Emulsifier, Surfactant/Cleanser, Fragrance, pH Adjuster, Thickener/Texture, Vitamin/Nutrient, Barrier Repair. Use consistent names within the same product. If an ingredient doesn't fit these, pick the closest match — do NOT use "Other".
   - cautionReason: REQUIRED when safetyTier is "caution" or "avoid". A 2-4 sentence explanation of: (1) why this ingredient is flagged, (2) what skin types or conditions should be careful, and (3) what precautions to take. Example: "Glycolic Acid is an AHA exfoliant that can cause irritation, redness, and sun sensitivity, especially at higher concentrations. People with sensitive or rosacea-prone skin should start with low concentrations (5-8%) and use only 2-3 times per week. Always apply SPF the morning after using this ingredient. Avoid combining with retinol or other strong exfoliants."
3. List ingredients in the order they appear on the label.
4. If no ingredient list is visible, set ingredients to [] and ingredientCount to 0.
5. Keep function descriptions SHORT — maximum 8 words per ingredient (e.g., "moisturizes and attracts water to skin").
6. Keep cautionReason to exactly 2 sentences. Be concise.
7. CRITICAL: You MUST list ALL ingredients on the label. Do not stop early. If the label has 35 ingredients, the JSON must have 35 entries. Completeness is more important than detail — if running low on space, shorten function/cautionReason text rather than dropping ingredients.${profileContext}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):

{"match":false,"confidence":"medium","detectedProduct":"Some Product Name","detectedBrand":"Some Brand","detectedCategory":"serum","ingredients":[{"name":"Niacinamide","function":"improves skin texture and tone","safetyTier":"safe","category":"Brightening"}],"ingredientCount":1}

If the image does not show a skincare product:
{"match":false,"confidence":"low","detectedProduct":null,"detectedBrand":null,"detectedCategory":null,"ingredients":[],"ingredientCount":0}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScanRequestBody {
  image?: string;
  mediaType?: 'image/jpeg' | 'image/png' | 'image/webp';
  skinProfile?: SkinProfile;
  upc?: string;
  mode?: 'identify' | 'full';
}

interface ParsedIngredientResult {
  name: string;
  function: string;
  safetyTier: 'safe' | 'caution' | 'avoid';
  category?: string;
  relevance?: string;
  cautionReason?: string;
}

interface ClaudeVisionResult {
  match: boolean;
  productId?: number;
  confidence: 'high' | 'medium' | 'low';
  detectedProduct?: string | null;
  detectedBrand?: string | null;
  detectedCategory?: string | null;
  ingredients?: ParsedIngredientResult[];
  ingredientCount?: number;
  ingredientsTruncated?: boolean;
}

// ---------------------------------------------------------------------------
// Claude Vision API caller
// ---------------------------------------------------------------------------

async function callClaudeVision(
  imageBase64: string,
  mediaType: string,
  skinProfile?: SkinProfile,
  mode: 'identify' | 'full' = 'identify',
): Promise<{ success: true; result: ClaudeVisionResult; tokensUsed: number } | { success: false; error: string }> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    console.error('[Product-Scan] ANTHROPIC_API_KEY not configured');
    return { success: false, error: 'AI service not configured' };
  }

  try {
    const systemPrompt = mode === 'full' ? buildSystemPrompt(skinProfile) : buildIdentifyPrompt();
    const maxTokens = mode === 'full' ? MAX_TOKENS_FULL : MAX_TOKENS_IDENTIFY;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
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
              text: mode === 'full'
                ? 'Identify this skincare product and parse its full ingredient list. Respond with JSON only.'
                : 'Identify this skincare product. Do NOT parse ingredients. Respond with JSON only.',
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

    // Parse the JSON response — Claude sometimes wraps JSON in markdown fences
    try {
      let jsonText = textContent.text.trim();

      // Strip markdown code fences (```json ... ``` or ``` ... ```)
      const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        jsonText = fenceMatch[1].trim();
      }

      // If response starts with non-JSON text, find the first {
      if (!jsonText.startsWith('{') && !jsonText.startsWith('[')) {
        const jsonStart = jsonText.indexOf('{');
        if (jsonStart !== -1) {
          jsonText = jsonText.substring(jsonStart);
        }
      }

      // Strip trailing text after the JSON object closes
      const lastBrace = jsonText.lastIndexOf('}');
      if (lastBrace !== -1 && lastBrace < jsonText.length - 1) {
        jsonText = jsonText.substring(0, lastBrace + 1);
      }

      const parsed: ClaudeVisionResult = JSON.parse(jsonText);

      // Validate productId is in catalog if match is true
      if (parsed.match && parsed.productId) {
        const inCatalog = PRODUCT_CATALOG.some(p => p.id === parsed.productId);
        if (!inCatalog) {
          console.warn(`[Product-Scan] Claude hallucinated product ID ${parsed.productId} (not in catalog) — demoting to no-match`);
          parsed.match = false;
          parsed.productId = undefined;
        }
      }

      // Sanitize ingredients array
      if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
        parsed.ingredients = parsed.ingredients.map(ing => ({
          name: String(ing.name || ''),
          function: String(ing.function || ''),
          safetyTier: ['safe', 'caution', 'avoid'].includes(ing.safetyTier) ? ing.safetyTier : 'safe',
          category: VALID_CATEGORIES.has(ing.category) ? ing.category : 'Other',
          ...(ing.relevance ? { relevance: String(ing.relevance) } : {}),
          ...(ing.cautionReason ? { cautionReason: String(ing.cautionReason) } : {}),
        }));
        parsed.ingredientCount = parsed.ingredients.length;
      } else {
        parsed.ingredients = [];
        parsed.ingredientCount = 0;
      }

      // Detect if Claude's response was truncated at the token limit
      if (data.stop_reason === 'max_tokens') {
        console.warn('[Product-Scan] Response hit max_tokens — ingredients may be truncated');
        parsed.ingredientsTruncated = true;
      }

      return { success: true, result: parsed, tokensUsed };
    } catch {
      console.error('[Product-Scan] Failed to parse Claude response as JSON. Raw response (first 500 chars):', textContent.text.substring(0, 500));
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

    // ── UPC barcode lookup (skips Vision entirely) ──────────────────────
    if (body.upc && typeof body.upc === 'string') {
      const upc = body.upc.trim();
      const match = PRODUCT_CATALOG.find(p => p.upc === upc);

      const scanResult = match
        ? {
            match: true,
            productId: match.id,
            confidence: 'high' as const,
            detectedProduct: match.name,
            detectedBrand: match.brand,
            detectedCategory: match.category,
            upc,
            ingredients: [],
            ingredientCount: 0,
            timestamp: new Date().toISOString(),
          }
        : {
            match: false,
            confidence: 'high' as const,
            upc,
            ingredients: [],
            ingredientCount: 0,
            timestamp: new Date().toISOString(),
          };

      return new Response(
        JSON.stringify({
          success: true,
          result: scanResult,
          meta: { authenticated: true, timestamp: new Date().toISOString() },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

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

    // Call Claude Vision with optional skin profile
    const mode = body.mode === 'full' ? 'full' as const : 'identify' as const;
    const result = await callClaudeVision(body.image, body.mediaType, body.skinProfile, mode);

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
      ingredients: result.result.ingredients ?? [],
      ingredientCount: result.result.ingredientCount ?? 0,
      ingredientsTruncated: result.result.ingredientsTruncated ?? false,
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
