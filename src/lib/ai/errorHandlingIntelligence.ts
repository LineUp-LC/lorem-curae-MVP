/**
 * Error Handling & Safety Intelligence for Lorem Curae AI
 *
 * Manages graceful error detection, safe fallbacks, and user-facing
 * error responses while maintaining trust and professionalism.
 */

// ============================================================================
// ERROR CATEGORIES
// ============================================================================

/**
 * Categories of errors the AI can detect and handle
 */
export type ErrorCategory =
  | 'missing_data'        // Required info not found
  | 'conflicting_data'    // Inconsistent metadata
  | 'unsupported_request' // Medical, diagnostic, or unsafe
  | 'unsafe_combination'  // Ingredient or routine conflicts
  | 'invalid_input'       // Nonsense, incomplete, contradictory
  | 'retrieval_failure'   // No relevant knowledge returned
  | 'system_error';       // Timeouts, malformed data, unavailable fields

/**
 * Severity levels for errors
 */
export type ErrorSeverity =
  | 'low'      // Minor gap, can proceed with alternatives
  | 'medium'   // Notable issue, needs acknowledgment
  | 'high'     // Significant problem, requires careful handling
  | 'critical'; // Safety concern, must not proceed as requested

/**
 * Detected error with context
 */
export interface DetectedError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  context?: string;
  suggestedAction?: string;
  safeAlternative?: string;
}

/**
 * Error handling result
 */
export interface ErrorHandlingResult {
  hasError: boolean;
  errors: DetectedError[];
  canProceed: boolean;
  userMessage: string;
  internalLog?: string;
}

// ============================================================================
// UNSAFE REQUEST DETECTION
// ============================================================================

/**
 * Patterns indicating medical/diagnostic requests
 */
const MEDICAL_REQUEST_PATTERNS = [
  /\b(diagnose|diagnosis|what condition|what disease|is this|do I have)\b/i,
  /\b(prescribe|prescription|medication|drug|antibiotic|steroid)\b/i,
  /\b(treat my|cure my|heal my|fix my)\s+(eczema|psoriasis|rosacea|dermatitis|infection)\b/i,
  /\b(should I see a doctor|is this serious|emergency|urgent)\b/i,
  /\b(biopsy|mole check|skin cancer|melanoma|lesion)\b/i,
];

/**
 * Patterns indicating pregnancy-unsafe requests
 */
const PREGNANCY_UNSAFE_PATTERNS = [
  /\b(pregnant|pregnancy|expecting|breastfeeding|nursing)\b.*\b(retinol|retinoid|tretinoin|adapalene|tazarotene)\b/i,
  /\b(retinol|retinoid|tretinoin|adapalene|tazarotene)\b.*\b(pregnant|pregnancy|expecting|breastfeeding|nursing)\b/i,
  /\b(pregnant|pregnancy)\b.*\b(salicylic acid|hydroquinone|benzoyl peroxide)\b/i,
];

/**
 * Patterns indicating overuse of strong actives
 */
const OVERUSE_PATTERNS = [
  /\b(every day|daily|twice a day|morning and night)\b.*\b(retinol|aha|bha|glycolic|salicylic|lactic)\b/i,
  /\b(retinol|aha|bha|glycolic|salicylic|lactic)\b.*\b(every day|daily|twice a day|morning and night)\b/i,
  /\b(multiple|several|many)\s+(actives|acids|exfoliants)\b/i,
  /\b(layer|combine|mix)\b.*\b(retinol|vitamin c|aha|bha)\b.*\b(retinol|vitamin c|aha|bha)\b/i,
];

/**
 * Check if request is medical/diagnostic
 */
