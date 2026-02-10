/**
 * Chat Retrieval Helper for Lorem Curae AI
 *
 * Provides async retrieval functions specifically designed
 * for use in the AI chat component.
 */

import {
  retrieveProducts,
  retrieveByCategory,
  retrieveRoutine,
  searchProducts,
  formatProductsForChat,
  initializeProductIngestion,
  type SkinSurvey,
  type RankedProduct,
  type RetrievalResult,
  type SourceIntent,
} from './index';

/**
 * Initialize the retrieval system
 * Call this on app/component mount
 */
export async function initializeRetrieval(): Promise<void> {
  await initializeProductIngestion();
}

/**
 * Get product recommendations based on user survey and query
 */
export async function getProductRecommendations(
  userProfile: {
    skinType?: string;
    concerns?: string[];
    sensitivities?: string[];
    goals?: string[];
    preferences?: {
      crueltyFree?: boolean;
      vegan?: boolean;
      fragranceFree?: boolean;
      budgetRange?: 'budget' | 'mid' | 'premium';
    };
  },
  options?: {
    category?: string;
    query?: string;
    limit?: number;
    sourceFilter?: SourceIntent;
  }
): Promise<{
  products: RankedProduct[];
  formatted: string;
  totalFound: number;
  sourceFilter?: SourceIntent;
}> {
  const survey: SkinSurvey = {
    skinType: userProfile.skinType,
    concerns: userProfile.concerns,
    sensitivities: userProfile.sensitivities,
    goals: userProfile.goals,
    preferences: userProfile.preferences,
  };

  const sourceFilter = options?.sourceFilter || 'all';

  // Use retrieveProducts with source filtering for all cases
  const result = await retrieveProducts(survey, {
    category: options?.category,
    limit: options?.limit || 4,
    naturalLanguageQuery: options?.query,
    sourceFilter,
  });

  // Format with source-aware messaging
  let formatted: string;
  if (result.products.length === 0 && sourceFilter !== 'all') {
    // No products found with source filter - provide graceful message
    const sourceName = sourceFilter === 'marketplace-only' ? 'Marketplace' : 'Discovery';
    const alternateName = sourceFilter === 'marketplace-only' ? 'Discovery' : 'Marketplace';
    formatted = `I didn't find ${sourceName} products that match your profile. Would you like me to show ${alternateName} options instead?`;
  } else {
    formatted = formatProductsForChat(result.products);
  }

  return {
    products: result.products,
    formatted,
    totalFound: result.totalCandidates,
    sourceFilter,
  };
}

/**
 * Get a complete skincare routine
 */
export async function getRoutineRecommendations(
  userProfile: {
    skinType?: string;
    concerns?: string[];
    sensitivities?: string[];
    preferences?: {
      crueltyFree?: boolean;
      vegan?: boolean;
      fragranceFree?: boolean;
      budgetRange?: 'budget' | 'mid' | 'premium';
    };
  }
): Promise<{
  routine: Record<string, RankedProduct[]>;
  formatted: string;
}> {
  const survey: SkinSurvey = {
    skinType: userProfile.skinType,
    concerns: userProfile.concerns,
    sensitivities: userProfile.sensitivities,
    preferences: userProfile.preferences,
  };

  const routine = await retrieveRoutine(survey);

  // Format the routine for chat
  let formatted = `Here's a personalized skincare routine for your ${userProfile.skinType || 'skin'} type:\n\n`;

  formatted += `**Morning Routine:**\n`;
  if (routine.cleanser?.[0]) {
    const p = routine.cleanser[0];
    formatted += `1. **Cleanse:** ${p.brand} ${p.name} ($${p.price.toFixed(2)})\n`;
    formatted += `   - ${p.matchReasons[0] || 'Great for your skin type'}\n`;
  }
  if (routine.serum?.[0]) {
    const p = routine.serum[0];
    formatted += `2. **Treat:** ${p.brand} ${p.name} ($${p.price.toFixed(2)})\n`;
    formatted += `   - ${p.matchReasons[0] || 'Targets your concerns'}\n`;
  }
  if (routine.moisturizer?.[0]) {
    const p = routine.moisturizer[0];
    formatted += `3. **Moisturize:** ${p.brand} ${p.name} ($${p.price.toFixed(2)})\n`;
    formatted += `   - ${p.matchReasons[0] || 'Hydrates and protects'}\n`;
  }
  if (routine.sunscreen?.[0]) {
    const p = routine.sunscreen[0];
    formatted += `4. **Protect:** ${p.brand} ${p.name} ($${p.price.toFixed(2)})\n`;
    formatted += `   - ${p.matchReasons[0] || 'Essential sun protection'}\n`;
  }

  formatted += `\n**Evening Routine:**\n`;
  formatted += `1. **Cleanse:** Same as morning\n`;
  if (routine.serum?.[1]) {
    const p = routine.serum[1];
    formatted += `2. **Treat:** ${p.brand} ${p.name} ($${p.price.toFixed(2)})\n`;
    formatted += `   - ${p.matchReasons[0] || 'Night treatment'}\n`;
  } else if (routine.serum?.[0]) {
    formatted += `2. **Treat:** Same serum or alternate with a night treatment\n`;
  }
  if (routine.moisturizer?.[0]) {
    formatted += `3. **Moisturize:** Same as morning (or a richer night cream)\n`;
  }

  formatted += `\nAll products available on the Lorem Curae Marketplace.`;

  if (userProfile.concerns?.length) {
    formatted += ` This routine specifically targets your ${userProfile.concerns.join(' and ')} concerns.`;
  }

  return { routine, formatted };
}

