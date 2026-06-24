/**
 * Modal Chat Responder
 *
 * Local, rule-based response generator for the Learn More popup's mini AI chat.
 * Uses product metadata, environment data, user profile, and reviewer evidence
 * to generate context-aware responses without requiring an external API call.
 */

import type { Product } from '../../types/product';
import type { EnvironmentContext } from '../environment/context';
import type { ConditionKey, IngredientClass } from '../environment/productKnowledge';
import type { ScoredReviewEntry } from './environmentFit';
import type { SeasonalSkinNotes } from './seasonalModalContent';
import { deriveConditions } from '../environment/productKnowledge';
import { classifyIngredients } from './environmentFit';
import {
  SKIN_TYPE_CONDITION_IMPACT,
  SKIN_TYPE_GENERIC,
  CONDITION_PROBLEM,
  CLASS_BENEFIT,
  getPlainBenefit,
  getActiveClasses,
  listJoin,
} from './seasonalModalContent';
import { matchesConcern } from './matching';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModalChatContext {
  product: Product;
  env: EnvironmentContext;
  userSkinType?: string;
  userConcerns?: string[];
  userSensitivity?: string;
  reviews: ScoredReviewEntry[];
  seasonalNotes?: SeasonalSkinNotes;
}

export interface NavigationTarget {
  sectionId: string;
  label: string;
}

export interface ChatResponse {
  response: string;
  highlightPhrases: string[];
  suggestedFollowUp?: string;
  navigationTarget?: NavigationTarget;
}

// ---------------------------------------------------------------------------
// Topic Detection
// ---------------------------------------------------------------------------

type QuestionTopic =
  | 'skin_type_environment'
  | 'season_hypothetical'
  | 'ingredient'
  | 'sensitivity'
  | 'concern'
  | 'texture_wear'
  | 'general_fit';

const SKIN_TYPE_TERMS = ['oily', 'dry', 'combination', 'sensitive', 'normal'];
const ENVIRONMENT_TERMS = ['humid', 'humidity', 'dry air', 'cold', 'hot', 'heat', 'wind', 'sun', 'uv', 'weather'];
const SEASON_TERMS = ['winter', 'summer', 'spring', 'autumn', 'fall'];
const SENSITIVITY_TERMS = ['sensitive', 'reactive', 'irritation', 'irritated', 'gentle', 'strong', 'harsh', 'sting', 'burning'];
const HYPOTHETICAL_TERMS = ['would', 'what if', 'what about', 'could', 'in winter', 'in summer', 'in spring', 'in autumn', 'in fall', 'during winter', 'during summer'];
const CONCERN_TERMS = ['acne', 'aging', 'wrinkle', 'dark spot', 'hyperpigmentation', 'dryness', 'dehydrat', 'pore', 'redness', 'dull', 'texture', 'fine line', 'breakout', 'oil', 'hydrat'];
const TEXTURE_WEAR_TERMS = ['heavy', 'lightweight', 'greasy', 'sticky', 'absorb', 'thick', 'thin', 'feel', 'wear', 'under makeup', 'makeup', 'pills', 'pilling', 'residue', 'tacky', 'finish', 'silky', 'smooth', 'creamy', 'gel', 'watery', 'matte', 'dewy'];

/** Map season names to typical environmental conditions for hypothetical questions. */
const SEASON_TO_CONDITIONS: Record<string, ConditionKey[]> = {
  winter: ['cold', 'dry_air', 'low_uv'],
  summer: ['hot', 'humid', 'high_uv'],
  spring: ['humid', 'high_uv'],
  autumn: ['dry_air', 'cold'],
  fall: ['dry_air', 'cold'],
};

