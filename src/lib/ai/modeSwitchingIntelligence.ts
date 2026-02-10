/**
 * Multi-Persona & Mode Switching Intelligence for Lorem Curae AI
 *
 * Seamlessly switches between functional modes based on user intent
 * while maintaining a consistent core persona. Never announces mode
 * switches. Safety always overrides other modes.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Available functional modes
 */
export type FunctionalMode =
  | 'ingredient_expert'
  | 'product_advisor'
  | 'routine_builder'
  | 'routine_optimizer'
  | 'concern_educator'
  | 'shopping_assistant'
  | 'safety_checker'
  | 'troubleshooter'
  | 'navigator'
  | 'workflow_manager'
  | 'summarizer'
  | 'general_assistant';

/**
 * Mode priority for conflict resolution
 */
export type ModePriority = 1 | 2 | 3 | 4 | 5;

/**
 * Mode configuration
 */
export interface ModeConfig {
  mode: FunctionalMode;
  priority: ModePriority;
  description: string;
  activationKeywords: string[];
  intelligenceModules: string[];
  formatStyle: 'structured' | 'conversational' | 'list' | 'comparison';
  includesLinks: boolean;
  requiresSafetyCheck: boolean;
}

/**
 * Active mode state
 */
export interface ActiveModeState {
  primaryMode: FunctionalMode;
  secondaryModes: FunctionalMode[];
  safetyOverrideActive: boolean;
  workflowActive: boolean;
  transitionHistory: Array<{ from: FunctionalMode; to: FunctionalMode; reason: string }>;
}

/**
 * Mode detection result
 */
export interface ModeDetectionResult {
  detectedModes: FunctionalMode[];
  primaryMode: FunctionalMode;
  confidence: 'high' | 'medium' | 'low';
  requiresSafetyOverride: boolean;
  suggestedOrder: FunctionalMode[];
}

/**
 * Core persona traits
 */