/**
 * Navigation intent types
 */
export type NavigationIntent =
  | { type: 'ingredient'; ingredient: string; url: string }
  | { type: 'concern'; concern: string; url: string }
  | { type: 'category'; category: string; source: 'marketplace' | 'discover'; url: string }
  | { type: 'routine'; url: string }
  | { type: 'faq'; url: string }
  | { type: 'survey'; url: string }
  | { type: 'brand'; brand: string; url: string }
  | { type: 'my-skin'; url: string }
  | { type: 'community'; url: string }
  | { type: 'none' };

/**
 * Known ingredients for navigation
 */
const KNOWN_INGREDIENTS = [
  'niacinamide', 'retinol', 'vitamin c', 'hyaluronic acid', 'salicylic acid',
  'glycolic acid', 'lactic acid', 'azelaic acid', 'benzoyl peroxide',
  'ceramides', 'peptides', 'squalane', 'centella asiatica', 'cica',
  'zinc oxide', 'titanium dioxide', 'vitamin e', 'ferulic acid',
  'bakuchiol', 'alpha arbutin', 'tranexamic acid', 'kojic acid',
  'mandelic acid', 'aha', 'bha', 'pha', 'panthenol', 'allantoin',
  'tea tree', 'witch hazel', 'aloe vera', 'green tea', 'rosehip',
  'jojoba', 'argan', 'marula', 'snail mucin', 'propolis', 'honey',
];

/**
 * Known skin concerns for navigation
 */
const KNOWN_CONCERNS = [
  'acne', 'breakouts', 'pimples', 'blemishes',
  'aging', 'anti-aging', 'wrinkles', 'fine lines',
  'dark spots', 'hyperpigmentation', 'melasma', 'sun spots',
  'dryness', 'dehydration', 'flaky skin',
  'oiliness', 'oily skin', 'sebum', 'shine',
  'sensitivity', 'sensitive skin', 'redness', 'irritation', 'rosacea',
  'pores', 'large pores', 'clogged pores', 'blackheads',
  'dullness', 'uneven tone', 'texture',
  'dark circles', 'puffy eyes', 'eye bags',
  'eczema', 'psoriasis', 'dermatitis',
];

/**
 * Known product categories for navigation
 */
const KNOWN_CATEGORIES = [
  'cleanser', 'cleansers', 'wash', 'cleansing',
  'serum', 'serums', 'essence', 'ampoule',
  'moisturizer', 'moisturizers', 'cream', 'lotion', 'gel',
  'sunscreen', 'sunscreens', 'spf', 'sun protection',
  'toner', 'toners', 'essence',
  'mask', 'masks', 'sheet mask', 'clay mask',
  'treatment', 'treatments', 'spot treatment',
  'eye cream', 'eye creams',
  'exfoliant', 'exfoliator', 'scrub', 'peel',
  'oil', 'oils', 'face oil',
];

/**
 * Detect navigation intent from user query
 */