function detectTopic(question: string, productIngredients: string[]): QuestionTopic {
  const q = question.toLowerCase();

  const hasHypothetical = HYPOTHETICAL_TERMS.some(t => q.includes(t));
  const mentionsSeason = SEASON_TERMS.some(t => q.includes(t));
  if (hasHypothetical && mentionsSeason) return 'season_hypothetical';

  const mentionsSkinType = SKIN_TYPE_TERMS.some(t => q.includes(t));
  const mentionsEnvironment = ENVIRONMENT_TERMS.some(t => q.includes(t));
  if (mentionsSkinType && mentionsEnvironment) return 'skin_type_environment';

  if (SENSITIVITY_TERMS.some(t => q.includes(t))) return 'sensitivity';

  const mentionsIngredient = productIngredients.some(ing =>
    q.includes(ing.toLowerCase())
  );
  if (mentionsIngredient) return 'ingredient';

  if (CONCERN_TERMS.some(t => q.includes(t))) return 'concern';

  if (TEXTURE_WEAR_TERMS.some(t => q.includes(t))) return 'texture_wear';

  if (mentionsEnvironment || mentionsSeason) return 'skin_type_environment';

  return 'general_fit';
}

// ---------------------------------------------------------------------------
// Response Generators
// ---------------------------------------------------------------------------

function respondSkinTypeEnvironment(q: string, ctx: ModalChatContext, conditions: ConditionKey[]): ChatResponse {
  const skinType = (SKIN_TYPE_TERMS.find(t => q.includes(t)) || ctx.userSkinType || '').toLowerCase();
  const matched = classifyIngredients(ctx.product.keyIngredients || []);
  const activeClasses = getActiveClasses(matched, conditions);
  const sentences: string[] = [];

  const condMap = SKIN_TYPE_CONDITION_IMPACT[skinType];
  if (condMap) {
    const firstMatch = conditions.find(c => condMap[c]);
    if (firstMatch && condMap[firstMatch]) {
      sentences.push(condMap[firstMatch]!);
    }
  }

  if (activeClasses.length > 0) {
    const benefit = getPlainBenefit(activeClasses[0].cls, conditions);
    sentences.push(`This product ${benefit}.`);
  }

  const similarReviews = ctx.reviews.filter(r =>
    r.matchTier === 'full' || r.matchTier === 'strong'
  );
  if (similarReviews.length > 0) {
    const avgRating = similarReviews.reduce((sum, r) => sum + r.review.rating, 0) / similarReviews.length;
    if (avgRating >= 4.0) {
      sentences.push('People with similar skin generally had positive experiences with this product.');
    } else {
      sentences.push('People with similar skin had mixed but mostly positive results.');
    }
  }

  if (sentences.length === 0) {
    sentences.push(`This product is designed to support ${skinType || 'your'} skin through current conditions.`);
  }

  const highlights: string[] = [];
  if (skinType) highlights.push(`${skinType} skin`);
  if (activeClasses.length > 0) highlights.push(activeClasses[0].cls);
  if (similarReviews.length > 0) highlights.push('positive experiences', 'similar skin');

  return {
    response: sentences.slice(0, 3).join(' '),
    highlightPhrases: highlights,
    suggestedFollowUp: 'Would this work differently in another season?',
    navigationTarget: { sectionId: 'section-environment', label: 'Environment fit' },
  };
}

