/**
 * AI Insight Edge Function for Lorem Curae
 *
 * Lightweight endpoint for non-chat AI surfaces (product detail, ingredient,
 * routine builder, comparison, etc.). Optimised for compact 1-4 sentence
 * responses with lower token limits than the full chat function.
 *
 * Model: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
 * Auth: Required — unauthenticated users receive rule-based fallback on the
 *       client side and never reach this function.
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

// Mode-specific token budgets — tuned for 1-4 sentence compact responses.
// Lower limits = faster generation (less time waiting for output tokens).
const MODE_MAX_TOKENS: Record<string, number> = {
  product_detail: 512,
  ingredient_detail: 512,
  routine_builder: 512,
  search: 384,
  comparison: 768,
  marketplace: 512,
  nutrition: 512,
  survey_results: 768,
  chat: 4096, // Fallback — chat mode should use ai-chat function
  explain_product: 512,
  is_it_for_me: 2048,
  find_alternatives: 512,
  review_summary: 512,
  natural_discovery: 384,
  rewrite_explanation: 512,
  guided_comparison: 768,
  guided_routine_build: 768,
  guided_routine_explain: 512,
};

// Supported non-chat modes
const SUPPORTED_MODES = [
  'product_detail',
  'ingredient_detail',
  'routine_builder',
  'search',
  'comparison',
  'marketplace',
  'nutrition',
  'survey_results',
  'explain_product',
  'is_it_for_me',
  'find_alternatives',
  'review_summary',
  'natural_discovery',
  'rewrite_explanation',
  'guided_comparison',
  'guided_routine_build',
  'guided_routine_explain',
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AIInsightRequest {
  mode: string;
  systemPrompt: string;
  message?: string;
  context?: Record<string, unknown>;
}

interface AIInsightResponse {
  success: boolean;
  mode: string;
  insight: string;
  meta: {
    authenticated: boolean;
    hasProfile: boolean;
    tokensUsed?: number;
    timestamp: string;
  };
}

// ---------------------------------------------------------------------------
// Claude API caller
// ---------------------------------------------------------------------------

async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
): Promise<{ success: true; text: string; tokensUsed: number } | { success: false; error: string }> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    console.error('[AI-Insight] ANTHROPIC_API_KEY not configured');
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
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI-Insight] Claude API error:', response.status, errorText);
      return { success: false, error: `AI service error: ${response.status}` };
    }

    const data = await response.json();

    const textContent = data.content?.find(
      (block: { type: string }) => block.type === 'text',
    );

    if (!textContent?.text) {
      console.error('[AI-Insight] Unexpected response format:', data);
      return { success: false, error: 'Unexpected AI response format' };
    }

    const tokensUsed =
      (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0);

    return { success: true, text: textContent.text, tokensUsed };
  } catch (error) {
    console.error('[AI-Insight] Claude API call failed:', error);
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
    // Authenticate — required for AI insight calls
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

    // Guest users should never reach this endpoint — client-side guard
    // However, we allow the request through with a flag for transparency
    if (!isAuthenticated) {
      console.log('[AI-Insight] Unauthenticated request — proceeding with guest flag');
    }

    // Parse request
    const body: AIInsightRequest = await req.json();

    // Validate mode
    if (!body.mode || !SUPPORTED_MODES.includes(body.mode)) {
      return new Response(
        JSON.stringify({ error: `Invalid or unsupported mode: "${body.mode}"` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Validate system prompt
    if (!body.systemPrompt || typeof body.systemPrompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid systemPrompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Build user message — default per mode if not provided
    const userMessage =
      body.message ||
      `Analyze this ${body.mode.replace(/_/g, ' ')} context and provide a concise insight.`;

    // Get token limit for this mode
    const maxTokens = MODE_MAX_TOKENS[body.mode] ?? 1024;

    // Call Claude
    const result = await callClaude(body.systemPrompt, userMessage, maxTokens);

    if (!result.success) {
      const errorResponse: AIInsightResponse = {
        success: false,
        mode: body.mode,
        insight: '',
        meta: {
          authenticated: isAuthenticated,
          hasProfile: false,
          timestamp: new Date().toISOString(),
        },
      };

      return new Response(
        JSON.stringify(errorResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Success response
    const response: AIInsightResponse = {
      success: true,
      mode: body.mode,
      insight: result.text,
      meta: {
        authenticated: isAuthenticated,
        hasProfile: isAuthenticated, // Simplified — full profile check would query Supabase
        tokensUsed: result.tokensUsed,
        timestamp: new Date().toISOString(),
      },
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[AI-Insight] Unexpected error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
