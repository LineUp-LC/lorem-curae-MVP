import type { EnvironmentContext } from './context';
import type { ProductCategory } from '../utils/categoryRegistry';

// ---------------------------------------------------------------------------
// Condition keys — derived from EnvironmentContext
// ---------------------------------------------------------------------------

export type ConditionKey =
  | 'high_uv' | 'low_uv'
  | 'humid' | 'dry_air'
  | 'hot' | 'cold'
  | 'transitional';

// ---------------------------------------------------------------------------
// Ingredient class keys (expanded from 6 → 9)
// ---------------------------------------------------------------------------

export type IngredientClass =
  | 'protective' | 'supportive' | 'sensitizing'
  | 'humectant' | 'barrier' | 'soothing'
  | 'emollient' | 'occlusive' | 'peptide';

// ---------------------------------------------------------------------------
// Texture types (inferred from product metadata)
// ---------------------------------------------------------------------------

export type InferredTexture =
  | 'gel' | 'cream' | 'lotion' | 'balm' | 'oil-texture'
  | 'liquid' | 'foam' | 'paste' | 'emulsion'
  | 'mist-texture' | 'serum-texture' | 'unknown';

// ---------------------------------------------------------------------------
// MECHANISM_PHRASES — how each ingredient class behaves under conditions
// ---------------------------------------------------------------------------

export const MECHANISM_PHRASES: Record<IngredientClass, Partial<Record<ConditionKey, string>>> = {
  humectant: {
    humid:        'draw atmospheric moisture into the skin effectively',
    dry_air:      'pull moisture toward the skin — pairing with a heavier layer on top helps lock it in during drier air',
    hot:          'support hydration as perspiration depletes surface moisture',
    cold:         'attract available moisture to counteract cold-air dryness',
    transitional: 'help the skin adapt as ambient humidity levels shift',
  },
  occlusive: {
    humid:        'form a light protective film without trapping excess moisture in humidity',
    dry_air:      'lock in moisture beneath a protective layer — especially important when ambient humidity is low',
    hot:          'seal in hydration, though lighter application avoids heaviness in heat',
    cold:         'help seal in moisture and protect it from escaping in cold, dry air',
    transitional: 'maintain consistent moisture levels as conditions change',
  },
  emollient: {
    dry_air:      'smooth and soften the skin surface, filling gaps between cells in dry conditions',
    cold:         'provide a conditioning layer that reduces roughness from cold-weather dryness',
    humid:        'deliver surface smoothing without adding significant weight in humid conditions',
    hot:          'offer lightweight conditioning that stays comfortable in heat',
    transitional: 'maintain skin smoothness as environmental conditions fluctuate',
  },
  supportive: {
    high_uv:      'help protect your skin from the extra environmental stress that strong sun can cause',
    low_uv:       'continue antioxidant support, with cumulative benefits during lower-UV periods',
    hot:          'help protect your skin from the combined environmental stress of heat and sun',
    humid:        'deliver antioxidant protection without feeling heavy in humid conditions',
    transitional: 'maintain antioxidant defense as seasonal UV levels shift',
  },
  sensitizing: {
    high_uv:      'can make your skin more sensitive to the sun — dedicated SPF is essential during high-UV periods',
    low_uv:       'benefit from reduced UV exposure, making this a favorable time for products that help your skin renew',
    hot:          'may increase irritation potential when skin is heat-stressed — evening use is recommended',
    cold:         'pair well with protective layers that shield sensitized skin from cold and wind',
    transitional: 'require consistent SPF as UV levels can be unpredictable during seasonal shifts',
  },
  protective: {
    high_uv:      'provide mineral-based sun protection well-matched to elevated UV levels',
    low_uv:       'maintain consistent mineral UV defense even during lower-exposure periods',
    hot:          'offer stable mineral protection that does not degrade with heat',
    humid:        'maintain steady sun protection that holds up well in humid conditions',
    transitional: 'provide reliable UV defense through changing seasonal conditions',
  },
  barrier: {
    dry_air:      'reinforce the skin barrier against moisture loss in dry conditions',
    cold:         'strengthen the skin barrier when cold air can weaken its natural protective layer',
    humid:        'support barrier function without feeling heavy, letting the skin breathe in humidity',
    transitional: 'help the barrier adapt as environmental conditions shift between seasons',
    hot:          'help maintain the skin barrier when heat and perspiration put it under stress',
    high_uv:      'support the barrier as a first line of defense against UV-related stress',
  },
  soothing: {
    cold:         'help calm reactivity that cold, dry air can trigger',
    hot:          'provide calming relief when heat increases skin reactivity',
    transitional: 'help manage sensitivity as environmental allergens and conditions fluctuate',
    high_uv:      'offer calming support for UV-stressed skin',
    dry_air:      'help comfort skin that dry air has left irritated or reactive',
  },
  peptide: {
    cold:         'support your skin\'s natural recovery from cold-weather dryness and stress',
    hot:          'remain stable across temperature ranges, continuing to support your skin\'s natural firmness',
    high_uv:      'support your skin\'s natural recovery from UV-related stress',
    low_uv:       'work consistently during lower-UV periods, complementing your skin\'s natural recovery',
    transitional: 'provide steady support as the skin adjusts to changing conditions',
  },
};

