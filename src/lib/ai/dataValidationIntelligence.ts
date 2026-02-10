/**
 * Data Validation, Metadata Integrity & Knowledge Reliability Intelligence
 *
 * Validates all ingredient, product, concern, and user metadata before use.
 * Never relies on incomplete or inconsistent data without safety-first fallbacks.
 * All recommendations are grounded in verified, reliable metadata.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Validation status
 */
export type ValidationStatus = 'valid' | 'partial' | 'invalid' | 'missing';

/**
 * Validation severity
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  field: string;
  severity: ValidationSeverity;
  message: string;
  fallbackValue?: unknown;
  fallbackMessage?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  status: ValidationStatus;
  isUsable: boolean;
  issues: ValidationIssue[];
  fallbacksApplied: string[];
  safetyOverrides: string[];
}

/**
 * Ingredient metadata for validation
 */
export interface IngredientMetadata {
  name: string;
  synonyms?: string[];
  concentrationRange?: { min: number; max: number };
  benefits?: string[];
  concerns?: string[];
  conflicts?: string[];
  isPhotosensitizing?: boolean;
  pregnancySafe?: boolean;
  beginnerSafe?: boolean;
}

/**
 * Product metadata for validation
 */
export interface ProductMetadata {
  id: number;
  name: string;
  brand?: string;
  category: string;
  ingredients?: string[];
  keyIngredients?: string[];
  activeStrength?: 'gentle' | 'moderate' | 'strong';
  skinTypes?: string[];
  concerns?: string[];
  isFragranceFree?: boolean;
  isNonComedogenic?: boolean;
  source: 'marketplace' | 'discovery';
  price?: number;
}

/**
 * Concern metadata for validation
 */
export interface ConcernMetadata {
  name: string;
  slug?: string;
  recommendedIngredients?: string[];
  recommendedCategories?: string[];
  causes?: string[];
  description?: string;
}

/**
 * User profile metadata for validation
 */
export interface UserProfileMetadata {
  skinType?: string;
  concerns?: string[];
  sensitivities?: string[];
  preferences?: Record<string, boolean>;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  isPregnant?: boolean;
}

/**
 * Cross-check result
 */
