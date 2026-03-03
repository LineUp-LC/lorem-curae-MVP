/**
 * AI Chat Client for Lorem Curae
 *
 * Client-side helper for calling the AI chat edge function.
 */

import { supabase } from '../supabase-browser';
import { savedProductsState } from '../utils/favoritesState';
import { recentlyViewedState } from '../utils/recentlyViewedState';
import type {
  AIChatRequest,
  AIChatErrorResponse,
  ProductReference,
} from './types';

// Response format from Claude-powered edge function
interface AIChatSuccessResponse {
  success: true;
  response: string;
  meta: {
    authenticated: boolean;
    hasProfile: boolean;
    hasInteractionHistory: boolean;
    timestamp: string;
  };
}

const AI_CHAT_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

/**
 * Gather client-side user context from localStorage state managers
 */
export function getClientContext(): AIChatRequest['clientContext'] {
  try {
    // Get saved products
    const saved = savedProductsState.getSavedProducts();
    const savedProducts: ProductReference[] = saved.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      savedAt: p.savedAt,
    }));

    // Get recently viewed products
    const recentlyViewed = recentlyViewedState.getRecentlyViewed();
    const viewedProducts: ProductReference[] = recentlyViewed.map((v) => ({
      id: v.id,
      name: v.name,
      brand: v.brand,
      category: v.category,
      viewedAt: v.viewedAt,
    }));

    // Derive frequent categories from viewed and saved
    const categoryCount: Record<string, number> = {};
    [...savedProducts, ...viewedProducts].forEach((p) => {
      if (p.category) {
        categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
      }
    });
    const frequentCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    // Get recent searches from localStorage
    const recentSearches: string[] = [];
    try {
      const searchHistory = localStorage.getItem('ai_chat_search_history');
      if (searchHistory) {
        recentSearches.push(...JSON.parse(searchHistory).slice(0, 10));
      }
    } catch {
      // Ignore search history errors
    }

    return {
      viewedProducts: viewedProducts.slice(0, 20),
      savedProducts: savedProducts.slice(0, 20),
      frequentCategories,
      recentSearches,
    };
  } catch (error) {
    console.error('[AIChatClient] Error gathering client context:', error);
    return {};
  }
}

/**
 * Call the AI chat edge function with Claude-powered responses
 */
export async function callAIChatAPI(
  request: AIChatRequest
): Promise<{ success: true; response: string; meta: AIChatSuccessResponse['meta'] } | { success: false; error: string }> {
  try {
    // Get current session for auth token
    const { data: { session } } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Include auth header if user is logged in
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    // Merge client context into request
    const clientContext = getClientContext();
    const requestWithContext: AIChatRequest = {
      ...request,
      clientContext: {
        ...clientContext,
        ...request.clientContext, // Allow override
      },
    };

    const response = await fetch(AI_CHAT_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestWithContext),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage = data.error || 'API request failed';
      console.error('[AIChatClient] API error:', errorMessage);
      return { success: false, error: errorMessage };
    }

    return {
      success: true,
      response: data.response,
      meta: data.meta,
    };
  } catch (error) {
    console.error('[AIChatClient] Error calling AI chat API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