function respondSeasonHypothetical(q: string, ctx: ModalChatContext): ChatResponse {
  const mentionedSeason = SEASON_TERMS.find(t => q.includes(t)) || 'winter';
  const hypotheticalConditions = SEASON_TO_CONDITIONS[mentionedSeason] || ['cold', 'dry_air'];
  const skinType = (ctx.userSkinType || '').toLowerCase();
  const matched = classifyIngredients(ctx.product.keyIngredients || []);
  const activeClasses = getActiveClasses(matched, hypotheticalConditions);
  const sentences: string[] = [];
  const seasonLabel = mentionedSeason.charAt(0).toUpperCase() + mentionedSeason.slice(1);

  const condMap = skinType ? SKIN_TYPE_CONDITION_IMPACT[skinType] : null;
  if (condMap) {
    const firstMatch = hypotheticalConditions.find(c => condMap[c]);
    if (firstMatch && condMap[firstMatch]) {
      const text = condMap[firstMatch]!;
      sentences.push(`In ${seasonLabel.toLowerCase()} conditions, ${text.charAt(0).toLowerCase()}${text.slice(1)}`);
    }
  }

  if (activeClasses.length > 0) {
    const benefit = getPlainBenefit(activeClasses[0].cls, hypotheticalConditions);
    sentences.push(`This product ${benefit}, so it can work well in ${seasonLabel.toLowerCase()} too.`);
  } else {
    sentences.push(`This product can still support your skin in ${seasonLabel.toLowerCase()}, though the conditions are different from now.`);
  }

  if (activeClasses.length >= 2) {
    const benefit2 = getPlainBenefit(activeClasses[1].cls, hypotheticalConditions);
    sentences.push(`It also ${benefit2}.`);
  }

  const highlights: string[] = [seasonLabel.toLowerCase()];
  if (skinType) highlights.push(`${skinType} skin`);
  if (activeClasses.length > 0) highlights.push(activeClasses[0].cls);

  return {
    response: sentences.slice(0, 3).join(' '),
    highlightPhrases: highlights,
    suggestedFollowUp: skinType
      ? 'Would you like to note how your skin behaves this season?'
      : 'What skin type do you have?',
    // No navigation — hypothetical season data isn't displayed in the modal
  };
}

function respondIngredient(q: string, ctx: ModalChatContext, conditions: ConditionKey[]): ChatResponse {
  const productIngredients = ctx.product.keyIngredients || [];
  const mentionedIngredient = productIngredients.find(ing =>
    q.includes(ing.toLowerCase())
  );

  if (!mentionedIngredient) {
    return respondGeneralFit(ctx, conditions);
  }

  const matched = classifyIngredients([mentionedIngredient]);
  const activeClasses = getActiveClasses(matched, conditions);
  const sentences: string[] = [];

  if (activeClasses.length > 0) {
    const benefit = getPlainBenefit(activeClasses[0].cls, conditions);
    sentences.push(`${mentionedIngredient} ${benefit}.`);
  } else {
    // No condition-specific benefit; use generic class benefit
    const CLASS_KEYS: IngredientClass[] = ['humectant', 'barrier', 'soothing', 'supportive', 'sensitizing', 'protective', 'emollient', 'occlusive', 'peptide'];
    for (const cls of CLASS_KEYS) {
      const names = cls === 'humectant' ? matched.humectants : (matched as unknown as Record<string, string[]>)[cls];
      if (names && names.length > 0) {
        sentences.push(`${mentionedIngredient} ${CLASS_BENEFIT[cls]}.`);
        break;
      }
    }
  }

  if (ctx.userConcerns && ctx.userConcerns.length > 0) {
    const productConcerns = ctx.product.concerns || [];
    const overlap = productConcerns.filter(pc =>
      ctx.userConcerns!.some(uc => matchesConcern(pc, [uc]))
    );
    if (overlap.length > 0) {
      sentences.push(`This ingredient is part of why this product addresses ${listJoin(overlap)}.`);
    }
  }

  if (sentences.length === 0) {
    sentences.push(`${mentionedIngredient} is one of the key ingredients in this product, contributing to its overall effectiveness.`);
  }

  const highlights: string[] = [mentionedIngredient];
  if (activeClasses.length > 0) highlights.push(activeClasses[0].cls);

  return {
    response: sentences.slice(0, 3).join(' '),
    highlightPhrases: highlights,
    suggestedFollowUp: 'How does this product fit your current environment?',
    navigationTarget: { sectionId: 'section-ingredients-tab', label: 'Ingredients' },
  };
}