export interface CrossCheckResult {
  isConsistent: boolean;
  inconsistencies: Array<{
    source1: string;
    source2: string;
    field: string;
    message: string;
    resolution: string;
  }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Required fields for each metadata type
 */
const REQUIRED_FIELDS = {
  ingredient: ['name'],
  product: ['id', 'name', 'category', 'source'],
  concern: ['name'],
  userProfile: [], // All user fields are optional
} as const;

/**
 * Valid skin types
 */
const VALID_SKIN_TYPES = ['oily', 'dry', 'combination', 'normal', 'sensitive'];

/**
 * Valid product categories
 */
const VALID_CATEGORIES = [
  'cleanser', 'toner', 'serum', 'essence', 'moisturizer', 'sunscreen',
  'treatment', 'exfoliant', 'mask', 'eye-cream', 'oil', 'mist',
];

/**
 * Valid experience levels
 */
const VALID_EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'];

/**
 * Valid product sources
 */
const VALID_SOURCES = ['marketplace', 'discovery'];

/**
 * Known ingredient names for validation
 */
const KNOWN_INGREDIENTS = [
  'niacinamide', 'retinol', 'vitamin c', 'hyaluronic acid', 'salicylic acid',
  'glycolic acid', 'lactic acid', 'azelaic acid', 'benzoyl peroxide',
  'ceramides', 'peptides', 'squalane', 'centella asiatica', 'vitamin e',
  'alpha arbutin', 'tranexamic acid', 'bakuchiol', 'panthenol', 'allantoin',
];

/**
 * Slug validation pattern
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ============================================================================
// INGREDIENT VALIDATION
// ============================================================================

/**
 * Validate ingredient metadata
 */
export function validateIngredient(ingredient: Partial<IngredientMetadata>): ValidationResult {
  const issues: ValidationIssue[] = [];
  const fallbacksApplied: string[] = [];
  const safetyOverrides: string[] = [];

  // Check required fields
  if (!ingredient.name || ingredient.name.trim() === '') {
    issues.push({
      field: 'name',
      severity: 'error',
      message: 'Ingredient name is missing',
    });
    return { status: 'invalid', isUsable: false, issues, fallbacksApplied, safetyOverrides };
  }

  // Validate name against known ingredients
  const normalizedName = ingredient.name.toLowerCase().trim();
  const isKnown = KNOWN_INGREDIENTS.some(known =>
    normalizedName.includes(known) || known.includes(normalizedName)
  );
  if (!isKnown) {
    issues.push({
      field: 'name',
      severity: 'info',
      message: 'Ingredient not in primary knowledge base',
      fallbackMessage: 'General guidance will be provided',
    });
  }

  // Validate concentration range
  if (ingredient.concentrationRange) {
    if (ingredient.concentrationRange.min > ingredient.concentrationRange.max) {
      issues.push({
        field: 'concentrationRange',
        severity: 'warning',
        message: 'Invalid concentration range',
        fallbackValue: null,
      });
      fallbacksApplied.push('Concentration data ignored');
    }
  } else {
    issues.push({
      field: 'concentrationRange',
      severity: 'info',
      message: 'Concentration data not available',
      fallbackMessage: 'Assuming moderate strength for safety',
    });
    safetyOverrides.push('Assumed moderate strength');
  }

  // Validate benefits array
  if (ingredient.benefits && !Array.isArray(ingredient.benefits)) {
    issues.push({
      field: 'benefits',
      severity: 'warning',
      message: 'Benefits not properly formatted',
      fallbackValue: [],
    });
    fallbacksApplied.push('Benefits data ignored');
  }

  // Check safety-critical fields
  if (ingredient.pregnancySafe === undefined) {
    issues.push({
      field: 'pregnancySafe',
      severity: 'info',
      message: 'Pregnancy safety not specified',
      fallbackMessage: 'Recommend consulting healthcare provider',
    });
    safetyOverrides.push('Pregnancy safety unknown - erring on caution');
  }

  // Determine overall status
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  let status: ValidationStatus = 'valid';
  if (errorCount > 0) status = 'invalid';
  else if (warningCount > 0) status = 'partial';

  return {
    status,
    isUsable: errorCount === 0,
    issues,
    fallbacksApplied,
    safetyOverrides,
  };
}

// ============================================================================
// PRODUCT VALIDATION
// ============================================================================

/**
 * Validate product metadata
 */
export function validateProduct(product: Partial<ProductMetadata>): ValidationResult {
  const issues: ValidationIssue[] = [];
  const fallbacksApplied: string[] = [];
  const safetyOverrides: string[] = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS.product) {
    const value = product[field as keyof ProductMetadata];
    if (value === undefined || value === null || value === '') {
      issues.push({
        field,
        severity: 'error',
        message: `Required field '${field}' is missing`,
      });
    }
  }

  // Validate product ID
  if (product.id !== undefined) {
    if (typeof product.id !== 'number' || product.id <= 0 || !Number.isInteger(product.id)) {
      issues.push({
        field: 'id',
        severity: 'error',
        message: 'Invalid product ID',
      });
    }
  }

  // Validate category
  if (product.category) {
    const normalizedCategory = product.category.toLowerCase().replace(/\s+/g, '-');
    if (!VALID_CATEGORIES.includes(normalizedCategory)) {
      issues.push({
        field: 'category',
        severity: 'warning',
        message: `Unknown category: ${product.category}`,
        fallbackValue: 'treatment',
      });
      fallbacksApplied.push('Defaulted to treatment category');
    }
  }

  // Validate source
  if (product.source && !VALID_SOURCES.includes(product.source)) {
    issues.push({
      field: 'source',
      severity: 'error',
      message: 'Invalid product source',
    });
  }

  // Validate ingredients list
  if (product.ingredients) {
    if (!Array.isArray(product.ingredients)) {
      issues.push({
        field: 'ingredients',
        severity: 'warning',
        message: 'Ingredients list not properly formatted',
        fallbackValue: [],
      });
      fallbacksApplied.push('Ingredients data ignored');
    }
  } else {
    issues.push({
      field: 'ingredients',
      severity: 'info',
      message: 'Full ingredient list not available',
      fallbackMessage: 'Recommendations based on key ingredients only',
    });
    safetyOverrides.push('Treat as potentially irritating for sensitive skin');
  }

  // Validate active strength
  if (product.activeStrength) {
    if (!['gentle', 'moderate', 'strong'].includes(product.activeStrength)) {
      issues.push({
        field: 'activeStrength',
        severity: 'warning',
        message: 'Invalid active strength value',
        fallbackValue: 'moderate',
      });
      fallbacksApplied.push('Assumed moderate strength');
    }
  } else {
    safetyOverrides.push('Strength unknown - assumed moderate');
  }