// ---------------------------------------------------------------------------
// CATEGORY_BEHAVIOR — how product types perform in different conditions
// ---------------------------------------------------------------------------

export const CATEGORY_BEHAVIOR: Partial<Record<ProductCategory, Partial<Record<ConditionKey, string>>>> = {
  cleanser: {
    humid:   'a cleanser helps manage the extra oil and buildup that humidity can cause',
    dry_air: 'a gentle cleanser preserves natural oils that dry air already depletes',
    hot:     'cleansing removes sweat and oil that build up faster in the heat',
    cold:    'a hydrating cleanser cleans without drying out skin that cold air has already stressed',
  },
  toner: {
    humid:   'toners help remove leftover oil and prep the skin in humid conditions',
    dry_air: 'hydrating toners add a moisture layer before heavier products in dry air',
    hot:     'lightweight toners refresh without adding weight in heat',
    cold:    'toners prep the skin to absorb richer winter products more effectively',
  },
  serum: {
    humid:   'lightweight serum textures absorb efficiently without added heaviness in humidity',
    dry_air: 'serums deliver concentrated actives, though layering with a heavier moisturizer helps lock them in',
    hot:     'fast-absorbing serum formats feel comfortable in heat',
    cold:    'concentrated serums deliver actives beneath protective cold-weather layers',
  },
  essence: {
    humid:   'lightweight essences absorb readily without adding heaviness in humid conditions',
    dry_air: 'essences deliver a hydrating prep layer before heavier products in dry air',
    hot:     'watery essences provide refreshing hydration in heat',
    cold:    'essences build a moisture foundation beneath cold-weather barrier creams',
  },
  moisturizer: {
    humid:   'a lighter moisturizer prevents congestion without sacrificing hydration in humid conditions',
    dry_air: 'a richer moisturizer seals in hydration when ambient moisture is low',
    hot:     'lighter moisturizer formats feel more comfortable in heat',
    cold:    'a nourishing moisturizer creates a protective layer against cold-air dryness',
  },
  sunscreen: {
    high_uv: 'sun protection is critical — reapplication every two hours is recommended at elevated UV levels',
    low_uv:  'consistent sun protection remains important even during lower-UV periods',
    hot:     'mineral sunscreens maintain stability in heat',
    humid:   'water-resistant formulas maintain protection as humidity and perspiration increase',
  },
  treatment: {
    high_uv: 'stronger treatments can make skin more sun-sensitive — evening use and morning sunscreen are recommended',
    low_uv:  'lower UV periods are a good time to use stronger treatments that can make skin sun-sensitive',
    dry_air: 'stronger treatments may feel more intense on dry skin — layering with hydrating products can help',
    cold:    'skin is more easily irritated in cold conditions — you may want to use treatments less often',
  },
  mask: {
    humid:   'clay and purifying masks help manage the extra oil that humid weather can cause',
    dry_air: 'hydrating masks provide a deep moisture boost in dry conditions',
    hot:     'cooling masks offer relief and help clear out heat-stressed skin',
    cold:    'nourishing masks give skin a concentrated moisture and repair boost during cold weather',
  },
  exfoliator: {
    high_uv: 'exfoliating can make skin more sun-sensitive — sunscreen is essential',
    low_uv:  'lower UV makes this a good time for exfoliating products',
    dry_air: 'gentler exfoliation frequency helps in dry conditions',
    cold:    'skin is more easily irritated in cold air — gentle exfoliation with recovery time is recommended',
  },
  oil: {
    humid:   'face oils may feel heavier in humidity — lighter application or nighttime use may be preferable',
    dry_air: 'face oils lock in moisture and help prevent it from escaping in dry air',
    cold:    'facial oils create a protective layer that helps keep moisture in during cold weather',
    hot:     'lighter oils or nighttime-only application prevents heaviness in heat',
  },
  mist: {
    humid:   'mists refresh without adding excess moisture in already-humid conditions',
    dry_air: 'hydrating mists provide instant surface moisture relief in dry air',
    hot:     'cooling mists offer immediate comfort and hydration in heat',
    cold:    'moisturizing mists add quick hydration between cold-weather product layers',
  },
  'eye-care': {
    cold:    'eye-area skin is thinner and more vulnerable to cold-induced dryness',
    dry_air: 'the delicate eye area benefits from targeted hydration in dry conditions',
    hot:     'lightweight eye products prevent heaviness common in heat',
    humid:   'gel-based eye products absorb without congesting the delicate eye area in humidity',
  },
  'lip-care': {
    cold:    'lip skin lacks oil glands and is especially vulnerable to cold-weather cracking',
    dry_air: 'a rich lip product seals in moisture when the air is dry',
    hot:     'lighter lip hydration prevents heaviness in heat',
    humid:   'lip products maintain comfort without feeling heavy in humid conditions',
  },
};