function respondSensitivity(q: string, ctx: ModalChatContext, conditions: ConditionKey[]): ChatResponse {
  const matched = classifyIngredients(ctx.product.keyIngredients || []);
  const sentences: string[] = [];
  const hasSensitizing = matched.sensitizing.length > 0;

  if (hasSensitizing) {
    sentences.push(
      `This product contains some stronger actives (${listJoin(matched.sensitizing)}), so introducing it gradually is a good idea.`
    );
    if (conditions.includes('high_uv')) {
      sentences.push('With current UV levels, wearing sunscreen during the day is especially important when using this product.');
    } else {
      sentences.push('Wearing sunscreen during the day is always a good idea when using active ingredients.');
    }
  } else {
    sentences.push('This product doesn\'t contain the stronger actives that tend to cause sensitivity, so it should be comfortable for most skin types.');
    if (matched.soothing.length > 0) {
      sentences.push(`It actually includes soothing ingredients like ${listJoin(matched.soothing)}, which help keep skin calm.`);
    }
  }

  if (ctx.userSensitivity === 'high') {
    sentences.push('Since your skin tends to be sensitive, introducing any new product gradually and watching how your skin responds is always a good idea.');
  }

  const highlights: string[] = ['sensitive'];
  if (hasSensitizing) highlights.push('stronger actives', ...matched.sensitizing);
  if (matched.soothing.length > 0) highlights.push('soothing ingredients', ...matched.soothing);
  highlights.push('sunscreen');

  return {
    response: sentences.slice(0, 3).join(' '),
    highlightPhrases: highlights,
    suggestedFollowUp: 'Would you like to note how your skin behaves this season?',
    // No navigation — answer is self-contained
  };
}

function respondConcern(q: string, ctx: ModalChatContext, conditions: ConditionKey[]): ChatResponse {
  const productConcerns = (ctx.product.concerns || []).map(c => c.toLowerCase());
  const sentences: string[] = [];

  const CONCERN_MAP: Record<string, string[]> = {
    'acne': ['acne', 'breakout'],
    'aging': ['aging', 'wrinkle', 'fine line'],
    'dark spots': ['dark spot', 'hyperpigmentation'],
    'dryness': ['dryness', 'dehydrat', 'dry'],
    'pores': ['pore'],
    'redness': ['redness'],
    'dullness': ['dull', 'dullness'],
    'texture': ['texture'],
    'oiliness': ['oil', 'oily'],
    'hydration': ['hydrat'],
  };

  let mentionedConcern: string | null = null;
  for (const [concern, terms] of Object.entries(CONCERN_MAP)) {
    if (terms.some(t => q.includes(t))) {
      mentionedConcern = concern;
      break;
    }
  }

  if (mentionedConcern) {
    const isAddressed = productConcerns.some(pc =>
      matchesConcern(pc, [mentionedConcern!])
    );

    if (isAddressed) {
      sentences.push(`Yes, this product does address ${mentionedConcern}, which is one of its targeted concerns.`);
      const firstCondition = conditions[0];
      const problem = firstCondition ? CONDITION_PROBLEM[firstCondition] : null;
      if (problem) {
        sentences.push(`${problem}, which can make ${mentionedConcern} more noticeable — so this product is especially relevant right now.`);
      }
    } else {
      sentences.push(`This product doesn't specifically target ${mentionedConcern}. It focuses more on ${listJoin(productConcerns.slice(0, 3))}.`);
    }
  } else {
    const userConcerns = (ctx.userConcerns || []).map(c => c.toLowerCase());
    if (userConcerns.length > 0) {
      const overlap = productConcerns.filter(pc =>
        userConcerns.some(uc => matchesConcern(pc, [uc]))
      );
      if (overlap.length > 0) {
        sentences.push(`This product addresses ${listJoin(overlap)}, which matches what your skin needs.`);
      } else {
        sentences.push(`This product focuses on ${listJoin(productConcerns.slice(0, 3))}, which may not directly overlap with your primary concerns.`);
      }
    }
  }

  if (sentences.length === 0) {
    return respondGeneralFit(ctx, conditions);
  }

  const highlights: string[] = [];
  if (mentionedConcern) highlights.push(mentionedConcern);
  highlights.push(...productConcerns.slice(0, 3));

  // Navigate to reviews only when reviewer data adds depth
  const hasRelevantReviews = ctx.reviews.some(
    r => r.matchTier === 'full' || r.matchTier === 'strong',
  );

  return {
    response: sentences.slice(0, 3).join(' '),
    highlightPhrases: highlights,
    suggestedFollowUp: 'Are there specific ingredients you want to know about?',
    navigationTarget: hasRelevantReviews
      ? { sectionId: 'section-reviews-tab', label: 'Reviews' }
      : undefined,
  };
}

