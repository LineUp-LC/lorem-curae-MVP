/**
 * Conversation Memory & Context Intelligence for Lorem Curae AI
 *
 * Manages skincare-focused user memory with strict safety boundaries.
 * Stores, recalls, and applies conversational context for personalization.
 */

import type { SkinProfile, ProductReference } from './types';

// ============================================================================
// MEMORY CATEGORIES (What can be stored)
// ============================================================================

/**
 * Allowed memory categories - strictly skincare-focused
 */
export type MemoryCategory =
  | 'skin_profile'          // type, concerns, sensitivities
  | 'product_preferences'   // fragrance-free, lightweight, non-comedogenic
  | 'budget_preferences'    // budget, mid, premium
  | 'experience_level'      // beginner, intermediate, advanced
  | 'product_history'       // viewed, saved, purchased
  | 'ingredient_preferences'// liked/disliked ingredients, sensitivities
  | 'routine_preferences'   // minimalist, advanced, AM-only, PM-only
  | 'skincare_goals';       // brightening, acne reduction, barrier repair

/**
 * Individual memory entry
 */
export interface MemoryEntry {
  category: MemoryCategory;
  key: string;
  value: string | string[] | boolean | number;
  confidence: 'explicit' | 'inferred';  // explicit = user stated, inferred = derived from behavior
  source: 'conversation' | 'survey' | 'behavior' | 'routine_notes';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;  // Optional expiration for temporary context
}

/**
 * Conversation memory state
 */
export interface ConversationMemory {
  // Core profile data
  skinProfile: {
    skinType?: string;
    concerns: string[];
    sensitivities: string[];
    goals: string[];
  };

  // Product preferences
  productPreferences: {
    fragranceFree?: boolean;
    lightweight?: boolean;
    nonComedogenic?: boolean;
    naturalIngredients?: boolean;
    minimalIngredients?: boolean;
  };

  // Budget and experience
  budgetRange?: 'budget' | 'mid' | 'premium';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';

  // Ingredient intelligence
  ingredientPreferences: {
    liked: string[];      // Ingredients user has expressed preference for
    disliked: string[];   // Ingredients user wants to avoid
    sensitivities: string[]; // Known sensitivities
  };

  // Routine preferences
  routinePreferences: {
    style?: 'minimalist' | 'moderate' | 'advanced';
    timing?: 'am-only' | 'pm-only' | 'both';
    currentProducts: string[];  // Products currently in routine
  };

  // Long-term goals (persisted across sessions)
  skincareGoals: string[];

  // Product interaction history
  productHistory: {
    viewed: ProductReference[];
    saved: ProductReference[];
    purchased: ProductReference[];
    discussed: string[];  // Products mentioned in conversation
  };

  // Conversation context (session-level)
  conversationContext: {
    currentTopic?: string;
    pendingQuestions: string[];
    mentionedConcerns: string[];
    mentionedIngredients: string[];
    lastRecommendations: string[];
  };

  // Memory metadata
  metadata: {
    lastUpdated: string;
    sessionCount: number;
    firstInteraction?: string;
  };
}

// ============================================================================
// FORBIDDEN MEMORY (What must NEVER be stored)
// ============================================================================

const FORBIDDEN_PATTERNS = [
  // Medical information
  /\b(diagnosis|diagnosed|prescription|medication|doctor|dermatologist\s+said|medical\s+condition)\b/i,
  // Private identifiers
  /\b(ssn|social\s+security|address|phone\s+number|email|password|credit\s+card)\b/i,
  // Emotional disclosures
  /\b(depressed|anxious|stressed|trauma|mental\s+health|therapy|counseling)\b/i,
  // Age-related (beyond skincare relevance)
  /\b(birthday|born\s+in|age\s+\d+|years\s+old)\b/i,
];

/**
 * Check if content contains forbidden information
 */
export function containsForbiddenContent(content: string): boolean {
  return FORBIDDEN_PATTERNS.some(pattern => pattern.test(content));
}

// ============================================================================
// MEMORY INITIALIZATION
// ============================================================================

/**
 * Create empty memory state
 */