// ---------------------------------------------------------------------------
// TEXTURE_BEHAVIOR — how textures/consistencies perform in conditions
// ---------------------------------------------------------------------------

export const TEXTURE_BEHAVIOR: Partial<Record<InferredTexture, Partial<Record<ConditionKey, string>>>> = {
  gel: {
    humid:   'its gel texture absorbs quickly without trapping moisture against the skin in humidity',
    hot:     'its gel texture feels lightweight and cooling in heat',
    dry_air: 'its gel texture absorbs fast but may benefit from a richer layer over top in dry air',
    cold:    'its gel texture may need a heavier layer over top for sufficient protection in cold conditions',
  },
  cream: {
    humid:   'its cream texture may feel richer in humidity — thinner application can help',
    dry_air: 'its cream texture provides a substantial moisture barrier in dry conditions',
    cold:    'its cream texture offers protective richness that cold-weather skin benefits from',
    hot:     'its cream texture stays comfortable with lighter application in heat',
  },
  lotion: {
    humid:   'its lotion texture provides balanced hydration without heaviness in humidity',
    dry_air: 'its lotion texture may need a heavier product on top to lock moisture in during very dry conditions',
    hot:     'its lightweight lotion texture stays comfortable in heat',
    cold:    'its lotion texture provides moderate protection — layering may enhance comfort in cold',
  },
  balm: {
    dry_air: 'its balm texture creates a heavy, protective seal that locks moisture in — ideal for very dry conditions',
    cold:    'its balm texture provides maximum protection against cold-weather moisture loss',
    humid:   'its balm texture may feel heavy in humidity — spot application on dry areas works well',
    hot:     'its balm texture can feel heavy in heat — nighttime use may be more comfortable',
  },
  'oil-texture': {
    dry_air: 'its oil-based texture seals in moisture effectively in dry conditions',
    cold:    'its oil texture adds a protective layer that helps keep moisture in during cold air',
    humid:   'its oil texture may feel heavy in humidity — lighter application or nighttime use works well',
    hot:     'its oil texture stays comfortable with thinner application in heat',
  },
  foam: {
    humid:   'its foam texture rinses cleanly without leaving residue in humid conditions',
    hot:     'its foam texture feels refreshing and light in heat',
    dry_air: 'its foam texture cleanses efficiently — follow with hydrating steps in dry conditions',
    cold:    'its foam texture rinses efficiently but benefits from hydrating follow-up in cold air',
  },
  liquid: {
    humid:   'its liquid format absorbs rapidly without adding heaviness in humidity',
    dry_air: 'its liquid format delivers actives quickly, though layering with heavier products helps seal them in',
    hot:     'its liquid texture feels lightweight and comfortable in heat',
    cold:    'its liquid format builds a quick hydration layer beneath heavier cold-weather products',
  },
  'serum-texture': {
    humid:   'its concentrated serum texture absorbs efficiently in humid conditions',
    dry_air: 'its serum texture delivers concentrated ingredients, though a heavier product on top helps seal them in dry air',
    hot:     'its lightweight serum texture feels comfortable in heat',
    cold:    'its serum texture delivers concentrated ingredients beneath protective cold-weather layers',
  },
  'mist-texture': {
    humid:   'its mist texture refreshes without adding heaviness in humid conditions',
    dry_air: 'its mist texture provides instant hydration in dry air — follow with a heavier product to lock it in',
    hot:     'its mist texture offers instant cooling relief in heat',
    cold:    'its hydrating mist adds quick moisture between cold-weather layers',
  },
  emulsion: {
    humid:   'its emulsion texture provides balanced hydration without congesting in humidity',
    dry_air: 'its emulsion texture delivers moderate hydration — layering may help in very dry conditions',
    hot:     'its lightweight emulsion texture stays comfortable in heat',
    cold:    'its emulsion provides a base layer of hydration beneath heavier cold-weather products',
  },
  paste: {
    humid:   'its paste texture provides intensive treatment that rinses clean in humid conditions',
    dry_air: 'its paste texture delivers concentrated care in dry conditions',
    hot:     'its paste texture provides focused treatment — shorter application in heat may feel more comfortable',
    cold:    'its paste texture delivers intensive nourishment in cold conditions',
  },
};

