/**
 * Skin Profile Intelligence for Lorem Curae AI
 *
 * Provides deep skin-profile understanding including:
 * - Profile attribute interpretation
 * - Safety rules based on profile
 * - Personalization filters for all recommendations
 * - Experience-level adaptation
 * - Integration with ingredient, concern, and product intelligence
 */

import { INGREDIENT_ENCYCLOPEDIA } from './knowledgeBase';
import { PHOTOSENSITIZING_INGREDIENTS, BEGINNER_SAFE, ADVANCED_INGREDIENTS, PREGNANCY_UNSAFE } from './ingredientIntelligence';
import { type ConcernId, CONCERN_ENCYCLOPEDIA } from './concernIntelligence';

// ============================================================================
// Types
// ============================================================================

/**
 * Skin type classification
 */
export type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';

/**
 * Experience level with skincare
 */
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Sensitivity level
 */
export type SensitivityLevel = 'none' | 'mild' | 'moderate' | 'severe';

/**
 * Fitzpatrick skin type (for sun sensitivity)
 */
export type FitzpatrickType = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Complete skin profile
 */
export interface SkinProfile {
  // Core attributes
  skinType: SkinType;
  sensitivityLevel: SensitivityLevel;

  // Concerns
  primaryConcerns: string[];
  secondaryConcerns?: string[];

  // Personal factors
  fitzpatrickType?: FitzpatrickType;
  experienceLevel: ExperienceLevel;
  age?: number;

  // Preferences
  preferences: {
    fragranceFree?: boolean;
    crueltyFree?: boolean;
    vegan?: boolean;
    lightweight?: boolean;
    nonComedogenic?: boolean;
    alcoholFree?: boolean;
    budgetRange?: 'budget' | 'mid' | 'premium';
  };

  // Lifestyle
  lifestyle?: {
    sunExposure?: 'minimal' | 'moderate' | 'high';
    routineConsistency?: 'minimal' | 'moderate' | 'dedicated';
    environment?: 'dry' | 'humid' | 'urban' | 'varied';
  };

  // Contraindications
  contraindications?: {
    pregnant?: boolean;
    breastfeeding?: boolean;
    allergies?: string[];
    medicalConditions?: string[];
  };

  // History
  avoidIngredients?: string[];
  lovedIngredients?: string[];
}

/**
 * Profile safety evaluation result
 */
export interface ProfileSafetyResult {
  safe: boolean;
  ingredientsToAvoid: Array<{
    ingredient: string;
    reason: string;
  }>;
  ingredientsToUseWithCaution: Array<{
    ingredient: string;
    reason: string;
    guidance: string;
  }>;
  generalGuidance: string[];
}

/**
 * Profile-based ingredient filter result
 */