export function createEmptyMemory(): ConversationMemory {
  return {
    skinProfile: {
      concerns: [],
      sensitivities: [],
      goals: [],
    },
    productPreferences: {},
    ingredientPreferences: {
      liked: [],
      disliked: [],
      sensitivities: [],
    },
    routinePreferences: {
      currentProducts: [],
    },
    skincareGoals: [],
    productHistory: {
      viewed: [],
      saved: [],
      purchased: [],
      discussed: [],
    },
    conversationContext: {
      pendingQuestions: [],
      mentionedConcerns: [],
      mentionedIngredients: [],
      lastRecommendations: [],
    },
    metadata: {
      lastUpdated: new Date().toISOString(),
      sessionCount: 1,
    },
  };
}

/**
 * Initialize memory from skin profile and interaction history
 */
export function initializeMemoryFromContext(
  skinProfile: SkinProfile | null,
  interactionHistory: {
    viewedProducts?: ProductReference[];
    favoritedProducts?: ProductReference[];
    purchasedProducts?: ProductReference[];
    frequentConcerns?: string[];
  }
): ConversationMemory {
  const memory = createEmptyMemory();

  // Populate from skin profile
  if (skinProfile) {
    memory.skinProfile = {
      skinType: skinProfile.skinType || undefined,
      concerns: skinProfile.concerns || [],
      sensitivities: skinProfile.sensitivities || [],
      goals: skinProfile.goals || [],
    };
    memory.productPreferences = {
      fragranceFree: skinProfile.preferences?.fragranceFree,
    };
    memory.budgetRange = skinProfile.preferences?.budgetRange;
    memory.ingredientPreferences.sensitivities = skinProfile.sensitivities || [];
    memory.skincareGoals = skinProfile.goals || [];
  }

  // Populate from interaction history
  if (interactionHistory) {
    memory.productHistory = {
      viewed: interactionHistory.viewedProducts || [],
      saved: interactionHistory.favoritedProducts || [],
      purchased: interactionHistory.purchasedProducts || [],
      discussed: [],
    };
    if (interactionHistory.frequentConcerns) {
      memory.conversationContext.mentionedConcerns = interactionHistory.frequentConcerns;
    }
  }

  memory.metadata.firstInteraction = new Date().toISOString();
  return memory;
}

// ============================================================================
// MEMORY UPDATES
// ============================================================================

/**
 * Update memory with new information, respecting recency rule
 * (newest information always takes precedence)
 */
export function updateMemory(
  memory: ConversationMemory,
  updates: Partial<ConversationMemory>
): ConversationMemory {
  const now = new Date().toISOString();

  // Merge updates, with new values overriding old
  const updated: ConversationMemory = {
    ...memory,
    skinProfile: {
      ...memory.skinProfile,
      ...updates.skinProfile,
      // Merge arrays instead of replacing
      concerns: updates.skinProfile?.concerns
        ? [...new Set([...updates.skinProfile.concerns])]
        : memory.skinProfile.concerns,
      sensitivities: updates.skinProfile?.sensitivities
        ? [...new Set([...updates.skinProfile.sensitivities])]
        : memory.skinProfile.sensitivities,
      goals: updates.skinProfile?.goals
        ? [...new Set([...updates.skinProfile.goals])]
        : memory.skinProfile.goals,
    },
    productPreferences: {
      ...memory.productPreferences,
      ...updates.productPreferences,
    },
    budgetRange: updates.budgetRange ?? memory.budgetRange,
    experienceLevel: updates.experienceLevel ?? memory.experienceLevel,
    ingredientPreferences: {
      liked: updates.ingredientPreferences?.liked
        ? [...new Set([...memory.ingredientPreferences.liked, ...updates.ingredientPreferences.liked])]
        : memory.ingredientPreferences.liked,
      disliked: updates.ingredientPreferences?.disliked
        ? [...new Set([...memory.ingredientPreferences.disliked, ...updates.ingredientPreferences.disliked])]
        : memory.ingredientPreferences.disliked,
      sensitivities: updates.ingredientPreferences?.sensitivities
        ? [...new Set([...memory.ingredientPreferences.sensitivities, ...updates.ingredientPreferences.sensitivities])]
        : memory.ingredientPreferences.sensitivities,
    },
    routinePreferences: {
      ...memory.routinePreferences,
      ...updates.routinePreferences,
      currentProducts: updates.routinePreferences?.currentProducts
        ? [...new Set([...updates.routinePreferences.currentProducts])]
        : memory.routinePreferences.currentProducts,
    },
    skincareGoals: updates.skincareGoals
      ? [...new Set([...updates.skincareGoals])]
      : memory.skincareGoals,
    productHistory: {
      ...memory.productHistory,
      ...updates.productHistory,
    },
    conversationContext: {
      ...memory.conversationContext,
      ...updates.conversationContext,
    },
    metadata: {
      ...memory.metadata,
      lastUpdated: now,
    },
  };

  return updated;
}