export function isMedicalRequest(message: string): boolean {
  return MEDICAL_REQUEST_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Check if request involves pregnancy-unsafe ingredients
 */
export function isPregnancyUnsafeRequest(message: string): boolean {
  return PREGNANCY_UNSAFE_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Check if request suggests overuse of actives
 */
export function isOveruseRequest(message: string): boolean {
  return OVERUSE_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Detect all unsafe aspects of a request
 */
export function detectUnsafeRequest(message: string): DetectedError | null {
  if (isMedicalRequest(message)) {
    return {
      category: 'unsupported_request',
      severity: 'critical',
      message: 'This appears to be a medical question requiring professional evaluation.',
      suggestedAction: 'Redirect to dermatologist while providing general skincare guidance.',
      safeAlternative: 'I can share general skincare information, but for medical concerns, please consult a dermatologist.',
    };
  }

  if (isPregnancyUnsafeRequest(message)) {
    return {
      category: 'unsafe_combination',
      severity: 'critical',
      message: 'Request involves pregnancy-unsafe ingredients.',
      suggestedAction: 'Suggest pregnancy-safe alternatives.',
      safeAlternative: 'During pregnancy, I recommend avoiding retinoids and high-concentration salicylic acid. Let me suggest some pregnancy-safe alternatives.',
    };
  }

  if (isOveruseRequest(message)) {
    return {
      category: 'unsafe_combination',
      severity: 'high',
      message: 'Request suggests overuse of strong actives.',
      suggestedAction: 'Recommend reduced frequency and proper spacing.',
      safeAlternative: 'Using multiple actives daily can irritate your skin. Let me suggest a gentler schedule.',
    };
  }

  return null;
}

// ============================================================================
// INGREDIENT CONFLICT DETECTION
// ============================================================================

/**
 * Known ingredient conflicts (hard conflicts - never combine)
 */
const HARD_CONFLICTS: Array<[string[], string[], string]> = [
  [['retinol', 'retinoid', 'tretinoin'], ['aha', 'glycolic acid', 'lactic acid'], 'Retinoids and AHAs can cause severe irritation when combined.'],
  [['retinol', 'retinoid', 'tretinoin'], ['bha', 'salicylic acid'], 'Retinoids and BHAs together may over-exfoliate and damage your barrier.'],
  [['retinol', 'retinoid', 'tretinoin'], ['benzoyl peroxide'], 'Benzoyl peroxide can deactivate retinoids, reducing effectiveness.'],
  [['vitamin c', 'ascorbic acid', 'l-ascorbic'], ['benzoyl peroxide'], 'Benzoyl peroxide can oxidize Vitamin C, making it less effective.'],
  [['aha', 'glycolic acid', 'lactic acid'], ['bha', 'salicylic acid'], 'Combining AHAs and BHAs in the same routine risks over-exfoliation.'],
];

/**
 * Soft conflicts (can alternate AM/PM or different days)
 */
const SOFT_CONFLICTS: Array<[string[], string[], string]> = [
  [['vitamin c', 'ascorbic acid'], ['niacinamide'], 'Vitamin C and niacinamide can be used together, but some prefer to alternate for best results.'],
  [['vitamin c', 'ascorbic acid'], ['retinol', 'retinoid'], 'Use Vitamin C in AM and retinol in PM for best results.'],
  [['aha', 'glycolic acid'], ['vitamin c', 'ascorbic acid'], 'Both are acidic; consider using on alternate days.'],
];

/**
 * Check if message mentions conflicting ingredients
 */
export function detectIngredientConflicts(
  message: string
): DetectedError | null {
  const lowerMessage = message.toLowerCase();

  // Check hard conflicts
  for (const [group1, group2, explanation] of HARD_CONFLICTS) {
    const hasGroup1 = group1.some(ing => lowerMessage.includes(ing));
    const hasGroup2 = group2.some(ing => lowerMessage.includes(ing));

    if (hasGroup1 && hasGroup2) {
      return {
        category: 'unsafe_combination',
        severity: 'high',
        message: explanation,
        suggestedAction: 'Recommend separating into AM/PM or alternate days.',
        safeAlternative: `${explanation} I recommend using these on different days or at different times.`,
      };
    }
  }

  // Check soft conflicts
  for (const [group1, group2, explanation] of SOFT_CONFLICTS) {
    const hasGroup1 = group1.some(ing => lowerMessage.includes(ing));
    const hasGroup2 = group2.some(ing => lowerMessage.includes(ing));

    if (hasGroup1 && hasGroup2) {
      return {
        category: 'unsafe_combination',
        severity: 'medium',
        message: explanation,
        suggestedAction: 'Suggest optimal timing for both ingredients.',
        safeAlternative: explanation,
      };
    }
  }

  return null;
}

// ============================================================================
// MISSING DATA DETECTION
// ============================================================================

/**
 * Check if retrieval result indicates missing data
 */
export function detectMissingData(
  retrievalResult: { found: boolean; content?: unknown } | null | undefined,
  dataType: string
): DetectedError | null {
  if (!retrievalResult || !retrievalResult.found || !retrievalResult.content) {
    return {
      category: 'missing_data',
      severity: 'low',
      message: `I don't have detailed information on that ${dataType} yet.`,
      suggestedAction: 'Provide closest alternative or general guidance.',
      safeAlternative: `I can help you explore similar options or provide general guidance on ${dataType}s.`,
    };
  }
  return null;
}

/**
 * Check if product data has required fields
 */
export function validateProductData(product: Record<string, unknown>): DetectedError | null {
  const requiredFields = ['name', 'brand', 'category'];
  const missingFields = requiredFields.filter(field => !product[field]);

  if (missingFields.length > 0) {
    return {
      category: 'missing_data',
      severity: 'low',
      message: 'Some product details are incomplete.',
      context: `Missing: ${missingFields.join(', ')}`,
      suggestedAction: 'Proceed with available information.',
    };
  }
  return null;
}

/**
 * Check if skin profile has minimum required data
 */
export function validateSkinProfile(
  profile: { skinType?: string | null; concerns?: string[] } | null
): DetectedError | null {
  if (!profile) {
    return {
      category: 'missing_data',
      severity: 'medium',
      message: 'No skin profile available.',
      suggestedAction: 'Provide general recommendations and suggest completing the skin survey.',
      safeAlternative: 'I can give general advice, but completing your skin survey would help me personalize recommendations.',
    };
  }

  if (!profile.skinType && (!profile.concerns || profile.concerns.length === 0)) {
    return {
      category: 'missing_data',
      severity: 'low',
      message: 'Skin profile is incomplete.',
      suggestedAction: 'Provide best-effort recommendations.',
      safeAlternative: 'With more details about your skin, I could give more targeted advice.',
    };
  }

  return null;
}

// ============================================================================
// CONFLICTING DATA HANDLING
// ============================================================================

/**
 * Resolve conflicting data by choosing safest option
 */
export function resolveConflictingData<T>(
  options: Array<{ value: T; source: string; confidence: number }>,
  preferSafer: boolean = true
): { resolved: T; explanation: string } {
  if (options.length === 0) {
    throw new Error('No options provided for conflict resolution');
  }

  if (options.length === 1) {
    return { resolved: options[0].value, explanation: '' };
  }

  // Sort by confidence (higher is better)
  const sorted = [...options].sort((a, b) => b.confidence - a.confidence);

  // If preferSafer and multiple high-confidence options, describe the choice
  if (preferSafer && sorted.length > 1 && sorted[0].confidence === sorted[1].confidence) {
    return {
      resolved: sorted[0].value,
      explanation: 'Multiple sources had different information; using the more conservative estimate.',
    };
  }

  return {
    resolved: sorted[0].value,
    explanation: sorted.length > 1 ? 'Resolved using the most reliable source.' : '',
  };
}

// ============================================================================
// INVALID INPUT DETECTION
// ============================================================================

/**
 * Patterns indicating invalid or nonsense input
 */
const INVALID_INPUT_PATTERNS = [
  /^[^a-zA-Z]*$/,  // No letters at all
  /^(.)\1{10,}$/,  // Same character repeated many times
  /^[a-z]{1,2}$/i, // Too short to be meaningful
];

/**
 * Check if input is valid and meaningful
 */
export function validateUserInput(message: string): DetectedError | null {
  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return {
      category: 'invalid_input',
      severity: 'low',
      message: 'Empty input received.',
      safeAlternative: 'How can I help you with your skincare today?',
    };
  }

  if (trimmed.length < 3) {
    return {
      category: 'invalid_input',
      severity: 'low',
      message: 'Input too short to understand.',
      safeAlternative: 'Could you tell me more about what you\'re looking for?',
    };
  }

  for (const pattern of INVALID_INPUT_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        category: 'invalid_input',
        severity: 'low',
        message: 'Input appears to be incomplete.',
        safeAlternative: 'I\'m not sure I understood. Could you rephrase your question?',
      };
    }
  }

  return null;
}