export function detectNavigationIntent(query: string): NavigationIntent {
  const lowerQuery = query.toLowerCase();

  // FAQ intent patterns
  const faqPatterns = [
    'return policy', 'refund', 'shipping', 'delivery',
    'cancel order', 'track order', 'payment',
    'cruelty free', 'animal testing', 'vegan',
    'contact', 'customer service', 'support',
    'account', 'password', 'login',
  ];
  for (const pattern of faqPatterns) {
    if (lowerQuery.includes(pattern)) {
      return { type: 'faq', url: '/faq' };
    }
  }

  // Survey intent patterns
  const surveyPatterns = [
    'skin quiz', 'skin survey', 'retake quiz', 'redo quiz',
    'update profile', 'update my skin', 'change my skin type',
    'take the quiz', 'skin assessment', 'skin test',
  ];
  for (const pattern of surveyPatterns) {
    if (lowerQuery.includes(pattern)) {
      return { type: 'survey', url: '/skin-survey' };
    }
  }

  // Routine intent patterns
  const routinePatterns = [
    'build a routine', 'create a routine', 'routine builder',
    'order of products', 'application order', 'what order',
    'morning routine', 'evening routine', 'night routine',
    'skincare routine', 'daily routine', 'weekly routine',
  ];
  for (const pattern of routinePatterns) {
    if (lowerQuery.includes(pattern)) {
      return { type: 'routine', url: '/routines' };
    }
  }

  // My Skin / Progress intent
  const progressPatterns = [
    'my progress', 'skin progress', 'track my skin',
    'skin diary', 'skin journal', 'routine notes',
    'before and after', 'skin photos',
  ];
  for (const pattern of progressPatterns) {
    if (lowerQuery.includes(pattern)) {
      return { type: 'my-skin', url: '/my-skin' };
    }
  }

  // Community intent
  const communityPatterns = [
    'community', 'reviews', 'user reviews', 'what others think',
    'share my review', 'write a review', 'see reviews',
  ];
  for (const pattern of communityPatterns) {
    if (lowerQuery.includes(pattern)) {
      return { type: 'community', url: '/community' };
    }
  }

  // Ingredient intent - check for known ingredients
  for (const ingredient of KNOWN_INGREDIENTS) {
    const patterns = [
      `what is ${ingredient}`,
      `what does ${ingredient}`,
      `tell me about ${ingredient}`,
      `${ingredient} benefits`,
      `${ingredient} for`,
      `is ${ingredient}`,
      `about ${ingredient}`,
      `learn about ${ingredient}`,
      `${ingredient} good for`,
      `${ingredient} help with`,
    ];
    for (const pattern of patterns) {
      if (lowerQuery.includes(pattern) || lowerQuery === ingredient) {
        const urlSlug = ingredient.replace(/\s+/g, '-');
        return { type: 'ingredient', ingredient, url: `/ingredients` };
      }
    }
    // Also check if the query is primarily about an ingredient
    if (lowerQuery.includes(ingredient) &&
        (lowerQuery.includes('what') || lowerQuery.includes('how') ||
         lowerQuery.includes('tell') || lowerQuery.includes('learn') ||
         lowerQuery.includes('explain') || lowerQuery.includes('about'))) {
      return { type: 'ingredient', ingredient, url: `/ingredients` };
    }
  }

  // Concern intent - check for skin concerns
  for (const concern of KNOWN_CONCERNS) {
    const patterns = [
      `how to treat ${concern}`,
      `help with ${concern}`,
      `${concern} treatment`,
      `what helps ${concern}`,
      `fix ${concern}`,
      `reduce ${concern}`,
      `get rid of ${concern}`,
      `dealing with ${concern}`,
      `struggling with ${concern}`,
    ];
    for (const pattern of patterns) {
      if (lowerQuery.includes(pattern)) {
        const urlSlug = concern.replace(/\s+/g, '-');
        return { type: 'concern', concern, url: `/discover?concern=${urlSlug}` };
      }
    }
  }

  // Brand intent
  const brandPatterns = lowerQuery.match(
    /(?:show me|products from|by|from brand|brand)\s+([a-z\s]+?)(?:\s+products|\s*$)/i
  );
  if (brandPatterns) {
    const brand = brandPatterns[1].trim();
    const urlSlug = brand.replace(/\s+/g, '-').toLowerCase();
    return { type: 'brand', brand, url: `/marketplace?brand=${urlSlug}` };
  }

  // Category intent - check for product categories
  for (const category of KNOWN_CATEGORIES) {
    const patterns = [
      `show me ${category}`,
      `best ${category}`,
      `recommend ${category}`,
      `need a ${category}`,
      `looking for ${category}`,
      `find ${category}`,
      `browse ${category}`,
    ];
    for (const pattern of patterns) {
      if (lowerQuery.includes(pattern)) {
        const normalizedCategory = normalizeCategory(category);
        // Default to discover, but can be overridden by source intent
        return {
          type: 'category',
          category: normalizedCategory,
          source: 'discover',
          url: `/discover?category=${normalizedCategory}`
        };
      }
    }
  }

  return { type: 'none' };
}

