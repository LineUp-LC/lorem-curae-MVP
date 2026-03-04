/**
 * Seasonal Modal Content Generator
 *
 * Pure utility that assembles all data needed by the EnvironmentFitModal.
 * No React — just transforms existing data sources into a structured shape.
 *
 * Produces:
 *  - Environmental factor badges + skin impact explanation (Section 1)
 *  - Connected product-fit narrative referencing user profile (Section 2)
 *  - Keyword insights with review-based insight text (Section 3)
 *  - Category/texture phrases + disclaimer (Section 4)
 */

import type { Product } from '../../types/product';
import type { EnvironmentContext } from '../environment/context';
import type { ConditionKey, IngredientClass } from '../environment/productKnowledge';
import type { ScoredReviewEntry } from './environmentFit';
import { classifyIngredients } from './environmentFit';
import { deriveConditions, getMechanismPhrase, getCategoryPhrase, getTexturePhrase } from '../environment/productKnowledge';
import { inferTexture } from '../environment/inferTexture';
import { matchesConcern } from './matching';
import { COMPLEXION_TIERS } from './reviewSimilarity';
import { getCategoryLabel } from './categoryRegistry';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EnvironmentalFactor {
  label: string;
  value: string;
  icon: string;
}

export interface SeasonalHeader {
  icon: string;
  seasonLabel: string;
  locationLabel: string;
  sourceNote: string;
  environmentalFactors: EnvironmentalFactor[];
  skinImpact: string | null;
}

export interface ProductFitNarrative {
  narrative: string;
  referencedIngredients: string[];
}

export interface KeywordInsight {
  label: string;
  insight: string;
  count: number;
  matchingReviewIds: number[];
}

export interface UserProfileForModal {
  skinType?: string;
  concerns?: string[];
  sensitivity?: string;
  complexion?: string;
  lifestyle?: string[];
  preferences?: Record<string, boolean>;
}