// ============================================================================
// SYSTEM ERROR HANDLING
// ============================================================================

/**
 * Create a safe fallback response for system errors
 */
export function createSystemErrorFallback(
  errorType: 'timeout' | 'malformed_data' | 'unavailable' | 'unknown'
): ErrorHandlingResult {
  const fallbacks: Record<string, string> = {
    timeout: 'The request took longer than expected. Let me try a simpler approach—what specific skincare question can I help with?',
    malformed_data: 'Something didn\'t load correctly, but I can still help you explore products and routines for your concerns.',
    unavailable: 'Some information isn\'t available right now. I can still provide general skincare guidance—what would you like to know?',
    unknown: 'I encountered an unexpected issue, but I\'m still here to help. What skincare topic can I assist with?',
  };

  return {
    hasError: true,
    errors: [{
      category: 'system_error',
      severity: 'medium',
      message: `System error: ${errorType}`,
    }],
    canProceed: true,
    userMessage: fallbacks[errorType] || fallbacks.unknown,
    internalLog: `System error encountered: ${errorType}`,
  };
}

/**
 * Wrap async operations with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorContext: string
): Promise<{ result: T; error: DetectedError | null }> {
  try {
    const result = await operation();
    return { result, error: null };
  } catch (err) {
    console.error(`[ErrorHandling] ${errorContext}:`, err);
    return {
      result: fallback,
      error: {
        category: 'system_error',
        severity: 'medium',
        message: `Failed to ${errorContext}`,
        context: err instanceof Error ? err.message : 'Unknown error',
      },
    };
  }
}

// ============================================================================
// COMPREHENSIVE ERROR DETECTION
// ============================================================================

/**
 * Run all error detection checks on a message
 */