export interface CorePersona {
  tone: 'warm' | 'professional' | 'encouraging';
  expertise: 'skincare_specialist';
  approach: 'educational' | 'advisory' | 'supportive';
  boundaries: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Mode configurations with priorities and settings
 */
export const MODE_CONFIGS: Record<FunctionalMode, ModeConfig> = {
  safety_checker: {
    mode: 'safety_checker',
    priority: 1,
    description: 'Detects conflicts, pregnancy-unsafe ingredients, over-exfoliation',
    activationKeywords: ['safe', 'together', 'combine', 'mix', 'pregnant', 'conflict', 'irritation', 'can i use'],
    intelligenceModules: ['errorHandlingIntelligence', 'ingredientIntelligence'],
    formatStyle: 'structured',
    includesLinks: true,
    requiresSafetyCheck: false, // Already is safety check
  },
  troubleshooter: {
    mode: 'troubleshooter',
    priority: 2,
    description: 'Diagnoses irritation, purging, dryness, redness (non-medical)',
    activationKeywords: ['purging', 'irritation', 'not working', 'breaking out', 'burning', 'stinging', 'problem', 'issue'],
    intelligenceModules: ['errorHandlingIntelligence', 'concernIntelligence'],
    formatStyle: 'structured',
    includesLinks: true,
    requiresSafetyCheck: true,
  },
  ingredient_expert: {
    mode: 'ingredient_expert',
    priority: 3,
    description: 'Explains ingredients, benefits, conflicts, usage, safety',
    activationKeywords: ['what is', 'what does', 'ingredient', 'niacinamide', 'retinol', 'vitamin c', 'how does', 'explain'],
    intelligenceModules: ['ingredientIntelligence', 'knowledgeBase'],
    formatStyle: 'structured',
    includesLinks: true,
    requiresSafetyCheck: true,
  },
  concern_educator: {
    mode: 'concern_educator',
    priority: 3,
    description: 'Explains concerns, causes (non-medical), recommended actives',
    activationKeywords: ['acne', 'dark spots', 'redness', 'hyperpigmentation', 'dryness', 'oiliness', 'concern', 'treat', 'help with'],
    intelligenceModules: ['concernIntelligence', 'knowledgeBase'],
    formatStyle: 'structured',
    includesLinks: true,
    requiresSafetyCheck: true,
  },
  routine_builder: {
    mode: 'routine_builder',
    priority: 3,
    description: 'Creates AM/PM routines, step order, frequency, safety adjustments',
    activationKeywords: ['routine', 'build', 'create', 'morning', 'evening', 'order', 'steps', 'am routine', 'pm routine'],
    intelligenceModules: ['routineBuilder', 'routineOptimizationIntelligence'],
    formatStyle: 'list',
    includesLinks: true,
    requiresSafetyCheck: true,
  },
  routine_optimizer: {
    mode: 'routine_optimizer',
    priority: 3,
    description: 'Evaluates existing routines, fixes issues, improves structure',
    activationKeywords: ['optimize', 'improve', 'adjust', 'my routine', 'add to routine', 'change routine', 'fix routine'],
    intelligenceModules: ['routineOptimizationIntelligence', 'routineBuilder'],
    formatStyle: 'structured',
    includesLinks: true,
    requiresSafetyCheck: true,
  },
  product_advisor: {
    mode: 'product_advisor',
    priority: 4,
    description: 'Recommends products, compares options, filters based on profile',
    activationKeywords: ['recommend', 'product', 'best', 'which', 'find me', 'suggest', 'looking for'],
    intelligenceModules: ['productIntelligence', 'shoppingIntelligence'],
    formatStyle: 'list',
    includesLinks: true,
    requiresSafetyCheck: true,
  },
  shopping_assistant: {
    mode: 'shopping_assistant',
    priority: 4,
    description: 'Helps filter, sort, compare, and discover products',
    activationKeywords: ['browse', 'shop', 'under $', 'budget', 'compare', 'alternatives', 'similar to', 'affordable'],
    intelligenceModules: ['shoppingIntelligence', 'productIntelligence'],
    formatStyle: 'comparison',
    includesLinks: true,
    requiresSafetyCheck: true,
  },
  navigator: {
    mode: 'navigator',
    priority: 5,
    description: 'Provides correct links to ingredients, products, concerns, routines',
    activationKeywords: ['where', 'page', 'link', 'go to', 'find the', 'show me'],
    intelligenceModules: ['navigationIntelligence'],
    formatStyle: 'conversational',
    includesLinks: true,
    requiresSafetyCheck: false,
  },
  workflow_manager: {
    mode: 'workflow_manager',
    priority: 2,
    description: 'Handles multi-turn tasks with continuity and structure',
    activationKeywords: ['next', 'continue', 'then', 'after that', 'okay', 'yes', 'proceed'],
    intelligenceModules: ['workflowIntelligence'],
    formatStyle: 'structured',
    includesLinks: true,
    requiresSafetyCheck: true,
  },
  summarizer: {
    mode: 'summarizer',
    priority: 5,
    description: 'Summarizes routines, comparisons, or multi-turn workflows',
    activationKeywords: ['summarize', 'summary', 'recap', 'overview', 'wrap up'],
    intelligenceModules: ['responseFormattingIntelligence'],
    formatStyle: 'structured',
    includesLinks: false,
    requiresSafetyCheck: false,
  },
  general_assistant: {
    mode: 'general_assistant',
    priority: 5,
    description: 'Default mode for general skincare questions',
    activationKeywords: [],
    intelligenceModules: ['searchRetrievalIntelligence'],
    formatStyle: 'conversational',
    includesLinks: true,
    requiresSafetyCheck: false,
  },
};

/**
 * Core persona definition (always active)
 */
export const CORE_PERSONA: CorePersona = {
  tone: 'warm',
  expertise: 'skincare_specialist',
  approach: 'educational',
  boundaries: [
    'No medical diagnoses or treatment advice',
    'No emotional support or therapy language',
    'No overly familiar or personal tone',
    'No claims beyond skincare expertise',
    'No memory of personal life details',
  ],
};

/**
 * Mode compatibility matrix
 */
const MODE_COMPATIBILITY: Record<FunctionalMode, FunctionalMode[]> = {
  safety_checker: ['ingredient_expert', 'product_advisor', 'routine_builder', 'routine_optimizer'],
  troubleshooter: ['ingredient_expert', 'concern_educator', 'product_advisor'],
  ingredient_expert: ['product_advisor', 'safety_checker', 'navigator', 'concern_educator'],
  concern_educator: ['ingredient_expert', 'product_advisor', 'routine_builder', 'navigator'],
  routine_builder: ['product_advisor', 'safety_checker', 'navigator'],
  routine_optimizer: ['product_advisor', 'safety_checker', 'navigator'],
  product_advisor: ['ingredient_expert', 'safety_checker', 'navigator', 'shopping_assistant'],
  shopping_assistant: ['product_advisor', 'navigator'],
  navigator: ['ingredient_expert', 'product_advisor', 'concern_educator', 'routine_builder'],
  workflow_manager: ['routine_builder', 'routine_optimizer', 'product_advisor', 'shopping_assistant'],
  summarizer: ['routine_builder', 'routine_optimizer', 'workflow_manager'],
  general_assistant: ['navigator', 'ingredient_expert', 'concern_educator'],
};

// ============================================================================
// MODE DETECTION
// ============================================================================

/**
 * Detect required modes from user message
 */
export function detectModes(
  message: string,
  context?: {
    hasActiveWorkflow?: boolean;
    previousMode?: FunctionalMode;
    userProfile?: { isPregnant?: boolean; sensitivities?: string[] };
  }
): ModeDetectionResult {
  const lowerMessage = message.toLowerCase();
  const detectedModes: Array<{ mode: FunctionalMode; score: number }> = [];

  // Check each mode's activation keywords
  for (const [mode, config] of Object.entries(MODE_CONFIGS)) {
    const matchedKeywords = config.activationKeywords.filter(kw => lowerMessage.includes(kw));
    if (matchedKeywords.length > 0) {
      detectedModes.push({
        mode: mode as FunctionalMode,
        score: matchedKeywords.length * (6 - config.priority), // Higher priority = higher score
      });
    }
  }

  // Check for safety-critical content
  const requiresSafetyOverride = checkSafetyRequired(lowerMessage, context?.userProfile);
  if (requiresSafetyOverride && !detectedModes.some(m => m.mode === 'safety_checker')) {
    detectedModes.push({ mode: 'safety_checker', score: 100 }); // Force safety mode
  }

  // Check for workflow continuation
  if (context?.hasActiveWorkflow) {
    const workflowCues = ['next', 'continue', 'okay', 'yes', 'proceed', 'then'];
    if (workflowCues.some(cue => lowerMessage.includes(cue))) {
      detectedModes.push({ mode: 'workflow_manager', score: 50 });
    }
  }

  // Default to general assistant if no modes detected
  if (detectedModes.length === 0) {
    detectedModes.push({ mode: 'general_assistant', score: 1 });
  }

  // Sort by score
  detectedModes.sort((a, b) => b.score - a.score);

  // Determine primary mode
  const primaryMode = detectedModes[0].mode;
  const secondaryModes = detectedModes.slice(1).map(m => m.mode);

  // Filter secondary modes for compatibility
  const compatibleSecondary = secondaryModes.filter(
    m => MODE_COMPATIBILITY[primaryMode]?.includes(m)
  );

  // Determine suggested order
  const suggestedOrder = determineModeOrder(primaryMode, compatibleSecondary, requiresSafetyOverride);

  // Determine confidence
  const topScore = detectedModes[0].score;
  const confidence = topScore >= 10 ? 'high' : topScore >= 3 ? 'medium' : 'low';

  return {
    detectedModes: [primaryMode, ...compatibleSecondary],
    primaryMode,
    confidence,
    requiresSafetyOverride,
    suggestedOrder,
  };
}

/**
 * Check if safety mode is required
 */
function checkSafetyRequired(
  message: string,
  userProfile?: { isPregnant?: boolean; sensitivities?: string[] }
): boolean {
  // Pregnancy check
  if (userProfile?.isPregnant) {
    const pregnancyUnsafe = ['retinol', 'retinoid', 'salicylic'];
    if (pregnancyUnsafe.some(ing => message.includes(ing))) {
      return true;
    }
  }

  // Sensitivity check
  if (userProfile?.sensitivities && userProfile.sensitivities.length > 0) {
    const strongActives = ['glycolic', 'retinol', 'aha', 'bha'];
    if (strongActives.some(active => message.includes(active))) {
      return true;
    }
  }

  // Combination check
  const actives = ['retinol', 'aha', 'bha', 'vitamin c', 'benzoyl peroxide', 'glycolic'];
  const mentionedActives = actives.filter(a => message.includes(a));
  if (mentionedActives.length >= 2) {
    return true;
  }

  return false;
}

/**
 * Determine optimal mode execution order
 */
function determineModeOrder(
  primary: FunctionalMode,
  secondary: FunctionalMode[],
  requiresSafety: boolean
): FunctionalMode[] {
  const order: FunctionalMode[] = [];

  // Safety always first if required
  if (requiresSafety) {
    order.push('safety_checker');
  }

  // Add primary if not already added
  if (!order.includes(primary)) {
    order.push(primary);
  }

  // Add compatible secondary modes
  for (const mode of secondary) {
    if (!order.includes(mode)) {
      order.push(mode);
    }
  }

  // Navigation always last if present
  if (order.includes('navigator') && order.indexOf('navigator') !== order.length - 1) {
    order.splice(order.indexOf('navigator'), 1);
    order.push('navigator');
  }

  return order;
}

// ============================================================================
// MODE TRANSITIONS
// ============================================================================

/**
 * Create initial mode state
 */
export function createModeState(detectionResult: ModeDetectionResult): ActiveModeState {
  return {
    primaryMode: detectionResult.primaryMode,
    secondaryModes: detectionResult.detectedModes.slice(1),
    safetyOverrideActive: detectionResult.requiresSafetyOverride,
    workflowActive: detectionResult.detectedModes.includes('workflow_manager'),
    transitionHistory: [],
  };
}

/**
 * Transition to a new mode
 */
export function transitionMode(
  currentState: ActiveModeState,
  newMode: FunctionalMode,
  reason: string
): ActiveModeState {
  // Record transition
  const transition = {
    from: currentState.primaryMode,
    to: newMode,
    reason,
  };

  return {
    ...currentState,
    primaryMode: newMode,
    secondaryModes: currentState.secondaryModes.filter(m => m !== newMode),
    transitionHistory: [...currentState.transitionHistory, transition],
  };
}

/**
 * Check if mode transition is allowed
 */
export function canTransition(from: FunctionalMode, to: FunctionalMode): boolean {
  // Safety mode can always activate
  if (to === 'safety_checker') return true;

  // Workflow mode overrides when active
  if (from === 'workflow_manager' && to !== 'safety_checker') {
    // Allow transitions within workflow context
    return MODE_COMPATIBILITY[from]?.includes(to) ?? false;
  }

  // Check compatibility
  return MODE_COMPATIBILITY[from]?.includes(to) ?? false;
}

// ============================================================================
// MODE-SPECIFIC BEHAVIOR
// ============================================================================

/**
 * Get mode-specific instructions for AI
 */
export function getModeInstructions(mode: FunctionalMode): string {
  switch (mode) {
    case 'safety_checker':
      return 'Check for ingredient conflicts, pregnancy risks, and over-exfoliation. Address safety first, then proceed with request.';

    case 'troubleshooter':
      return 'Help diagnose skincare issues (purging vs breakout, irritation). Provide non-medical guidance and suggest adjustments.';

    case 'ingredient_expert':
      return 'Explain ingredient benefits, how it works, who it suits, usage tips, and compatibility. Link to ingredient page.';

    case 'concern_educator':
      return 'Explain the concern, common causes (non-medical), recommended ingredients and products. Link to learn page.';

    case 'routine_builder':
      return 'Create structured AM/PM routine with numbered steps. Consider user profile, concerns, and experience level.';

    case 'routine_optimizer':
      return 'Evaluate routine structure, identify issues, suggest improvements. Maintain safety and user preferences.';

    case 'product_advisor':
      return 'Recommend 2-4 products with personalized reasoning. Consider profile, concerns, budget, and preferences.';

    case 'shopping_assistant':
      return 'Help filter and compare products. Consider price, texture, ingredients, and user preferences.';

    case 'navigator':
      return 'Provide correct internal links to relevant pages. Use validated slugs only.';

    case 'workflow_manager':
      return 'Continue the active workflow from where it left off. Maintain context and progress.';

    case 'summarizer':
      return 'Provide a clear, concise summary of the information discussed or routine built.';

    case 'general_assistant':
      return 'Provide helpful skincare guidance based on the question. Stay within skincare expertise.';

    default:
      return 'Provide helpful, personalized skincare guidance.';
  }
}

/**
 * Get mode-specific format instructions
 */
export function getModeFormatInstructions(mode: FunctionalMode): string {
  const config = MODE_CONFIGS[mode];

  switch (config.formatStyle) {
    case 'structured':
      return 'Use clear headings, bullet points, and organized sections.';
    case 'list':
      return 'Use numbered lists for steps or ranked recommendations.';
    case 'comparison':
      return 'Use side-by-side format with clear differences highlighted.';
    case 'conversational':
      return 'Keep response natural and flowing, but concise.';
    default:
      return 'Format for clarity and scannability.';
  }
}

// ============================================================================
// PERSONA MANAGEMENT
// ============================================================================

/**
 * Get persona modifiers for current mode
 */
export function getPersonaModifiers(mode: FunctionalMode): {
  emphasis: string;
  avoidance: string[];
} {
  const baseAvoidance = CORE_PERSONA.boundaries;

  switch (mode) {
    case 'safety_checker':
      return {
        emphasis: 'Clear, direct safety guidance without alarm',
        avoidance: [...baseAvoidance, 'Don\'t be alarmist', 'Don\'t use medical terminology'],
      };

    case 'troubleshooter':
      return {
        emphasis: 'Supportive and solution-focused',
        avoidance: [...baseAvoidance, 'Don\'t diagnose medical conditions', 'Don\'t guarantee outcomes'],
      };

    case 'ingredient_expert':
      return {
        emphasis: 'Educational and clear',
        avoidance: [...baseAvoidance, 'Don\'t be overly technical', 'Don\'t make miracle claims'],
      };

    case 'routine_builder':
      return {
        emphasis: 'Practical and actionable',
        avoidance: [...baseAvoidance, 'Don\'t overcomplicate', 'Don\'t add unnecessary steps'],
      };

    case 'product_advisor':
      return {
        emphasis: 'Helpful and personalized',
        avoidance: [...baseAvoidance, 'Don\'t be salesy', 'Don\'t push premium products unnecessarily'],
      };

    case 'shopping_assistant':
      return {
        emphasis: 'Efficient and informative',
        avoidance: [...baseAvoidance, 'Don\'t overwhelm with options', 'Don\'t pressure to buy'],
      };

    default:
      return {
        emphasis: 'Warm and knowledgeable',
        avoidance: baseAvoidance,
      };
  }
}

/**
 * Check if response maintains persona boundaries
 */
export function checkPersonaBoundaries(response: string): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Check for medical language
  const medicalPatterns = [
    /diagnos(e|is|ed)/i,
    /prescrib(e|ed)/i,
    /treat(ment)? for/i,
    /cure(s|d)?/i,
    /medical advice/i,
  ];
  for (const pattern of medicalPatterns) {
    if (pattern.test(response)) {
      violations.push('Contains medical language');
      break;
    }
  }