  // Validate skin types
  if (product.skinTypes) {
    if (!Array.isArray(product.skinTypes)) {
      issues.push({
        field: 'skinTypes',
        severity: 'warning',
        message: 'Skin types not properly formatted',
      });
    } else {
      const invalidTypes = product.skinTypes.filter(t => !VALID_SKIN_TYPES.includes(t.toLowerCase()));
      if (invalidTypes.length > 0) {
        issues.push({
          field: 'skinTypes',
          severity: 'info',
          message: `Unknown skin types: ${invalidTypes.join(', ')}`,
        });
      }
    }
  }

  // Validate price
  if (product.price !== undefined && (typeof product.price !== 'number' || product.price < 0)) {
    issues.push({
      field: 'price',
      severity: 'warning',
      message: 'Invalid price value',
      fallbackValue: null,
    });
    fallbacksApplied.push('Price data ignored');
  }

  // Determine status
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  let status: ValidationStatus = 'valid';
  if (errorCount > 0) status = 'invalid';
  else if (warningCount > 0) status = 'partial';

  return {
    status,
    isUsable: errorCount === 0,
    issues,
    fallbacksApplied,
    safetyOverrides,
  };
}

// ============================================================================
// CONCERN VALIDATION
// ============================================================================

/**
 * Validate concern metadata
 */