export interface SeasonalModalContent {
  header: SeasonalHeader;
  productFit: ProductFitNarrative;
  keywordInsights: KeywordInsight[];
  categoryPhrase: string | null;
  texturePhrase: string | null;
  disclaimer: string;
  personalized: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEASON_ICONS: Record<string, string> = {
  spring: 'ri-seedling-line',
  summer: 'ri-sun-line',
  autumn: 'ri-leaf-line',
  winter: 'ri-snowy-line',
};

/** How each environmental condition affects skin, in plain language. */
const SKIN_IMPACT: Partial<Record<ConditionKey, string>> = {
  high_uv: 'Strong sun can make your skin more vulnerable to damage, and dark spots may become easier to trigger.',
  low_uv:  'With lower UV right now, it\'s a good time to use products with stronger actives, though sunscreen is still a good idea.',
  humid:   'Humid weather can make skin feel oily or congested, but the moisture in the air does help keep it hydrated on the surface.',
  dry_air: 'Dry air pulls moisture from your skin, which can leave it feeling tight, rough, or easily irritated.',
  hot:     'Heat can make skin feel oily and sweaty, and some products may not stay put as long.',
  cold:    'Cold air can make skin feel tight and dry, especially when wind is a factor.',
};

/** Keywords used for review filtering — user-friendly labels that still match review text. */
const CLASS_KEYWORDS: Partial<Record<IngredientClass, string>> = {
  humectant: 'hydration',
  barrier: 'moisture barrier',
  soothing: 'redness',
  supportive: 'antioxidant',
  sensitizing: 'actives',
  protective: 'sun protection',
  emollient: 'moisture',
  occlusive: 'moisture',
  peptide: 'firmness',
};

const CLASS_PRIORITY: IngredientClass[] = [
  'protective', 'supportive', 'sensitizing',
  'humectant', 'barrier', 'soothing',
  'emollient', 'occlusive', 'peptide',
];

/** Generic plain-language benefit per ingredient class. */
const CLASS_BENEFIT: Record<IngredientClass, string> = {
  humectant:   'helps hold onto moisture so your skin stays comfortable',
  barrier:     'supports your skin\'s natural moisture barrier',
  soothing:    'helps calm irritation and keep skin comfortable',
  supportive:  'helps protect your skin from everyday environmental stress',
  sensitizing: 'has stronger actives — so wearing sunscreen during the day is important',
  protective:  'includes ingredients that help shield your skin from the sun',
  emollient:   'helps soften and smooth your skin',
  occlusive:   'helps seal in moisture so it doesn\'t escape',
  peptide:     'supports your skin\'s natural ability to stay firm and bounce back',
};

/** Condition-specific overrides when the generic benefit isn't specific enough. */
const CLASS_CONDITION_OVERRIDE: Partial<Record<IngredientClass, Partial<Record<ConditionKey, string>>>> = {
  humectant: {
    humid:   'helps keep skin hydrated without feeling heavy in the humidity',
    dry_air: 'helps hold onto moisture so your skin doesn\'t feel tight or parched',
    cold:    'helps attract and hold moisture even when cold air is pulling it away',
  },
  barrier: {
    cold:    'helps protect the moisture barrier that cold weather tends to weaken',
    dry_air: 'strengthens your skin\'s natural barrier, which dry air can wear down',
  },
  occlusive: {
    humid:   'seals in moisture without feeling too heavy for humid weather',
    dry_air: 'locks in moisture so dry air can\'t pull it out as easily',
  },
  sensitizing: {
    high_uv: 'contains stronger actives that can make skin more sun-sensitive — sunscreen during the day is especially important right now',
    low_uv:  'works well when UV is lower, but sunscreen is still a good idea',
  },
  protective: {
    high_uv: 'helps shield your skin from the sun, which is especially important with current UV levels',
  },
  supportive: {
    high_uv: 'helps protect your skin from the extra sun stress right now',
  },
  soothing: {
    cold:    'helps calm the irritation that cold, dry air can cause',
    hot:     'helps keep skin calm when heat makes it more reactive',
  },
};

/** Pick the best plain-language benefit for a class + conditions combo. */
function getPlainBenefit(cls: IngredientClass, conditions: ConditionKey[]): string {
  const overrides = CLASS_CONDITION_OVERRIDE[cls];
  if (overrides) {
    for (const cond of conditions) {
      if (overrides[cond]) return overrides[cond]!;
    }
  }
  return CLASS_BENEFIT[cls];
}

/** Short environment-problem phrases, keyed by condition. */
const CONDITION_PROBLEM: Partial<Record<ConditionKey, string>> = {
  high_uv: 'Strong sun can take a toll on your skin',
  low_uv:  'Even with lower UV right now, your skin still needs support',
  humid:   'Humid weather can leave skin feeling heavy or oily',
  dry_air: 'Dry air pulls moisture from your skin, which can leave it feeling tight',
  hot:     'Heat can make your skin feel oily and uncomfortable',
  cold:    'Cold air can make your skin feel tight and dry',
};

/** Condition-specific lifestyle sentences — only fire when relevant to the environment. */
const LIFESTYLE_SENTENCES: Record<string, Partial<Record<ConditionKey, string>>> = {
  'Active lifestyle': {
    hot:     'With an active lifestyle in the heat, products that absorb quickly and stay put through movement work best.',
    humid:   'Staying active in humid conditions means this lightweight texture can keep up without feeling heavy.',
  },
  'Outdoor work environment': {
    high_uv: 'Working outdoors with strong UV means extra protection is worth prioritizing.',
    cold:    'Being outdoors in the cold means your skin faces more wind and dryness throughout the day.',
  },
  'Indoor work environment': {
    dry_air: 'Indoor environments with dry, recirculated air can pull moisture from your skin throughout the day.',
  },
  'Sun exposure daily': {
    high_uv: 'With daily sun exposure and current UV levels, consistent protection is especially relevant.',
  },
};

/** Generic lifestyle fallbacks when no condition-specific match exists. */
const LIFESTYLE_GENERIC: Record<string, string> = {
  'High stress levels':      'Stress can make skin more reactive, so products that help keep it calm matter.',
  'Screen time heavy':       'Extended screen time can contribute to skin fatigue, so supportive products help.',
  'Frequent travel':         'Frequent travel means your skin encounters changing conditions, so adaptable products are a good fit.',
  'Frequently wears makeup': 'Since you wear makeup regularly, products that layer well underneath are important.',
};

/** Map preference keys to readable labels. */
const PREFERENCE_LABELS: Record<string, string> = {
  fragranceFree: 'fragrance-free',
  crueltyFree: 'cruelty-free',
  vegan: 'vegan',
  organic: 'organic',
  plantBased: 'plant-based',
  glutenFree: 'gluten-free',
  alcoholFree: 'alcohol-free',
  siliconeFree: 'silicone-free',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function reviewMatchesKeyword(content: string, keyword: string): boolean {
  return content.toLowerCase().includes(keyword.toLowerCase());
}

/** Join array with commas and "and" for the last item. */
function listJoin(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/** Map IngredientClass key to MatchedIngredients property name. */
function getMatchedNames(matched: ReturnType<typeof classifyIngredients>, cls: IngredientClass): string[] {
  switch (cls) {
    case 'humectant': return matched.humectants;
    default: return matched[cls];
  }
}

/** Get active ingredient classes with their matched names and mechanism phrases. */
function getActiveClasses(
  matched: ReturnType<typeof classifyIngredients>,
  conditions: ConditionKey[],
): { cls: IngredientClass; names: string[]; phrase: string }[] {
  const result: { cls: IngredientClass; names: string[]; phrase: string }[] = [];
  for (const cls of CLASS_PRIORITY) {
    const names = getMatchedNames(matched, cls);
    if (names.length === 0) continue;
    const phrase = getMechanismPhrase(cls, conditions);
    if (!phrase) continue;
    result.push({ cls, names, phrase });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Environmental Factors (Section 1)
// ---------------------------------------------------------------------------

function deriveEnvironmentalFactors(conditions: ConditionKey[], env: EnvironmentContext): EnvironmentalFactor[] {
  const factors: EnvironmentalFactor[] = [];

  // UV exposure
  if (env.uvBand) {
    const uvLabels: Record<string, string> = {
      low: 'Low',
      moderate: 'Moderate',
      high: 'High',
      very_high: 'Very High',
      extreme: 'Extreme',
    };
    factors.push({
      label: 'UV Exposure',
      value: uvLabels[env.uvBand] || capitalize(env.uvBand.replace(/_/g, ' ')),
      icon: env.uvBand === 'low' ? 'ri-sun-cloudy-line' : 'ri-sun-line',
    });
  }

  // Humidity
  if (conditions.includes('humid')) {
    factors.push({ label: 'Humidity', value: 'High', icon: 'ri-water-percent-line' });
  } else if (conditions.includes('dry_air')) {
    factors.push({ label: 'Humidity', value: 'Low', icon: 'ri-water-percent-line' });
  }

  // Temperature
  if (conditions.includes('hot')) {
    factors.push({ label: 'Temperature', value: 'Warm to Hot', icon: 'ri-temp-hot-line' });
  } else if (conditions.includes('cold')) {
    factors.push({ label: 'Temperature', value: 'Cold', icon: 'ri-temp-cold-line' });
  } else if (conditions.includes('transitional')) {
    factors.push({ label: 'Temperature', value: 'Variable', icon: 'ri-temp-cold-line' });
  }

  // Dryness risk (composite)
  if (conditions.includes('dry_air') || conditions.includes('cold')) {
    factors.push({
      label: 'Dryness Risk',
      value: conditions.includes('dry_air') && conditions.includes('cold') ? 'Elevated' : 'Moderate',
      icon: 'ri-drop-line',
    });
  }

  return factors;
}

function buildSkinImpact(conditions: ConditionKey[]): string | null {
  const priorityOrder: ConditionKey[] = ['high_uv', 'low_uv', 'humid', 'dry_air', 'hot', 'cold'];
  const matched = priorityOrder.filter(k => conditions.includes(k) && SKIN_IMPACT[k]);
  if (matched.length === 0) return null;
  return matched.slice(0, 2).map(k => SKIN_IMPACT[k]!).join(' ');
}

// ---------------------------------------------------------------------------
// Product-Fit Narrative (Section 2)
// ---------------------------------------------------------------------------

interface NarrativeContext {
  product: Product;
  env: EnvironmentContext;
  conditions: ConditionKey[];
  matched: ReturnType<typeof classifyIngredients>;
  userSkinType?: string;
  userConcerns?: string[];
  userSensitivity?: string;
  userComplexion?: string;
  userLifestyle?: string[];
  userPreferences?: Record<string, boolean>;
}

function buildProductFitNarrative(ctx: NarrativeContext): ProductFitNarrative {
  const sentences: string[] = [];
  const { product, env, conditions, matched, userSkinType, userConcerns, userSensitivity, userComplexion, userLifestyle, userPreferences } = ctx;

  const activeClasses = getActiveClasses(matched, conditions);
  const categoryLabel = getCategoryLabel(product.category).toLowerCase();
  const season = env.season ? capitalize(env.season).toLowerCase() : null;
  const loc = env.location?.city
    ? [env.location.city, env.location.region].filter(Boolean).join(', ')
    : null;

  // Build environment fragment for skin-type intro
  const envFragment = season && loc
    ? `${season} in ${loc}`
    : season
      ? `${season} weather`
      : 'current conditions';

  // --- Sentence 1: Environment problem + primary product benefit ---
  const firstCondition = conditions[0];
  const conditionProblem = firstCondition ? CONDITION_PROBLEM[firstCondition] : null;

  if (conditionProblem && activeClasses.length >= 1) {
    const benefit = getPlainBenefit(activeClasses[0].cls, conditions);
    if (userSkinType) {
      sentences.push(
        `${conditionProblem}. For ${userSkinType} skin in ${envFragment}, this ${categoryLabel} ${benefit}.`
      );
    } else {
      sentences.push(
        `${conditionProblem}. This ${categoryLabel} ${benefit}.`
      );
    }
  } else if (activeClasses.length >= 1) {
    const benefit = getPlainBenefit(activeClasses[0].cls, conditions);
    sentences.push(
      `This ${categoryLabel} ${benefit}.`
    );
  } else {
    sentences.push(
      `This ${categoryLabel} is designed to support your skin through ${envFragment}.`
    );
  }

  // --- Sentence 2: Secondary benefit or texture note ---
  if (activeClasses.length >= 2) {
    const benefit2 = getPlainBenefit(activeClasses[1].cls, conditions);
    sentences.push(`It also ${benefit2}.`);
  } else {
    const texture = inferTexture(product);
    const texPhrase = getTexturePhrase(texture, conditions);
    const catPhrase = getCategoryPhrase(product.category, conditions);
    if (texPhrase) {
      sentences.push(capitalize(texPhrase) + '.');
    } else if (catPhrase) {
      sentences.push(capitalize(catPhrase) + '.');
    }
  }

  // --- Sentence 3 (conditional): Concern alignment ---
  if (userConcerns && userConcerns.length > 0) {
    const productConcerns = (product.concerns || []);
    const overlap = productConcerns.filter(pc =>
      userConcerns.some(uc => matchesConcern(pc, [uc]))
    );
    if (overlap.length > 0) {
      sentences.push(
        `It also targets ${listJoin(overlap)}, which matches what your skin needs right now.`
      );
    }
  }

  // --- Sentence 4 (conditional): Sensitivity or complexion consideration ---
  if (userSensitivity === 'high' && matched.sensitizing.length > 0) {
    sentences.push(
      'Since your skin tends to be sensitive, it\'s worth easing into this product and always wearing sunscreen during the day.'
    );
  } else if (userComplexion && conditions.includes('high_uv')) {
    const fitzIndex = COMPLEXION_TIERS.findIndex(t => t.toLowerCase() === userComplexion.toLowerCase());
    if (fitzIndex >= 0 && fitzIndex <= 1) {
      sentences.push(
        'Fair skin is especially vulnerable to sun damage right now, so sunscreen is a must alongside this product.'
      );
    } else if (fitzIndex >= 4) {
      sentences.push(
        'Even with naturally more resilient skin, sunscreen is still important for keeping your tone even in strong sun.'
      );
    }
  }

  // --- Sentence 5 (conditional): Lifestyle consideration ---
  if (userLifestyle && userLifestyle.length > 0) {
    for (const factor of userLifestyle) {
      const condMap = LIFESTYLE_SENTENCES[factor];
      if (condMap) {
        const match = conditions.find(c => condMap[c]);
        if (match) {
          sentences.push(condMap[match]!);
          break;
        }
      }
      const generic = LIFESTYLE_GENERIC[factor];
      if (generic) {
        sentences.push(generic);
        break;
      }
    }
  }

  // --- Sentence 6 (conditional): Preference reminder ---
  if (userPreferences) {
    const readable = Object.entries(userPreferences)
      .filter(([, v]) => v)
      .map(([k]) => PREFERENCE_LABELS[k])
      .filter(Boolean)
      .slice(0, 2);
    if (readable.length > 0) {
      sentences.push(
        `You've noted a preference for ${listJoin(readable)} products — check the label to confirm this one meets that standard.`
      );
    }
  }

  return {
    narrative: sentences.slice(0, 6).join(' '),
    referencedIngredients: [],
  };
}

// ---------------------------------------------------------------------------
// Keyword Insights (Section 3)
// ---------------------------------------------------------------------------

function buildInsightText(label: string, matchingReviews: ScoredReviewEntry[]): string {
  const count = matchingReviews.length;
  const avgRating = matchingReviews.reduce((sum, r) => sum + r.review.rating, 0) / count;
  const hasSimilar = matchingReviews.some(r => r.matchTier === 'full' || r.matchTier === 'strong');

  if (hasSimilar && avgRating >= 4.0) {
    return `People with similar skin said they noticed a difference with ${label} after a few weeks of use.`;
  } else if (avgRating >= 4.0) {
    return `Reviewers who mentioned ${label} rated the product ${avgRating.toFixed(1)} stars on average.`;
  } else if (avgRating >= 3.0) {
    return `Reviewers had mixed but mostly positive experiences with ${label}.`;
  }
  return `Results varied for ${label} — some people saw a difference, others less so.`;
}

function generateKeywordInsights(
  reviews: ScoredReviewEntry[],
  matched: ReturnType<typeof classifyIngredients>,
  product: Product,
  userSkinType?: string,
): KeywordInsight[] {
  if (reviews.length === 0) return [];

  const insights: KeywordInsight[] = [];
  const usedLabels = new Set<string>();

  // 1. From ingredient classes
  for (const cls of CLASS_PRIORITY) {
    const names = getMatchedNames(matched, cls);
    if (names.length === 0) continue;
    const kw = CLASS_KEYWORDS[cls];
    if (!kw || usedLabels.has(kw)) continue;

    const matchingReviews = reviews.filter(r => reviewMatchesKeyword(r.review.content, kw));
    if (matchingReviews.length === 0) continue;

    usedLabels.add(kw);
    insights.push({
      label: kw,
      insight: buildInsightText(kw, matchingReviews),
      count: matchingReviews.length,
      matchingReviewIds: matchingReviews.map(r => r.review.id),
    });
  }

  // 2. From product concerns
  for (const concern of product.concerns || []) {
    const label = concern.toLowerCase();
    if (usedLabels.has(label)) continue;

    const matchingReviews = reviews.filter(r => reviewMatchesKeyword(r.review.content, label));
    if (matchingReviews.length === 0) continue;

    usedLabels.add(label);
    insights.push({
      label,
      insight: buildInsightText(label, matchingReviews),
      count: matchingReviews.length,
      matchingReviewIds: matchingReviews.map(r => r.review.id),
    });
  }

  // 3. From user skin type
  if (userSkinType) {
    const label = `${userSkinType} skin`;
    if (!usedLabels.has(label)) {
      const matchingReviews = reviews.filter(r =>
        r.review.skinType.toLowerCase() === userSkinType.toLowerCase()
        || reviewMatchesKeyword(r.review.content, userSkinType)
      );
      if (matchingReviews.length > 0) {
        usedLabels.add(label);
        insights.push({
          label,
          insight: buildInsightText(label, matchingReviews),
          count: matchingReviews.length,
          matchingReviewIds: matchingReviews.map(r => r.review.id),
        });
      }
    }
  }

  return insights
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateSeasonalModalContent(
  product: Product,
  env: EnvironmentContext,
  reviews: ScoredReviewEntry[],
  disclaimer: string,
  userProfile?: UserProfileForModal,
): SeasonalModalContent {
  const season = env.season || null;
  const city = env.location?.city;
  const region = env.location?.region;
  const conditions = deriveConditions(env);
  const matched = classifyIngredients(product.keyIngredients || []);

  // --- Header (enhanced) ---
  const locationLabel = city
    ? [city, region].filter(Boolean).join(', ')
    : '';

  const header: SeasonalHeader = {
    icon: season ? (SEASON_ICONS[season] || 'ri-earth-line') : 'ri-earth-line',
    seasonLabel: season ? capitalize(season) : '',
    locationLabel,
    sourceNote: env.source === 'live'
      ? 'Personalized for your local conditions'
      : env.source === 'partial'
        ? 'Partially personalized based on your saved location'
        : 'Add your location in Settings for personalized insights',
    environmentalFactors: deriveEnvironmentalFactors(conditions, env),
    skinImpact: buildSkinImpact(conditions),
  };

  // --- Product Fit Narrative ---
  const productFit = buildProductFitNarrative({
    product,
    env,
    conditions,
    matched,
    userSkinType: userProfile?.skinType,
    userConcerns: userProfile?.concerns,
    userSensitivity: userProfile?.sensitivity,
    userComplexion: userProfile?.complexion,
    userLifestyle: userProfile?.lifestyle,
    userPreferences: userProfile?.preferences,
  });

  // --- Keyword Insights ---
  const keywordInsights = generateKeywordInsights(
    reviews,
    matched,
    product,
    userProfile?.skinType,
  );

  // --- Category & Texture phrases ---
  const catPhrase = getCategoryPhrase(product.category, conditions);
  const texture = inferTexture(product);
  const texPhrase = getTexturePhrase(texture, conditions);

  const finalTexPhrase = texPhrase && catPhrase && texPhrase === catPhrase
    ? null
    : texPhrase;

  return {
    header,
    productFit,
    keywordInsights,
    categoryPhrase: catPhrase,
    texturePhrase: finalTexPhrase,
    disclaimer,
    personalized: !!userProfile?.skinType,
  };
}