/**
 * Normalize category names to URL-friendly format
 */
function normalizeCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'cleanser': 'cleanser', 'cleansers': 'cleanser', 'wash': 'cleanser', 'cleansing': 'cleanser',
    'serum': 'serum', 'serums': 'serum', 'essence': 'serum', 'ampoule': 'serum',
    'moisturizer': 'moisturizer', 'moisturizers': 'moisturizer', 'cream': 'moisturizer',
    'lotion': 'moisturizer', 'gel': 'moisturizer',
    'sunscreen': 'sunscreen', 'sunscreens': 'sunscreen', 'spf': 'sunscreen', 'sun protection': 'sunscreen',
    'toner': 'toner', 'toners': 'toner',
    'mask': 'mask', 'masks': 'mask', 'sheet mask': 'mask', 'clay mask': 'mask',
    'treatment': 'treatment', 'treatments': 'treatment', 'spot treatment': 'treatment',
    'eye cream': 'eye-cream', 'eye creams': 'eye-cream',
    'exfoliant': 'exfoliant', 'exfoliator': 'exfoliant', 'scrub': 'exfoliant', 'peel': 'exfoliant',
    'oil': 'oil', 'oils': 'oil', 'face oil': 'oil',
  };
  return categoryMap[category.toLowerCase()] || category.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Format navigation suggestion for chat response
 */
export function formatNavigationSuggestion(nav: NavigationIntent): string | null {
  if (nav.type === 'none') return null;

  switch (nav.type) {
    case 'ingredient':
      return `You can learn more about ${nav.ingredient} on our [Ingredients page](${nav.url}).`;
    case 'concern':
      return `Explore products for ${nav.concern} in our [Discover section](${nav.url}).`;
    case 'category':
      return `Browse our ${nav.category} collection in [${nav.source === 'marketplace' ? 'Marketplace' : 'Discover'}](${nav.url}).`;
    case 'routine':
      return `Build your personalized routine with our [Routine Builder](${nav.url}).`;
    case 'faq':
      return `Find answers to your questions in our [FAQ](${nav.url}).`;
    case 'survey':
      return `Update your skin profile by taking our [Skin Survey](${nav.url}).`;
    case 'brand':
      return `Explore products from ${nav.brand} in our [Marketplace](${nav.url}).`;
    case 'my-skin':
      return `Track your skin progress on your [My Skin page](${nav.url}).`;
    case 'community':
      return `See what others are saying in our [Community](${nav.url}).`;
    default:
      return null;
  }
}

/**
 * Detect source intent from query
 */
export function detectSourceIntent(query: string): SourceIntent {
  const lowerQuery = query.toLowerCase();

  // Marketplace-only patterns
  const marketplacePatterns = [
    'marketplace only',
    'only marketplace',
    'marketplace products',
    'marketplace items',
    'show marketplace',
    'from marketplace',
    'on marketplace',
    'products i can buy here',
    'buy here',
    'purchase here',
    'available here',
    'in stock here',
  ];

  for (const pattern of marketplacePatterns) {
    if (lowerQuery.includes(pattern)) {
      return 'marketplace-only';
    }
  }

  // Discovery-only patterns
  const discoveryPatterns = [
    'discovery only',
    'only discovery',
    'discovery products',
    'discovery items',
    'show discovery',
    'from discovery',
    'research products',
    'explore products',
    'external products',
  ];

  for (const pattern of discoveryPatterns) {
    if (lowerQuery.includes(pattern)) {
      return 'discovery-only';
    }
  }

  return 'all';
}

/**
 * Detect query intent and extract parameters
 */
