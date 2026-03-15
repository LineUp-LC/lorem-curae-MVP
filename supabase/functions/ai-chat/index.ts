/**
 * AI Chat Edge Function for Lorem Curae
 *
 * Accepts a system prompt built by the frontend (via systemPrompt.ts),
 * enriches it with server-side user data, and proxies to Anthropic Claude.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 4096;

// Minimal fallback when the frontend does not provide a system prompt
const FALLBACK_SYSTEM_PROMPT = `You are Curae AI, a personalized skincare assistant for Lorem Curae.
Help users find suitable skincare products, build routines, and understand ingredients.
Be calm, educational, and evidence-based. Never make medical claims or diagnoses.
Always recommend consulting a dermatologist for persistent skin concerns.
Provide 2-4 product recommendations when relevant, with brand names and reasoning.
Do not hallucinate products, ingredients, or retailers.
Keep responses concise and actionable.`;

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

interface AIRequestBody {
  message: string;
  systemPrompt?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  settings?: {
    tone?: string;
    detailLevel?: string;
    responseStyle?: string;
    customInstructions?: string;
  };
  clientContext?: {
    viewedProducts?: Array<{ id: number; name: string; brand: string; category: string }>;
    favoritedProducts?: Array<{ id: number; name: string; brand: string; category: string }>;
    frequentCategories?: string[];
    recentSearches?: string[];
  };
}

// ---------------------------------------------------------------------------
// Server-side context (data the frontend cannot access)
// ---------------------------------------------------------------------------

interface ServerContext {
  sections: string[];
  hasProfile: boolean;
}

async function getServerContext(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
): Promise<ServerContext> {
  const sections: string[] = [];
  let hasProfile = false;

  try {
    // Check for skin profile
    const { data: profile } = await supabaseClient
      .from('users_profiles')
      .select('skin_type')
      .eq('id', userId)
      .single();
    hasProfile = !!profile;

    // Routine notes (last 30 days) — not available to frontend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: routineNotes } = await supabaseClient
      .from('routine_notes')
      .select('observations, products_used, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (routineNotes && routineNotes.length > 0) {
      const observations = routineNotes
        .map((n: { observations?: string }) => n.observations)
        .filter(Boolean)
        .slice(0, 5) as string[];
      const products = [
        ...new Set(
          routineNotes.flatMap((n: { products_used?: string[] }) => n.products_used || []),
        ),
      ].slice(0, 10) as string[];

      let section = `## Recent Routine Activity\n\nThe user has logged ${routineNotes.length} routine notes in the past 30 days.`;
      if (products.length > 0) {
        section += `\n- Products currently using: ${products.join(', ')}`;
      }
      if (observations.length > 0) {
        section += `\n- Recent observations: ${observations.slice(0, 3).join('; ')}`;
      }
      section += `\nConsider their current routine when making recommendations.`;
      sections.push(section);
    }

    // Purchase history — not available to frontend
    const { data: purchases } = await supabaseClient
      .from('marketplace_transactions')
      .select('product_name, product_brand, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (purchases && purchases.length > 0) {
      const purchaseList = purchases
        .slice(0, 5)
        .map((p: { product_brand: string; product_name: string }) =>
          `${p.product_brand} ${p.product_name}`,
        )
        .join(', ');
      sections.push(`## Purchase History\n\nPreviously purchased: ${purchaseList}`);
    }
  } catch (error) {
    console.error('[AI-Chat] Error fetching server context:', error);
  }

  return { sections, hasProfile };
}

// ---------------------------------------------------------------------------
// Prompt assembly
// ---------------------------------------------------------------------------

function buildFinalPrompt(
  basePrompt: string,
  serverSections: string[],
  settings?: AIRequestBody['settings'],
): string {
  let prompt = basePrompt;

  for (const section of serverSections) {
    prompt += `\n\n---\n\n${section}`;
  }

  if (settings?.customInstructions) {
    prompt += `\n\n---\n\n## User's Custom Instructions\n\n${settings.customInstructions}`;
  }

  const toneMap: Record<string, string> = {
    friendly: 'Use a warm, conversational tone.',
    professional: 'Use a professional, formal tone.',
    encouraging: 'Use an encouraging, supportive tone.',
    direct: 'Be direct and concise in your responses.',
  };
  if (settings?.tone && toneMap[settings.tone]) {
    prompt += `\n\n## Response Tone\n\n${toneMap[settings.tone]}`;
  }

  const detailMap: Record<string, string> = {
    brief: 'Keep responses brief and to the point.',
    balanced: 'Provide balanced responses with moderate detail.',
    detailed: 'Provide comprehensive, in-depth explanations.',
  };
  if (settings?.detailLevel && detailMap[settings.detailLevel]) {
    prompt += `\n\n## Detail Level\n\n${detailMap[settings.detailLevel]}`;
  }

  return prompt;
}

// ---------------------------------------------------------------------------
// Anthropic Claude API
// ---------------------------------------------------------------------------

async function callClaudeAPI(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<{ success: true; response: string } | { success: false; error: string }> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!anthropicApiKey) {
    console.error('[AI-Chat] ANTHROPIC_API_KEY not configured');
    return { success: false, error: 'AI service not configured' };
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI-Chat] Claude API error:', response.status, errorText);
      return { success: false, error: `AI service error: ${response.status}` };
    }

    const data = await response.json();
    const textContent = data.content?.find((block: { type: string }) => block.type === 'text');
    if (!textContent?.text) {
      console.error('[AI-Chat] Unexpected Claude response format:', data);
      return { success: false, error: 'Unexpected AI response format' };
    }

    return { success: true, response: textContent.text };
  } catch (error) {
    console.error('[AI-Chat] Claude API call failed:', error);
    return { success: false, error: 'AI service unavailable' };
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Soft auth — anonymous access allowed
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    let user = null;
    if (token) {
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (!error) user = data.user;
    }

    const body: AIRequestBody = await req.json();

    if (!body.message || typeof body.message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid message field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Use frontend-provided system prompt or minimal fallback
    const basePrompt = body.systemPrompt || FALLBACK_SYSTEM_PROMPT;

    // Enrich with server-side context if authenticated
    let serverCtx: ServerContext = { sections: [], hasProfile: false };
    if (user) {
      serverCtx = await getServerContext(supabaseClient, user.id);
    }

    const finalPrompt = buildFinalPrompt(basePrompt, serverCtx.sections, body.settings);

    // Build messages array
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (body.conversationHistory) {
      for (const msg of body.conversationHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    messages.push({ role: 'user', content: body.message });

    const result = await callClaudeAPI(finalPrompt, messages);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error,
          meta: {
            authenticated: !!user,
            hasProfile: serverCtx.hasProfile,
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: result.response,
        meta: {
          authenticated: !!user,
          hasProfile: serverCtx.hasProfile,
          hasInteractionHistory: false,
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[AI-Chat] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
