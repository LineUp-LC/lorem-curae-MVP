/**
 * Navigation, Linking & Page-Routing Intelligence for Lorem Curae AI
 *
 * Provides accurate, contextual navigation links for ingredients, products,
 * concerns, routines, and educational content. All links are grounded in
 * metadata and user intent.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Navigation target types
 */
export type NavigationTarget =
  | 'ingredient'
  | 'product_marketplace'
  | 'product_discovery'
  | 'concern'
  | 'learn'
  | 'routine'
  | 'category'
  | 'brand'
  | 'survey'
  | 'faq'
  | 'community'
  | 'my_skin'
  | 'marketplace'
  | 'discover';

/**
 * Product source type
 */
export type ProductSource = 'marketplace' | 'discovery';

/**
 * Generated navigation link
 */
export interface NavigationLink {
  target: NavigationTarget;
  url: string;
  label: string;
  context?: string;
  isValid: boolean;
}

/**
 * Navigation context from user intent
 */
export interface NavigationContext {
  primaryTarget?: NavigationTarget;
  entities: {
    ingredients: string[];
    concerns: string[];
    categories: string[];
    brands: string[];
    productIds: number[];
  };
  source?: ProductSource;
}

/**
 * Page link result
 */
export interface PageLink {
  url: string;
  label: string;
  description?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Valid ingredient slugs
 */
export const VALID_INGREDIENT_SLUGS: Record<string, string> = {
  'niacinamide': 'niacinamide',
  'retinol': 'retinol',
  'retinoid': 'retinol',
  'vitamin c': 'vitamin-c',
  'ascorbic acid': 'vitamin-c',
  'l-ascorbic acid': 'vitamin-c',
  'hyaluronic acid': 'hyaluronic-acid',
  'salicylic acid': 'salicylic-acid',
  'glycolic acid': 'glycolic-acid',
  'lactic acid': 'lactic-acid',
  'mandelic acid': 'mandelic-acid',
  'azelaic acid': 'azelaic-acid',
  'benzoyl peroxide': 'benzoyl-peroxide',
  'ceramides': 'ceramides',
  'ceramide': 'ceramides',
  'peptides': 'peptides',
  'peptide': 'peptides',
  'squalane': 'squalane',
  'centella asiatica': 'centella-asiatica',
  'cica': 'centella-asiatica',
  'zinc oxide': 'zinc-oxide',
  'titanium dioxide': 'titanium-dioxide',
  'vitamin e': 'vitamin-e',
  'tocopherol': 'vitamin-e',
  'ferulic acid': 'ferulic-acid',
  'bakuchiol': 'bakuchiol',
  'alpha arbutin': 'alpha-arbutin',
  'arbutin': 'alpha-arbutin',
  'tranexamic acid': 'tranexamic-acid',
  'kojic acid': 'kojic-acid',
  'aha': 'aha',
  'bha': 'bha',
  'pha': 'pha',
  'panthenol': 'panthenol',
  'allantoin': 'allantoin',
  'tea tree': 'tea-tree',
  'witch hazel': 'witch-hazel',
  'aloe vera': 'aloe-vera',
  'green tea': 'green-tea',
  'rosehip': 'rosehip',
  'jojoba': 'jojoba',
  'argan': 'argan',
  'marula': 'marula',
  'snail mucin': 'snail-mucin',
  'propolis': 'propolis',
  'honey': 'honey',
  'caffeine': 'caffeine',
  'zinc': 'zinc',
  'sulfur': 'sulfur',
  'urea': 'urea',
};

/**
 * Valid concern slugs
 */
export const VALID_CONCERN_SLUGS: Record<string, string> = {
  'acne': 'acne',
  'breakouts': 'acne',
  'pimples': 'acne',
  'blemishes': 'acne',
  'dark spots': 'dark-spots',
  'hyperpigmentation': 'hyperpigmentation',
  'melasma': 'hyperpigmentation',
  'sun spots': 'dark-spots',
  'age spots': 'dark-spots',
  'aging': 'aging',
  'anti-aging': 'aging',
  'wrinkles': 'wrinkles',
  'fine lines': 'fine-lines',
  'dryness': 'dryness',
  'dry skin': 'dryness',
  'dehydration': 'dehydration',
  'flaky skin': 'dryness',
  'oiliness': 'oiliness',
  'oily skin': 'oiliness',
  'excess oil': 'oiliness',
  'shine': 'oiliness',
  'sensitivity': 'sensitivity',
  'sensitive skin': 'sensitivity',
  'redness': 'redness',
  'irritation': 'sensitivity',
  'rosacea': 'rosacea',
  'pores': 'large-pores',
  'large pores': 'large-pores',
  'clogged pores': 'large-pores',
  'blackheads': 'blackheads',
  'whiteheads': 'acne',
  'dullness': 'dullness',
  'uneven tone': 'uneven-tone',
  'uneven skin tone': 'uneven-tone',
  'texture': 'texture',
  'rough texture': 'texture',
  'dark circles': 'dark-circles',
  'puffy eyes': 'puffy-eyes',
  'eye bags': 'puffy-eyes',
  'eczema': 'eczema',
  'psoriasis': 'psoriasis',
  'dermatitis': 'dermatitis',
  'barrier damage': 'barrier-damage',
  'compromised barrier': 'barrier-damage',
};

/**
 * Valid category slugs
 */
export const VALID_CATEGORY_SLUGS: Record<string, string> = {
  'cleanser': 'cleanser',
  'cleansers': 'cleanser',
  'face wash': 'cleanser',
  'wash': 'cleanser',
  'serum': 'serum',
  'serums': 'serum',
  'essence': 'essence',
  'ampoule': 'serum',
  'moisturizer': 'moisturizer',
  'moisturizers': 'moisturizer',
  'cream': 'moisturizer',
  'face cream': 'moisturizer',
  'lotion': 'moisturizer',
  'sunscreen': 'sunscreen',
  'sunscreens': 'sunscreen',
  'spf': 'sunscreen',
  'sun protection': 'sunscreen',
  'toner': 'toner',
  'toners': 'toner',
  'mask': 'mask',
  'masks': 'mask',
  'sheet mask': 'mask',
  'clay mask': 'mask',
  'treatment': 'treatment',
  'treatments': 'treatment',
  'spot treatment': 'treatment',
  'eye cream': 'eye-cream',
  'eye creams': 'eye-cream',
  'exfoliant': 'exfoliant',
  'exfoliator': 'exfoliant',
  'scrub': 'exfoliant',
  'peel': 'exfoliant',
  'oil': 'oil',
  'oils': 'oil',
  'face oil': 'oil',
  'facial oil': 'oil',
  'mist': 'mist',
  'setting spray': 'mist',
};

/**
 * Site navigation structure
 */
export const SITE_NAVIGATION = {
  ingredients: '/ingredients',
  marketplace: '/marketplace',
  discover: '/discover',
  routines: '/routines',
  survey: '/skin-survey',
  faq: '/faq',
  community: '/community',
  mySkin: '/my-skin',
  learn: '/learn',
} as const;

// ============================================================================
// SLUG GENERATION
// ============================================================================

/**
 * Generate a valid ingredient slug
 */
export function toIngredientSlug(ingredient: string): string | null {
  const normalized = ingredient.toLowerCase().trim();

  // Check if we have a valid mapping
  if (VALID_INGREDIENT_SLUGS[normalized]) {
    return VALID_INGREDIENT_SLUGS[normalized];
  }

  // Check partial matches
  for (const [key, slug] of Object.entries(VALID_INGREDIENT_SLUGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return slug;
    }
  }

  return null;
}

/**
 * Generate a valid concern slug
 */
export function toConcernSlug(concern: string): string | null {
  const normalized = concern.toLowerCase().trim();

  // Check if we have a valid mapping
  if (VALID_CONCERN_SLUGS[normalized]) {
    return VALID_CONCERN_SLUGS[normalized];
  }

  // Check partial matches
  for (const [key, slug] of Object.entries(VALID_CONCERN_SLUGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return slug;
    }
  }

  return null;
}

/**
 * Generate a valid category slug
 */
export function toCategorySlug(category: string): string | null {
  const normalized = category.toLowerCase().trim();

  // Check if we have a valid mapping
  if (VALID_CATEGORY_SLUGS[normalized]) {
    return VALID_CATEGORY_SLUGS[normalized];
  }

  // Check partial matches
  for (const [key, slug] of Object.entries(VALID_CATEGORY_SLUGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return slug;
    }
  }

  return null;
}

/**
 * Generate URL-safe slug from any string
 */
export function toUrlSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ============================================================================
// URL GENERATION
// ============================================================================

/**
 * Generate ingredient page URL
 */
export function getIngredientUrl(ingredient: string): PageLink | null {
  const slug = toIngredientSlug(ingredient);

  if (!slug) {
    return null;
  }

  return {
    url: `/ingredients/${slug}`,
    label: ingredient,
    description: `Learn about ${ingredient}`,
  };
}

/**
 * Generate product page URL
 */
export function getProductUrl(
  productId: number,
  source: ProductSource,
  productName?: string
): PageLink {
  const url = source === 'marketplace'
    ? `/marketplace/product/${productId}`
    : `/product-detail/${productId}`;

  return {
    url,
    label: productName || `Product #${productId}`,
    description: source === 'marketplace' ? 'View on Marketplace' : 'View product details',
  };
}

/**
 * Generate concern/learn page URL
 */
export function getConcernUrl(concern: string): PageLink | null {
  const slug = toConcernSlug(concern);

  if (!slug) {
    return null;
  }

  return {
    url: `/learn/${slug}`,
    label: concern,
    description: `Learn about ${concern}`,
  };
}

/**
 * Generate category browse URL
 */
export function getCategoryUrl(
  category: string,
  source: ProductSource = 'discover'
): PageLink | null {
  const slug = toCategorySlug(category);

  if (!slug) {
    return null;
  }

  const url = source === 'marketplace'
    ? `/marketplace?category=${slug}`
    : `/discover?category=${slug}`;

  return {
    url,
    label: `${category} products`,
    description: `Browse ${category} in ${source === 'marketplace' ? 'Marketplace' : 'Discover'}`,
  };
}

/**
 * Generate brand page URL
 */
export function getBrandUrl(brand: string): PageLink {
  const slug = toUrlSlug(brand);

  return {
    url: `/marketplace?brand=${slug}`,
    label: brand,
    description: `Products from ${brand}`,
  };
}

/**
 * Generate routine builder URL
 */
export function getRoutineUrl(): PageLink {
  return {
    url: '/routines',
    label: 'Routine Builder',
    description: 'Build your personalized skincare routine',
  };
}

/**
 * Generate survey URL
 */
export function getSurveyUrl(): PageLink {
  return {
    url: '/skin-survey',
    label: 'Skin Survey',
    description: 'Take or retake your skin assessment',
  };
}

/**
 * Generate FAQ URL
 */
export function getFaqUrl(): PageLink {
  return {
    url: '/faq',
    label: 'FAQ',
    description: 'Frequently asked questions',
  };
}

/**
 * Generate my-skin/progress URL
 */
export function getMySkinUrl(): PageLink {
  return {
    url: '/my-skin',
    label: 'My Skin',
    description: 'Track your skin progress',
  };
}

/**
 * Generate community URL
 */
export function getCommunityUrl(): PageLink {
  return {
    url: '/community',
    label: 'Community',
    description: 'See reviews and community content',
  };
}

// ============================================================================
// NAVIGATION DETECTION
// ============================================================================

/**
 * Detect navigation intent from user message
 */
export function detectNavigationFromMessage(message: string): NavigationContext {
  const lowerMessage = message.toLowerCase();
  const context: NavigationContext = {
    entities: {
      ingredients: [],
      concerns: [],
      categories: [],
      brands: [],
      productIds: [],
    },
  };

  // Detect ingredients
  for (const [key, slug] of Object.entries(VALID_INGREDIENT_SLUGS)) {
    if (lowerMessage.includes(key)) {
      if (!context.entities.ingredients.includes(slug)) {
        context.entities.ingredients.push(slug);
      }
    }
  }

  // Detect concerns
  for (const [key, slug] of Object.entries(VALID_CONCERN_SLUGS)) {
    if (lowerMessage.includes(key)) {
      if (!context.entities.concerns.includes(slug)) {
        context.entities.concerns.push(slug);
      }
    }
  }

  // Detect categories
  for (const [key, slug] of Object.entries(VALID_CATEGORY_SLUGS)) {
    if (lowerMessage.includes(key)) {
      if (!context.entities.categories.includes(slug)) {
        context.entities.categories.push(slug);
      }
    }
  }

  // Detect product IDs
  const productIdMatch = lowerMessage.match(/product\s*#?\s*(\d+)/i);
  if (productIdMatch) {
    context.entities.productIds.push(parseInt(productIdMatch[1], 10));
  }

  // Determine primary target
  if (lowerMessage.includes('routine') || lowerMessage.includes('build') || lowerMessage.includes('order')) {
    context.primaryTarget = 'routine';
  } else if (lowerMessage.includes('quiz') || lowerMessage.includes('survey') || lowerMessage.includes('profile')) {
    context.primaryTarget = 'survey';
  } else if (lowerMessage.includes('faq') || lowerMessage.includes('question') || lowerMessage.includes('policy')) {
    context.primaryTarget = 'faq';
  } else if (lowerMessage.includes('progress') || lowerMessage.includes('track') || lowerMessage.includes('diary')) {
    context.primaryTarget = 'my_skin';
  } else if (lowerMessage.includes('community') || lowerMessage.includes('review')) {
    context.primaryTarget = 'community';
  } else if (context.entities.ingredients.length > 0) {
    context.primaryTarget = 'ingredient';
  } else if (context.entities.concerns.length > 0) {
    context.primaryTarget = 'concern';
  } else if (context.entities.categories.length > 0) {
    context.primaryTarget = 'category';
  }

  // Detect source preference
  if (lowerMessage.includes('marketplace') || lowerMessage.includes('buy here')) {
    context.source = 'marketplace';
  } else if (lowerMessage.includes('discover') || lowerMessage.includes('explore')) {
    context.source = 'discovery';
  }

  return context;
}

// ============================================================================
// LINK GENERATION FOR RESPONSES
// ============================================================================

/**
 * Generate relevant links for a response based on context
 */
export function generateContextualLinks(
  context: NavigationContext,
  options?: {
    maxLinks?: number;
    includeRoutine?: boolean;
    includeSurvey?: boolean;
  }
): NavigationLink[] {
  const links: NavigationLink[] = [];
  const maxLinks = options?.maxLinks ?? 3;

  // Add ingredient links
  for (const slug of context.entities.ingredients.slice(0, 2)) {
    const originalName = Object.entries(VALID_INGREDIENT_SLUGS)
      .find(([, s]) => s === slug)?.[0] || slug;

    links.push({
      target: 'ingredient',
      url: `/ingredients/${slug}`,
      label: originalName,
      isValid: true,
    });
  }

  // Add concern links
  for (const slug of context.entities.concerns.slice(0, 2)) {
    const originalName = Object.entries(VALID_CONCERN_SLUGS)
      .find(([, s]) => s === slug)?.[0] || slug;

    links.push({
      target: 'concern',
      url: `/learn/${slug}`,
      label: originalName,
      isValid: true,
    });
  }

  // Add category links
  for (const slug of context.entities.categories.slice(0, 1)) {
    const source = context.source || 'discover';
    const url = source === 'marketplace'
      ? `/marketplace?category=${slug}`
      : `/discover?category=${slug}`;

    links.push({
      target: 'category',
      url,
      label: `Browse ${slug}`,
      isValid: true,
    });
  }

  // Add routine link if relevant
  if (options?.includeRoutine || context.primaryTarget === 'routine') {
    links.push({
      target: 'routine',
      url: '/routines',
      label: 'Routine Builder',
      isValid: true,
    });
  }

  // Add survey link if relevant
  if (options?.includeSurvey || context.primaryTarget === 'survey') {
    links.push({
      target: 'survey',
      url: '/skin-survey',
      label: 'Skin Survey',
      isValid: true,
    });
  }

  return links.slice(0, maxLinks);
}

/**
 * Generate product links for recommendations
 */
export function generateProductLinks(
  products: Array<{ id: number; name: string; brand?: string; source: ProductSource }>
): NavigationLink[] {
  return products.map(product => ({
    target: product.source === 'marketplace' ? 'product_marketplace' : 'product_discovery',
    url: product.source === 'marketplace'
      ? `/marketplace/product/${product.id}`
      : `/product-detail/${product.id}`,
    label: product.brand ? `${product.brand} ${product.name}` : product.name,
    isValid: true,
  }));
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format a single link for chat response
 */
export function formatLink(link: NavigationLink): string {
  return `[${link.label}](${link.url})`;
}

/**
 * Format multiple links for chat response
 */
export function formatLinks(links: NavigationLink[], separator: string = ' | '): string {
  return links.map(formatLink).join(separator);
}

/**
 * Format inline link suggestion
 */
export function formatInlineLink(link: PageLink): string {
  return `[${link.label}](${link.url})`;
}

/**
 * Format navigation suggestion at end of response (from link object)
 */
export function formatNavigationSuggestionFromLink(
  target: NavigationTarget,
  link: PageLink
): string {
  switch (target) {
    case 'ingredient':
      return `Learn more: ${formatInlineLink(link)}`;
    case 'concern':
    case 'learn':
      return `Learn more about this: ${formatInlineLink(link)}`;
    case 'product_marketplace':
      return `View product: ${formatInlineLink(link)}`;
    case 'product_discovery':
      return `Explore product: ${formatInlineLink(link)}`;
    case 'routine':
      return `Build your routine: ${formatInlineLink(link)}`;
    case 'survey':
      return `Update your profile: ${formatInlineLink(link)}`;
    case 'category':
      return `Browse products: ${formatInlineLink(link)}`;
    case 'faq':
      return `Find answers: ${formatInlineLink(link)}`;
    case 'my_skin':
      return `Track your progress: ${formatInlineLink(link)}`;
    case 'community':
      return `See reviews: ${formatInlineLink(link)}`;
    default:
      return formatInlineLink(link);
  }
}

/**
 * Format navigation for AI response context
 */
export function formatNavigationForAI(context: NavigationContext): string {
  const parts: string[] = [];

  if (context.entities.ingredients.length > 0) {
    parts.push(`Ingredients mentioned: ${context.entities.ingredients.join(', ')}`);
  }

  if (context.entities.concerns.length > 0) {
    parts.push(`Concerns mentioned: ${context.entities.concerns.join(', ')}`);
  }

  if (context.entities.categories.length > 0) {
    parts.push(`Categories mentioned: ${context.entities.categories.join(', ')}`);
  }

  if (context.primaryTarget) {
    parts.push(`Primary navigation target: ${context.primaryTarget}`);
  }

  return parts.join('\n');
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate if a URL is a valid internal route
 */
export function isValidInternalUrl(url: string): boolean {
  const validPrefixes = [
    '/ingredients',
    '/marketplace',
    '/discover',
    '/product-detail',
    '/routines',
    '/skin-survey',
    '/faq',
    '/community',
    '/my-skin',
    '/learn',
  ];

  return validPrefixes.some(prefix => url.startsWith(prefix));
}

/**
 * Validate ingredient slug exists
 */
export function isValidIngredientSlug(slug: string): boolean {
  return Object.values(VALID_INGREDIENT_SLUGS).includes(slug);
}

/**
 * Validate concern slug exists
 */
export function isValidConcernSlug(slug: string): boolean {
  return Object.values(VALID_CONCERN_SLUGS).includes(slug);
}

/**
 * Validate category slug exists
 */
export function isValidCategorySlug(slug: string): boolean {
  return Object.values(VALID_CATEGORY_SLUGS).includes(slug);
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

/**
 * Navigation intelligence principles
 */
export const NAVIGATION_PRINCIPLES = {
  accuracy: [
    'Always use validated slugs and IDs',
    'Never guess or fabricate URLs',
    'Only provide links that exist',
    'Match link type to content discussed',
  ],
  context: [
    'Link to ingredient page when discussing ingredients',
    'Link to product page when recommending products',
    'Link to learn page when discussing concerns',
    'Link to routine builder when discussing routines',
  ],
  placement: [
    'Keep links concise and relevant',
    'Place at end unless context requires otherwise',
    'Limit to 2-3 links per response',
    'Use inline format for single links',
  ],
  safety: [
    'Never link to external sites',
    'Never link to internal system paths',
    'Avoid broken or placeholder links',
    'Validate all generated URLs',
  ],
} as const;