// ---------------------------------------------------------------------------
// Condition derivation — map EnvironmentContext to active ConditionKeys
// ---------------------------------------------------------------------------

export function deriveConditions(env: EnvironmentContext): ConditionKey[] {
  const keys: ConditionKey[] = [];

  // UV conditions
  if (env.uvBand === 'high' || env.uvBand === 'very_high' || env.uvBand === 'extreme') {
    keys.push('high_uv');
  } else if (env.uvBand === 'low') {
    keys.push('low_uv');
  }

  // Climate-derived conditions
  if (env.climate === 'tropical' || env.climate === 'mediterranean') {
    keys.push('humid');
  }
  if (env.climate === 'arid') {
    keys.push('dry_air');
  }
  if (env.climate === 'polar') {
    keys.push('cold', 'dry_air');
  }
  if (env.climate === 'humid_continental') {
    if (env.season === 'summer') keys.push('humid', 'hot');
    else if (env.season === 'winter') keys.push('cold', 'dry_air');
    else keys.push('transitional');
  }

  // Season-derived supplements (avoid duplicates)
  if (env.season === 'summer' && !keys.includes('hot')) keys.push('hot');
  if (env.season === 'winter' && !keys.includes('cold')) keys.push('cold');
  if ((env.season === 'spring' || env.season === 'autumn') && !keys.includes('transitional')) {
    keys.push('transitional');
  }

  return keys;
}

// ---------------------------------------------------------------------------
// Phrase selectors — pick the best match for given conditions
// ---------------------------------------------------------------------------

export function getMechanismPhrase(
  ingredientClass: IngredientClass,
  conditions: ConditionKey[],
): string | null {
  const classMap = MECHANISM_PHRASES[ingredientClass];
  if (!classMap) return null;
  for (const cond of conditions) {
    if (classMap[cond]) return classMap[cond]!;
  }
  return null;
}

export function getCategoryPhrase(
  category: ProductCategory,
  conditions: ConditionKey[],
): string | null {
  const catMap = CATEGORY_BEHAVIOR[category];
  if (!catMap) return null;
  for (const cond of conditions) {
    if (catMap[cond]) return catMap[cond]!;
  }
  return null;
}

export function getTexturePhrase(
  texture: InferredTexture,
  conditions: ConditionKey[],
): string | null {
  const texMap = TEXTURE_BEHAVIOR[texture];
  if (!texMap) return null;
  for (const cond of conditions) {
    if (texMap[cond]) return texMap[cond]!;
  }
  return null;
}