export function parseUserQuery(query: string): {
  intent: 'product' | 'routine' | 'ingredient' | 'general';
  category?: string;
  ingredient?: string;
  sourceIntent: SourceIntent;
} {
  const lowerQuery = query.toLowerCase();
  const sourceIntent = detectSourceIntent(query);

  // Detect routine intent
  if (
    lowerQuery.includes('routine') ||
    lowerQuery.includes('regimen') ||
    lowerQuery.includes('morning') ||
    lowerQuery.includes('evening') ||
    lowerQuery.includes('night')
  ) {
    return { intent: 'routine', sourceIntent };
  }

  // Detect category
  let category: string | undefined;
  if (lowerQuery.includes('cleanser') || lowerQuery.includes('wash') || lowerQuery.includes('cleanse')) {
    category = 'cleanser';
  } else if (lowerQuery.includes('serum')) {
    category = 'serum';
  } else if (lowerQuery.includes('moisturizer') || lowerQuery.includes('cream') || lowerQuery.includes('lotion')) {
    category = 'moisturizer';
  } else if (lowerQuery.includes('sunscreen') || lowerQuery.includes('spf') || lowerQuery.includes('sun protection')) {
    category = 'sunscreen';
  } else if (lowerQuery.includes('mask')) {
    category = 'mask';
  } else if (lowerQuery.includes('treatment') || lowerQuery.includes('spot')) {
    category = 'treatment';
  } else if (lowerQuery.includes('toner')) {
    category = 'toner';
  }

  // Detect ingredient search
  const ingredientMatch = lowerQuery.match(
    /(?:with|contain|has|using|find.*with)\s+([a-z]+(?:\s+[a-z]+)?)/i
  );
  if (ingredientMatch) {
    return { intent: 'ingredient', ingredient: ingredientMatch[1], sourceIntent };
  }

  // Check for product recommendation intent
  if (
    lowerQuery.includes('recommend') ||
    lowerQuery.includes('suggest') ||
    lowerQuery.includes('product') ||
    lowerQuery.includes('what should') ||
    lowerQuery.includes('best') ||
    category
  ) {
    return { intent: 'product', category, sourceIntent };
  }

  return { intent: 'general', sourceIntent };
}

/**
 * Generate a complete AI response with product retrieval
 */
export async function generateRetrievalResponse(
  userQuery: string,
  userProfile: {
    skinType?: string;
    concerns?: string[];
    sensitivities?: string[];
    goals?: string[];
    preferences?: {
      crueltyFree?: boolean;
      vegan?: boolean;
      fragranceFree?: boolean;
      budgetRange?: 'budget' | 'mid' | 'premium';
    };
  }
): Promise<string> {
  // Initialize retrieval system
  await initializeRetrieval();

  // Parse the query (includes sourceIntent detection)
  const { intent, category, ingredient, sourceIntent } = parseUserQuery(userQuery);

  // Build source context for intro messages
  const sourceContext = sourceIntent === 'marketplace-only'
    ? ' from the Marketplace'
    : sourceIntent === 'discovery-only'
      ? ' from Discovery'
      : '';

  // Generate response based on intent
  switch (intent) {
    case 'routine': {
      const { formatted } = await getRoutineRecommendations(userProfile);
      return formatted;
    }

    case 'ingredient': {
      const { formatted } = await getProductRecommendations(userProfile, {
        query: ingredient || userQuery,
        limit: 3,
        sourceFilter: sourceIntent,
      });
      return `Here are products${sourceContext} ${ingredient ? `containing ${ingredient}` : 'matching your search'} for your skin profile:\n\n${formatted}`;
    }

    case 'product': {
      const { formatted } = await getProductRecommendations(userProfile, {
        category,
        query: !category ? userQuery : undefined,
        limit: 3,
        sourceFilter: sourceIntent,
      });

      const intro = category
        ? `Based on your ${userProfile.skinType || 'skin'} profile, here are my top ${category} recommendations${sourceContext}:`
        : `Here are personalized product recommendations${sourceContext} for you:`;

      return `${intro}\n\n${formatted}`;
    }

    default: {
      // General query - provide some recommendations
      const { formatted } = await getProductRecommendations(userProfile, {
        limit: 3,
        sourceFilter: sourceIntent,
      });
      return `I'm here to help with your skincare journey. Based on your profile, here are some products${sourceContext} you might like:\n\n${formatted}\n\nFeel free to ask about specific products, ingredients, or routines.`;
    }
  }
}