  // Check for overly familiar language
  const familiarPatterns = [
    /my friend/i,
    /I love you/i,
    /I care about you/i,
    /always here for you/i,
    /whenever you need me/i,
  ];
  for (const pattern of familiarPatterns) {
    if (pattern.test(response)) {
      violations.push('Too familiar or emotional');
      break;
    }
  }

  // Check for guarantees
  const guaranteePatterns = [
    /guaranteed to/i,
    /will definitely/i,
    /100% (effective|works)/i,
    /miracle/i,
  ];
  for (const pattern of guaranteePatterns) {
    if (pattern.test(response)) {
      violations.push('Contains guarantees or miracle claims');
      break;
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

// ============================================================================
// FORMATTING FOR AI
// ============================================================================

/**
 * Format mode context for AI
 */
export function formatModeContextForAI(state: ActiveModeState): string {
  const primaryConfig = MODE_CONFIGS[state.primaryMode];
  const instructions = getModeInstructions(state.primaryMode);
  const formatInstructions = getModeFormatInstructions(state.primaryMode);
  const personaModifiers = getPersonaModifiers(state.primaryMode);

  const lines: string[] = [
    `**Active Mode:** ${state.primaryMode.replace(/_/g, ' ')}`,
    `**Mode Focus:** ${instructions}`,
    `**Format:** ${formatInstructions}`,
    `**Tone Emphasis:** ${personaModifiers.emphasis}`,
  ];

  if (state.secondaryModes.length > 0) {
    lines.push(`**Secondary Modes:** ${state.secondaryModes.join(', ')}`);
  }

  if (state.safetyOverrideActive) {
    lines.push('**Safety Override Active:** Address safety concerns first');
  }

  return lines.join('\n');
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

/**
 * Mode switching principles
 */
export const MODE_SWITCHING_PRINCIPLES = {
  transitions: [
    'Switch modes invisibly based on intent',
    'Never announce mode changes',
    'Never break persona or tone',
    'Never reset context on switch',
  ],
  priority: [
    'Safety Checker always overrides',
    'Workflow Manager maintains continuity',
    'Multiple modes can be active together',
    'Incompatible modes are filtered out',
  ],
  persona: [
    'Core persona remains constant',
    'Mode only affects focus and format',
    'Warmth and expertise always present',
    'Professional boundaries maintained',
  ],
  boundaries: [
    'No medical diagnoses',
    'No emotional support language',
    'No overly familiar tone',
    'No miracle claims',
  ],
} as const;