function respondGeneralFit(ctx: ModalChatContext, conditions: ConditionKey[]): ChatResponse {
  const skinType = (ctx.userSkinType || '').toLowerCase();
  const matched = classifyIngredients(ctx.product.keyIngredients || []);
  const activeClasses = getActiveClasses(matched, conditions);
  const sentences: string[] = [];
  const season = ctx.env.season;

  const firstCondition = conditions[0];
  const problem = firstCondition ? CONDITION_PROBLEM[firstCondition] : null;

  if (problem && skinType) {
    sentences.push(`${problem}. For ${skinType} skin, that means extra attention to the right products matters.`);
  } else if (problem) {
    sentences.push(`${problem}. Choosing the right product helps your skin stay comfortable.`);
  }

  if (activeClasses.length > 0) {
    const benefit = getPlainBenefit(activeClasses[0].cls, conditions);
    sentences.push(`This product ${benefit}.`);
  }

  if (ctx.userConcerns && ctx.userConcerns.length > 0) {
    const productConcerns = ctx.product.concerns || [];
    const overlap = productConcerns.filter(pc =>
      ctx.userConcerns!.some(uc => matchesConcern(pc, [uc]))
    );
    if (overlap.length > 0) {
      sentences.push(`It also addresses ${listJoin(overlap)}, which is what your skin is looking for.`);
    }
  }

  if (sentences.length === 0) {
    const generic = skinType ? SKIN_TYPE_GENERIC[skinType] : null;
    sentences.push(generic || 'This product is designed to support your skin through changing conditions.');
  }

  const highlights: string[] = [];
  if (skinType) highlights.push(`${skinType} skin`);
  if (activeClasses.length > 0) highlights.push(activeClasses[0].cls);

  return {
    response: sentences.slice(0, 3).join(' '),
    highlightPhrases: highlights,
    suggestedFollowUp: season
      ? `How does your skin usually feel in ${season}?`
      : 'What concerns are most important to you right now?',
    navigationTarget: activeClasses.length > 0
      ? { sectionId: 'section-ingredients-tab', label: 'Ingredients' }
      : undefined,
  };
}

