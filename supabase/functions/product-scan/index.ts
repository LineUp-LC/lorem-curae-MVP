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
// Service role client (lazy singleton — bypasses RLS for server-side writes)
// ---------------------------------------------------------------------------

let _serviceClient: ReturnType<typeof createClient> | null = null;
function getServiceClient(): ReturnType<typeof createClient> | null {
  if (!_serviceClient) {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) {
      console.error('[Product-Scan] SUPABASE_SERVICE_ROLE_KEY not configured — ingredient persistence disabled');
      return null;
    }
    _serviceClient = createClient(url, key);
  }
  return _serviceClient;
}

// ---------------------------------------------------------------------------
// Types (declared early for use in persistence helpers)
// ---------------------------------------------------------------------------

interface SkinProfile {
  skinType?: string;
  concerns?: string[];
  sensitivity?: string;
}

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
// Ingredient persistence helpers
// ---------------------------------------------------------------------------

function getConcentrationRange(position: number): string {
  if (position <= 0) return 'low';
  if (position <= 3) return 'very_high';
  if (position <= 8) return 'high';
  if (position <= 15) return 'medium';
  return 'low';
}

async function findOrCreateProduct(
  brand: string,
  name: string,
  category?: string,
): Promise<string | null> {
  const client = getServiceClient();
  if (!client || !brand || !name) return null;

  try {
    // Case-insensitive lookup matching the dedup index
    const { data: existing, error: selectError } = await client
      .from('products')
      .select('id')
      .ilike('brand', brand)
      .ilike('name', name)
      .limit(1)
      .single();

    if (existing?.id) {
      return existing.id;
    }

    // Insert new product
    const slug = `${brand}-${name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: inserted, error } = await client
      .from('products')
      .insert({
        slug,
        name,
        brand,
        category: category || 'unknown',
        price: 0,
        source: 'scan',
        status: 'draft',
      })
      .select('id')
      .single();

    if (error) {
      // Unique constraint race — another scan inserted this product concurrently
      if (error.code === '23505') {
        console.log('[Product-Scan] Concurrent product creation detected, retrying lookup');
        const { data: retry } = await client
          .from('products')
          .select('id')
          .ilike('brand', brand)
          .ilike('name', name)
          .limit(1)
          .single();
        return retry?.id ?? null;
      }
      console.error('[Product-Scan] findOrCreateProduct insert error:', error.message);
      return null;
    }

    return inserted?.id ?? null;
  } catch (err) {
    console.error('[Product-Scan] findOrCreateProduct failed:', err);
    return null;
  }
}

async function persistIngredients(
  productId: string,
  ingredients: ParsedIngredientResult[],
): Promise<void> {
  const client = getServiceClient();
  if (!client || ingredients.length === 0) return;

  try {
    const rows = ingredients.map((ing, idx) => ({
      product_id: productId,
      ingredient_name: ing.name,
      inci_name: null,
      position: idx + 1,
      estimated_concentration_range: getConcentrationRange(idx + 1),
      safety_tier: ing.safetyTier,
      caution_reason: ing.cautionReason ?? null,
      function: ing.function,
      category: ing.category ?? null,
      source: 'scan',
      needs_review: false,
      last_verified_at: new Date().toISOString(),
    }));

    const { error } = await client
      .from('product_ingredients')
      .upsert(rows, {
        onConflict: 'product_id,position',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('[Product-Scan] persistIngredients error:', error.message);
    } else {
      console.log(`[Product-Scan] Persisted ${rows.length} ingredients for product ${productId}`);
    }
  } catch (err) {
    console.error('[Product-Scan] persistIngredients failed:', err);
  }
}

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

function buildIdentifyPrompt(): string {
  return `You are a skincare product analyzer for Lorem Curae. Identify the product from the photo.

INSTRUCTIONS:
1. Read the product name, brand, and any visible text on the packaging.
2. Common skincare brands: CeraVe, Cetaphil, Neutrogena, La Roche-Posay, The Ordinary, Paula's Choice, Drunk Elephant, Tatcha, COSRX, Vanicream, Aveeno, Olay, Kiehl's, Clinique, SK-II, EltaMD, Supergoop, First Aid Beauty, Sunday Riley, Glossier, Peter Thomas Roth, Dr. Dennis Gross, Murad, Origins, Laneige, Innisfree, Bioderma, Avène, Vichy.
3. Confidence: "high" if brand OR product name is readable, even partially. If you can identify the brand from packaging shape, color, typography, or any visible text, return "high". "medium" if image is blurry but a best-guess identification is possible. "low" ONLY if the image shows literally no skincare product packaging or is completely unreadable noise.
4. IMPORTANT: Never return confidence "low" for a recognizable skincare product. If you can see any brand name, product type, or packaging style — return "high" or "medium". Low confidence should only appear when the image contains no skincare product at all.
5. Do NOT parse ingredients — set ingredients to [] and ingredientCount to 0.

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
4. Confidence: "high" if brand OR product name is readable, even partially. If you can identify the brand from packaging shape, color, typography, or any visible text, return "high". "medium" if image is blurry but a best-guess identification is possible. "low" ONLY if the image shows literally no skincare product packaging or is completely unreadable noise.
5. IMPORTANT: Never return confidence "low" for a recognizable skincare product. If you can see any brand name, product type, or packaging style — return "high" or "medium". Low confidence should only appear when the image contains no skincare product at all.

INGREDIENT PARSING INSTRUCTIONS:
1. Read every ingredient visible on the product label (usually in the ingredients list / INCI list).
2. For each ingredient provide:
   - name: the ingredient name as written on the label
   - function: its primary skincare function in plain language (e.g., "moisturizes and attracts water to skin", "helps protect from sun damage", "gentle surfactant that cleanses skin")
   - safetyTier: "safe", "caution", or "avoid" — apply the SAFETY TIER RULES below deterministically

SAFETY TIER RULES (apply these exact rules for every ingredient — do not improvise):

"avoid" — the ingredient MUST be classified as "avoid" if ANY of the following is true:
  - Listed in EU Cosmetics Regulation Annex II (banned substances) — e.g., hydroquinone (in OTC cosmetics), mercury compounds, lead acetate, triclosan (in most uses), coal tar, certain parabens (isopropyl-, isobutyl-, phenyl-, benzyl-, pentylparaben).
  - Formaldehyde or a formaldehyde-releasing preservative — DMDM hydantoin, diazolidinyl urea, imidazolidinyl urea, quaternium-15, 2-bromo-2-nitropropane-1,3-diol (bronopol), sodium hydroxymethylglycinate.
  - Methylisothiazolinone (MI) or methylchloroisothiazolinone (MCI) — known high-risk allergens/sensitizers.
  - Heavy metals or heavy-metal salts (lead, mercury, arsenic, cadmium compounds).
  - Known carcinogens, mutagens, or reproductive toxins (CMR substances) restricted in cosmetics.
  - PFAS / fluorinated compounds (PTFE, perfluorodecalin, perfluorohexane, etc.).

"caution" — the ingredient MUST be classified as "caution" if it is NOT in the "avoid" list AND ANY of the following is true:
  - Known skin sensitizer or common contact allergen — fragrance/parfum, essential oils (limonene, linalool, citral, geraniol, eugenol, cinnamal), balsam of Peru, lanolin.
  - Strong active with known irritation/sun-sensitivity risk — any AHA (glycolic, lactic, mandelic, citric as active), any BHA (salicylic acid), PHAs at high concentrations, retinol/retinal/retinyl esters/tretinoin/adapalene, benzoyl peroxide, hydroquinone alternatives at high strengths.
  - High-concentration vitamin C (L-ascorbic acid ≥ 10%) or vitamin C derivatives at high strengths.
  - Denatured alcohol / alcohol denat / SD alcohol / isopropyl alcohol when listed in the top 5 ingredients.
  - Sulfates as primary surfactants (sodium lauryl sulfate, sodium laureth sulfate, ammonium lauryl sulfate).
  - Known comedogenic ingredients at notable concentrations — coconut oil, isopropyl myristate, isopropyl palmitate, myristyl myristate, algae extract.
  - Chemical sunscreen filters with known sensitization or hormone-disruption concerns — oxybenzone, octinoxate, homosalate, octocrylene, avobenzone.
  - Limited long-term safety data or regulatory uncertainty.

"safe" — everything that does NOT meet the "avoid" or "caution" criteria above. This includes water, glycerin, hyaluronic acid, niacinamide (at typical concentrations), ceramides, peptides, panthenol, allantoin, squalane, most plant butters/oils at typical use levels, zinc oxide, titanium dioxide (non-nano), xanthan gum, typical emulsifiers and thickeners.

CONSISTENCY RULE: Apply safety tiers based on the ingredient's known chemical properties and regulatory status, NOT based on the specific product or context. The same ingredient must always receive the same safety tier regardless of which product it appears in. Water is always safe. Fragrance is always caution. Methylisothiazolinone is always avoid. Do not vary these judgments between scans.
   - category: EVERY ingredient MUST have a category — never leave it blank or null. Choose from these primary categories based on what the ingredient actually does: Active Exfoliant, Hydration/Moisture, Soothing/Botanical, Antioxidant, Brightening, Anti-Aging, Acne Treatment, Sun Protection, Preservative, Base/Solvent, Emulsifier, Surfactant/Cleanser, Fragrance, pH Adjuster, Thickener/Texture, Vitamin/Nutrient, Barrier Repair. Use consistent names within the same product. If an ingredient doesn't fit these, pick the closest match — do NOT use "Other".
   - cautionReason: REQUIRED when safetyTier is "caution" or "avoid". A 2-4 sentence explanation of: (1) why this ingredient is flagged, (2) what skin types or conditions should be careful, and (3) what precautions to take. Example: "Glycolic Acid is an AHA exfoliant that can cause irritation, redness, and sun sensitivity, especially at higher concentrations. People with sensitive or rosacea-prone skin should start with low concentrations (5-8%) and use only 2-3 times per week. Always apply SPF the morning after using this ingredient. Avoid combining with retinol or other strong exfoliants."
3. List ingredients in the order they appear on the label.
4. If no ingredient list is visible, set ingredients to [] and ingredientCount to 0.
5. Keep function descriptions SHORT — maximum 8 words per ingredient (e.g., "moisturizes and attracts water to skin").
6. Keep cautionReason to exactly 2 sentences. Be concise.
7. CRITICAL: You MUST list ALL ingredients on the label. Do not stop early. If the label has 35 ingredients, the JSON must have 35 entries. Completeness is more important than detail — if running low on space, shorten function/cautionReason text rather than dropping ingredients.${profileContext}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):

{"match":false,"confidence":"high","detectedProduct":"Some Product Name","detectedBrand":"Some Brand","detectedCategory":"serum","ingredients":[{"name":"Niacinamide","function":"improves skin texture and tone","safetyTier":"safe","category":"Brightening"}],"ingredientCount":1}

If the image does not show a skincare product:
{"match":false,"confidence":"low","detectedProduct":null,"detectedBrand":null,"detectedCategory":null,"ingredients":[],"ingredientCount":0}`;
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
        temperature: 0,
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

      // match field comes from Claude's response — no local catalog lookup

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
    // match field comes from Claude's response — no local catalog lookup
    if (body.upc && typeof body.upc === 'string') {
      const upc = body.upc.trim();

      const scanResult = {
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

    // ── Fire-and-forget: persist ingredients to DB ──────────────────────
    // Started BEFORE return so the promise is in-flight within the Deno isolate
    if (
      mode === 'full' &&
      scanResult.ingredients.length > 0 &&
      scanResult.detectedBrand &&
      scanResult.detectedProduct
    ) {
      const ingredientPersistPromise = (async () => {
        try {
          const productId = await findOrCreateProduct(
            scanResult.detectedBrand!,
            scanResult.detectedProduct!,
            scanResult.detectedCategory,
          );
          if (productId) {
            await persistIngredients(productId, scanResult.ingredients);
          }
        } catch {
          // silent — never affect scan response
        }
      })();
      void ingredientPersistPromise;
    }

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
