import type { Product } from '../../types/product';
import type { EnvironmentContext } from '../environment/context';
import type { IngredientClass, ConditionKey } from '../environment/productKnowledge';
import type { MatchTier } from './reviewSimilarity';
import {
  deriveConditions,
  getMechanismPhrase,
  getCategoryPhrase,
  getTexturePhrase,
} from '../environment/productKnowledge';
import { inferTexture } from '../environment/inferTexture';

// ---------------------------------------------------------------------------
// Ingredient classification sets (case-insensitive, forward-match only)
// ---------------------------------------------------------------------------

const UV_SUPPORTIVE = [
  'vitamin c', 'vitamin e', 'ferulic acid', 'niacinamide', 'green tea',
  'resveratrol', 'coenzyme q10', 'astaxanthin', 'lycopene',
];

const UV_PROTECTIVE = [
  'zinc oxide', 'titanium dioxide', 'avobenzone', 'octinoxate',
  'homosalate', 'octocrylene',
];

const PHOTOSENSITIZING = [
  'retinol', 'retinal', 'tretinoin', 'adapalene', 'aha', 'bha',
  'salicylic acid', 'glycolic acid', 'lactic acid', 'mandelic acid',
  'azelaic acid',
];

const HUMECTANT = [
  'hyaluronic acid', 'glycerin', 'aloe vera', 'panthenol', 'urea',
  'honey', 'propylene glycol', 'sodium hyaluronate', 'beta-glucan',
];

const BARRIER_SUPPORT = [
  'ceramides', 'squalane', 'niacinamide', 'shea butter', 'cholesterol',
  'fatty acids', 'jojoba oil', 'argan oil', 'lanolin', 'dimethicone',
];

const SOOTHING = [
  'centella asiatica', 'madecassoside', 'aloe vera', 'chamomile',
  'allantoin', 'panthenol', 'bisabolol', 'calendula', 'oat extract',
  'licorice root',
];

const EMOLLIENT = [
  'squalane', 'jojoba oil', 'argan oil', 'rosehip oil', 'marula oil',
  'sweet almond oil', 'avocado oil', 'grape seed oil', 'meadowfoam oil',
];

const OCCLUSIVE = [
  'shea butter', 'beeswax', 'lanolin', 'petrolatum', 'dimethicone',
  'cocoa butter', 'candelilla wax', 'mineral oil',
];