export function detectAllErrors(
  message: string,
  context?: {
    skinProfile?: { skinType?: string | null; concerns?: string[] } | null;
    retrievalResult?: { found: boolean; content?: unknown } | null;
  }
): ErrorHandlingResult {
  const errors: DetectedError[] = [];

  // Check for invalid input
  const inputError = validateUserInput(message);
  if (inputError) {
    errors.push(inputError);
  }

  // Check for unsafe requests
  const unsafeError = detectUnsafeRequest(message);
  if (unsafeError) {
    errors.push(unsafeError);
  }

  // Check for ingredient conflicts
  const conflictError = detectIngredientConflicts(message);
  if (conflictError) {
    errors.push(conflictError);
  }

  // Check skin profile if provided
  if (context?.skinProfile !== undefined) {
    const profileError = validateSkinProfile(context.skinProfile);
    if (profileError) {
      errors.push(profileError);
    }
  }

  // Check retrieval result if provided
  if (context?.retrievalResult !== undefined) {
    const retrievalError = detectMissingData(context.retrievalResult, 'information');
    if (retrievalError) {
      errors.push(retrievalError);
    }
  }

  // Determine if we can proceed
  const hasCritical = errors.some(e => e.severity === 'critical');
  const hasHigh = errors.some(e => e.severity === 'high');

  // Build user message
  let userMessage = '';
  if (errors.length > 0) {
    // Prioritize the most severe error's alternative
    const primaryError = errors.find(e => e.severity === 'critical')
      || errors.find(e => e.severity === 'high')
      || errors[0];

    userMessage = primaryError.safeAlternative || primaryError.message;
  }

  return {
    hasError: errors.length > 0,
    errors,
    canProceed: !hasCritical,
    userMessage,
    internalLog: errors.length > 0
      ? `Detected ${errors.length} issue(s): ${errors.map(e => e.category).join(', ')}`
      : undefined,
  };
}

