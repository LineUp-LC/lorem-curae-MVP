/**
 * Concern Intelligence for Lorem Curae AI
 *
 * Provides deep concern-level understanding including:
 * - Concern explanations tailored to user profiles
 * - Concern-to-ingredient mapping
 * - Concern-to-routine mapping
 * - Concern-to-product mapping
 * - Personalized concern guidance
 */

import { INGREDIENT_ENCYCLOPEDIA } from './knowledgeBase';
import { type RankedProduct } from './retrievalPipeline';

// ============================================================================
// Types
// ============================================================================

/**
 * Skin concern identifier
 */
export type ConcernId =
  | 'acne'
  | 'blackheads'
  | 'whiteheads'
  | 'hyperpigmentation'
  | 'dark-spots'
  | 'redness'
  | 'sensitivity'
  | 'dryness'
  | 'oiliness'
  | 'dehydration'
  | 'texture'
  | 'fine-lines'
  | 'wrinkles'
  | 'dullness'
  | 'barrier-damage'
  | 'large-pores'
  | 'uneven-tone'
  | 'aging';

/**
 * Concern severity level
 */
export type ConcernSeverity = 'mild' | 'moderate' | 'severe';

/**
 * User profile for concern personalization
 */
export interface ConcernUserProfile {
  skinType?: string;
  concerns?: string[];
  sensitivities?: string[];
  goals?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  currentProducts?: string[];
  avoidIngredients?: string[];
}

/**
 * Concern knowledge structure
 */
export interface ConcernKnowledge {
  id: ConcernId;
  name: string;
  aliases: string[];
  description: string;
  rootCauses: string[];
  visibleSigns: string[];
  recommendedIngredients: {
    primary: string[];
    secondary: string[];
  };
  ingredientsToAvoid: string[];
  routinePatterns: {
    am: string[];
    pm: string[];
    frequency: string;
  };
  productCategories: string[];
  lifestyleNotes: string[];
  severityConsiderations: {
    mild: string;
    moderate: string;
    severe: string;
  };
  relatedConcerns: ConcernId[];
}

/**
 * Concern explanation result
 */
export interface ConcernExplanation {
  concern: string;
  summary: string;
  rootCauses: string[];
  visibleSigns: string[];
  recommendedIngredients: string[];
  ingredientsToAvoid: string[];
  routineGuidance: {
    am: string;
    pm: string;
    tips: string[];
  };
  productCategories: string[];
  personalizedNote?: string;
  navigationUrl: string;
  ingredientUrls: Array<{ name: string; url: string }>;
}

/**
 * Concern-to-ingredient mapping result
 */
export interface ConcernIngredientMapping {
  concern: string;
  primaryIngredients: Array<{
    name: string;
    reason: string;
    strength: 'gentle' | 'moderate' | 'strong';
  }>;
  secondaryIngredients: Array<{
    name: string;
    reason: string;
  }>;
  ingredientsToAvoid: Array<{
    name: string;
    reason: string;
  }>;
}

/**
 * Concern-to-routine mapping result
 */