/**
 * Handle user contradiction - always treat newest information as correct
 */
export function handleContradiction(
  memory: ConversationMemory,
  field: keyof ConversationMemory['skinProfile'],
  newValue: string | string[]
): ConversationMemory {
  return updateMemory(memory, {
    skinProfile: {
      ...memory.skinProfile,
      [field]: newValue,
    },
  });
}

/**
 * Clear specific memory when user requests
 */
export function forgetMemory(
  memory: ConversationMemory,
  category: MemoryCategory | 'all'
): ConversationMemory {
  if (category === 'all') {
    return createEmptyMemory();
  }

  const cleared = { ...memory };

  switch (category) {
    case 'skin_profile':
      cleared.skinProfile = { concerns: [], sensitivities: [], goals: [] };
      break;
    case 'product_preferences':
      cleared.productPreferences = {};
      break;
    case 'budget_preferences':
      cleared.budgetRange = undefined;
      break;
    case 'experience_level':
      cleared.experienceLevel = undefined;
      break;
    case 'product_history':
      cleared.productHistory = { viewed: [], saved: [], purchased: [], discussed: [] };
      break;
    case 'ingredient_preferences':
      cleared.ingredientPreferences = { liked: [], disliked: [], sensitivities: [] };
      break;
    case 'routine_preferences':
      cleared.routinePreferences = { currentProducts: [] };
      break;
    case 'skincare_goals':
      cleared.skincareGoals = [];
      break;
  }

  cleared.metadata.lastUpdated = new Date().toISOString();
  return cleared;
}

// ============================================================================
// MEMORY EXTRACTION FROM MESSAGES
// ============================================================================

/**
 * Skincare-relevant patterns for memory extraction
 */