// ============================================================================
// SAFE ALTERNATIVE GENERATORS
// ============================================================================

/**
 * Generate safe alternative for ingredient conflict
 */
export function generateConflictAlternative(
  ingredient1: string,
  ingredient2: string
): string {
  return `Instead of using ${ingredient1} and ${ingredient2} together, try using ${ingredient1} in your AM routine and ${ingredient2} in your PM routine—or alternate days.`;
}

/**
 * Generate safe alternative for missing product
 */
export function generateMissingProductAlternative(
  productName: string,
  category: string
): string {
  return `I don't have specific details on ${productName}, but I can help you find other ${category} options that might work for your skin.`;
}

/**
 * Generate safe alternative for overuse
 */
export function generateOveruseAlternative(
  ingredient: string,
  suggestedFrequency: string
): string {
  return `For ${ingredient}, I recommend starting with ${suggestedFrequency} to let your skin adjust. You can gradually increase if your skin tolerates it well.`;
}

// ============================================================================
// ERROR RESPONSE FORMATTING
// ============================================================================

/**
 * Format error for user-facing response
 */
export function formatErrorForUser(error: DetectedError): string {
  if (error.safeAlternative) {
    return error.safeAlternative;
  }

  // Default formatting by category
  switch (error.category) {
    case 'missing_data':
      return `I don't have all the details on that, but I can still help with related guidance.`;

    case 'conflicting_data':
      return `I found some inconsistent information, so I'll use the safer estimate.`;

    case 'unsupported_request':
      return `That's outside what I can help with, but I can offer general skincare guidance.`;

    case 'unsafe_combination':
      return `That combination might cause irritation. Let me suggest a safer approach.`;

    case 'invalid_input':
      return `I'm not sure I understood. Could you tell me more about what you're looking for?`;

    case 'retrieval_failure':
      return `I couldn't find specific information on that, but I can help you explore related topics.`;

    case 'system_error':
      return `Something didn't work as expected, but I can still help with your skincare questions.`;

    default:
      return `Let me try a different approach to help you.`;
  }
}

/**
 * Format multiple errors for user-facing response
 */
export function formatErrorsForUser(errors: DetectedError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return formatErrorForUser(errors[0]);
  }

  // For multiple errors, prioritize by severity
  const critical = errors.find(e => e.severity === 'critical');
  if (critical) {
    return formatErrorForUser(critical);
  }

  const high = errors.find(e => e.severity === 'high');
  if (high) {
    return formatErrorForUser(high);
  }

  // Combine medium/low errors briefly
  return `I noticed a few things to address. ${formatErrorForUser(errors[0])}`;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Error handling principles for reference
 */
export const ERROR_HANDLING_PRINCIPLES = {
  core: [
    'Never guess or fabricate information',
    'Always provide safe alternatives',
    'Maintain user trust through transparency',
    'Keep error messages calm and professional',
    'Avoid technical jargon in user-facing messages',
  ],
  safety: [
    'Critical errors block unsafe actions',
    'High severity errors require acknowledgment',
    'Medium errors can proceed with caution',
    'Low errors can proceed normally',
  ],
  tone: [
    'Stay supportive, not apologetic',
    'Focus on what we CAN do',
    'Never blame the user',
    'Keep explanations brief',
  ],
} as const;
