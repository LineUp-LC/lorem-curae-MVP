/**
 * Personalization History, Preferences & Behavioral Intelligence for Lorem Curae AI
 *
 * Uses the user's browsing, saving, and preference patterns to refine
 * recommendations. Behavioral signals enhance personalization without
 * becoming intrusive. Safety always overrides preference.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Types of behavioral signals we track
 */
export type BehaviorSignalType =
  | 'product_viewed'
  | 'product_saved'
  | 'product_removed'
  | 'product_purchased'
  | 'ingredient_explored'
  | 'concern_explored'
  | 'routine_built'
  | 'step_skipped'
  | 'preference_expressed'
  | 'category_browsed';

/**
 * Individual behavioral signal
 */
export interface BehaviorSignal {
  type: BehaviorSignalType;
  entityId?: number;
  entityName: string;
  category?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  strength: 'weak' | 'moderate' | 'strong';
}

/**
 * Aggregated user behavior patterns
 */
export interface BehaviorPatterns {
  // Product preferences
  viewedProducts: Array<{ id: number; name: string; brand?: string; category: string; count: number }>;
  savedProducts: Array<{ id: number; name: string; brand?: string; category: string }>;
  removedProducts: Array<{ id: number; name: string; reason?: string }>;

  // Ingredient preferences
  exploredIngredients: Array<{ name: string; count: number; lastExplored: string }>;
  avoidedIngredients: string[];

  // Concern focus
  exploredConcerns: Array<{ name: string; count: number; lastExplored: string }>;

  // Texture & format preferences
  texturePreferences: {
    preferred: string[];
    avoided: string[];
  };

  // Budget patterns
  budgetRange: {
    typical: 'budget' | 'mid' | 'premium' | 'mixed';
    averagePrice?: number;
  };

  // Brand affinity
  brandAffinity: Array<{ brand: string; interactionCount: number }>;

  // Routine patterns
  routinePreferences: {
    complexity: 'minimalist' | 'moderate' | 'advanced' | 'unknown';
    skippedSteps: string[];
    preferredSteps: string[];
  };

  // Avoidance patterns
  avoidancePatterns: {
    fragranceFree: boolean;
    lightweightOnly: boolean;
    noStrongActives: boolean;
    customAvoidances: string[];
  };
}

/**
 * Detected behavioral trend
 */
export interface BehavioralTrend {
  type: 'emerging_interest' | 'shifting_preference' | 'leveling_up' | 'expanding_concerns' | 'budget_shift';
  description: string;
  confidence: 'high' | 'medium' | 'low';
  suggestion?: string;
  relatedEntities: string[];
}

/**
 * Preference conflict
 */
export interface PreferenceConflict {
  behaviorPattern: string;
  safetyRule: string;
  severity: 'info' | 'warning' | 'critical';
  suggestion: string;
}

/**
 * Personalization context for recommendations
 */
