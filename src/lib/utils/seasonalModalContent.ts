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

export interface SeasonalSkinNotes {
  current?: string;
  other?: string;
  updatedAt?: string;
}

export interface UserProfileForModal {
  skinType?: string;
  concerns?: string[];
  sensitivity?: string;
  complexion?: string;
  lifestyle?: string[];
  preferences?: Record<string, boolean>;
  seasonalNotes?: SeasonalSkinNotes;
}

export interface SeasonalModalContent {
  header: SeasonalHeader;
  skinTypeImpact: { text: string; skinTypeLabel: string | null } | null;
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
  high_uv: 'Strong sun can affect your skin more easily, and dark spots or uneven tone may show up faster.',
  low_uv:  'With less intense sun right now, your skin gets a bit of a break — though sunscreen is still a good idea.',
  humid:   'Humid weather can make skin feel oily or congested, but the moisture in the air does help keep it hydrated on the surface.',
  dry_air: 'Dry air pulls moisture from your skin, which can leave it feeling tight, rough, or easily irritated.',
  hot:     'Heat makes your skin produce more oil and sweat, which can leave it feeling uncomfortable.',
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
export const CLASS_BENEFIT: Record<IngredientClass, string> = {
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
    humid:        'helps keep skin hydrated without feeling heavy in the humidity',
    dry_air:      'helps hold onto moisture so your skin doesn\'t feel tight or parched',
    cold:         'helps attract and hold moisture even when cold air is pulling it away',
    transitional: 'helps keep moisture steady as your skin adjusts to days that swing between warm and cool',
  },
  barrier: {
    cold:         'helps protect the moisture barrier that cold weather tends to weaken',
    dry_air:      'strengthens your skin\'s natural barrier, which dry air can wear down',
    transitional: 'supports your skin\'s protective layer as it adjusts to shifting temperatures',
  },
  occlusive: {
    humid:        'seals in moisture without feeling too heavy for humid weather',
    dry_air:      'locks in moisture so dry air can\'t pull it out as easily',
    transitional: 'helps lock in moisture on days when the air is drier than your skin expects',
  },
  sensitizing: {
    high_uv:      'contains stronger actives that can make skin more sun-sensitive — sunscreen during the day is especially important right now',
    low_uv:       'works well when UV is lower, but sunscreen is still a good idea',
    transitional: 'contains stronger actives — since UV can be surprisingly strong on clear days, sunscreen is still important',
  },
  protective: {
    high_uv:      'helps shield your skin from the sun, which is especially important with current UV levels',
    transitional: 'provides sun protection that matters even when the weather doesn\'t feel intense — UV can be stronger than it seems',
  },
  supportive: {
    high_uv:      'helps protect your skin from the extra sun stress right now',
    transitional: 'helps protect your skin from environmental stress as conditions shift',
  },
  soothing: {
    cold:         'helps calm the irritation that cold, dry air can cause',
    hot:          'helps keep skin calm when heat makes it more reactive',
    transitional: 'helps keep skin calm as temperature swings and allergens make it more reactive',
  },
};

/** Pick the best plain-language benefit for a class + conditions combo. */
export function getPlainBenefit(cls: IngredientClass, conditions: ConditionKey[]): string {
  const overrides = CLASS_CONDITION_OVERRIDE[cls];
  if (overrides) {
    for (const cond of conditions) {
      if (overrides[cond]) return overrides[cond]!;
    }
  }
  return CLASS_BENEFIT[cls];
}