export interface ConcernRoutineMapping {
  concern: string;
  amRoutine: {
    steps: string[];
    keyIngredients: string[];
    notes: string;
  };
  pmRoutine: {
    steps: string[];
    keyIngredients: string[];
    notes: string;
  };
  frequency: string;
  conflicts: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert concern name to URL-friendly slug
 */
export function toConcernSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Convert ingredient name to URL-friendly slug
 */
function toIngredientSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ============================================================================
// Concern Encyclopedia
// ============================================================================

export const CONCERN_ENCYCLOPEDIA: Record<ConcernId, ConcernKnowledge> = {
  'acne': {
    id: 'acne',
    name: 'Acne',
    aliases: ['breakouts', 'pimples', 'blemishes', 'spots'],
    description: 'Inflammatory skin condition causing pimples, blackheads, and clogged pores due to excess oil, dead skin cells, and bacteria.',
    rootCauses: [
      'Excess sebum production',
      'Clogged pores from dead skin cells',
      'Bacteria (C. acnes)',
      'Hormonal fluctuations',
      'Using pore-clogging products',
    ],
    visibleSigns: [
      'Red, inflamed bumps',
      'Whiteheads and blackheads',
      'Pustules with visible pus',
      'Cysts or nodules (severe)',
      'Post-acne marks or scarring',
    ],
    recommendedIngredients: {
      primary: ['salicylic acid', 'benzoyl peroxide', 'niacinamide', 'retinol'],
      secondary: ['azelaic acid', 'tea tree', 'zinc', 'sulfur'],
    },
    ingredientsToAvoid: ['heavy oils', 'coconut oil', 'comedogenic ingredients', 'alcohol (drying)'],
    routinePatterns: {
      am: ['gentle cleanser', 'niacinamide serum', 'lightweight moisturizer', 'sunscreen'],
      pm: ['cleanser', 'salicylic acid or benzoyl peroxide', 'retinol (alternate nights)', 'moisturizer'],
      frequency: 'Use actives 2-3x/week initially, increase as tolerated',
    },
    productCategories: ['cleanser', 'treatment', 'serum', 'spot treatment'],
    lifestyleNotes: [
      'Avoid touching face',
      'Change pillowcases frequently',
      'Non-comedogenic products only',
      'Be patient - results take 6-8 weeks',
    ],
    severityConsiderations: {
      mild: 'Gentle salicylic acid cleanser and niacinamide may be sufficient.',
      moderate: 'Add benzoyl peroxide or retinol as targeted treatments.',
      severe: 'Consider consulting a dermatologist for prescription options.',
    },
    relatedConcerns: ['oiliness', 'large-pores', 'texture', 'blackheads'],
  },

  'blackheads': {
    id: 'blackheads',
    name: 'Blackheads',
    aliases: ['open comedones', 'clogged pores'],
    description: 'Open clogged pores that appear dark due to oxidized sebum and dead skin cells.',
    rootCauses: [
      'Excess oil production',
      'Incomplete cleansing',
      'Dead skin cell buildup',
      'Using heavy or occlusive products',
    ],
    visibleSigns: [
      'Small dark spots on nose, chin, forehead',
      'Rough texture in T-zone',
      'Visible pore congestion',
    ],
    recommendedIngredients: {
      primary: ['salicylic acid', 'retinol', 'niacinamide'],
      secondary: ['clay', 'charcoal', 'glycolic acid'],
    },
    ingredientsToAvoid: ['heavy oils', 'comedogenic ingredients'],
    routinePatterns: {
      am: ['gentle cleanser', 'niacinamide', 'moisturizer', 'sunscreen'],
      pm: ['oil cleanser', 'salicylic acid cleanser or toner', 'retinol', 'moisturizer'],
      frequency: 'BHA 2-3x/week, clay mask 1x/week',
    },
    productCategories: ['cleanser', 'toner', 'mask', 'serum'],
    lifestyleNotes: [
      'Double cleanse in PM',
      'Never squeeze or extract',
      'Use non-comedogenic products',
    ],
    severityConsiderations: {
      mild: 'Weekly salicylic acid treatment and clay mask.',
      moderate: 'Regular BHA use and retinol at night.',
      severe: 'Professional extractions may help alongside consistent routine.',
    },
    relatedConcerns: ['acne', 'oiliness', 'large-pores'],
  },

  'whiteheads': {
    id: 'whiteheads',
    name: 'Whiteheads',
    aliases: ['closed comedones', 'milia'],
    description: 'Closed clogged pores that appear as small white or flesh-colored bumps.',
    rootCauses: [
      'Clogged pores trapped under skin',
      'Heavy product buildup',
      'Slow cell turnover',
    ],
    visibleSigns: [
      'Small flesh-colored bumps',
      'Rough texture',
      'Bumps that do not come to a head',
    ],
    recommendedIngredients: {
      primary: ['retinol', 'salicylic acid', 'adapalene'],
      secondary: ['glycolic acid', 'niacinamide'],
    },
    ingredientsToAvoid: ['heavy creams', 'occlusive layers over active breakouts'],
    routinePatterns: {
      am: ['gentle cleanser', 'lightweight moisturizer', 'sunscreen'],
      pm: ['cleanser', 'retinol or BHA', 'gel moisturizer'],
      frequency: 'Retinol 2-3x/week, building to nightly',
    },
    productCategories: ['cleanser', 'treatment', 'serum'],
    lifestyleNotes: [
      'Be patient - takes weeks to clear',
      'Do not pick or squeeze',
      'Expect purging with retinol',
    ],
    severityConsiderations: {
      mild: 'Gentle exfoliation with BHA may resolve.',
      moderate: 'Retinol is typically most effective.',
      severe: 'Prescription retinoid may be needed.',
    },
    relatedConcerns: ['acne', 'texture'],
  },

  'hyperpigmentation': {
    id: 'hyperpigmentation',
    name: 'Hyperpigmentation',
    aliases: ['dark patches', 'melasma', 'sun spots', 'age spots'],
    description: 'Areas of skin that appear darker than surrounding skin due to excess melanin production.',
    rootCauses: [
      'Sun exposure (primary cause)',
      'Hormonal changes (melasma)',
      'Post-inflammatory (after acne/injury)',
      'Aging',
    ],
    visibleSigns: [
      'Patches darker than surrounding skin',
      'Uneven skin tone',
      'Spots on sun-exposed areas',
    ],
    recommendedIngredients: {
      primary: ['vitamin c', 'niacinamide', 'azelaic acid', 'alpha arbutin'],
      secondary: ['retinol', 'tranexamic acid', 'kojic acid', 'licorice root'],
    },
    ingredientsToAvoid: ['irritating ingredients that cause inflammation', 'skipping sunscreen'],
    routinePatterns: {
      am: ['gentle cleanser', 'vitamin c serum', 'moisturizer', 'spf 30+ (essential)'],
      pm: ['cleanser', 'azelaic acid or retinol', 'niacinamide', 'moisturizer'],
      frequency: 'Consistent daily use for 3-6 months',
    },
    productCategories: ['serum', 'treatment', 'sunscreen'],
    lifestyleNotes: [
      'SPF is non-negotiable',
      'Reapply sunscreen every 2 hours outdoors',
      'Be patient - fading takes months',
      'Avoid picking at skin',
    ],
    severityConsiderations: {
      mild: 'Vitamin C and niacinamide with diligent SPF.',
      moderate: 'Add azelaic acid or retinol for faster results.',
      severe: 'Consider professional treatments alongside topicals.',
    },
    relatedConcerns: ['dark-spots', 'uneven-tone', 'aging'],
  },

  'dark-spots': {
    id: 'dark-spots',
    name: 'Dark Spots',
    aliases: ['post-inflammatory hyperpigmentation', 'PIH', 'acne marks', 'sun spots'],
    description: 'Localized areas of darkened skin, often from past breakouts, injuries, or sun damage.',
    rootCauses: [
      'Post-acne inflammation',
      'Sun damage',
      'Skin injuries or picking',
      'Hormonal changes',
    ],
    visibleSigns: [
      'Flat dark marks (not raised)',
      'Brown, red, or purple discoloration',
      'Located where breakouts occurred',
    ],
    recommendedIngredients: {
      primary: ['vitamin c', 'niacinamide', 'azelaic acid', 'retinol'],
      secondary: ['alpha arbutin', 'tranexamic acid', 'glycolic acid'],
    },
    ingredientsToAvoid: ['picking at spots', 'skipping spf'],
    routinePatterns: {
      am: ['cleanser', 'vitamin c', 'moisturizer', 'sunscreen spf 30+'],
      pm: ['cleanser', 'niacinamide or azelaic acid', 'retinol (alternate nights)', 'moisturizer'],
      frequency: 'Daily vitamin C, retinol 2-3x/week',
    },
    productCategories: ['serum', 'treatment', 'sunscreen'],
    lifestyleNotes: [
      'Do not pick at breakouts',
      'Sun protection prevents darkening',
      'Takes 3-6 months to fade',
    ],
    severityConsiderations: {
      mild: 'Vitamin C and niacinamide.',
      moderate: 'Add retinol or azelaic acid.',
      severe: 'Consider professional treatments like chemical peels.',
    },
    relatedConcerns: ['hyperpigmentation', 'acne', 'uneven-tone'],
  },

  'redness': {
    id: 'redness',
    name: 'Redness',
    aliases: ['flushing', 'erythema', 'rosacea-like'],
    description: 'Persistent or recurring facial redness, often indicating sensitivity or inflammation.',
    rootCauses: [
      'Sensitive or reactive skin',
      'Rosacea',
      'Over-exfoliation',
      'Environmental triggers',
      'Damaged skin barrier',
    ],
    visibleSigns: [
      'Flushed cheeks, nose, chin',
      'Visible blood vessels',
      'Skin that reacts easily',
      'Warmth or burning sensation',
    ],
    recommendedIngredients: {
      primary: ['centella asiatica', 'niacinamide', 'azelaic acid', 'green tea'],
      secondary: ['aloe vera', 'chamomile', 'allantoin', 'licorice root'],
    },
    ingredientsToAvoid: ['alcohol', 'fragrance', 'strong acids', 'high-strength retinoids', 'menthol', 'eucalyptus'],
    routinePatterns: {
      am: ['gentle creamy cleanser', 'centella or niacinamide serum', 'soothing moisturizer', 'mineral sunscreen'],
      pm: ['gentle cleanser', 'azelaic acid (if tolerated)', 'barrier-repair moisturizer'],
      frequency: 'Gentle products daily, actives slowly introduced',
    },
    productCategories: ['cleanser', 'serum', 'moisturizer', 'sunscreen'],
    lifestyleNotes: [
      'Identify and avoid triggers',
      'Use lukewarm water',
      'Mineral sunscreen may be better tolerated',
      'Patch test everything',
    ],
    severityConsiderations: {
      mild: 'Soothing ingredients like centella and niacinamide.',
      moderate: 'Add azelaic acid, avoid all irritants.',
      severe: 'Consult a dermatologist - may be rosacea.',
    },
    relatedConcerns: ['sensitivity', 'barrier-damage'],
  },

  'sensitivity': {
    id: 'sensitivity',
    name: 'Sensitivity',
    aliases: ['reactive skin', 'easily irritated skin'],
    description: 'Skin that reacts easily to products or environmental factors with stinging, burning, or irritation.',
    rootCauses: [
      'Compromised skin barrier',
      'Genetic predisposition',
      'Over-use of actives',
      'Environmental factors',
      'Allergies or sensitivities',
    ],
    visibleSigns: [
      'Stinging or burning with products',
      'Redness after product application',
      'Dryness and flaking',
      'Reactions to many products',
    ],
    recommendedIngredients: {
      primary: ['ceramides', 'centella asiatica', 'panthenol', 'oat extract'],
      secondary: ['squalane', 'allantoin', 'aloe vera', 'hyaluronic acid'],
    },
    ingredientsToAvoid: ['fragrance', 'essential oils', 'alcohol', 'strong acids', 'high-strength retinoids', 'vitamin c (l-ascorbic acid)'],
    routinePatterns: {
      am: ['gentle creamy cleanser', 'hydrating serum', 'barrier moisturizer', 'mineral sunscreen'],
      pm: ['gentle cleanser', 'soothing serum', 'rich barrier cream'],
      frequency: 'Minimal routine, one new product at a time',
    },
    productCategories: ['cleanser', 'moisturizer', 'serum'],
    lifestyleNotes: [
      'Patch test all new products',
      'Introduce one product at a time',
      'Simplify routine',
      'Avoid hot water',
    ],
    severityConsiderations: {
      mild: 'Focus on barrier repair with ceramides.',
      moderate: 'Eliminate all potential irritants, simplify routine.',
      severe: 'See a dermatologist to rule out conditions.',
    },
    relatedConcerns: ['redness', 'barrier-damage', 'dryness'],
  },

  'dryness': {
    id: 'dryness',
    name: 'Dryness',
    aliases: ['dry skin', 'flaky skin', 'rough patches'],
    description: 'Skin lacking oil (sebum) production, leading to tightness, flaking, and rough texture.',
    rootCauses: [
      'Naturally low sebum production',
      'Environmental factors (cold, wind)',
      'Over-cleansing or harsh products',
      'Aging',
      'Certain medications',
    ],
    visibleSigns: [
      'Tight, uncomfortable feeling',
      'Flaking or peeling',
      'Rough texture',
      'Dull appearance',
      'Fine lines more visible',
    ],
    recommendedIngredients: {
      primary: ['hyaluronic acid', 'ceramides', 'squalane', 'glycerin'],
      secondary: ['shea butter', 'jojoba oil', 'panthenol', 'fatty acids'],
    },
    ingredientsToAvoid: ['alcohol', 'harsh sulfates', 'over-exfoliation', 'astringents'],
    routinePatterns: {
      am: ['creamy cleanser', 'hyaluronic acid serum', 'rich moisturizer', 'sunscreen'],
      pm: ['gentle cleanser', 'hydrating serum', 'facial oil', 'occlusive moisturizer'],
      frequency: 'Hydrating products daily, exfoliate gently 1x/week max',
    },
    productCategories: ['cleanser', 'serum', 'moisturizer', 'oil'],
    lifestyleNotes: [
      'Apply products to damp skin',
      'Use a humidifier',
      'Drink plenty of water',
      'Avoid very hot showers',
    ],
    severityConsiderations: {
      mild: 'Add hyaluronic acid and richer moisturizer.',
      moderate: 'Layer hydrating products, add facial oil.',
      severe: 'Occlusive products at night, avoid all drying ingredients.',
    },
    relatedConcerns: ['dehydration', 'sensitivity', 'barrier-damage'],
  },

  'oiliness': {
    id: 'oiliness',
    name: 'Oiliness',
    aliases: ['oily skin', 'excess sebum', 'shiny skin', 'greasy skin'],
    description: 'Overproduction of sebum leading to a shiny appearance and potentially clogged pores.',
    rootCauses: [
      'Genetics',
      'Hormonal factors',
      'Over-stripping skin (reactive oiliness)',
      'Humidity and heat',
      'Using wrong products',
    ],
    visibleSigns: [
      'Shiny T-zone or full face',
      'Makeup sliding off',
      'Visible pores',
      'Frequent breakouts',
    ],
    recommendedIngredients: {
      primary: ['niacinamide', 'salicylic acid', 'zinc pca', 'clay'],
      secondary: ['retinol', 'green tea', 'witch hazel'],
    },
    ingredientsToAvoid: ['heavy oils', 'thick creams', 'over-drying products (counterproductive)'],
    routinePatterns: {
      am: ['gel cleanser', 'niacinamide serum', 'lightweight gel moisturizer', 'mattifying sunscreen'],
      pm: ['cleanser', 'salicylic acid toner', 'retinol', 'lightweight moisturizer'],
      frequency: 'BHA 2-3x/week, do not skip moisturizer',
    },
    productCategories: ['cleanser', 'toner', 'serum', 'moisturizer'],
    lifestyleNotes: [
      'Do not over-wash (triggers more oil)',
      'Always moisturize',
      'Blotting papers during day',
      'Oil-free and non-comedogenic products',
    ],
    severityConsiderations: {
      mild: 'Niacinamide and lightweight products.',
      moderate: 'Add BHA and clay masks.',
      severe: 'Consider retinol, do not over-strip.',
    },
    relatedConcerns: ['acne', 'large-pores', 'blackheads'],
  },

  'dehydration': {
    id: 'dehydration',
    name: 'Dehydration',
    aliases: ['dehydrated skin', 'water loss', 'thirsty skin'],
    description: 'Skin lacking water (not oil), which can affect any skin type. Different from dryness.',
    rootCauses: [
      'Impaired skin barrier',
      'Not drinking enough water',
      'Environmental factors',
      'Over-exfoliation',
      'Using wrong products',
    ],
    visibleSigns: [
      'Tight feeling despite oiliness',
      'Fine lines more visible when dehydrated',
      'Dull, lackluster appearance',
      'Skin feels thin',
      'Makeup looks patchy',
    ],
    recommendedIngredients: {
      primary: ['hyaluronic acid', 'glycerin', 'beta-glucan', 'panthenol'],
      secondary: ['ceramides', 'squalane', 'aloe vera'],
    },
    ingredientsToAvoid: ['alcohol', 'over-exfoliation', 'harsh cleansers'],
    routinePatterns: {
      am: ['hydrating cleanser', 'hyaluronic acid on damp skin', 'moisturizer to seal', 'sunscreen'],
      pm: ['gentle cleanser', 'hydrating toner', 'hyaluronic acid', 'moisturizer'],
      frequency: 'Hydrating products at every step, reduce actives temporarily',
    },
    productCategories: ['toner', 'serum', 'moisturizer', 'mist'],
    lifestyleNotes: [
      'Apply HA to damp skin',
      'Layer hydrating products',
      'Drink water',
      'Use a humidifier',
    ],
    severityConsiderations: {
      mild: 'Add hyaluronic acid serum.',
      moderate: 'Layer hydrating toner + serum + moisturizer.',
      severe: 'Temporarily stop all actives, focus only on hydration.',
    },
    relatedConcerns: ['dryness', 'dullness', 'fine-lines'],
  },

  'texture': {
    id: 'texture',
    name: 'Texture',
    aliases: ['uneven texture', 'rough skin', 'bumpy skin', 'orange peel skin'],
    description: 'Uneven skin surface with bumps, roughness, or irregularities.',
    rootCauses: [
      'Dead skin cell buildup',
      'Clogged pores',
      'Sun damage',
      'Acne scarring',
      'Slow cell turnover',
    ],
    visibleSigns: [
      'Rough to the touch',
      'Visible bumps',
      'Uneven surface',
      'Makeup does not apply smoothly',
    ],
    recommendedIngredients: {
      primary: ['glycolic acid', 'retinol', 'lactic acid', 'niacinamide'],
      secondary: ['salicylic acid', 'mandelic acid', 'pha'],
    },
    ingredientsToAvoid: ['over-exfoliation', 'physical scrubs with harsh particles'],
    routinePatterns: {
      am: ['gentle cleanser', 'niacinamide', 'moisturizer', 'sunscreen'],
      pm: ['cleanser', 'aha or retinol', 'moisturizer'],
      frequency: 'Chemical exfoliant 2-3x/week, retinol on alternate nights',
    },
    productCategories: ['exfoliant', 'serum', 'treatment'],
    lifestyleNotes: [
      'Be patient - texture takes time',
      'Do not over-exfoliate',
      'Sunscreen essential with exfoliants',
    ],
    severityConsiderations: {
      mild: 'Weekly AHA treatment.',
      moderate: 'Regular exfoliation plus retinol.',
      severe: 'May need professional treatments.',
    },
    relatedConcerns: ['acne', 'dullness', 'large-pores'],
  },

  'fine-lines': {
    id: 'fine-lines',
    name: 'Fine Lines',
    aliases: ['early wrinkles', 'expression lines', 'crows feet'],
    description: 'Shallow lines that appear with age, dehydration, or repeated facial expressions.',
    rootCauses: [
      'Natural aging',
      'Sun damage',
      'Dehydration',
      'Repeated facial expressions',
      'Loss of collagen',
    ],
    visibleSigns: [
      'Shallow lines around eyes and mouth',
      'Lines visible when skin is dry',
      'Expression lines that linger',
    ],
    recommendedIngredients: {
      primary: ['retinol', 'peptides', 'hyaluronic acid', 'vitamin c'],
      secondary: ['niacinamide', 'bakuchiol', 'ceramides'],
    },
    ingredientsToAvoid: ['drying alcohols', 'harsh products'],
    routinePatterns: {
      am: ['gentle cleanser', 'vitamin c', 'hyaluronic acid', 'peptide moisturizer', 'sunscreen spf 30+'],
      pm: ['cleanser', 'retinol', 'peptide serum', 'rich moisturizer'],
      frequency: 'Daily antioxidants, retinol 2-3x/week building to nightly',
    },
    productCategories: ['serum', 'moisturizer', 'eye cream', 'sunscreen'],
    lifestyleNotes: [
      'Sunscreen prevents further damage',
      'Stay hydrated',
      'Retinol is gold standard',
      'Be consistent',
    ],
    severityConsiderations: {
      mild: 'Hydration and peptides.',
      moderate: 'Add retinol and vitamin C.',
      severe: 'Consistent retinol use, consider professional treatments.',
    },
    relatedConcerns: ['wrinkles', 'dehydration', 'aging'],
  },

  'wrinkles': {
    id: 'wrinkles',
    name: 'Wrinkles',
    aliases: ['deep lines', 'creases', 'aging lines'],
    description: 'Deeper creases in the skin from collagen loss, sun damage, and natural aging.',
    rootCauses: [
      'Collagen and elastin breakdown',
      'Cumulative sun damage',
      'Natural aging process',
      'Smoking',
      'Repeated expressions',
    ],
    visibleSigns: [
      'Deep creases',
      'Folds in skin',
      'Loss of skin firmness',
      'Lines visible at rest',
    ],
    recommendedIngredients: {
      primary: ['retinol', 'peptides', 'vitamin c', 'niacinamide'],
      secondary: ['hyaluronic acid', 'ceramides', 'growth factors'],
    },
    ingredientsToAvoid: ['drying products', 'irritating ingredients'],
    routinePatterns: {
      am: ['gentle cleanser', 'vitamin c', 'peptide serum', 'moisturizer', 'sunscreen spf 50'],
      pm: ['cleanser', 'retinol', 'peptides', 'rich night cream'],
      frequency: 'Consistent daily routine, retinol nightly if tolerated',
    },
    productCategories: ['serum', 'treatment', 'moisturizer', 'sunscreen'],
    lifestyleNotes: [
      'Prevention is key - always wear SPF',
      'Consistency over intensity',
      'Consider professional treatments',
    ],
    severityConsiderations: {
      mild: 'Retinol and peptides.',
      moderate: 'Higher strength retinol, professional advice.',
      severe: 'May need in-office treatments alongside topicals.',
    },
    relatedConcerns: ['fine-lines', 'aging', 'dullness'],
  },

  'dullness': {
    id: 'dullness',
    name: 'Dullness',
    aliases: ['dull skin', 'lackluster skin', 'tired-looking skin', 'sallow skin'],
    description: 'Skin that lacks radiance, appears flat, tired, or has a grayish cast.',
    rootCauses: [
      'Dead skin cell buildup',
      'Dehydration',
      'Poor circulation',
      'Lack of sleep',
      'Environmental factors',
    ],
    visibleSigns: [
      'Lack of glow or radiance',
      'Grayish or sallow undertone',
      'Tired-looking skin',
      'Uneven tone',
    ],
    recommendedIngredients: {
      primary: ['vitamin c', 'glycolic acid', 'niacinamide', 'hyaluronic acid'],
      secondary: ['lactic acid', 'azelaic acid', 'fermented ingredients'],
    },
    ingredientsToAvoid: ['over-drying products'],
    routinePatterns: {
      am: ['cleanser', 'vitamin c serum', 'hydrating serum', 'moisturizer', 'sunscreen'],
      pm: ['cleanser', 'aha exfoliant', 'niacinamide', 'moisturizer'],
      frequency: 'Vitamin C daily, exfoliate 2-3x/week',
    },
    productCategories: ['serum', 'exfoliant', 'mask', 'toner'],
    lifestyleNotes: [
      'Exfoliation reveals brighter skin',
      'Hydration adds glow',
      'Sleep and water intake matter',
    ],
    severityConsiderations: {
      mild: 'Weekly exfoliation and vitamin C.',
      moderate: 'Regular AHA use plus vitamin C.',
      severe: 'Professional treatments like chemical peels.',
    },
    relatedConcerns: ['texture', 'dehydration', 'uneven-tone'],
  },

  'barrier-damage': {
    id: 'barrier-damage',
    name: 'Barrier Damage',
    aliases: ['compromised barrier', 'damaged skin barrier', 'over-exfoliated skin'],
    description: 'Weakened skin barrier leading to sensitivity, dryness, and inability to tolerate products.',
    rootCauses: [
      'Over-exfoliation',
      'Too many actives',
      'Harsh cleansers',
      'Environmental damage',
      'Retinol overuse',
    ],
    visibleSigns: [
      'Stinging with any product',
      'Extreme sensitivity',
      'Redness and irritation',
      'Tight, dry feeling',
      'Products that used to work now irritate',
    ],
    recommendedIngredients: {
      primary: ['ceramides', 'cholesterol', 'fatty acids', 'panthenol'],
      secondary: ['centella asiatica', 'squalane', 'niacinamide', 'oat extract'],
    },
    ingredientsToAvoid: ['all actives', 'exfoliants', 'retinol', 'vitamin c', 'acids', 'fragrance'],
    routinePatterns: {
      am: ['gentle cream cleanser', 'barrier repair moisturizer', 'mineral sunscreen'],
      pm: ['gentle cleanser', 'barrier repair serum', 'ceramide-rich cream'],
      frequency: 'Minimal routine only, no actives for 2-4 weeks',
    },
    productCategories: ['cleanser', 'moisturizer', 'serum'],
    lifestyleNotes: [
      'Stop all actives immediately',
      'Simplify to cleanser + moisturizer + SPF',
      'Takes 2-4 weeks to heal',
      'Reintroduce actives slowly after recovery',
    ],
    severityConsiderations: {
      mild: 'Reduce actives, add ceramides.',
      moderate: 'Stop all actives, focus on barrier repair.',
      severe: 'Bare minimum routine, may need dermatologist.',
    },
    relatedConcerns: ['sensitivity', 'redness', 'dryness'],
  },

  'large-pores': {
    id: 'large-pores',
    name: 'Large Pores',
    aliases: ['visible pores', 'enlarged pores', 'open pores'],
    description: 'Visibly enlarged pores, often on the nose, cheeks, and forehead.',
    rootCauses: [
      'Genetics (primary factor)',
      'Excess oil production',
      'Age-related loss of elasticity',
      'Sun damage',
      'Clogged pores stretching',
    ],
    visibleSigns: [
      'Visible pore openings',
      'Orange peel texture',
      'More prominent in T-zone',
    ],
    recommendedIngredients: {
      primary: ['niacinamide', 'retinol', 'salicylic acid', 'clay'],
      secondary: ['glycolic acid', 'zinc pca'],
    },
    ingredientsToAvoid: ['pore-clogging ingredients', 'heavy oils'],
    routinePatterns: {
      am: ['gel cleanser', 'niacinamide serum', 'lightweight moisturizer', 'sunscreen'],
      pm: ['oil cleanser', 'gel cleanser', 'retinol or bha', 'moisturizer'],
      frequency: 'Niacinamide daily, BHA 2-3x/week, retinol alternate nights',
    },
    productCategories: ['serum', 'cleanser', 'toner', 'mask'],
    lifestyleNotes: [
      'Cannot shrink pores but can minimize appearance',
      'Keep pores clean to prevent stretching',
      'Sunscreen prevents elasticity loss',
    ],
    severityConsiderations: {
      mild: 'Niacinamide and regular cleansing.',
      moderate: 'Add BHA and retinol.',
      severe: 'Consistent routine plus professional treatments.',
    },
    relatedConcerns: ['oiliness', 'blackheads', 'texture'],
  },

  'uneven-tone': {
    id: 'uneven-tone',
    name: 'Uneven Tone',
    aliases: ['uneven skin tone', 'discoloration', 'patchy skin'],
    description: 'Inconsistent skin coloring with darker or lighter patches across the face.',
    rootCauses: [
      'Sun exposure',
      'Post-inflammatory changes',
      'Hormonal influences',
      'Acne scarring',
    ],
    visibleSigns: [
      'Patches of different colors',
      'Redness in some areas',
      'Dark spots mixed with normal skin',
    ],
    recommendedIngredients: {
      primary: ['vitamin c', 'niacinamide', 'azelaic acid', 'alpha arbutin'],
      secondary: ['retinol', 'kojic acid', 'licorice root'],
    },
    ingredientsToAvoid: ['irritating ingredients', 'skipping sunscreen'],
    routinePatterns: {
      am: ['gentle cleanser', 'vitamin c', 'moisturizer', 'sunscreen spf 30+'],
      pm: ['cleanser', 'niacinamide or azelaic acid', 'retinol (alternate nights)', 'moisturizer'],
      frequency: 'Brightening ingredients daily, consistent for months',
    },
    productCategories: ['serum', 'treatment', 'sunscreen'],
    lifestyleNotes: [
      'SPF prevents further discoloration',
      'Patience required - takes months',
      'Consistency is key',
    ],
    severityConsiderations: {
      mild: 'Vitamin C and niacinamide.',
      moderate: 'Add azelaic acid or retinol.',
      severe: 'Professional treatments may accelerate results.',
    },
    relatedConcerns: ['hyperpigmentation', 'dark-spots', 'dullness'],
  },

  'aging': {
    id: 'aging',
    name: 'Aging',
    aliases: ['anti-aging', 'mature skin', 'age prevention'],
    description: 'General signs of skin aging including wrinkles, loss of firmness, and uneven tone.',
    rootCauses: [
      'Intrinsic aging (natural)',
      'Extrinsic aging (sun, environment)',
      'Collagen loss',
      'Decreased cell turnover',
    ],
    visibleSigns: [
      'Fine lines and wrinkles',
      'Loss of firmness',
      'Thinner skin',
      'Age spots',
      'Dryness',
    ],
    recommendedIngredients: {
      primary: ['retinol', 'vitamin c', 'peptides', 'niacinamide'],
      secondary: ['hyaluronic acid', 'ceramides', 'antioxidants', 'growth factors'],
    },
    ingredientsToAvoid: ['harsh products', 'over-drying ingredients'],
    routinePatterns: {
      am: ['gentle cleanser', 'vitamin c', 'peptide serum', 'moisturizer', 'sunscreen spf 50'],
      pm: ['cleanser', 'retinol', 'peptides', 'rich night cream', 'eye cream'],
      frequency: 'Comprehensive routine, retinol nightly if tolerated',
    },
    productCategories: ['serum', 'treatment', 'moisturizer', 'eye cream', 'sunscreen'],
    lifestyleNotes: [
      'Sunscreen is best anti-aging product',
      'Start retinol early for prevention',
      'Hydration plumps skin',
      'Consistency over time',
    ],
    severityConsiderations: {
      mild: 'Prevention focus - SPF and antioxidants.',
      moderate: 'Retinol, peptides, vitamin C.',
      severe: 'High-strength products plus professional treatments.',
    },
    relatedConcerns: ['wrinkles', 'fine-lines', 'dullness', 'dryness'],
  },
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get concern knowledge from encyclopedia
 */
export function getConcernKnowledge(concern: string): ConcernKnowledge | null {
  const key = concern.toLowerCase().replace(/\s+/g, '-') as ConcernId;

  // Direct match
  if (CONCERN_ENCYCLOPEDIA[key]) {
    return CONCERN_ENCYCLOPEDIA[key];
  }

  // Search by name or alias
  for (const [, v] of Object.entries(CONCERN_ENCYCLOPEDIA)) {
    if (v.name.toLowerCase() === concern.toLowerCase()) {
      return v;
    }
    if (v.aliases.some(a => a.toLowerCase() === concern.toLowerCase())) {
      return v;
    }
  }

  return null;
}

/**
 * Generate personalized concern explanation
 */
export function explainConcern(
  concern: string,
  userProfile?: ConcernUserProfile
): ConcernExplanation | null {
  const knowledge = getConcernKnowledge(concern);

  if (!knowledge) {
    return null;
  }

  // Build personalized note
  let personalizedNote: string | undefined;

  if (userProfile) {
    const notes: string[] = [];

    // Skin type relevance
    if (userProfile.skinType) {
      const skinType = userProfile.skinType.toLowerCase();
      if (knowledge.id === 'oiliness' && skinType === 'oily') {
        notes.push('especially relevant for your oily skin type');
      } else if (knowledge.id === 'dryness' && skinType === 'dry') {
        notes.push('a primary concern for your dry skin type');
      } else if (knowledge.id === 'sensitivity' && skinType === 'sensitive') {
        notes.push('central to managing your sensitive skin');
      }
    }

    // Sensitivity consideration
    if (userProfile.sensitivities && userProfile.sensitivities.length > 0) {
      notes.push('I\'ll focus on gentle options given your sensitivities');
    }

    // Experience level
    if (userProfile.experienceLevel === 'beginner') {
      notes.push('recommending beginner-friendly ingredients');
    }

    // Related concerns
    if (userProfile.concerns) {
      const relatedUserConcerns = userProfile.concerns.filter(c =>
        knowledge.relatedConcerns.includes(c.toLowerCase().replace(/\s+/g, '-') as ConcernId)
      );
      if (relatedUserConcerns.length > 0) {
        notes.push(`also addresses your ${relatedUserConcerns.join(' and ')} concerns`);
      }
    }

    if (notes.length > 0) {
      personalizedNote = `For your profile: ${notes.join('; ')}.`;
    }
  }

  // Filter ingredients based on experience level
  let recommendedIngredients = [...knowledge.recommendedIngredients.primary];
  if (userProfile?.experienceLevel === 'beginner') {
    // Filter out strong actives for beginners
    const gentleOptions = recommendedIngredients.filter(i =>
      !['retinol', 'benzoyl peroxide', 'glycolic acid'].includes(i.toLowerCase())
    );
    if (gentleOptions.length > 0) {
      recommendedIngredients = gentleOptions;
    }
  }

  // Build ingredient URLs
  const ingredientUrls = recommendedIngredients.map(name => ({
    name,
    url: `/ingredients/${toIngredientSlug(name)}`,
  }));

  return {
    concern: knowledge.name,
    summary: knowledge.description,
    rootCauses: knowledge.rootCauses,
    visibleSigns: knowledge.visibleSigns,
    recommendedIngredients,
    ingredientsToAvoid: knowledge.ingredientsToAvoid,
    routineGuidance: {
      am: knowledge.routinePatterns.am.join(' → '),
      pm: knowledge.routinePatterns.pm.join(' → '),
      tips: knowledge.lifestyleNotes,
    },
    productCategories: knowledge.productCategories,
    personalizedNote,
    navigationUrl: `/learn/${toConcernSlug(knowledge.name)}`,
    ingredientUrls,
  };
}

/**
 * Get concern-to-ingredient mapping
 */
export function getConcernIngredientMapping(
  concern: string,
  userProfile?: ConcernUserProfile
): ConcernIngredientMapping | null {
  const knowledge = getConcernKnowledge(concern);

  if (!knowledge) {
    return null;
  }

  const isBeginnerOrSensitive =
    userProfile?.experienceLevel === 'beginner' ||
    (userProfile?.sensitivities && userProfile.sensitivities.length > 0);

  // Map primary ingredients with strength
  const primaryIngredients = knowledge.recommendedIngredients.primary.map(name => {
    const ingredientKnowledge = INGREDIENT_ENCYCLOPEDIA[name.toLowerCase().replace(/\s+/g, '-')];
    let strength: 'gentle' | 'moderate' | 'strong' = 'moderate';

    if (['niacinamide', 'hyaluronic acid', 'ceramides', 'centella asiatica', 'panthenol'].includes(name.toLowerCase())) {
      strength = 'gentle';
    } else if (['retinol', 'benzoyl peroxide', 'glycolic acid'].includes(name.toLowerCase())) {
      strength = 'strong';
    }

    return {
      name,
      reason: ingredientKnowledge?.benefits[0] || `Helps address ${knowledge.name.toLowerCase()}`,
      strength,
    };
  });

  // Sort by strength if beginner/sensitive (gentle first)
  if (isBeginnerOrSensitive) {
    primaryIngredients.sort((a, b) => {
      const order = { gentle: 0, moderate: 1, strong: 2 };
      return order[a.strength] - order[b.strength];
    });
  }

  const secondaryIngredients = knowledge.recommendedIngredients.secondary.map(name => ({
    name,
    reason: `Supporting ingredient for ${knowledge.name.toLowerCase()}`,
  }));

  const ingredientsToAvoid = knowledge.ingredientsToAvoid.map(name => ({
    name,
    reason: `May worsen ${knowledge.name.toLowerCase()} or cause irritation`,
  }));

  return {
    concern: knowledge.name,
    primaryIngredients,
    secondaryIngredients,
    ingredientsToAvoid,
  };
}

/**
 * Get concern-to-routine mapping
 */
export function getConcernRoutineMapping(
  concern: string,
  userProfile?: ConcernUserProfile
): ConcernRoutineMapping | null {
  const knowledge = getConcernKnowledge(concern);

  if (!knowledge) {
    return null;
  }

  // Adjust for beginners
  const amSteps = [...knowledge.routinePatterns.am];
  const pmSteps = [...knowledge.routinePatterns.pm];
  const amKeyIngredients = knowledge.recommendedIngredients.primary.filter(i =>
    !['retinol', 'glycolic acid', 'salicylic acid'].includes(i.toLowerCase())
  );
  let pmKeyIngredients = knowledge.recommendedIngredients.primary;

  if (userProfile?.experienceLevel === 'beginner') {
    // Simplify for beginners
    pmKeyIngredients = pmKeyIngredients.filter(i =>
      !['retinol', 'benzoyl peroxide'].includes(i.toLowerCase())
    );
  }

  // Build conflicts list
  const conflicts: string[] = [];
  if (knowledge.recommendedIngredients.primary.includes('retinol')) {
    conflicts.push('Avoid using retinol with AHAs/BHAs in same routine');
  }
  if (knowledge.recommendedIngredients.primary.includes('vitamin c')) {
    conflicts.push('Use vitamin C in AM for antioxidant protection');
  }

  return {
    concern: knowledge.name,
    amRoutine: {
      steps: amSteps,
      keyIngredients: amKeyIngredients,
      notes: 'Always end with sunscreen',
    },
    pmRoutine: {
      steps: pmSteps,
      keyIngredients: pmKeyIngredients,
      notes: knowledge.routinePatterns.frequency,
    },
    frequency: knowledge.routinePatterns.frequency,
    conflicts,
  };
}

/**
 * Get all concerns that match a set of ingredients
 */
export function getConcernsForIngredient(ingredient: string): ConcernKnowledge[] {
  const lowerIngredient = ingredient.toLowerCase();
  const matches: ConcernKnowledge[] = [];

  for (const concern of Object.values(CONCERN_ENCYCLOPEDIA)) {
    const allIngredients = [
      ...concern.recommendedIngredients.primary,
      ...concern.recommendedIngredients.secondary,
    ];

    if (allIngredients.some(i => i.toLowerCase().includes(lowerIngredient) || lowerIngredient.includes(i.toLowerCase()))) {
      matches.push(concern);
    }
  }

  return matches;
}

/**
 * Get personalized concern recommendations based on user profile
 */
export function getRecommendedConcernFocus(
  userProfile: ConcernUserProfile
): Array<{ concern: ConcernKnowledge; priority: number; reason: string }> {
  const recommendations: Array<{ concern: ConcernKnowledge; priority: number; reason: string }> = [];

  for (const concern of Object.values(CONCERN_ENCYCLOPEDIA)) {
    let priority = 0;
    const reasons: string[] = [];

    // Match user's stated concerns
    if (userProfile.concerns) {
      for (const userConcern of userProfile.concerns) {
        if (
          concern.name.toLowerCase().includes(userConcern.toLowerCase()) ||
          concern.aliases.some(a => a.toLowerCase().includes(userConcern.toLowerCase()))
        ) {
          priority += 10;
          reasons.push('matches your profile');
        }
      }
    }

    // Match related concerns
    if (userProfile.concerns) {
      const relatedMatches = userProfile.concerns.filter(c =>
        concern.relatedConcerns.some(rc => rc.includes(c.toLowerCase().replace(/\s+/g, '-')))
      );
      if (relatedMatches.length > 0) {
        priority += 3;
        reasons.push('related to your concerns');
      }
    }

    // Skin type relevance
    if (userProfile.skinType) {
      const skinType = userProfile.skinType.toLowerCase();
      if (skinType === 'oily' && ['acne', 'oiliness', 'blackheads', 'large-pores'].includes(concern.id)) {
        priority += 5;
        reasons.push('common for oily skin');
      }
      if (skinType === 'dry' && ['dryness', 'dehydration', 'fine-lines'].includes(concern.id)) {
        priority += 5;
        reasons.push('common for dry skin');
      }
      if (skinType === 'sensitive' && ['sensitivity', 'redness', 'barrier-damage'].includes(concern.id)) {
        priority += 5;
        reasons.push('common for sensitive skin');
      }
    }

    if (priority > 0) {
      recommendations.push({
        concern,
        priority,
        reason: reasons.join('; '),
      });
    }
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}

/**
 * Format concern explanation for chat
 */
export function formatConcernForChat(
  explanation: ConcernExplanation,
  includeProducts?: RankedProduct[]
): string {
  const lines: string[] = [];

  // Header
  lines.push(`## ${explanation.concern}`);
  lines.push(`\n${explanation.summary}\n`);

  // Personalized note
  if (explanation.personalizedNote) {
    lines.push(`*${explanation.personalizedNote}*\n`);
  }

  // Root causes
  lines.push('### What Causes It');
  explanation.rootCauses.slice(0, 4).forEach(c => lines.push(`- ${c}`));

  // Visible signs
  lines.push(`\n### Signs to Look For`);
  explanation.visibleSigns.slice(0, 4).forEach(s => lines.push(`- ${s}`));

  // Recommended ingredients
  lines.push(`\n### Recommended Ingredients`);
  explanation.ingredientUrls.slice(0, 5).forEach(({ name, url }) => {
    lines.push(`- [${name}](${url})`);
  });

  // Ingredients to avoid
  if (explanation.ingredientsToAvoid.length > 0) {
    lines.push(`\n### Ingredients to Avoid`);
    explanation.ingredientsToAvoid.slice(0, 4).forEach(i => lines.push(`- ${i}`));
  }

  // Routine guidance
  lines.push(`\n### Routine Guidance`);
  lines.push(`**AM:** ${explanation.routineGuidance.am}`);
  lines.push(`**PM:** ${explanation.routineGuidance.pm}`);

  // Tips
  lines.push(`\n### Tips`);
  explanation.routineGuidance.tips.slice(0, 3).forEach(t => lines.push(`- ${t}`));

  // Products
  if (includeProducts && includeProducts.length > 0) {
    lines.push(`\n### Recommended Products`);
    includeProducts.slice(0, 3).forEach(p => {
      lines.push(`- **${p.brand} ${p.name}** ($${p.price.toFixed(2)}) - [View](${p.productUrl})`);
    });
  }

  // Navigation
  lines.push(`\n---`);
  lines.push(`Learn more: [${explanation.concern} Guide](${explanation.navigationUrl})`);

  return lines.join('\n');
}