function respondTextureWear(q: string, ctx: ModalChatContext, conditions: ConditionKey[]): ChatResponse {
  const matched = classifyIngredients(ctx.product.keyIngredients || []);
  const sentences: string[] = [];
  const highlights: string[] = [];

  // Detect what the user is asking about
  const asksHeavy = ['heavy', 'thick', 'greasy', 'sticky', 'tacky', 'residue'].some(t => q.includes(t));
  const asksLight = ['lightweight', 'light', 'thin', 'watery', 'gel'].some(t => q.includes(t));
  const asksMakeup = ['makeup', 'under makeup'].some(t => q.includes(t));
  const asksAbsorb = ['absorb', 'sink'].some(t => q.includes(t));
  const asksFinish = ['matte', 'dewy', 'finish'].some(t => q.includes(t));

  // Build answer based on what was asked
  if (asksHeavy) {
    if (matched.emollient.length > 0 || matched.occlusive.length > 0) {
      sentences.push('This product contains richer ingredients that provide a protective layer.');
      if (conditions.includes('humid') || conditions.includes('hot')) {
        sentences.push('In your current warm or humid conditions, lighter application can help it feel more comfortable.');
      } else {
        sentences.push('In your current conditions, the richness helps lock in moisture.');
      }
      highlights.push('protective layer', 'richer ingredients');
    } else {
      sentences.push('This product has a lighter formulation that shouldn\'t feel heavy on the skin.');
      highlights.push('lighter formulation');
    }
  } else if (asksLight) {
    if (matched.humectants.length > 0) {
      sentences.push('This product uses humectant ingredients that absorb quickly and feel lightweight.');
      highlights.push('lightweight', 'absorb quickly');
    } else {
      sentences.push('This product is designed to feel comfortable without heaviness.');
      highlights.push('comfortable');
    }
  } else if (asksMakeup) {
    sentences.push('Based on its ingredient profile, this product should layer well under makeup.');
    if (conditions.includes('humid') || conditions.includes('hot')) {
      sentences.push('In warm or humid conditions, letting it absorb fully before applying makeup helps it sit better.');
    }
    highlights.push('under makeup', 'layer well');
  } else if (asksAbsorb) {
    if (matched.humectants.length > 0) {
      sentences.push(`With humectant ingredients like ${listJoin(matched.humectants.slice(0, 2))}, this product tends to absorb well into the skin.`);
      highlights.push('absorb well', ...matched.humectants.slice(0, 2));
    } else {
      sentences.push('This product is designed to absorb comfortably without leaving residue.');
      highlights.push('absorb comfortably');
    }
  } else if (asksFinish) {
    if (matched.emollient.length > 0) {
      sentences.push('With emollient ingredients, this product tends toward a more dewy, moisturized finish.');
      highlights.push('dewy', 'moisturized finish');
    } else if (matched.humectants.length > 0) {
      sentences.push('The humectant-based formula tends to dry down to a natural, comfortable finish.');
      highlights.push('natural', 'comfortable finish');
    } else {
      sentences.push('This product is designed to leave a comfortable finish on the skin.');
      highlights.push('comfortable finish');
    }
  } else {
    // General texture question
    sentences.push('This product is designed to feel comfortable on the skin.');
    if (matched.humectants.length > 0) {
      sentences.push(`Humectant ingredients like ${listJoin(matched.humectants.slice(0, 2))} help it absorb smoothly.`);
      highlights.push('absorb smoothly', ...matched.humectants.slice(0, 2));
    }
    highlights.push('comfortable');
  }

  // Add reviewer perspective if available
  const similarReviews = ctx.reviews.filter(
    r => r.matchTier === 'full' || r.matchTier === 'strong',
  );
  const hasRelevantReviews = similarReviews.length > 0;
  if (hasRelevantReviews) {
    const avgRating = similarReviews.reduce((sum, r) => sum + r.review.rating, 0) / similarReviews.length;
    if (avgRating >= 4.0) {
      sentences.push('People with similar skin generally found it comfortable to wear.');
      highlights.push('similar skin', 'comfortable to wear');
    }
  }

  return {
    response: sentences.slice(0, 3).join(' '),
    highlightPhrases: highlights,
    suggestedFollowUp: 'How does this product fit your current environment?',
    navigationTarget: hasRelevantReviews
      ? { sectionId: 'section-reviews-tab', label: 'Reviews' }
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generateModalChatResponse(
  question: string,
  ctx: ModalChatContext,
): ChatResponse {
  const q = question.toLowerCase().trim();
  const conditions = deriveConditions(ctx.env);
  const topic = detectTopic(q, ctx.product.keyIngredients || []);

  switch (topic) {
    case 'skin_type_environment':
      return respondSkinTypeEnvironment(q, ctx, conditions);
    case 'season_hypothetical':
      return respondSeasonHypothetical(q, ctx);
    case 'ingredient':
      return respondIngredient(q, ctx, conditions);
    case 'sensitivity':
      return respondSensitivity(q, ctx, conditions);
    case 'concern':
      return respondConcern(q, ctx, conditions);
    case 'texture_wear':
      return respondTextureWear(q, ctx, conditions);
    case 'general_fit':
    default:
      return respondGeneralFit(ctx, conditions);
  }
}