export interface IngredientFilterResult {
  recommended: Array<{
    ingredient: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  avoid: Array<{
    ingredient: string;
    reason: string;
  }>;
  useWithCaution: Array<{
    ingredient: string;
    guidance: string;
  }>;
}

/**
 * Profile-based texture recommendation
 */
export interface TextureRecommendation {
  preferred: string[];
  avoid: string[];
  reason: string;
}

/**
 * Profile analysis result
 */
export interface ProfileAnalysis {
  summary: string;
  skinTypeGuidance: string;
  concernPriorities: Array<{
    concern: string;
    priority: 'primary' | 'secondary';
    suggestedIngredients: string[];
  }>;
  safetyNotes: string[];
  routineComplexity: 'minimal' | 'moderate' | 'comprehensive';
  texturePreferences: TextureRecommendation;
}

/**
 * Personalization context for AI responses
 */
export interface PersonalizationContext {
  profile: SkinProfile;
  ingredientFilter: IngredientFilterResult;
  safety: ProfileSafetyResult;
  routineGuidance: {
    maxActives: number;
    exfoliationFrequency: string;
    retinolSafe: boolean;
    acidsSafe: boolean;
  };
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Texture preferences by skin type
 */
const TEXTURE_BY_SKIN_TYPE: Record<SkinType, { preferred: string[]; avoid: string[] }> = {
  dry: {
    preferred: ['cream', 'balm', 'oil', 'rich', 'emollient', 'butter'],
    avoid: ['gel', 'foaming', 'mattifying', 'powder'],
  },
  oily: {
    preferred: ['gel', 'lightweight', 'water-based', 'mattifying', 'oil-free'],
    avoid: ['heavy cream', 'oil', 'balm', 'rich', 'occlusive'],
  },
  combination: {
    preferred: ['lightweight cream', 'gel-cream', 'lotion', 'emulsion'],
    avoid: ['very heavy cream', 'very light gel'],
  },
  normal: {
    preferred: ['lotion', 'cream', 'gel-cream', 'emulsion'],
    avoid: [],
  },
  sensitive: {
    preferred: ['cream', 'gentle', 'fragrance-free', 'minimal ingredients'],
    avoid: ['foaming', 'exfoliating', 'strong actives'],
  },
};

/**
 * Maximum actives by experience level
 */
const MAX_ACTIVES_BY_LEVEL: Record<ExperienceLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

/**
 * Exfoliation frequency by sensitivity
 */
const EXFOLIATION_FREQUENCY: Record<SensitivityLevel, string> = {
  none: '2-3 times per week',
  mild: '1-2 times per week',
  moderate: 'Once per week or less',
  severe: 'Avoid exfoliation until barrier is repaired',
};

/**
 * Ingredients to avoid by skin type
 */
const AVOID_BY_SKIN_TYPE: Record<SkinType, string[]> = {
  dry: ['alcohol denat', 'witch hazel', 'benzoyl peroxide', 'strong sulfates'],
  oily: ['heavy oils', 'coconut oil', 'cocoa butter', 'lanolin'],
  combination: ['very heavy oils', 'very drying alcohols'],
  normal: [],
  sensitive: ['fragrance', 'essential oils', 'alcohol', 'menthol', 'eucalyptus', 'strong acids'],
};

/**
 * Ingredients to recommend by skin type
 */
const RECOMMEND_BY_SKIN_TYPE: Record<SkinType, string[]> = {
  dry: ['hyaluronic acid', 'ceramides', 'squalane', 'glycerin', 'shea butter'],
  oily: ['niacinamide', 'salicylic acid', 'zinc', 'clay', 'lightweight hyaluronic acid'],
  combination: ['niacinamide', 'hyaluronic acid', 'lightweight ceramides'],
  normal: ['niacinamide', 'hyaluronic acid', 'vitamin c', 'peptides'],
  sensitive: ['centella asiatica', 'ceramides', 'oat extract', 'allantoin', 'panthenol'],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert concern to slug
 */
function toConcernSlug(concern: string): string {
  return concern.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Convert ingredient to slug
 */
function toIngredientSlug(ingredient: string): string {
  return ingredient.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Evaluate safety based on skin profile
 */
export function evaluateProfileSafety(profile: SkinProfile): ProfileSafetyResult {
  const ingredientsToAvoid: ProfileSafetyResult['ingredientsToAvoid'] = [];
  const ingredientsToUseWithCaution: ProfileSafetyResult['ingredientsToUseWithCaution'] = [];
  const generalGuidance: string[] = [];

  // Pregnancy/breastfeeding restrictions
  if (profile.contraindications?.pregnant || profile.contraindications?.breastfeeding) {
    PREGNANCY_UNSAFE.forEach(ingredient => {
      ingredientsToAvoid.push({
        ingredient,
        reason: 'Not recommended during pregnancy or breastfeeding',
      });
    });
    generalGuidance.push('Consult your healthcare provider before using new skincare actives');
  }

  // Allergy restrictions
  if (profile.contraindications?.allergies) {
    profile.contraindications.allergies.forEach(allergy => {
      ingredientsToAvoid.push({
        ingredient: allergy,
        reason: 'Listed as personal allergy',
      });
    });
  }

  // User's avoid list
  if (profile.avoidIngredients) {
    profile.avoidIngredients.forEach(ingredient => {
      ingredientsToAvoid.push({
        ingredient,
        reason: 'On your personal avoid list',
      });
    });
  }

  // Sensitivity-based restrictions
  if (profile.sensitivityLevel === 'severe' || profile.sensitivityLevel === 'moderate') {
    ingredientsToAvoid.push(
      { ingredient: 'fragrance', reason: 'High sensitivity risk' },
      { ingredient: 'essential oils', reason: 'High sensitivity risk' },
      { ingredient: 'alcohol denat', reason: 'Can irritate sensitive skin' }
    );

    ADVANCED_INGREDIENTS.forEach(ingredient => {
      ingredientsToUseWithCaution.push({
        ingredient,
        reason: 'Potent active that may irritate sensitive skin',
        guidance: 'Start with lowest concentration, patch test, and use infrequently',
      });
    });

    generalGuidance.push('Patch test all new products for 48 hours before full use');
    generalGuidance.push('Introduce new actives one at a time, waiting 2 weeks between');
  }

  // Skin type restrictions
  const skinTypeAvoid = AVOID_BY_SKIN_TYPE[profile.skinType] || [];
  skinTypeAvoid.forEach(ingredient => {
    if (!ingredientsToAvoid.some(i => i.ingredient === ingredient)) {
      ingredientsToAvoid.push({
        ingredient,
        reason: `Not ideal for ${profile.skinType} skin`,
      });
    }
  });

  // Experience level restrictions
  if (profile.experienceLevel === 'beginner') {
    ADVANCED_INGREDIENTS.forEach(ingredient => {
      if (!ingredientsToUseWithCaution.some(i => i.ingredient === ingredient)) {
        ingredientsToUseWithCaution.push({
          ingredient,
          reason: 'Strong active for beginners',
          guidance: 'Start with gentler alternatives or lowest concentration',
        });
      }
    });
    generalGuidance.push('Limit routine to 1 active ingredient to start');
    generalGuidance.push('Focus on basic routine (cleanser, moisturizer, SPF) before adding actives');
  }

  // Fragrance preference
  if (profile.preferences.fragranceFree) {
    if (!ingredientsToAvoid.some(i => i.ingredient === 'fragrance')) {
      ingredientsToAvoid.push({
        ingredient: 'fragrance',
        reason: 'Preference for fragrance-free products',
      });
    }
  }

  return {
    safe: ingredientsToAvoid.length === 0,
    ingredientsToAvoid,
    ingredientsToUseWithCaution,
    generalGuidance,
  };
}

/**
 * Generate ingredient filter based on profile
 */
export function generateIngredientFilter(profile: SkinProfile): IngredientFilterResult {
  const recommended: IngredientFilterResult['recommended'] = [];
  const avoid: IngredientFilterResult['avoid'] = [];
  const useWithCaution: IngredientFilterResult['useWithCaution'] = [];

  // Add skin type recommendations
  const skinTypeRecommend = RECOMMEND_BY_SKIN_TYPE[profile.skinType] || [];
  skinTypeRecommend.forEach(ingredient => {
    recommended.push({
      ingredient,
      reason: `Beneficial for ${profile.skinType} skin`,
      priority: 'high',
    });
  });

  // Add concern-based recommendations
  profile.primaryConcerns.forEach(concern => {
    const concernSlug = toConcernSlug(concern) as ConcernId;
    const concernKnowledge = CONCERN_ENCYCLOPEDIA[concernSlug];
    if (concernKnowledge) {
      concernKnowledge.recommendedIngredients.primary.forEach(ingredient => {
        if (!recommended.some(r => r.ingredient.toLowerCase() === ingredient.toLowerCase())) {
          recommended.push({
            ingredient,
            reason: `Addresses ${concern}`,
            priority: 'high',
          });
        }
      });
    }
  });

  // Add secondary concern recommendations
  if (profile.secondaryConcerns) {
    profile.secondaryConcerns.forEach(concern => {
      const concernSlug = toConcernSlug(concern) as ConcernId;
      const concernKnowledge = CONCERN_ENCYCLOPEDIA[concernSlug];
      if (concernKnowledge) {
        concernKnowledge.recommendedIngredients.primary.slice(0, 2).forEach(ingredient => {
          if (!recommended.some(r => r.ingredient.toLowerCase() === ingredient.toLowerCase())) {
            recommended.push({
              ingredient,
              reason: `Helps with ${concern}`,
              priority: 'medium',
            });
          }
        });
      }
    });
  }

  // Add loved ingredients
  if (profile.lovedIngredients) {
    profile.lovedIngredients.forEach(ingredient => {
      if (!recommended.some(r => r.ingredient.toLowerCase() === ingredient.toLowerCase())) {
        recommended.push({
          ingredient,
          reason: 'Works well for you based on history',
          priority: 'high',
        });
      }
    });
  }

  // Build avoid list from safety evaluation
  const safety = evaluateProfileSafety(profile);
  safety.ingredientsToAvoid.forEach(item => {
    avoid.push({
      ingredient: item.ingredient,
      reason: item.reason,
    });
  });

  // Add caution list
  safety.ingredientsToUseWithCaution.forEach(item => {
    useWithCaution.push({
      ingredient: item.ingredient,
      guidance: item.guidance,
    });
  });

  // Filter out avoided ingredients from recommended
  const filteredRecommended = recommended.filter(r =>
    !avoid.some(a => a.ingredient.toLowerCase() === r.ingredient.toLowerCase())
  );

  // Adjust for experience level
  if (profile.experienceLevel === 'beginner') {
    // Move strong actives to caution
    const strongActives = filteredRecommended.filter(r =>
      ADVANCED_INGREDIENTS.some(ai => r.ingredient.toLowerCase().includes(ai))
    );
    strongActives.forEach(active => {
      if (!useWithCaution.some(c => c.ingredient === active.ingredient)) {
        useWithCaution.push({
          ingredient: active.ingredient,
          guidance: 'Strong active - start slowly if you choose to use',
        });
      }
    });
  }

  // Sort by priority
  filteredRecommended.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return {
    recommended: filteredRecommended,
    avoid,
    useWithCaution,
  };
}

/**
 * Get texture recommendations based on profile
 */
export function getTextureRecommendations(profile: SkinProfile): TextureRecommendation {
  const base = TEXTURE_BY_SKIN_TYPE[profile.skinType] || TEXTURE_BY_SKIN_TYPE.normal;

  let preferred = [...base.preferred];
  let avoid = [...base.avoid];

  // Adjust for preferences
  if (profile.preferences.lightweight) {
    preferred = preferred.filter(t => !['heavy', 'rich', 'thick'].some(h => t.includes(h)));
    if (!preferred.includes('lightweight')) preferred.unshift('lightweight');
  }

  // Adjust for sensitivity
  if (profile.sensitivityLevel === 'severe' || profile.sensitivityLevel === 'moderate') {
    preferred.push('gentle', 'minimal ingredients');
    avoid.push('exfoliating textures', 'scrubs');
  }

  // Build reason
  let reason = `Based on your ${profile.skinType} skin`;
  if (profile.sensitivityLevel !== 'none') {
    reason += ` with ${profile.sensitivityLevel} sensitivity`;
  }
  if (profile.preferences.lightweight) {
    reason += ' and preference for lightweight textures';
  }

  return {
    preferred: [...new Set(preferred)],
    avoid: [...new Set(avoid)],
    reason,
  };
}

/**
 * Analyze skin profile and generate comprehensive guidance
 */
export function analyzeProfile(profile: SkinProfile): ProfileAnalysis {
  const ingredientFilter = generateIngredientFilter(profile);
  const textures = getTextureRecommendations(profile);
  const safety = evaluateProfileSafety(profile);

  // Build summary
  let summary = `${profile.skinType.charAt(0).toUpperCase() + profile.skinType.slice(1)} skin`;
  if (profile.sensitivityLevel !== 'none') {
    summary += ` with ${profile.sensitivityLevel} sensitivity`;
  }
  if (profile.primaryConcerns.length > 0) {
    summary += `, focusing on ${profile.primaryConcerns.slice(0, 2).join(' and ')}`;
  }
  summary += '.';

  // Build skin type guidance
  const skinTypeGuidance = getSkinTypeGuidance(profile.skinType, profile.sensitivityLevel);

  // Build concern priorities
  const concernPriorities: ProfileAnalysis['concernPriorities'] = [];

  profile.primaryConcerns.forEach(concern => {
    const concernSlug = toConcernSlug(concern) as ConcernId;
    const concernKnowledge = CONCERN_ENCYCLOPEDIA[concernSlug];
    concernPriorities.push({
      concern,
      priority: 'primary',
      suggestedIngredients: concernKnowledge?.recommendedIngredients.primary.slice(0, 3) || [],
    });
  });

  if (profile.secondaryConcerns) {
    profile.secondaryConcerns.forEach(concern => {
      const concernSlug = toConcernSlug(concern) as ConcernId;
      const concernKnowledge = CONCERN_ENCYCLOPEDIA[concernSlug];
      concernPriorities.push({
        concern,
        priority: 'secondary',
        suggestedIngredients: concernKnowledge?.recommendedIngredients.primary.slice(0, 2) || [],
      });
    });
  }

  // Determine routine complexity
  let routineComplexity: ProfileAnalysis['routineComplexity'] = 'moderate';
  if (profile.experienceLevel === 'beginner' || profile.lifestyle?.routineConsistency === 'minimal') {
    routineComplexity = 'minimal';
  } else if (profile.experienceLevel === 'advanced' && profile.lifestyle?.routineConsistency === 'dedicated') {
    routineComplexity = 'comprehensive';
  }

  return {
    summary,
    skinTypeGuidance,
    concernPriorities,
    safetyNotes: safety.generalGuidance,
    routineComplexity,
    texturePreferences: textures,
  };
}

/**
 * Get skin type specific guidance
 */
function getSkinTypeGuidance(skinType: SkinType, sensitivity: SensitivityLevel): string {
  const baseGuidance: Record<SkinType, string> = {
    dry: 'Focus on hydration and barrier support. Look for cream-based products with ceramides, hyaluronic acid, and nourishing oils. Avoid over-cleansing and harsh exfoliants.',
    oily: 'Focus on oil control and pore care. Look for lightweight, gel-based products with niacinamide and salicylic acid. Don\'t skip moisturizer - dehydrated skin produces more oil.',
    combination: 'Balance is key. Use lightweight hydration all over with targeted treatments for oily T-zone. Gel-creams work well.',
    normal: 'Maintain skin health with antioxidants and hydration. You can explore various actives, but don\'t overdo it.',
    sensitive: 'Prioritize barrier health and calming ingredients. Avoid fragrance, alcohol, and strong actives. Introduce new products slowly.',
  };

  let guidance = baseGuidance[skinType];

  if (sensitivity === 'moderate' || sensitivity === 'severe') {
    guidance += ' Given your sensitivity, always patch test and introduce products one at a time.';
  }

  return guidance;
}

/**
 * Build personalization context for AI responses
 */
export function buildPersonalizationContext(profile: SkinProfile): PersonalizationContext {
  const ingredientFilter = generateIngredientFilter(profile);
  const safety = evaluateProfileSafety(profile);

  // Determine routine guidance
  const maxActives = MAX_ACTIVES_BY_LEVEL[profile.experienceLevel];
  const exfoliationFrequency = EXFOLIATION_FREQUENCY[profile.sensitivityLevel];

  // Retinol safety
  const retinolSafe = !(
    profile.contraindications?.pregnant ||
    profile.contraindications?.breastfeeding ||
    profile.sensitivityLevel === 'severe' ||
    profile.experienceLevel === 'beginner'
  );

  // Acids safety
  const acidsSafe = !(
    profile.sensitivityLevel === 'severe' ||
    profile.skinType === 'sensitive'
  );

  return {
    profile,
    ingredientFilter,
    safety,
    routineGuidance: {
      maxActives,
      exfoliationFrequency,
      retinolSafe,
      acidsSafe,
    },
  };
}

/**
 * Check if an ingredient is suitable for a profile
 */
export function isIngredientSuitable(
  ingredient: string,
  profile: SkinProfile
): { suitable: boolean; reason: string; guidance?: string } {
  const lowerIngredient = ingredient.toLowerCase();
  const filter = generateIngredientFilter(profile);

  // Check avoid list
  const avoided = filter.avoid.find(a =>
    lowerIngredient.includes(a.ingredient.toLowerCase()) ||
    a.ingredient.toLowerCase().includes(lowerIngredient)
  );
  if (avoided) {
    return { suitable: false, reason: avoided.reason };
  }

  // Check caution list
  const caution = filter.useWithCaution.find(c =>
    lowerIngredient.includes(c.ingredient.toLowerCase()) ||
    c.ingredient.toLowerCase().includes(lowerIngredient)
  );
  if (caution) {
    return { suitable: true, reason: 'Use with caution', guidance: caution.guidance };
  }

  // Check recommended list
  const recommended = filter.recommended.find(r =>
    lowerIngredient.includes(r.ingredient.toLowerCase()) ||
    r.ingredient.toLowerCase().includes(lowerIngredient)
  );
  if (recommended) {
    return { suitable: true, reason: recommended.reason };
  }

  return { suitable: true, reason: 'No specific concerns for your profile' };
}

/**
 * Generate profile-based response prefix for AI
 */
export function generateProfilePrefix(profile: SkinProfile): string {
  const parts: string[] = [];

  parts.push(`For your ${profile.skinType} skin`);

  if (profile.sensitivityLevel !== 'none') {
    parts.push(`with ${profile.sensitivityLevel} sensitivity`);
  }

  if (profile.primaryConcerns.length > 0) {
    parts.push(`focusing on ${profile.primaryConcerns[0]}`);
  }

  if (profile.experienceLevel === 'beginner') {
    parts.push('(as a skincare beginner)');
  }

  return parts.join(' ') + ':';
}

/**
 * Format profile analysis for chat
 */
export function formatProfileForChat(analysis: ProfileAnalysis): string {
  const lines: string[] = [];

  // Header
  lines.push('## Your Skin Profile');
  lines.push(`\n${analysis.summary}\n`);

  // Skin type guidance
  lines.push('### Understanding Your Skin');
  lines.push(analysis.skinTypeGuidance);

  // Concern priorities
  if (analysis.concernPriorities.length > 0) {
    lines.push('\n### Your Concern Priorities');
    analysis.concernPriorities.forEach(({ concern, priority, suggestedIngredients }) => {
      const slug = toConcernSlug(concern);
      lines.push(`\n**${concern}** (${priority})`);
      if (suggestedIngredients.length > 0) {
        lines.push(`Key ingredients: ${suggestedIngredients.map(i => `[${i}](/ingredients/${toIngredientSlug(i)})`).join(', ')}`);
      }
      lines.push(`[Learn more](/learn/${slug})`);
    });
  }

  // Texture preferences
  lines.push('\n### Texture Preferences');
  lines.push(`**Look for:** ${analysis.texturePreferences.preferred.join(', ')}`);
  if (analysis.texturePreferences.avoid.length > 0) {
    lines.push(`**Avoid:** ${analysis.texturePreferences.avoid.join(', ')}`);
  }

  // Safety notes
  if (analysis.safetyNotes.length > 0) {
    lines.push('\n### Important Notes');
    analysis.safetyNotes.forEach(note => lines.push(`- ${note}`));
  }

  // Routine complexity
  lines.push('\n### Recommended Routine Complexity');
  const complexityText = {
    minimal: 'Start with basics: cleanser, moisturizer, and SPF. Add one active after you\'re comfortable.',
    moderate: 'Build a balanced routine with 1-2 actives. Morning and evening routines can differ.',
    comprehensive: 'Full routine with multiple targeted actives. Alternate nights for different treatments.',
  };
  lines.push(complexityText[analysis.routineComplexity]);

  return lines.join('\n');
}