const PEPTIDE = [
  'peptides', 'matrixyl', 'argireline', 'copper peptides',
  'palmitoyl tripeptide', 'palmitoyl tetrapeptide', 'acetyl hexapeptide',
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Individual scored review for rendering in the environment-fit modal */
export interface ScoredReviewEntry {
  review: {
    id: number;
    userName: string;
    userAvatar: string;
    rating: number;
    content: string;
    skinType: string;
    usageDurationWeeks: number;
    verified: boolean;
  };
  score: number;
  matchTier: MatchTier;
  matchDetails: string[];
}

export interface ReviewerEnvironmentInsight {
  count: number;
  sentiment: 'positive' | 'mixed';
  detail?: string;
  /** Top scored reviews for modal rendering (max 3, sorted by score desc) */
  scoredReviews?: ScoredReviewEntry[];
}

export interface EnvironmentFitExplanation {
  explanation: string;
  reviewerInsight: string | null;
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ingredientsInSet(ingredients: string[], set: string[]): string[] {
  const lower = ingredients.map(i => i.toLowerCase());
  return ingredients.filter((_, idx) =>
    set.some(s => lower[idx].includes(s)),
  );
}

export interface MatchedIngredients {
  protective: string[];
  supportive: string[];
  sensitizing: string[];
  humectants: string[];
  barrier: string[];
  soothing: string[];
  emollient: string[];
  occlusive: string[];
  peptide: string[];
}

export function classifyIngredients(ingredients: string[]): MatchedIngredients {
  return {
    protective: ingredientsInSet(ingredients, UV_PROTECTIVE),
    supportive: ingredientsInSet(ingredients, UV_SUPPORTIVE),
    sensitizing: ingredientsInSet(ingredients, PHOTOSENSITIZING),
    humectants: ingredientsInSet(ingredients, HUMECTANT),
    barrier: ingredientsInSet(ingredients, BARRIER_SUPPORT),
    soothing: ingredientsInSet(ingredients, SOOTHING),
    emollient: ingredientsInSet(ingredients, EMOLLIENT),
    occlusive: ingredientsInSet(ingredients, OCCLUSIVE),
    peptide: ingredientsInSet(ingredients, PEPTIDE),
  };
}

/** Map MatchedIngredients to their IngredientClass keys with matched names. */
function getActiveClasses(m: MatchedIngredients): { cls: IngredientClass; names: string[] }[] {
  const entries: { cls: IngredientClass; names: string[] }[] = [];
  if (m.sensitizing.length > 0) entries.push({ cls: 'sensitizing', names: m.sensitizing });
  if (m.protective.length > 0) entries.push({ cls: 'protective', names: m.protective });
  if (m.supportive.length > 0) entries.push({ cls: 'supportive', names: m.supportive });
  if (m.humectants.length > 0) entries.push({ cls: 'humectant', names: m.humectants });
  if (m.barrier.length > 0) entries.push({ cls: 'barrier', names: m.barrier });
  if (m.occlusive.length > 0) entries.push({ cls: 'occlusive', names: m.occlusive });
  if (m.emollient.length > 0) entries.push({ cls: 'emollient', names: m.emollient });
  if (m.soothing.length > 0) entries.push({ cls: 'soothing', names: m.soothing });
  if (m.peptide.length > 0) entries.push({ cls: 'peptide', names: m.peptide });
  return entries;
}

function list(items: string[]): string {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function catLabel(category: string): string {
  return category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function isPmOnly(product: Product): boolean {
  return !!product.timeOfDay && product.timeOfDay.includes('pm') && !product.timeOfDay.includes('am');
}

/** Concerns from the product that overlap with the user's concerns. */
function matchedConcerns(product: Product, userConcerns?: string[]): string[] {
  if (!userConcerns || userConcerns.length === 0) return [];
  const productConcerns = (product.concerns || []).map(c => c.toLowerCase());
  return userConcerns.filter(c => productConcerns.includes(c));
}

// ---------------------------------------------------------------------------
// Live mode — mechanism-aware, fully personalized (1-3 sentences)
// ---------------------------------------------------------------------------

function buildLiveExplanation(
  product: Product,
  env: EnvironmentContext,
  m: MatchedIngredients,
  reviewer?: ReviewerEnvironmentInsight,
  userConcerns?: string[],
): string {
  const s: string[] = [];
  const conditions = deriveConditions(env);
  const texture = inferTexture(product);
  const activeClasses = getActiveClasses(m);
  const loc = env.location?.city
    ? [env.location.city, env.location.region].filter(Boolean).join(', ')
    : 'your area';

  // --- sentence 1: primary mechanism phrase ---

  let usedClass: IngredientClass | null = null;

  for (const { cls, names } of activeClasses) {
    const phrase = getMechanismPhrase(cls, conditions);
    if (phrase) {
      // Special handling for sensitizing + pm-only products
      if (cls === 'sensitizing' && isPmOnly(product)) {
        const isHighUv = conditions.includes('high_uv');
        if (isHighUv || conditions.includes('hot')) {
          s.push(`${product.name} is best used in the evening, so its ${list(names)} can work while naturally avoiding peak sun exposure in ${loc}.`);
        } else {
          s.push(`${product.name}'s ${list(names)} ${phrase} in ${loc}.`);
        }
      } else {
        s.push(`${product.name}'s ${list(names)} ${phrase} in ${loc}.`);
      }
      usedClass = cls;
      break;
    }
  }

  // --- sentence 2: category or texture phrase (avoid redundancy) ---

  if (s.length < 3) {
    const catPhrase = getCategoryPhrase(product.category, conditions);
    const texPhrase = getTexturePhrase(texture, conditions);

    if (catPhrase) {
      // Capitalize first character for sentence start
      s.push(catPhrase.charAt(0).toUpperCase() + catPhrase.slice(1) + '.');
    } else if (texPhrase) {
      // Capitalize first character for sentence start
      s.push(texPhrase.charAt(0).toUpperCase() + texPhrase.slice(1) + '.');
    } else {
      // Try a second ingredient class mechanism phrase
      for (const { cls, names } of activeClasses) {
        if (cls === usedClass) continue;
        const phrase = getMechanismPhrase(cls, conditions);
        if (phrase) {
          s.push(`Its ${list(names)} ${phrase}.`);
          break;
        }
      }
    }
  }

  // --- sentence 3: reviewer evidence OR concern alignment ---

  if (s.length < 3 && reviewer && reviewer.count > 0 && reviewer.sentiment === 'positive' && reviewer.detail) {
    s.push(`${reviewer.count} people with a similar skin profile ${reviewer.detail}.`);
  } else if (s.length < 3) {
    const concerns = matchedConcerns(product, userConcerns);
    if (concerns.length > 0) {
      s.push(s.length > 0
        ? `It also targets ${list(concerns)}, which matches what your skin needs right now.`
        : `${product.name} targets ${list(concerns)}, which matches what your skin needs right now.`);
    }
  }

  // --- fallback: always product-specific ---

  if (s.length === 0) {
    const season = env.season ? env.season.charAt(0).toUpperCase() + env.season.slice(1) : null;
    const any = [...m.barrier, ...m.humectants, ...m.soothing, ...m.supportive].slice(0, 2);
    if (any.length > 0) {
      return `${product.name}'s ${list(any)} ${any.length > 1 ? 'help maintain' : 'helps maintain'} skin comfort through ${season ? season.toLowerCase() + '\'s' : 'the'} conditions in ${loc}. With ${env.uvBand ? env.uvBand.replace(/_/g, ' ') : 'current'} UV levels, this ${catLabel(product.category).toLowerCase()} fits well in your routine.`;
    }
    return `${product.name} is a ${catLabel(product.category).toLowerCase()} suited to ${season ? season.toLowerCase() : 'current'} conditions in ${loc}. Its blend supports daily use at ${env.uvBand ? env.uvBand.replace(/_/g, ' ') : 'current'} UV levels.`;
  }

  return s.slice(0, 3).join(' ');
}

// ---------------------------------------------------------------------------
// Partial mode — conditions derived from season only
// ---------------------------------------------------------------------------

function buildPartialExplanation(
  product: Product,
  env: EnvironmentContext,
  m: MatchedIngredients,
  reviewer?: ReviewerEnvironmentInsight,
  userConcerns?: string[],
): string {
  const s: string[] = [];
  const season = env.season ? env.season.charAt(0).toUpperCase() + env.season.slice(1) : null;

  // Derive conditions from season only (no climate/UV in partial mode)
  const conditions: ConditionKey[] = [];
  if (env.season === 'summer') conditions.push('hot');
  if (env.season === 'winter') conditions.push('cold', 'dry_air');
  if (env.season === 'spring' || env.season === 'autumn') conditions.push('transitional');

  const activeClasses = getActiveClasses(m);
  const texture = inferTexture(product);

  // --- sentence 1: primary mechanism phrase ---

  for (const { cls, names } of activeClasses) {
    const phrase = getMechanismPhrase(cls, conditions);
    if (phrase) {
      s.push(`${product.name}'s ${list(names)} ${phrase} during ${season?.toLowerCase() || 'current'} months.`);
      break;
    }
  }

  // If no mechanism phrase matched, use existing season-based patterns
  if (s.length === 0) {
    if (m.sensitizing.length > 0) {
      if (env.season === 'summer' || env.season === 'spring') {
        s.push(`${product.name}'s ${list(m.sensitizing)} can increase UV sensitivity — consistent SPF use is important during ${season?.toLowerCase()} months.`);
      } else if (env.season === 'winter' || env.season === 'autumn') {
        s.push(`${season}'s lower UV makes this a favorable time for ${product.name}'s ${list(m.sensitizing)}.`);
      }
    } else if (m.protective.length > 0) {
      s.push(`${product.name}'s ${list(m.protective)} ${m.protective.length > 1 ? 'provide' : 'provides'} mineral-based UV defense across all seasons.`);
    } else if (m.supportive.length > 0) {
      s.push(`${product.name}'s ${list(m.supportive)} ${m.supportive.length > 1 ? 'complement' : 'complements'} daily SPF year-round.`);
    }
  }

  // --- sentence 2: texture or category phrase ---

  if (s.length < 3 && s.length > 0) {
    const texPhrase = getTexturePhrase(texture, conditions);
    const catPhrase = getCategoryPhrase(product.category, conditions);
    if (texPhrase) {
      s.push(texPhrase.charAt(0).toUpperCase() + texPhrase.slice(1) + '.');
    } else if (catPhrase) {
      s.push(catPhrase.charAt(0).toUpperCase() + catPhrase.slice(1) + '.');
    }
  }

  // --- sentence 3: reviewer or concern ---

  if (s.length < 3 && reviewer && reviewer.count > 0 && reviewer.sentiment === 'positive' && reviewer.detail) {
    s.push(`People with a similar skin profile ${reviewer.detail}.`);
  } else if (s.length < 3) {
    const concerns = matchedConcerns(product, userConcerns);
    if (concerns.length > 0) {
      s.push(s.length > 0
        ? `It also targets ${list(concerns)}, which matches what your skin needs right now.`
        : `${product.name} targets ${list(concerns)}, which matches what your skin needs right now.`);
    }
  }

  // --- fallback ---

  if (s.length === 0) {
    const any = [...m.barrier, ...m.humectants, ...m.supportive, ...m.soothing, ...m.protective].slice(0, 2);
    if (any.length > 0 && season) {
      return `${product.name}'s ${list(any)} ${any.length > 1 ? 'are' : 'is'} relevant across a range of conditions. During ${season.toLowerCase()}, add your full location for a more specific assessment.`;
    }
    if (season) {
      return `During ${season.toLowerCase()}, ${product.name}'s ${catLabel(product.category).toLowerCase()} formula can be assessed against local conditions. Add your full location for deeper insights.`;
    }
    return `${product.name}'s ingredient profile can be assessed against your environment. Add your location in Settings for a personalized assessment.`;
  }

  return s.slice(0, 3).join(' ');
}

// ---------------------------------------------------------------------------
// Mock mode — product-specific with texture/category knowledge, no location
// ---------------------------------------------------------------------------

function buildMockExplanation(
  product: Product,
  m: MatchedIngredients,
  reviewer?: ReviewerEnvironmentInsight,
  userConcerns?: string[],
): string {
  const s: string[] = [];
  const texture = inferTexture(product);
  const activeClasses = getActiveClasses(m);

  // General condition keys for mock mode (no specific location)
  const generalConditions: ConditionKey[] = ['transitional'];

  // --- sentence 1: ingredient class statement ---

  let foundMechanism = false;
  for (const { cls, names } of activeClasses) {
    const phrase = getMechanismPhrase(cls, generalConditions);
    if (phrase) {
      s.push(`${product.name}'s ${list(names)} ${phrase}.`);
      foundMechanism = true;
      break;
    }
  }

  // Fallback to existing pattern if no mechanism phrase matched
  if (!foundMechanism) {
    if (m.protective.length > 0) {
      s.push(`${product.name}'s ${list(m.protective)} ${m.protective.length > 1 ? 'provide' : 'provides'} mineral-based UV defense across all conditions.`);
    } else if (m.supportive.length > 0) {
      s.push(`${product.name}'s ${list(m.supportive)} ${m.supportive.length > 1 ? 'complement' : 'complements'} daily SPF by helping neutralize environmental free radicals.`);
    } else if (m.sensitizing.length > 0) {
      s.push(`${product.name} contains ${list(m.sensitizing)}, which may increase UV sensitivity — pairing with SPF is recommended.`);
    } else if (m.barrier.length > 0 || m.humectants.length > 0) {
      const ing = [...m.barrier, ...m.humectants].slice(0, 2);
      s.push(`${product.name}'s ${list(ing)} ${ing.length > 1 ? 'support' : 'supports'} hydration and barrier health across varying conditions.`);
    } else if (m.soothing.length > 0) {
      s.push(`${product.name}'s ${list(m.soothing)} may help keep skin calm when environmental stressors shift.`);
    } else {
      s.push(`${product.name} is a ${catLabel(product.category).toLowerCase()} designed to perform across a range of conditions.`);
    }
  }

  // --- sentence 2: texture phrase or reviewer/concern ---

  const texPhrase = getTexturePhrase(texture, generalConditions);
  if (texPhrase) {
    s.push(texPhrase.charAt(0).toUpperCase() + texPhrase.slice(1) + '.');
  } else if (reviewer && reviewer.count > 0 && reviewer.sentiment === 'positive' && reviewer.detail) {
    s.push(`People with a similar skin profile ${reviewer.detail}.`);
  } else {
    const concerns = matchedConcerns(product, userConcerns);
    if (concerns.length > 0) {
      s.push(`It targets ${list(concerns)}, which matches what your skin needs right now.`);
    }
  }

  // --- sentence 3: location nudge ---

  s.push('Add your location in Settings to see how your environment interacts with this product.');

  return s.slice(0, 3).join(' ');
}

// ---------------------------------------------------------------------------
// Reviewer insight (separate field for optional UI rendering)
// ---------------------------------------------------------------------------

function buildReviewerInsight(
  product: Product,
  matches?: ReviewerEnvironmentInsight,
): string | null {
  if (!matches || matches.count === 0) return null;

  if (matches.sentiment === 'positive') {
    return matches.detail
      ? `${matches.count} people with a similar skin profile ${matches.detail}.`
      : `${matches.count} people with a similar skin profile gave ${product.name} positive ratings in similar conditions.`;
  }

  return 'People with a similar skin profile had mixed results — your experience may differ.';
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generateEnvironmentFitExplanation(
  product: Product,
  env: EnvironmentContext,
  reviewerMatches?: ReviewerEnvironmentInsight,
  userConcerns?: string[],
): EnvironmentFitExplanation {
  const ingredients = product.keyIngredients || [];
  const matched = classifyIngredients(ingredients);

  if (env.source === 'mock') {
    return {
      explanation: buildMockExplanation(product, matched, reviewerMatches, userConcerns),
      reviewerInsight: buildReviewerInsight(product, reviewerMatches),
      disclaimer: 'Add your location in Settings for personalized environmental insights.',
    };
  }

  if (env.source === 'partial') {
    return {
      explanation: buildPartialExplanation(product, env, matched, reviewerMatches, userConcerns),
      reviewerInsight: buildReviewerInsight(product, reviewerMatches),
      disclaimer: 'Partially personalized. Add full location for deeper environmental insights.',
    };
  }

  return {
    explanation: buildLiveExplanation(product, env, matched, reviewerMatches, userConcerns),
    reviewerInsight: buildReviewerInsight(product, reviewerMatches),
    disclaimer: 'Personalized for your local conditions. Update your location in Settings anytime.',
  };
}