/** Short environment-problem phrases, keyed by condition. */
export const CONDITION_PROBLEM: Partial<Record<ConditionKey, string>> = {
  high_uv:      'Strong sun can take a toll on your skin',
  low_uv:       'Even with lower UV right now, your skin still needs support',
  humid:        'Humid weather can leave skin feeling heavy or oily',
  dry_air:      'Dry air pulls moisture from your skin, which can leave it feeling tight',
  hot:          'Heat can make your skin feel oily and uncomfortable',
  cold:         'Cold air can make your skin feel tight and dry',
  transitional: 'Changing weather means your skin has to adjust constantly, which can cause dryness, oiliness, or irritation to shift day to day',
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
export function listJoin(items: string[]): string {
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
export function getActiveClasses(
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

  // Sun exposure
  if (env.uvBand) {
    const uvLabels: Record<string, string> = {
      low: 'Minimal',
      moderate: 'Moderate',
      high: 'Strong',
      very_high: 'Very Strong',
      extreme: 'Intense',
    };
    factors.push({
      label: 'Sun Exposure',
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

  // Dryness risk (composite)
  if (conditions.includes('dry_air') || conditions.includes('cold')) {
    factors.push({
      label: 'Dryness Risk',
      value: conditions.includes('dry_air') && conditions.includes('cold') ? 'High' : 'Moderate',
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
// Skin-Type × Season Impact (new section between header and product fit)
// ---------------------------------------------------------------------------

/**
 * Season-specific skin behavior descriptions. Each entry ties the skin type
 * directly to the named season. Uses a {SKIN_TYPE} placeholder so the
 * renderer can highlight the skin type inline.
 *
 * All entries: 1–2 sentences, calm, supportive, non-medical, no product
 * references, no diagnoses.
 */
export const SKIN_TYPE_SEASON_BEHAVIOR: Record<string, Record<string, string>> = {
  dry: {
    winter: 'In winter, {SKIN_TYPE} loses moisture faster in the cold, dry air — expect more tightness and flaking, especially on your cheeks.',
    spring: 'In spring, {SKIN_TYPE} starts to feel more comfortable as humidity rises, though temperature swings can still cause some unevenness.',
    summer: 'In summer, {SKIN_TYPE} can dehydrate quickly in the heat, and sun exposure tends to make dry patches more noticeable.',
    autumn: 'In autumn, {SKIN_TYPE} tends to feel tighter again as the air dries out and temperatures drop.',
  },
  oily: {
    winter: 'In winter, {SKIN_TYPE} may feel tight from the cold, even though oil levels stay the same or rise to compensate.',
    spring: 'In spring, {SKIN_TYPE} starts producing more shine as temperatures and humidity climb, and pores may feel more clogged.',
    summer: 'In summer, {SKIN_TYPE} produces more shine as heat and humidity rise, and pores may feel more clogged by midday.',
    autumn: 'In autumn, {SKIN_TYPE} tends to calm down as humidity drops, though some unevenness is common during the transition.',
  },
  combination: {
    winter: 'In winter, {SKIN_TYPE} feels more uneven — cheeks may get tight and rough while your T-zone stays oily.',
    spring: 'In spring, {SKIN_TYPE} tends toward an oilier T-zone while drier areas feel more comfortable than in winter.',
    summer: 'In summer, {SKIN_TYPE} leans oilier overall — the T-zone gets shinier while the rest of your face stays relatively comfortable.',
    autumn: 'In autumn, {SKIN_TYPE} can feel more uneven as the air dries — oily areas stay the same while drier patches get tighter.',
  },
  sensitive: {
    winter: 'In winter, {SKIN_TYPE} is more prone to redness and stinging from cold air and wind, especially on exposed areas.',
    spring: 'In spring, {SKIN_TYPE} can feel unsettled as temperatures swing and pollen levels rise, leading to more redness or irritation.',
    summer: 'In summer, {SKIN_TYPE} reacts faster to heat and sun — redness and discomfort happen more easily.',
    autumn: 'In autumn, {SKIN_TYPE} tends to feel calmer as temperatures cool, though drier air can bring back some tightness.',
  },
  normal: {
    winter: 'In winter, {SKIN_TYPE} holds up well, though very cold air can cause some tightness on exposed areas like cheeks and nose.',
    spring: 'In spring, {SKIN_TYPE} stays mostly balanced, with occasional shine or dryness as humidity and temperature shift.',
    summer: 'In summer, {SKIN_TYPE} stays comfortable, though a bit more shine by end of day is common as warmth increases.',
    autumn: 'In autumn, {SKIN_TYPE} adjusts well to cooler weather, with slight dryness as the air becomes less humid.',
  },
};

/**
 * Condition-specific skin behavior descriptions. Used as a fallback when
 * season is not available but environmental conditions are known.
 * Uses a {SKIN_TYPE} placeholder for inline highlighting.
 */
export const SKIN_TYPE_CONDITION_IMPACT: Record<string, Partial<Record<ConditionKey, string>>> = {
  dry: {
    cold:         '{SKIN_TYPE} loses moisture faster in the cold, leading to tightness and rough patches.',
    dry_air:      'Dry air pulls moisture from {SKIN_TYPE} faster, causing more flaking and discomfort.',
    humid:        'Humidity feels comfortable for {SKIN_TYPE} on the surface, though deeper layers may still need hydration.',
    hot:          'Heat dehydrates {SKIN_TYPE} faster, making dry patches more noticeable.',
    high_uv:      'Sun hits {SKIN_TYPE} harder since its natural moisture levels are already low.',
    low_uv:       '{SKIN_TYPE} still needs consistent moisture support year-round, even with lower UV.',
    transitional: 'Changing weather means {SKIN_TYPE} swings between feeling tight on cool days and more comfortable on warmer ones.',
  },
  oily: {
    cold:         '{SKIN_TYPE} can feel tight in cold weather, even though oil levels stay the same.',
    dry_air:      'Dry air pushes {SKIN_TYPE} into producing more oil to compensate for surface dryness.',
    humid:        '{SKIN_TYPE} produces more oil in humid weather, leaving pores feeling clogged.',
    hot:          'Heat increases shine and makes {SKIN_TYPE} feel heavy by midday.',
    high_uv:      'Stronger sun means {SKIN_TYPE} works harder to protect itself, though extra oil doesn\'t replace sunscreen.',
    low_uv:       'With lower UV, {SKIN_TYPE} gets a break, though managing excess oil is still year-round.',
    transitional: 'Shifting temperatures make {SKIN_TYPE} unpredictable — some days are shinier, others feel almost balanced.',
  },
  combination: {
    cold:         '{SKIN_TYPE} feels unpredictable in the cold — drier in some areas, still oily in the T-zone.',
    dry_air:      'Dry air tightens the drier areas of {SKIN_TYPE} while oilier zones stay about the same.',
    humid:        'Humidity clogs the oily areas of {SKIN_TYPE} while drier patches feel more comfortable.',
    hot:          'Heat increases T-zone shine in {SKIN_TYPE} while the rest of your face stays relatively normal.',
    high_uv:      '{SKIN_TYPE} reacts unevenly to strong sun — oilier areas get shinier, drier patches feel more irritated.',
    low_uv:       'During lower UV, {SKIN_TYPE} feels more balanced, though seasonal shifts can still cause unevenness.',
    transitional: 'Changing weather makes {SKIN_TYPE} harder to predict — the T-zone gets oilier on warm days while drier areas tighten up on cool ones.',
  },
  sensitive: {
    cold:         '{SKIN_TYPE} is more prone to redness and irritation in the cold, especially with wind.',
    dry_air:      'Dry air leaves {SKIN_TYPE} feeling tight and easily irritated, with stinging common.',
    humid:        'Humidity can trigger redness in {SKIN_TYPE}, though the extra moisture can also feel soothing.',
    hot:          'Heat makes {SKIN_TYPE} quicker to react, with redness and discomfort happening more easily.',
    high_uv:      '{SKIN_TYPE} reacts more to sun exposure, so extra awareness during high UV is important.',
    low_uv:       'With lower UV, {SKIN_TYPE} gets some relief, though other irritation triggers remain.',
    transitional: 'Temperature swings and rising allergens make {SKIN_TYPE} more reactive — redness and irritation can flare without warning.',
  },
  normal: {
    cold:         '{SKIN_TYPE} handles cold well, though some tightness on exposed areas is common.',
    dry_air:      'Even {SKIN_TYPE} can feel drier than usual in very dry air, though it bounces back faster.',
    humid:        '{SKIN_TYPE} stays balanced in humidity, with just a slight shine by end of day.',
    hot:          '{SKIN_TYPE} handles heat well — staying hydrated helps maintain its natural balance.',
    high_uv:      '{SKIN_TYPE} is still affected by strong sun over time, so awareness during high UV matters.',
    low_uv:       'With lower UV, {SKIN_TYPE} stays comfortable — consistent awareness helps keep it that way.',
    transitional: 'Even {SKIN_TYPE} can feel a little off as the weather shifts — slight dryness or shine depending on the day.',
  },
};

/** Fallback when skin type is known but no season or condition matches. */
export const SKIN_TYPE_GENERIC: Record<string, string> = {
  dry:         '{SKIN_TYPE} loses moisture easily and can feel tight or rough, especially when the weather shifts.',
  oily:        '{SKIN_TYPE} produces more shine throughout the day and may feel clogged, with patterns that shift seasonally.',
  combination: '{SKIN_TYPE} behaves differently across your face — some areas feel dry while others stay oily, shifting with the weather.',
  sensitive:   '{SKIN_TYPE} reacts easily to changes, and irritation triggers shift with the seasons.',
  normal:      '{SKIN_TYPE} is generally balanced, though subtle shifts happen with the seasons.',
};

/** The placeholder token used in skin type descriptions. */
const SKIN_TYPE_PLACEHOLDER = '{SKIN_TYPE}';

function buildSkinTypeSeasonImpact(
  skinType: string | undefined,
  conditions: ConditionKey[],
  season: string | null,
  seasonalNotes?: SeasonalSkinNotes,
): { text: string; skinTypeLabel: string | null } | null {
  if (!skinType) return null;

  const label = skinType.charAt(0).toUpperCase() + skinType.slice(1).toLowerCase() + ' skin';
  const key = skinType.toLowerCase();

  // User-provided notes take priority over generic patterns
  if (seasonalNotes?.current && seasonalNotes.current.trim().length > 0) {
    const userNote = seasonalNotes.current.trim();
    const seasonName = season
      ? season.charAt(0).toUpperCase() + season.slice(1)
      : 'this season';
    return {
      text: `In ${seasonName.toLowerCase()}, you've noted that ${userNote.charAt(0).toLowerCase()}${userNote.slice(1)}${userNote.endsWith('.') ? '' : '.'}`,
      skinTypeLabel: label,
    };
  }

  // Priority 1: Season-specific behavior (ties skin type to named season)
  if (season) {
    const seasonMap = SKIN_TYPE_SEASON_BEHAVIOR[key];
    const seasonText = seasonMap?.[season];
    if (seasonText) {
      return { text: seasonText.replace(SKIN_TYPE_PLACEHOLDER, label), skinTypeLabel: null };
    }
  }

  // Priority 2: Condition-based behavior (when season is unknown)
  const conditionMap = SKIN_TYPE_CONDITION_IMPACT[key];
  if (conditionMap) {
    const priorityOrder: ConditionKey[] = ['high_uv', 'cold', 'dry_air', 'humid', 'hot', 'low_uv'];
    const primary = priorityOrder.find(c => conditions.includes(c) && conditionMap[c]);
    if (primary) {
      const secondary = priorityOrder.find(c => c !== primary && conditions.includes(c) && conditionMap[c]);
      const raw = secondary
        ? `${conditionMap[primary]!} ${conditionMap[secondary]!}`
        : conditionMap[primary]!;
      return { text: raw.replaceAll(SKIN_TYPE_PLACEHOLDER, label), skinTypeLabel: null };
    }
  }

  // Priority 3: Generic fallback
  const generic = SKIN_TYPE_GENERIC[key];
  return generic
    ? { text: generic.replaceAll(SKIN_TYPE_PLACEHOLDER, label), skinTypeLabel: null }
    : null;
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

/** Explains why a concern matters more given current conditions. */
const CONCERN_CONDITION_LINK: Record<string, Partial<Record<ConditionKey, string>>> = {
  dryness:      { cold: 'cold air pulls moisture from your skin, making dryness worse', dry_air: 'dry air makes your skin lose moisture faster', hot: 'heat dries your skin out faster', transitional: 'your skin loses moisture on cool days and can\'t keep up when the weather swings back warm' },
  hydration:    { cold: 'cold air makes it harder for your skin to stay hydrated', dry_air: 'dry air makes it harder for your skin to hold onto moisture', hot: 'heat and sweat pull moisture out of your skin', transitional: 'your skin\'s moisture needs keep changing as the weather shifts day to day' },
  acne:         { humid: 'humidity traps oil and sweat, which can lead to breakouts', hot: 'heat makes your skin produce more oil and can clog pores', transitional: 'unpredictable humidity swings can trigger oil buildup one day and dryness the next' },
  oiliness:     { humid: 'humidity makes your skin produce more oil throughout the day', hot: 'heat makes your skin oilier and shinier', transitional: 'warmer days bring more oil while cooler ones pull it back, making shine hard to predict' },
  redness:      { cold: 'cold, dry air can make your skin red and irritated', hot: 'heat makes your skin more reactive and prone to flushing', transitional: 'temperature swings and rising allergens can trigger redness more easily' },
  aging:        { high_uv: 'strong sun speeds up visible signs of aging', dry_air: 'dry air makes fine lines more noticeable', transitional: 'sun strength can be stronger than expected on clear days, even when it doesn\'t feel hot' },
  'dark spots': { high_uv: 'strong sun can darken existing spots and create new ones', transitional: 'UV can be surprisingly strong on clear days during changing seasons' },
  texture:      { cold: 'cold air can leave your skin feeling rough and uneven', dry_air: 'dry air can create rough, flaky patches', transitional: 'your skin texture shifts as it adjusts to days that swing between warm and cool' },
  dullness:     { cold: 'cold weather can make your skin look dull and tired', dry_air: 'dry air can take away your skin\'s natural glow', transitional: 'inconsistent weather can leave your skin looking tired as it constantly adjusts' },
  pores:        { humid: 'humidity makes pores look larger as oil builds up', hot: 'heat and sweat can make pores more visible', transitional: 'pores can look larger on warmer days as oil production picks up unevenly' },
};

/** Pick the best skin-type × condition priority for the environment opener. */
const SKIN_TYPE_CONDITION_PRIORITY: Record<string, ConditionKey[]> = {
  dry:         ['cold', 'dry_air', 'transitional', 'hot', 'high_uv', 'humid'],
  oily:        ['hot', 'humid', 'transitional', 'high_uv', 'cold', 'dry_air'],
  combination: ['hot', 'humid', 'transitional', 'cold', 'dry_air', 'high_uv'],
  sensitive:   ['cold', 'hot', 'transitional', 'dry_air', 'high_uv', 'humid'],
  normal:      ['high_uv', 'cold', 'hot', 'transitional', 'dry_air', 'humid'],
};

/** Short skin-type × condition impact phrases for the opener. */
const SKIN_CONDITION_IMPACT: Record<string, Partial<Record<ConditionKey, string>>> = {
  dry:         { cold: 'moisture loss and tightness', dry_air: 'dryness and flaking', hot: 'faster dehydration', humid: 'some relief, though hydration still matters', high_uv: 'sun damage on already-stressed skin', transitional: 'uneven moisture as the weather swings between warm and cool' },
  oily:        { hot: 'excess shine and oil production', humid: 'heavier oil buildup and congestion', cold: 'tightness even as oil stays active', dry_air: 'surface tightness with underlying oiliness', high_uv: 'sun damage that oily skin isn\'t immune to', transitional: 'unpredictable shine as humidity and temperature fluctuate' },
  combination: { hot: 'more T-zone shine and drier cheeks', humid: 'oilier T-zone with relatively balanced cheeks', cold: 'drier patches and unpredictable oil', dry_air: 'uneven moisture across your face', high_uv: 'sun stress across both oily and dry areas', transitional: 'an oilier T-zone on warm days and tighter cheeks on cool ones' },
  sensitive:   { cold: 'redness, irritation, and a weakened barrier', hot: 'increased reactivity and flushing', dry_air: 'tightness and stinging', high_uv: 'heightened sun sensitivity', humid: 'potential for heat-triggered reactivity', transitional: 'flare-ups as temperature swings and allergens make skin more reactive' },
  normal:      { high_uv: 'sun stress that even balanced skin needs protection from', cold: 'some tightness on exposed areas', hot: 'a bit more shine than usual', dry_air: 'slight dryness', humid: 'comfortable conditions overall', transitional: 'minor shifts in moisture and shine as the weather changes' },
};

function buildProductFitNarrative(ctx: NarrativeContext): ProductFitNarrative {
  const sentences: string[] = [];
  const { product, env, conditions, matched, userSkinType, userConcerns, userSensitivity, userComplexion, userLifestyle, userPreferences } = ctx;

  const activeClasses = getActiveClasses(matched, conditions);
  const categoryLabel = getCategoryLabel(product.category).toLowerCase();
  const season = env.season ? capitalize(env.season) : null;
  const loc = env.source !== 'mock' && env.location?.city
    ? [env.location.city, env.location.region].filter(Boolean).join(', ')
    : null;

  // Pick the most impactful condition for this skin type
  const skinKey = (userSkinType || '').toLowerCase();
  const priorityOrder = SKIN_TYPE_CONDITION_PRIORITY[skinKey] || conditions;
  const primaryCondition = priorityOrder.find(c => conditions.includes(c)) || conditions[0];
  const secondaryCondition = conditions.find(c => c !== primaryCondition);

  // --- Sentence 1: Environment opener (location + season + skin type + impact) ---
  if (loc && season && userSkinType && primaryCondition) {
    const impact = SKIN_CONDITION_IMPACT[skinKey]?.[primaryCondition];
    if (impact) {
      sentences.push(
        `${season} in ${loc} means ${impact} for ${userSkinType} skin.`
      );
    } else {
      // Fallback: use the generic skin type description instead of empty filler
      const generic = SKIN_TYPE_GENERIC[skinKey];
      if (generic) {
        sentences.push(generic.replaceAll(SKIN_TYPE_PLACEHOLDER, `${userSkinType} skin`));
      } else {
        sentences.push(
          `${season} in ${loc} can shift how your skin feels day to day.`
        );
      }
    }
  } else if (season && userSkinType && primaryCondition) {
    const impact = SKIN_CONDITION_IMPACT[skinKey]?.[primaryCondition];
    if (impact) {
      sentences.push(
        `${season} weather means ${impact} for ${userSkinType} skin.`
      );
    } else {
      const generic = SKIN_TYPE_GENERIC[skinKey];
      if (generic) {
        sentences.push(generic.replaceAll(SKIN_TYPE_PLACEHOLDER, `${userSkinType} skin`));
      } else {
        sentences.push(
          `${season} weather can shift how your skin feels day to day.`
        );
      }
    }
  } else if (primaryCondition) {
    const problem = CONDITION_PROBLEM[primaryCondition];
    if (problem) {
      sentences.push(`${problem}.`);
    }
  } else if (userSkinType) {
    const generic = SKIN_TYPE_GENERIC[skinKey];
    if (generic) {
      sentences.push(generic.replaceAll(SKIN_TYPE_PLACEHOLDER, `${userSkinType} skin`));
    } else {
      sentences.push(
        `This ${categoryLabel} is designed to work with your skin's current needs.`
      );
    }
  } else {
    // No skin type, no conditions — use product's top ingredient class benefit
    const topBenefit = activeClasses.length > 0 ? getPlainBenefit(activeClasses[0].cls, conditions) : null;
    if (topBenefit) {
      sentences.push(`This ${categoryLabel} ${topBenefit}.`);
    } else {
      sentences.push(
        `This ${categoryLabel} is designed to work with your skin's current needs.`
      );
    }
  }

  // --- Sentence 2: Primary product action → tied to environment ---
  if (activeClasses.length >= 1) {
    const ac = activeClasses[0];
    sentences.push(
      `This ${categoryLabel} ${ac.phrase}.`
    );
  }

  // --- Sentence 3: Secondary product action → tied to environment ---
  // Repetition guard: if sentence 3 would sound too similar to sentence 2
  // (both ending with similar trailing text like "as the weather changes"),
  // use the class-specific benefit instead of the mechanism phrase.
  if (activeClasses.length >= 2) {
    const ac2 = activeClasses[1];
    const phrase1 = activeClasses[0].phrase;
    const phrase2 = ac2.phrase;

    // Check for similar trailing text (last 20 chars)
    const tail1 = phrase1.slice(-20).toLowerCase();
    const tail2 = phrase2.slice(-20).toLowerCase();
    const tooSimilar = tail1 === tail2 && tail1.length > 10;

    if (tooSimilar) {
      // Use the plain benefit for variation
      const altPhrase = getPlainBenefit(ac2.cls, conditions);
      sentences.push(`It also ${altPhrase}.`);
    } else {
      sentences.push(`It also ${ac2.phrase}.`);
    }
  } else if (activeClasses.length === 1) {
    // Fall back to texture or category phrase
    const texture = inferTexture(product);
    const texPhrase = getTexturePhrase(texture, conditions);
    const catPhrase = getCategoryPhrase(product.category, conditions);
    if (texPhrase) {
      sentences.push(capitalize(texPhrase) + '.');
    } else if (catPhrase) {
      sentences.push(capitalize(catPhrase) + '.');
    }
  }

  // --- Sentence 4 (conditional): Concern alignment tied to environment ---
  if (userConcerns && userConcerns.length > 0) {
    const productConcerns = (product.concerns || []);
    const overlap = productConcerns.filter(pc =>
      userConcerns.some(uc => matchesConcern(pc, [uc]))
    );
    if (overlap.length > 0) {
      // Try to link the concern to a current condition
      const firstOverlap = overlap[0].toLowerCase();
      const condLink = CONCERN_CONDITION_LINK[firstOverlap];
      const linkedCond = condLink ? conditions.find(c => condLink[c]) : null;
      if (linkedCond && condLink![linkedCond]) {
        sentences.push(
          `${capitalize(listJoin(overlap))} ${overlap.length === 1 ? 'is' : 'are'} harder to manage right now because ${condLink![linkedCond]!} — this product helps.`
        );
      } else {
        sentences.push(
          `It also helps with ${listJoin(overlap)}, which ${overlap.length === 1 ? 'is' : 'are'} important for your skin right now.`
        );
      }
    }
  }

  // --- Sentence 5 (conditional): Sensitivity, complexion, lifestyle, or preference ---
  // Only one of these fires — first match wins, capped at 4 total bullets
  if (sentences.length < 4) {
    if (userSensitivity === 'high' && matched.sensitizing.length > 0) {
      sentences.push(
        'This product contains stronger actives, so easing in gradually and wearing sunscreen during the day is a good idea.'
      );
    } else if (userSensitivity === 'high') {
      sentences.push(
        'Since your skin tends to be sensitive, introducing this product gradually is always a good idea.'
      );
    } else if (userComplexion && conditions.includes('high_uv')) {
      const fitzIndex = COMPLEXION_TIERS.findIndex(t => t.toLowerCase() === userComplexion.toLowerCase());
      if (fitzIndex >= 0 && fitzIndex <= 1) {
        sentences.push('Fair skin is especially vulnerable to sun damage right now — sunscreen is a must alongside this product.');
      } else if (fitzIndex >= 2 && fitzIndex <= 3) {
        sentences.push('With current UV levels, sunscreen helps protect against uneven tone — even with medium skin tones.');
      } else if (fitzIndex >= 4) {
        sentences.push('Even with naturally more resilient skin, sunscreen helps keep your tone even in strong sun.');
      }
    } else if (userComplexion && (conditions.includes('cold') || conditions.includes('dry_air'))) {
      const fitzIndex = COMPLEXION_TIERS.findIndex(t => t.toLowerCase() === userComplexion.toLowerCase());
      if (fitzIndex >= 0 && fitzIndex <= 1) {
        sentences.push('Fair skin shows redness more easily in cold, dry weather — gentle, hydrating products help.');
      } else if (fitzIndex >= 4) {
        sentences.push('Deeper skin tones can look ashy in cold weather — keeping skin well-moisturized helps maintain an even look.');
      }
    } else if (userLifestyle && userLifestyle.length > 0) {
      for (const factor of userLifestyle) {
        const condMap = LIFESTYLE_SENTENCES[factor];
        if (condMap) {
          const match = conditions.find(c => condMap[c]);
          if (match) { sentences.push(condMap[match]!); break; }
        }
        const generic = LIFESTYLE_GENERIC[factor];
        if (generic) { sentences.push(generic); break; }
      }
    }
  }

  return {
    narrative: sentences.slice(0, 4).join(' '),
    referencedIngredients: activeClasses.flatMap(ac => ac.names),
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
    return `People who mentioned ${label} generally had great results with this product.`;
  } else if (avgRating >= 3.0) {
    return `People who mentioned ${label} had mixed but mostly positive experiences.`;
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

  // --- Skin-Type × Season Impact ---
  const skinTypeImpact = buildSkinTypeSeasonImpact(
    userProfile?.skinType,
    conditions,
    season,
    userProfile?.seasonalNotes,
  );

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
    skinTypeImpact,
    productFit,
    keywordInsights,
    categoryPhrase: catPhrase,
    texturePhrase: finalTexPhrase,
    disclaimer,
    personalized: !!userProfile?.skinType,
  };
}

// ---------------------------------------------------------------------------
// AI-Assisted Product Fit — Structured Context + Prompt Builder
// ---------------------------------------------------------------------------

/**
 * Deterministic structured input for the AI product fit generator.
 * Assembled entirely from existing platform data — no new data sources.
 */
export interface ProductFitAIInput {
  location: string | null;
  season: string | null;
  conditions: string[];
  uvBand: string | null;
  skinType: string | null;
  concerns: string[];
  sensitivity: string | null;
  productName: string;
  categoryLabel: string;
  ingredientClasses: { label: string; benefit: string; names: string[] }[];
  texture: string;
  concernOverlap: string[];
  concernConditionLink: string | null;
  reviewerSummary: string | null;
  matchedPreferences: string[];
  skinConditionImpact: string | null;
}

/** Human-friendly labels for ingredient classes. */
const CLASS_DISPLAY_LABELS: Record<IngredientClass, string> = {
  humectant:   'moisture-attracting ingredients',
  barrier:     'barrier-supporting ingredients',
  soothing:    'calming ingredients',
  supportive:  'protective ingredients',
  sensitizing: 'stronger active ingredients',
  protective:  'sun-protective ingredients',
  emollient:   'softening ingredients',
  occlusive:   'moisture-sealing ingredients',
  peptide:     'firming ingredients',
};

/**
 * Build the deterministic structured context for the AI product fit call.
 * Uses the same data already available to buildProductFitNarrative().
 */
export function buildProductFitContext(
  product: Product,
  env: EnvironmentContext,
  userProfile?: UserProfileForModal,
  reviewerEvidence?: { count: number; sentiment: string; detail?: string } | null,
): ProductFitAIInput {
  const conditions = deriveConditions(env);
  const matched = classifyIngredients(product.keyIngredients || []);
  const activeClasses = getActiveClasses(matched, conditions);
  const categoryLabel = getCategoryLabel(product.category).toLowerCase();
  const texture = inferTexture(product);
  const skinKey = (userProfile?.skinType || '').toLowerCase();

  // Concern overlap
  const userConcerns = userProfile?.concerns || [];
  const productConcerns = product.concerns || [];
  const overlap = productConcerns.filter(pc =>
    userConcerns.some(uc => matchesConcern(pc, [uc])),
  );

  // Best concern-condition link
  let concernConditionLink: string | null = null;
  if (overlap.length > 0) {
    const firstOverlap = overlap[0].toLowerCase();
    const condLink = CONCERN_CONDITION_LINK[firstOverlap];
    const linkedCond = condLink ? conditions.find(c => condLink[c]) : null;
    if (linkedCond && condLink![linkedCond]) {
      concernConditionLink = condLink![linkedCond]!;
    }
  }

  // Reviewer summary
  let reviewerSummary: string | null = null;
  if (reviewerEvidence && reviewerEvidence.count > 0 && reviewerEvidence.detail) {
    reviewerSummary = `${reviewerEvidence.count} people with a similar skin profile ${reviewerEvidence.detail}`;
  }

  // Matched preferences
  const matchedPreferences: string[] = [];
  if (userProfile?.preferences) {
    for (const [key, val] of Object.entries(userProfile.preferences)) {
      if (val && PREFERENCE_LABELS[key]) {
        matchedPreferences.push(PREFERENCE_LABELS[key]);
      }
    }
  }

  // Skin condition impact
  const primaryCondition = (SKIN_TYPE_CONDITION_PRIORITY[skinKey] || conditions)
    .find(c => conditions.includes(c)) || conditions[0];
  const skinConditionImpact = SKIN_CONDITION_IMPACT[skinKey]?.[primaryCondition] || null;

  // Condition labels (human-friendly)
  const CONDITION_LABELS: Record<string, string> = {
    high_uv: 'strong sun', low_uv: 'lower UV', humid: 'high humidity',
    dry_air: 'dry air', hot: 'heat', cold: 'cold air', transitional: 'changing weather',
  };

  return {
    location: env.source !== 'mock' && env.location?.city
      ? [env.location.city, env.location.region].filter(Boolean).join(', ')
      : null,
    season: env.season ? capitalize(env.season) : null,
    conditions: conditions.map(c => CONDITION_LABELS[c] || c),
    uvBand: env.uvBand || null,
    skinType: userProfile?.skinType || null,
    concerns: userConcerns,
    sensitivity: userProfile?.sensitivity || null,
    productName: product.name,
    categoryLabel,
    ingredientClasses: activeClasses.map(ac => ({
      label: CLASS_DISPLAY_LABELS[ac.cls],
      benefit: getPlainBenefit(ac.cls, conditions),
      names: ac.names,
    })),
    texture,
    concernOverlap: overlap,
    concernConditionLink,
    reviewerSummary,
    matchedPreferences,
    skinConditionImpact,
  };
}

/**
 * Format the structured context into a user message for the AI.
 * Sent alongside the existing product_detail system prompt.
 */
export function formatProductFitPrompt(input: ProductFitAIInput): string {
  const lines: string[] = [];

  lines.push('Based on the following structured data, write 3-5 short sentences explaining why this product fits this user right now. Each sentence must directly connect a product quality to the user\'s environment, skin type, or concerns.');
  lines.push('');

  lines.push('ENVIRONMENT:');
  if (input.location) lines.push(`- Location: ${input.location}`);
  if (input.season) lines.push(`- Season: ${input.season}`);
  if (input.conditions.length > 0) lines.push(`- Current conditions: ${input.conditions.join(', ')}`);
  if (input.uvBand) lines.push(`- UV: ${input.uvBand}`);
  if (input.skinConditionImpact) lines.push(`- Impact on their skin: ${input.skinConditionImpact}`);
  lines.push('');

  lines.push('SKIN PROFILE:');
  if (input.skinType) lines.push(`- Skin type: ${input.skinType}`);
  if (input.concerns.length > 0) lines.push(`- Concerns: ${input.concerns.join(', ')}`);
  if (input.sensitivity) lines.push(`- Sensitivity: ${input.sensitivity}`);
  lines.push('');

  lines.push('PRODUCT:');
  lines.push(`- Name: ${input.productName}`);
  lines.push(`- Type: ${input.categoryLabel}`);
  lines.push(`- Texture: ${input.texture}`);
  if (input.ingredientClasses.length > 0) {
    lines.push('- Key ingredient benefits:');
    for (const ic of input.ingredientClasses) {
      lines.push(`  - ${ic.benefit} (from ${ic.names.join(', ')})`);
    }
  }
  lines.push('');

  if (input.concernOverlap.length > 0) {
    lines.push('CONCERN MATCH:');
    lines.push(`- Overlapping concerns: ${input.concernOverlap.join(', ')}`);
    if (input.concernConditionLink) {
      lines.push(`- Why this matters now: ${input.concernConditionLink}`);
    }
    lines.push('');
  }

  if (input.reviewerSummary) {
    lines.push('REVIEWER EVIDENCE:');
    lines.push(`- ${input.reviewerSummary}`);
    lines.push('');
  }

  if (input.matchedPreferences.length > 0) {
    lines.push('PREFERENCES MATCHED:');
    lines.push(`- ${input.matchedPreferences.join(', ')}`);
    lines.push('');
  }

  lines.push('RULES:');
  lines.push('- Every sentence must connect a product quality to the user\'s environment OR skin type OR concerns');
  lines.push('- Use "your" and "you" — speak directly to the user');
  lines.push('- No jargon — explain what ingredients DO, never name ingredient classes');
  lines.push('- No medical claims — use "helps", "can support", "may"');
  lines.push('- No filler sentences — every sentence must teach the user something specific');
  lines.push('- Keep each sentence under 25 words');
  lines.push('- Do not include disclaimers or "this is not medical advice"');

  return lines.join('\n');
}