export function validateConcern(concern: Partial<ConcernMetadata>): ValidationResult {
  const issues: ValidationIssue[] = [];
  const fallbacksApplied: string[] = [];
  const safetyOverrides: string[] = [];

  // Check required fields
  if (!concern.name || concern.name.trim() === '') {
    issues.push({
      field: 'name',
      severity: 'error',
      message: 'Concern name is missing',
    });
    return { status: 'invalid', isUsable: false, issues, fallbacksApplied, safetyOverrides };
  }

  // Validate slug format
  if (concern.slug && !SLUG_PATTERN.test(concern.slug)) {
    issues.push({
      field: 'slug',
      severity: 'warning',
      message: 'Invalid slug format',
      fallbackValue: concern.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
    fallbacksApplied.push('Generated fallback slug');
  }

  // Validate recommended ingredients
  if (concern.recommendedIngredients) {
    if (!Array.isArray(concern.recommendedIngredients)) {
      issues.push({
        field: 'recommendedIngredients',
        severity: 'warning',
        message: 'Recommended ingredients not properly formatted',
      });
    } else if (concern.recommendedIngredients.length === 0) {
      issues.push({
        field: 'recommendedIngredients',
        severity: 'info',
        message: 'No recommended ingredients specified',
      });
    }
  }

  // Validate recommended categories
  if (concern.recommendedCategories) {
    if (!Array.isArray(concern.recommendedCategories)) {
      issues.push({
        field: 'recommendedCategories',
        severity: 'warning',
        message: 'Recommended categories not properly formatted',
      });
    }
  }

  // Determine status
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  let status: ValidationStatus = 'valid';
  if (errorCount > 0) status = 'invalid';
  else if (warningCount > 0) status = 'partial';

  return {
    status,
    isUsable: errorCount === 0,
    issues,
    fallbacksApplied,
    safetyOverrides,
  };
}

// ============================================================================
// USER PROFILE VALIDATION
// ============================================================================

/**
 * Validate user profile metadata
 */
export function validateUserProfile(profile: Partial<UserProfileMetadata>): ValidationResult {
  const issues: ValidationIssue[] = [];
  const fallbacksApplied: string[] = [];
  const safetyOverrides: string[] = [];

  // Validate skin type
  if (profile.skinType) {
    if (!VALID_SKIN_TYPES.includes(profile.skinType.toLowerCase())) {
      issues.push({
        field: 'skinType',
        severity: 'warning',
        message: `Unknown skin type: ${profile.skinType}`,
        fallbackValue: 'combination',
      });
      fallbacksApplied.push('Defaulted to combination skin type');
    }
  } else {
    issues.push({
      field: 'skinType',
      severity: 'info',
      message: 'Skin type not specified',
      fallbackMessage: 'General recommendations will be provided',
    });
  }

  // Validate concerns array
  if (profile.concerns && !Array.isArray(profile.concerns)) {
    issues.push({
      field: 'concerns',
      severity: 'warning',
      message: 'Concerns not properly formatted',
      fallbackValue: [],
    });
    fallbacksApplied.push('Concerns data ignored');
  }

  // Validate sensitivities array
  if (profile.sensitivities && !Array.isArray(profile.sensitivities)) {
    issues.push({
      field: 'sensitivities',
      severity: 'warning',
      message: 'Sensitivities not properly formatted',
      fallbackValue: [],
    });
    safetyOverrides.push('Treating as potentially sensitive');
  }

  // Validate experience level
  if (profile.experienceLevel) {
    if (!VALID_EXPERIENCE_LEVELS.includes(profile.experienceLevel)) {
      issues.push({
        field: 'experienceLevel',
        severity: 'warning',
        message: `Invalid experience level: ${profile.experienceLevel}`,
        fallbackValue: 'beginner',
      });
      fallbacksApplied.push('Defaulted to beginner level for safety');
      safetyOverrides.push('Conservative recommendations applied');
    }
  } else {
    safetyOverrides.push('Assumed beginner level for safety');
  }

  // Determine status
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  let status: ValidationStatus = 'valid';
  if (errorCount > 0) status = 'invalid';
  else if (warningCount > 0) status = 'partial';

  // User profiles are always usable (with fallbacks)
  return {
    status,
    isUsable: true,
    issues,
    fallbacksApplied,
    safetyOverrides,
  };
}

// ============================================================================
// CROSS-CHECKING
// ============================================================================

/**
 * Cross-check product against ingredient intelligence
 */
export function crossCheckProductIngredients(
  product: ProductMetadata,
  ingredientData: Record<string, IngredientMetadata>
): CrossCheckResult {
  const inconsistencies: CrossCheckResult['inconsistencies'] = [];

  if (!product.keyIngredients || product.keyIngredients.length === 0) {
    return { isConsistent: true, inconsistencies };
  }

  for (const ingredientName of product.keyIngredients) {
    const ingredientInfo = ingredientData[ingredientName.toLowerCase()];

    if (!ingredientInfo) {
      continue; // Unknown ingredient, no cross-check possible
    }

    // Check skin type compatibility
    if (product.skinTypes && ingredientInfo.beginnerSafe === false) {
      if (product.skinTypes.includes('sensitive')) {
        inconsistencies.push({
          source1: 'product.skinTypes',
          source2: 'ingredient.beginnerSafe',
          field: ingredientName,
          message: `Product claims suitability for sensitive skin but contains ${ingredientName} which may irritate`,
          resolution: 'Recommend patch testing and gradual introduction',
        });
      }
    }

    // Check concern alignment
    if (product.concerns && ingredientInfo.concerns) {
      const misaligned = product.concerns.filter(
        c => !ingredientInfo.concerns?.includes(c.toLowerCase())
      );
      if (misaligned.length > 0) {
        inconsistencies.push({
          source1: 'product.concerns',
          source2: 'ingredient.concerns',
          field: ingredientName,
          message: `Product targets ${misaligned.join(', ')} but ${ingredientName} may not address these`,
          resolution: 'Consider additional products for unaddressed concerns',
        });
      }
    }
  }

  return {
    isConsistent: inconsistencies.length === 0,
    inconsistencies,
  };
}

/**
 * Cross-check user profile against product suitability
 */
export function crossCheckProfileProduct(
  profile: UserProfileMetadata,
  product: ProductMetadata
): CrossCheckResult {
  const inconsistencies: CrossCheckResult['inconsistencies'] = [];

  // Check skin type match
  if (profile.skinType && product.skinTypes && product.skinTypes.length > 0) {
    if (!product.skinTypes.map(t => t.toLowerCase()).includes(profile.skinType.toLowerCase())) {
      inconsistencies.push({
        source1: 'profile.skinType',
        source2: 'product.skinTypes',
        field: 'skinType',
        message: `Product may not be ideal for ${profile.skinType} skin`,
        resolution: 'Consider alternatives better suited to your skin type',
      });
    }
  }

  // Check sensitivity concerns
  if (profile.sensitivities && profile.sensitivities.length > 0) {
    if (product.activeStrength === 'strong') {
      inconsistencies.push({
        source1: 'profile.sensitivities',
        source2: 'product.activeStrength',
        field: 'activeStrength',
        message: 'Strong active may irritate sensitive skin',
        resolution: 'Start with lower frequency or choose gentler alternative',
      });
    }

    if (profile.sensitivities.includes('fragrance') && !product.isFragranceFree) {
      inconsistencies.push({
        source1: 'profile.sensitivities',
        source2: 'product.isFragranceFree',
        field: 'fragrance',
        message: 'Product may contain fragrance',
        resolution: 'Check ingredient list for parfum/fragrance',
      });
    }
  }

  // Check experience level match
  if (profile.experienceLevel === 'beginner' && product.activeStrength === 'strong') {
    inconsistencies.push({
      source1: 'profile.experienceLevel',
      source2: 'product.activeStrength',
      field: 'experienceLevel',
      message: 'Strong active may be challenging for beginners',
      resolution: 'Start slowly with 1-2x per week usage',
    });
  }

  return {
    isConsistent: inconsistencies.length === 0,
    inconsistencies,
  };
}

// ============================================================================
// SLUG VALIDATION
// ============================================================================

/**
 * Validate and sanitize slug
 */
export function validateSlug(slug: string, type: 'ingredient' | 'concern' | 'category'): {
  isValid: boolean;
  sanitized: string | null;
  fallbackUrl: string;
} {
  const sanitized = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  if (!SLUG_PATTERN.test(sanitized) || sanitized.length === 0) {
    return {
      isValid: false,
      sanitized: null,
      fallbackUrl: type === 'ingredient' ? '/ingredients' :
                   type === 'concern' ? '/learn' :
                   '/discover',
    };
  }

  return {
    isValid: true,
    sanitized,
    fallbackUrl: '',
  };
}

/**
 * Validate product ID for linking
 */
export function validateProductId(id: unknown, source: 'marketplace' | 'discovery'): {
  isValid: boolean;
  validId: number | null;
  fallbackUrl: string;
} {
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    return {
      isValid: false,
      validId: null,
      fallbackUrl: source === 'marketplace' ? '/marketplace' : '/discover',
    };
  }

  return {
    isValid: true,
    validId: id,
    fallbackUrl: '',
  };
}

// ============================================================================
// SAFE FALLBACKS
// ============================================================================

/**
 * Generate safe fallback for missing data
 */
export function getSafeFallback(
  field: string,
  context: { userProfile?: UserProfileMetadata }
): { value: unknown; message: string } {
  switch (field) {
    case 'activeStrength':
      return {
        value: 'moderate',
        message: 'Strength not specified - assuming moderate for safety',
      };

    case 'experienceLevel':
      return {
        value: 'beginner',
        message: 'Experience level unknown - applying beginner-safe recommendations',
      };

    case 'skinType':
      return {
        value: 'combination',
        message: 'Skin type not specified - providing general recommendations',
      };

    case 'pregnancySafe':
      return {
        value: false,
        message: 'Pregnancy safety unknown - recommend consulting healthcare provider',
      };

    case 'ingredients':
      return {
        value: [],
        message: 'Full ingredient list unavailable - recommendations based on key ingredients',
      };

    case 'conflicts':
      return {
        value: [],
        message: 'Conflict data unavailable - avoid combining with strong actives',
      };

    default:
      return {
        value: null,
        message: `${field} data unavailable`,
      };
  }
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format validation result for AI context
 */
export function formatValidationForAI(result: ValidationResult): string {
  if (result.status === 'valid') {
    return 'Data validated successfully.';
  }

  const lines: string[] = [];

  if (result.fallbacksApplied.length > 0) {
    lines.push(`Fallbacks applied: ${result.fallbacksApplied.join('; ')}`);
  }

  if (result.safetyOverrides.length > 0) {
    lines.push(`Safety overrides: ${result.safetyOverrides.join('; ')}`);
  }

  const warnings = result.issues.filter(i => i.severity === 'warning' || i.severity === 'error');
  if (warnings.length > 0) {
    lines.push(`Issues: ${warnings.map(w => w.message).join('; ')}`);
  }

  return lines.join('\n');
}

/**
 * Format cross-check result for AI
 */
export function formatCrossCheckForAI(result: CrossCheckResult): string {
  if (result.isConsistent) {
    return 'Data cross-check passed.';
  }

  return result.inconsistencies.map(i =>
    `${i.message}. ${i.resolution}`
  ).join('\n');
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

/**
 * Data validation principles
 */
export const VALIDATION_PRINCIPLES = {
  required: [
    'Check that required fields exist',
    'Validate field types and formats',
    'Verify IDs and slugs are valid',
    'Confirm values are not empty or null',
  ],
  safety: [
    'Missing concentration = assume moderate strength',
    'Missing suitability = avoid for sensitive skin',
    'Missing conflicts = avoid combining with actives',
    'Incomplete ingredients = treat as potentially irritating',
  ],
  fallbacks: [
    'Provide safe fallback values',
    'Acknowledge limitations briefly',
    'Avoid guessing or fabricating',
    'Suggest alternatives with complete data',
  ],
  crossCheck: [
    'Verify ingredient data against product claims',
    'Check user profile against product suitability',
    'Default to safest interpretation',
    'Explain uncertainty calmly',
  ],
} as const;