const EXTRACTION_PATTERNS = {
  skinType: /\b(my\s+skin\s+is\s+)?(oily|dry|combination|normal|sensitive)\s+skin\b/i,
  concerns: /\b(acne|breakouts?|dark\s+spots?|hyperpigmentation|wrinkles?|fine\s+lines?|dryness|oiliness|redness|sensitivity|large\s+pores?|dullness|uneven\s+tone|texture|aging)\b/gi,
  preferences: {
    fragranceFree: /\b(fragrance[-\s]?free|no\s+fragrance|unscented|avoid\s+fragrance)\b/i,
    lightweight: /\b(lightweight|light\s+formula|not\s+heavy|non[-\s]?greasy)\b/i,
    nonComedogenic: /\b(non[-\s]?comedogenic|won't\s+clog\s+pores?)\b/i,
  },
  budget: /\b(budget|affordable|cheap|mid[-\s]?range|luxury|premium|splurge|drugstore)\b/i,
  experience: /\b(beginner|new\s+to\s+skincare|just\s+starting|intermediate|advanced|experienced)\b/i,
  ingredients: {
    liked: /\b(love|like|prefer|works\s+well|enjoy)\s+(?:using\s+)?([a-z\s]+(?:acid|vitamin\s+c|retinol|niacinamide|hyaluronic|ceramides?))\b/i,
    disliked: /\b(hate|dislike|avoid|can't\s+use|react\s+to|sensitive\s+to)\s+(?:[a-z\s]+)?([a-z\s]+(?:acid|vitamin\s+c|retinol|niacinamide|hyaluronic|fragrance))\b/i,
  },
  routineStyle: /\b(minimalist|simple|basic|multi[-\s]?step|10[-\s]?step|advanced|elaborate)\s+routine\b/i,
  goals: /\b(brighten|brightening|clear|clearing|hydrat|moisturiz|anti[-\s]?aging|barrier\s+repair|glow|radiance|even\s+out|reduce\s+(?:acne|redness|pores?))\b/gi,
};

/**
 * Extract skincare-relevant memory from user message
 */
export function extractMemoryFromMessage(
  message: string,
  existingMemory: ConversationMemory
): Partial<ConversationMemory> | null {
  // Safety check - don't extract from forbidden content
  if (containsForbiddenContent(message)) {
    return null;
  }

  const updates: Partial<ConversationMemory> = {};
  let hasUpdates = false;

  // Extract skin type
  const skinTypeMatch = message.match(EXTRACTION_PATTERNS.skinType);
  if (skinTypeMatch) {
    const skinType = skinTypeMatch[2]?.toLowerCase();
    if (skinType && skinType !== existingMemory.skinProfile.skinType) {
      updates.skinProfile = { ...existingMemory.skinProfile, skinType };
      hasUpdates = true;
    }
  }

  // Extract concerns
  const concernMatches = message.match(EXTRACTION_PATTERNS.concerns);
  if (concernMatches) {
    const newConcerns = [...new Set(concernMatches.map(c => c.toLowerCase()))];
    const combinedConcerns = [...new Set([...existingMemory.skinProfile.concerns, ...newConcerns])];
    if (combinedConcerns.length > existingMemory.skinProfile.concerns.length) {
      updates.skinProfile = {
        ...(updates.skinProfile || existingMemory.skinProfile),
        concerns: combinedConcerns,
      };
      hasUpdates = true;
    }
  }

  // Extract preferences
  const newPrefs: ConversationMemory['productPreferences'] = {};
  if (EXTRACTION_PATTERNS.preferences.fragranceFree.test(message)) {
    newPrefs.fragranceFree = true;
    hasUpdates = true;
  }
  if (EXTRACTION_PATTERNS.preferences.lightweight.test(message)) {
    newPrefs.lightweight = true;
    hasUpdates = true;
  }
  if (EXTRACTION_PATTERNS.preferences.nonComedogenic.test(message)) {
    newPrefs.nonComedogenic = true;
    hasUpdates = true;
  }
  if (Object.keys(newPrefs).length > 0) {
    updates.productPreferences = { ...existingMemory.productPreferences, ...newPrefs };
  }

  // Extract budget
  const budgetMatch = message.match(EXTRACTION_PATTERNS.budget);
  if (budgetMatch) {
    const budgetWord = budgetMatch[0].toLowerCase();
    let budgetRange: 'budget' | 'mid' | 'premium' | undefined;
    if (['budget', 'affordable', 'cheap', 'drugstore'].some(w => budgetWord.includes(w))) {
      budgetRange = 'budget';
    } else if (['luxury', 'premium', 'splurge'].some(w => budgetWord.includes(w))) {
      budgetRange = 'premium';
    } else {
      budgetRange = 'mid';
    }
    if (budgetRange !== existingMemory.budgetRange) {
      updates.budgetRange = budgetRange;
      hasUpdates = true;
    }
  }

  // Extract experience level
  const expMatch = message.match(EXTRACTION_PATTERNS.experience);
  if (expMatch) {
    const expWord = expMatch[0].toLowerCase();
    let experienceLevel: 'beginner' | 'intermediate' | 'advanced' | undefined;
    if (['beginner', 'new to', 'just starting'].some(w => expWord.includes(w))) {
      experienceLevel = 'beginner';
    } else if (expWord.includes('intermediate')) {
      experienceLevel = 'intermediate';
    } else if (['advanced', 'experienced'].some(w => expWord.includes(w))) {
      experienceLevel = 'advanced';
    }
    if (experienceLevel && experienceLevel !== existingMemory.experienceLevel) {
      updates.experienceLevel = experienceLevel;
      hasUpdates = true;
    }
  }

  // Extract goals
  const goalMatches = message.match(EXTRACTION_PATTERNS.goals);
  if (goalMatches) {
    const newGoals = [...new Set(goalMatches.map(g => g.toLowerCase()))];
    const combinedGoals = [...new Set([...existingMemory.skincareGoals, ...newGoals])];
    if (combinedGoals.length > existingMemory.skincareGoals.length) {
      updates.skincareGoals = combinedGoals;
      hasUpdates = true;
    }
  }

  return hasUpdates ? updates : null;
}

// ============================================================================
// MEMORY-DRIVEN PERSONALIZATION
// ============================================================================

/**
 * Generate personalization context for AI responses
 */
export function generatePersonalizationContext(memory: ConversationMemory): string {
  const parts: string[] = [];

  // Skin profile context
  if (memory.skinProfile.skinType) {
    parts.push(`User has ${memory.skinProfile.skinType} skin.`);
  }
  if (memory.skinProfile.concerns.length > 0) {
    parts.push(`Primary concerns: ${memory.skinProfile.concerns.join(', ')}.`);
  }
  if (memory.skinProfile.sensitivities.length > 0) {
    parts.push(`Known sensitivities: ${memory.skinProfile.sensitivities.join(', ')} - avoid these.`);
  }

  // Preferences
  const prefParts: string[] = [];
  if (memory.productPreferences.fragranceFree) prefParts.push('fragrance-free');
  if (memory.productPreferences.lightweight) prefParts.push('lightweight textures');
  if (memory.productPreferences.nonComedogenic) prefParts.push('non-comedogenic');
  if (prefParts.length > 0) {
    parts.push(`Product preferences: ${prefParts.join(', ')}.`);
  }

  // Budget and experience
  if (memory.budgetRange) {
    parts.push(`Budget preference: ${memory.budgetRange}.`);
  }
  if (memory.experienceLevel) {
    parts.push(`Experience level: ${memory.experienceLevel}.`);
  }

  // Ingredient preferences
  if (memory.ingredientPreferences.liked.length > 0) {
    parts.push(`Prefers products with: ${memory.ingredientPreferences.liked.join(', ')}.`);
  }
  if (memory.ingredientPreferences.disliked.length > 0) {
    parts.push(`Avoids ingredients: ${memory.ingredientPreferences.disliked.join(', ')}.`);
  }

  // Routine style
  if (memory.routinePreferences.style) {
    parts.push(`Routine preference: ${memory.routinePreferences.style}.`);
  }
  if (memory.routinePreferences.currentProducts.length > 0) {
    parts.push(`Currently using: ${memory.routinePreferences.currentProducts.slice(0, 5).join(', ')}.`);
  }

  // Goals
  if (memory.skincareGoals.length > 0) {
    parts.push(`Long-term goals: ${memory.skincareGoals.join(', ')}.`);
  }

  return parts.join(' ');
}

/**
 * Generate natural language memory reference for AI response
 */
export function generateMemoryReference(
  memory: ConversationMemory,
  context: 'recommendation' | 'ingredient' | 'routine' | 'general'
): string {
  const refs: string[] = [];

  switch (context) {
    case 'recommendation':
      if (memory.productPreferences.fragranceFree) {
        refs.push('Since you prefer fragrance-free products');
      }
      if (memory.skinProfile.sensitivities.length > 0) {
        refs.push(`Given your sensitivity to ${memory.skinProfile.sensitivities[0]}`);
      }
      if (memory.budgetRange === 'budget') {
        refs.push('Keeping your budget in mind');
      }
      break;

    case 'ingredient':
      if (memory.experienceLevel === 'beginner') {
        refs.push('As someone new to skincare');
      }
      if (memory.ingredientPreferences.sensitivities.length > 0) {
        refs.push(`Since you're sensitive to ${memory.ingredientPreferences.sensitivities[0]}`);
      }
      break;

    case 'routine':
      if (memory.routinePreferences.style === 'minimalist') {
        refs.push('For your minimalist routine preference');
      }
      if (memory.routinePreferences.currentProducts.length > 0) {
        refs.push('Based on the products you\'re currently using');
      }
      break;

    case 'general':
      if (memory.skinProfile.concerns.length > 0) {
        refs.push(`Since you've mentioned ${memory.skinProfile.concerns[0]} as a concern`);
      }
      break;
  }

  return refs.length > 0 ? refs[0] : '';
}

// ============================================================================
// STORAGE (localStorage-backed)
// ============================================================================

const MEMORY_STORAGE_KEY = 'curae_conversation_memory';

/**
 * Load memory from localStorage
 */
export function loadMemory(): ConversationMemory {
  try {
    const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ConversationMemory;
      // Increment session count
      parsed.metadata.sessionCount = (parsed.metadata.sessionCount || 0) + 1;
      parsed.metadata.lastUpdated = new Date().toISOString();
      return parsed;
    }
  } catch {
    console.warn('[ConversationMemory] Failed to load memory from storage');
  }
  return createEmptyMemory();
}

/**
 * Save memory to localStorage
 */
export function saveMemory(memory: ConversationMemory): void {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memory));
  } catch {
    console.warn('[ConversationMemory] Failed to save memory to storage');
  }
}

/**
 * Clear all stored memory
 */
export function clearStoredMemory(): void {
  try {
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  } catch {
    console.warn('[ConversationMemory] Failed to clear stored memory');
  }
}