export interface PersonalizationContext {
  patterns: BehaviorPatterns;
  trends: BehavioralTrend[];
  conflicts: PreferenceConflict[];
  personalizationNotes: string[];
  shouldApply: {
    textureFilter: boolean;
    budgetFilter: boolean;
    brandBoost: boolean;
    ingredientBoost: boolean;
    avoidanceFilter: boolean;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Signal strength thresholds
 */
const SIGNAL_THRESHOLDS = {
  weak: 1,
  moderate: 3,
  strong: 5,
} as const;

/**
 * Texture keywords for detection
 */
const TEXTURE_KEYWORDS: Record<string, string[]> = {
  gel: ['gel', 'gel-cream', 'water-gel', 'jelly'],
  cream: ['cream', 'rich', 'thick', 'butter'],
  lightweight: ['lightweight', 'light', 'watery', 'fluid'],
  oil: ['oil', 'facial oil', 'face oil'],
  serum: ['serum', 'essence', 'ampoule'],
  lotion: ['lotion', 'emulsion', 'milk'],
};

/**
 * Budget range thresholds
 */
const BUDGET_THRESHOLDS = {
  budget: { min: 0, max: 20 },
  mid: { min: 20, max: 50 },
  premium: { min: 50, max: Infinity },
} as const;

/**
 * Forbidden data types (never store)
 */
const FORBIDDEN_DATA_TYPES = [
  'medical_diagnosis',
  'emotional_disclosure',
  'personal_identifier',
  'non_skincare_data',
  'health_condition',
  'medication',
] as const;

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Analyze user signals to detect behavior patterns
 */
export function analyzePatterns(signals: BehaviorSignal[]): BehaviorPatterns {
  // Initialize patterns
  const patterns: BehaviorPatterns = {
    viewedProducts: [],
    savedProducts: [],
    removedProducts: [],
    exploredIngredients: [],
    avoidedIngredients: [],
    exploredConcerns: [],
    texturePreferences: { preferred: [], avoided: [] },
    budgetRange: { typical: 'mixed' },
    brandAffinity: [],
    routinePreferences: {
      complexity: 'unknown',
      skippedSteps: [],
      preferredSteps: [],
    },
    avoidancePatterns: {
      fragranceFree: false,
      lightweightOnly: false,
      noStrongActives: false,
      customAvoidances: [],
    },
  };

  // Process each signal
  for (const signal of signals) {
    processSignal(signal, patterns);
  }

  // Consolidate and rank
  consolidatePatterns(patterns);

  return patterns;
}

/**
 * Process individual signal into patterns
 */
function processSignal(signal: BehaviorSignal, patterns: BehaviorPatterns): void {
  switch (signal.type) {
    case 'product_viewed': {
      const existing = patterns.viewedProducts.find(p => p.id === signal.entityId);
      if (existing) {
        existing.count++;
      } else if (signal.entityId) {
        patterns.viewedProducts.push({
          id: signal.entityId,
          name: signal.entityName,
          brand: signal.metadata?.brand as string,
          category: signal.category || 'unknown',
          count: 1,
        });
      }
      break;
    }

    case 'product_saved': {
      if (signal.entityId && !patterns.savedProducts.find(p => p.id === signal.entityId)) {
        patterns.savedProducts.push({
          id: signal.entityId,
          name: signal.entityName,
          brand: signal.metadata?.brand as string,
          category: signal.category || 'unknown',
        });
      }
      break;
    }

    case 'product_removed': {
      if (signal.entityId) {
        patterns.removedProducts.push({
          id: signal.entityId,
          name: signal.entityName,
          reason: signal.metadata?.reason as string,
        });
      }
      break;
    }

    case 'ingredient_explored': {
      const existing = patterns.exploredIngredients.find(i => i.name === signal.entityName);
      if (existing) {
        existing.count++;
        existing.lastExplored = signal.timestamp;
      } else {
        patterns.exploredIngredients.push({
          name: signal.entityName,
          count: 1,
          lastExplored: signal.timestamp,
        });
      }
      break;
    }

    case 'concern_explored': {
      const existing = patterns.exploredConcerns.find(c => c.name === signal.entityName);
      if (existing) {
        existing.count++;
        existing.lastExplored = signal.timestamp;
      } else {
        patterns.exploredConcerns.push({
          name: signal.entityName,
          count: 1,
          lastExplored: signal.timestamp,
        });
      }
      break;
    }

    case 'preference_expressed': {
      const preference = signal.entityName.toLowerCase();

      // Texture preferences
      for (const [texture, keywords] of Object.entries(TEXTURE_KEYWORDS)) {
        if (keywords.some(kw => preference.includes(kw))) {
          if (preference.includes('prefer') || preference.includes('like')) {
            if (!patterns.texturePreferences.preferred.includes(texture)) {
              patterns.texturePreferences.preferred.push(texture);
            }
          } else if (preference.includes('avoid') || preference.includes('don\'t like') || preference.includes('hate')) {
            if (!patterns.texturePreferences.avoided.includes(texture)) {
              patterns.texturePreferences.avoided.push(texture);
            }
          }
        }
      }

      // Avoidance patterns
      if (preference.includes('fragrance-free') || preference.includes('unscented')) {
        patterns.avoidancePatterns.fragranceFree = true;
      }
      if (preference.includes('lightweight') || preference.includes('not heavy')) {
        patterns.avoidancePatterns.lightweightOnly = true;
      }
      break;
    }

    case 'step_skipped': {
      if (!patterns.routinePreferences.skippedSteps.includes(signal.entityName)) {
        patterns.routinePreferences.skippedSteps.push(signal.entityName);
      }
      break;
    }
  }
}

/**
 * Consolidate and rank patterns
 */
function consolidatePatterns(patterns: BehaviorPatterns): void {
  // Sort viewed products by count
  patterns.viewedProducts.sort((a, b) => b.count - a.count);

  // Sort explored ingredients by count
  patterns.exploredIngredients.sort((a, b) => b.count - a.count);

  // Detect brand affinity
  const brandCounts: Record<string, number> = {};
  for (const product of [...patterns.viewedProducts, ...patterns.savedProducts]) {
    if (product.brand) {
      brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
    }
  }
  patterns.brandAffinity = Object.entries(brandCounts)
    .map(([brand, count]) => ({ brand, interactionCount: count }))
    .sort((a, b) => b.interactionCount - a.interactionCount)
    .slice(0, 5);

  // Determine routine complexity preference
  const savedCount = patterns.savedProducts.length;
  const skippedCount = patterns.routinePreferences.skippedSteps.length;
  if (skippedCount > 3) {
    patterns.routinePreferences.complexity = 'minimalist';
  } else if (savedCount > 10) {
    patterns.routinePreferences.complexity = 'advanced';
  } else if (savedCount > 5) {
    patterns.routinePreferences.complexity = 'moderate';
  }
}

// ============================================================================
// TREND DETECTION
// ============================================================================

/**
 * Detect behavioral trends over time
 */
export function detectTrends(
  patterns: BehaviorPatterns,
  recentSignals: BehaviorSignal[]
): BehavioralTrend[] {
  const trends: BehavioralTrend[] = [];

  // Detect emerging ingredient interest
  const recentIngredients = recentSignals
    .filter(s => s.type === 'ingredient_explored')
    .map(s => s.entityName);

  const ingredientCounts: Record<string, number> = {};
  for (const ing of recentIngredients) {
    ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
  }

  for (const [ingredient, count] of Object.entries(ingredientCounts)) {
    if (count >= 3) {
      trends.push({
        type: 'emerging_interest',
        description: `Growing interest in ${ingredient}`,
        confidence: count >= 5 ? 'high' : 'medium',
        suggestion: `Since you've been exploring ${ingredient}, here are products that feature it prominently.`,
        relatedEntities: [ingredient],
      });
    }
  }

  // Detect texture shift
  const preferredTextures = patterns.texturePreferences.preferred;
  if (preferredTextures.length > 0) {
    const newlyPreferred = preferredTextures[preferredTextures.length - 1];
    if (preferredTextures.length >= 2) {
      trends.push({
        type: 'shifting_preference',
        description: `Shifting toward ${newlyPreferred} textures`,
        confidence: 'medium',
        relatedEntities: [newlyPreferred],
      });
    }
  }

  // Detect leveling up (beginner → intermediate actives)
  const activeIngredients = ['retinol', 'glycolic acid', 'vitamin c', 'niacinamide', 'azelaic acid'];
  const exploredActives = patterns.exploredIngredients
    .filter(i => activeIngredients.includes(i.name.toLowerCase()))
    .map(i => i.name);

  if (exploredActives.length >= 3) {
    trends.push({
      type: 'leveling_up',
      description: 'Exploring more active ingredients',
      confidence: 'medium',
      suggestion: 'As you explore more actives, remember to introduce them slowly and watch for sensitivity.',
      relatedEntities: exploredActives,
    });
  }

  // Detect expanding concerns
  if (patterns.exploredConcerns.length >= 3) {
    const concerns = patterns.exploredConcerns.map(c => c.name);
    trends.push({
      type: 'expanding_concerns',
      description: 'Exploring multiple skin concerns',
      confidence: 'medium',
      suggestion: 'Prioritize 1-2 concerns at a time for the best results.',
      relatedEntities: concerns,
    });
  }

  return trends;
}

// ============================================================================
// PREFERENCE APPLICATION
// ============================================================================

/**
 * Apply behavioral preferences to filter/boost products
 */
export function applyBehavioralPreferences(
  products: Array<{
    id: number;
    name: string;
    brand?: string;
    category: string;
    price?: number;
    texture?: string;
    keyIngredients?: string[];
    isFragranceFree?: boolean;
  }>,
  patterns: BehaviorPatterns
): Array<{
  product: typeof products[0];
  behaviorScore: number;
  reasons: string[];
}> {
  return products.map(product => {
    let score = 0;
    const reasons: string[] = [];

    // Brand affinity boost
    const brandMatch = patterns.brandAffinity.find(b => b.brand === product.brand);
    if (brandMatch && brandMatch.interactionCount >= 2) {
      score += 2;
      reasons.push(`You've shown interest in ${product.brand}`);
    }

    // Texture preference match
    if (product.texture) {
      const textureMatch = patterns.texturePreferences.preferred.some(
        t => product.texture?.toLowerCase().includes(t)
      );
      if (textureMatch) {
        score += 3;
        reasons.push('Matches your texture preference');
      }

      const textureAvoid = patterns.texturePreferences.avoided.some(
        t => product.texture?.toLowerCase().includes(t)
      );
      if (textureAvoid) {
        score -= 5;
        reasons.push('May not match your texture preference');
      }
    }

    // Ingredient interest boost
    if (product.keyIngredients) {
      const matchedIngredients = product.keyIngredients.filter(ing =>
        patterns.exploredIngredients.some(e => e.name.toLowerCase() === ing.toLowerCase() && e.count >= 2)
      );
      if (matchedIngredients.length > 0) {
        score += matchedIngredients.length * 2;
        reasons.push(`Contains ${matchedIngredients[0]} you've been exploring`);
      }
    }

    // Fragrance-free preference
    if (patterns.avoidancePatterns.fragranceFree && product.isFragranceFree) {
      score += 2;
      reasons.push('Fragrance-free as you prefer');
    } else if (patterns.avoidancePatterns.fragranceFree && !product.isFragranceFree) {
      score -= 3;
    }

    // Category match from saved products
    const categorySaved = patterns.savedProducts.filter(p => p.category === product.category).length;
    if (categorySaved >= 2) {
      score += 1;
    }

    return { product, behaviorScore: score, reasons };
  }).sort((a, b) => b.behaviorScore - a.behaviorScore);
}

// ============================================================================
// CONFLICT DETECTION
// ============================================================================

/**
 * Detect conflicts between behavior and safety/profile
 */
export function detectPreferenceConflicts(
  patterns: BehaviorPatterns,
  userProfile: {
    skinType?: string;
    sensitivities?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    isPregnant?: boolean;
  }
): PreferenceConflict[] {
  const conflicts: PreferenceConflict[] = [];

  // Strong actives for beginners
  const strongActives = ['retinol', 'glycolic acid', 'tca', 'tretinoin'];
  const exploredStrong = patterns.exploredIngredients.filter(
    i => strongActives.includes(i.name.toLowerCase())
  );

  if (userProfile.experienceLevel === 'beginner' && exploredStrong.length > 0) {
    conflicts.push({
      behaviorPattern: `Interest in ${exploredStrong[0].name}`,
      safetyRule: 'Strong actives require gradual introduction for beginners',
      severity: 'warning',
      suggestion: `Start with lower concentrations of ${exploredStrong[0].name} and use 1-2x per week.`,
    });
  }

  // Exfoliants for sensitive skin
  const exfoliants = ['glycolic acid', 'salicylic acid', 'lactic acid', 'mandelic acid'];
  const exploredExfoliants = patterns.exploredIngredients.filter(
    i => exfoliants.includes(i.name.toLowerCase())
  );

  if (userProfile.sensitivities?.includes('sensitive') && exploredExfoliants.length > 1) {
    conflicts.push({
      behaviorPattern: 'Exploring multiple exfoliants',
      safetyRule: 'Sensitive skin may react to frequent exfoliation',
      severity: 'warning',
      suggestion: 'Choose one gentle exfoliant and use 1-2x per week.',
    });
  }

  // Pregnancy-unsafe interests
  const pregnancyUnsafe = ['retinol', 'retinoid', 'salicylic acid'];
  const exploredUnsafe = patterns.exploredIngredients.filter(
    i => pregnancyUnsafe.includes(i.name.toLowerCase())
  );

  if (userProfile.isPregnant && exploredUnsafe.length > 0) {
    conflicts.push({
      behaviorPattern: `Interest in ${exploredUnsafe[0].name}`,
      safetyRule: 'This ingredient is not recommended during pregnancy',
      severity: 'critical',
      suggestion: 'Consider pregnancy-safe alternatives like azelaic acid or niacinamide.',
    });
  }

  // Fragrance products for sensitivity
  if (userProfile.sensitivities?.includes('fragrance') && !patterns.avoidancePatterns.fragranceFree) {
    const fragranceProducts = patterns.savedProducts.filter(p => p.name.toLowerCase().includes('scented'));
    if (fragranceProducts.length > 0) {
      conflicts.push({
        behaviorPattern: 'Saving products that may contain fragrance',
        safetyRule: 'Your profile indicates fragrance sensitivity',
        severity: 'info',
        suggestion: 'Check ingredient lists for parfum/fragrance before purchasing.',
      });
    }
  }

  return conflicts;
}

// ============================================================================
// PERSONALIZATION CONTEXT BUILDING
// ============================================================================

/**
 * Build complete personalization context for AI
 */
export function buildPersonalizationContext(
  signals: BehaviorSignal[],
  userProfile?: {
    skinType?: string;
    sensitivities?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    isPregnant?: boolean;
  }
): PersonalizationContext {
  // Analyze patterns
  const patterns = analyzePatterns(signals);

  // Detect trends from recent signals (last 30 days simulation)
  const recentSignals = signals.slice(-50);
  const trends = detectTrends(patterns, recentSignals);

  // Detect conflicts
  const conflicts = userProfile ? detectPreferenceConflicts(patterns, userProfile) : [];

  // Generate personalization notes
  const personalizationNotes: string[] = [];

  if (patterns.texturePreferences.preferred.length > 0) {
    personalizationNotes.push(`Prefers ${patterns.texturePreferences.preferred.join(', ')} textures`);
  }

  if (patterns.brandAffinity.length > 0 && patterns.brandAffinity[0].interactionCount >= 3) {
    personalizationNotes.push(`Shows affinity for ${patterns.brandAffinity[0].brand}`);
  }

  if (patterns.exploredIngredients.length > 0) {
    const topIngredient = patterns.exploredIngredients[0];
    if (topIngredient.count >= 3) {
      personalizationNotes.push(`Frequently explores ${topIngredient.name}`);
    }
  }

  if (patterns.avoidancePatterns.fragranceFree) {
    personalizationNotes.push('Prefers fragrance-free products');
  }

  if (patterns.routinePreferences.complexity !== 'unknown') {
    personalizationNotes.push(`Prefers ${patterns.routinePreferences.complexity} routines`);
  }

  // Determine which filters to apply
  const shouldApply = {
    textureFilter: patterns.texturePreferences.preferred.length > 0,
    budgetFilter: patterns.budgetRange.typical !== 'mixed',
    brandBoost: patterns.brandAffinity.some(b => b.interactionCount >= 3),
    ingredientBoost: patterns.exploredIngredients.some(i => i.count >= 3),
    avoidanceFilter: patterns.avoidancePatterns.fragranceFree ||
                     patterns.avoidancePatterns.lightweightOnly ||
                     patterns.avoidancePatterns.customAvoidances.length > 0,
  };

  return {
    patterns,
    trends,
    conflicts,
    personalizationNotes,
    shouldApply,
  };
}

// ============================================================================
// FORMATTING FOR AI
// ============================================================================

/**
 * Format behavioral context for AI response generation
 */
export function formatBehavioralContextForAI(context: PersonalizationContext): string {
  const lines: string[] = [];

  // Personalization notes
  if (context.personalizationNotes.length > 0) {
    lines.push('**User Preferences (from behavior):**');
    context.personalizationNotes.forEach(note => lines.push(`- ${note}`));
    lines.push('');
  }

  // Active trends
  if (context.trends.length > 0) {
    lines.push('**Detected Trends:**');
    context.trends.forEach(trend => lines.push(`- ${trend.description}`));
    lines.push('');
  }

  // Conflicts to address
  if (context.conflicts.length > 0) {
    lines.push('**Preference Conflicts (address gently):**');
    context.conflicts.forEach(c => lines.push(`- ${c.behaviorPattern} vs ${c.safetyRule}`));
  }

  return lines.join('\n');
}

/**
 * Generate subtle personalization reference for response
 */
export function generatePersonalizationReference(
  patterns: BehaviorPatterns,
  type: 'ingredient' | 'product' | 'texture' | 'brand'
): string | null {
  switch (type) {
    case 'ingredient': {
      const top = patterns.exploredIngredients[0];
      if (top && top.count >= 3) {
        return `Since you've been exploring ${top.name}`;
      }
      break;
    }
    case 'product': {
      if (patterns.savedProducts.length >= 3) {
        return 'Based on products you\'ve saved';
      }
      break;
    }
    case 'texture': {
      if (patterns.texturePreferences.preferred.length > 0) {
        return `Keeping your preference for ${patterns.texturePreferences.preferred[0]} textures in mind`;
      }
      break;
    }
    case 'brand': {
      const topBrand = patterns.brandAffinity[0];
      if (topBrand && topBrand.interactionCount >= 3) {
        return `You've shown interest in ${topBrand.brand}`;
      }
      break;
    }
  }
  return null;
}

// ============================================================================
// DATA SAFETY
// ============================================================================

/**
 * Check if data is safe to store (not forbidden)
 */
export function isSafeToStore(data: string, type: string): boolean {
  const lowerData = data.toLowerCase();

  // Check for forbidden content
  const forbiddenPatterns = [
    /medical|diagnosis|doctor|prescription/i,
    /depression|anxiety|stress|emotional/i,
    /address|phone|email|social security/i,
    /medication|drug|treatment/i,
  ];

  if (forbiddenPatterns.some(pattern => pattern.test(lowerData))) {
    return false;
  }

  // Check type
  if (FORBIDDEN_DATA_TYPES.includes(type as any)) {
    return false;
  }

  return true;
}

/**
 * Sanitize behavioral data before storage
 */
export function sanitizeBehaviorData(signal: Partial<BehaviorSignal>): BehaviorSignal | null {
  // Must have required fields
  if (!signal.type || !signal.entityName) {
    return null;
  }

  // Check if safe to store
  if (!isSafeToStore(signal.entityName, signal.type)) {
    return null;
  }

  return {
    type: signal.type,
    entityId: signal.entityId,
    entityName: signal.entityName,
    category: signal.category,
    metadata: signal.metadata,
    timestamp: signal.timestamp || new Date().toISOString(),
    strength: signal.strength || 'weak',
  };
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

/**
 * Behavioral intelligence principles
 */
export const BEHAVIORAL_PRINCIPLES = {
  tracking: [
    'Track non-sensitive behavioral data only',
    'Prioritize explicit preferences over inferred ones',
    'Treat repeated actions as stronger signals',
    'Never store medical or emotional data',
  ],
  application: [
    'Use patterns to refine recommendations',
    'Reference behavior subtly and professionally',
    'Never override safety rules with preferences',
    'Avoid sounding intrusive or overly familiar',
  ],
  safety: [
    'Safety always overrides user preference',
    'Flag preference-safety conflicts gently',
    'Suggest safer alternatives when needed',
    'Warn even for repeated unsafe behavior',
  ],
  privacy: [
    'No medical information',
    'No emotional disclosures',
    'No personal identifiers',
    'Skincare-related data only',
  ],
} as const;
