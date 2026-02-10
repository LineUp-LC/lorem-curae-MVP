/**
 * User Intent Classification & Query Understanding Intelligence for Lorem Curae AI
 *
 * Accurately detects user intent, classifies requests, and routes conversations
 * to the correct intelligence module. Handles ambiguous, multi-intent, and
 * multi-turn queries with clarity and structure.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Primary intent categories
 */
export type IntentCategory =
  | 'ingredient_question'
  | 'product_question'
  | 'concern_question'
  | 'routine_building'
  | 'routine_optimization'
  | 'product_discovery'
  | 'skin_profile_clarification'
  | 'troubleshooting'
  | 'comparison'
  | 'safety_check'
  | 'educational'
  | 'navigation'
  | 'workflow_continuation'
  | 'off_topic';

/**
 * Safety signal types
 */
export type SafetySignal =
  | 'pregnancy'
  | 'sensitivity'
  | 'irritation'
  | 'active_conflict'
  | 'overuse'
  | 'medical_condition'
  | 'allergic_reaction';

/**
 * Detected constraint from user message
 */
export interface DetectedConstraint {
  type: 'budget' | 'preference' | 'ingredient' | 'texture' | 'timing' | 'experience';
  value: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Individual intent with confidence
 */
export interface DetectedIntent {
  category: IntentCategory;
  confidence: 'high' | 'medium' | 'low';
  keywords: string[];
  subType?: string;
}

/**
 * Complete intent classification result
 */
export interface IntentClassification {
  primary: DetectedIntent;
  secondary: DetectedIntent[];
  hidden: DetectedIntent[];
  constraints: DetectedConstraint[];
  safetySignals: SafetySignal[];
  isWorkflowContinuation: boolean;
  workflowCues: string[];
  requiresClarification: boolean;
  suggestedClarification?: string;
  interpretationOptions?: string[];
}

/**
 * Routing decision for intent
 */
export interface IntentRoute {
  targetModule: string;
  priority: 'safety' | 'primary' | 'secondary';
  action: string;
  context: Record<string, unknown>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Keywords for each intent category
 */
const INTENT_KEYWORDS: Record<IntentCategory, string[]> = {
  ingredient_question: [
    'what is', 'what does', 'how does', 'ingredient', 'niacinamide', 'retinol',
    'vitamin c', 'hyaluronic', 'salicylic', 'glycolic', 'ceramide', 'peptide',
    'aha', 'bha', 'explain', 'tell me about', 'how to use', 'benefits of',
    'is it safe', 'can i use', 'azelaic', 'benzoyl peroxide', 'centella',
  ],
  product_question: [
    'product', 'which', 'what product', 'recommend', 'best', 'buy', 'where to buy',
    'good for', 'works for', 'suitable for', 'should i get', 'looking for',
  ],
  concern_question: [
    'acne', 'dark spots', 'redness', 'sensitive', 'dry', 'oily', 'wrinkle',
    'fine line', 'dull', 'texture', 'pore', 'hyperpigmentation', 'breakout',
    'aging', 'dehydrated', 'flaky', 'irritated', 'uneven', 'scarring', 'melasma',
    'help with', 'deal with', 'treat', 'fix', 'reduce', 'get rid of',
  ],
  routine_building: [
    'routine', 'build', 'create', 'start', 'beginner', 'morning', 'evening',
    'am routine', 'pm routine', 'skincare routine', 'daily routine', 'steps',
    'what order', 'how to layer', 'complete routine', 'full routine',
  ],
  routine_optimization: [
    'improve', 'optimize', 'adjust', 'change', 'update', 'simplify', 'expand',
    'add to', 'remove from', 'better', 'enhance', 'tweak', 'modify',
    'my current routine', 'my routine', 'i use', 'i apply', 'what am i missing',
  ],
  product_discovery: [
    'find', 'show me', 'browse', 'explore', 'search', 'discover', 'options',
    'alternatives', 'similar to', 'like this', 'under $', 'budget', 'affordable',
    'premium', 'high-end', 'drugstore', 'shop', 'marketplace',
  ],
  skin_profile_clarification: [
    'my skin', 'skin type', 'i have', 'i am', 'my concern', 'sensitive skin',
    'oily skin', 'dry skin', 'combination skin', 'normal skin', 'quiz', 'survey',
    'profile', 'update my', 'change my',
  ],
  troubleshooting: [
    'not working', 'problem', 'issue', 'wrong', 'irritation', 'burning',
    'stinging', 'breakout after', 'worse', 'pilling', 'reacting', 'purging',
    'why is', 'what went wrong', 'help', 'emergency',
  ],
  comparison: [
    'vs', 'versus', 'compare', 'difference', 'better', 'or', 'which one',
    'between', 'compared to', 'prefer', 'choose',
  ],
  safety_check: [
    'safe', 'together', 'combine', 'mix', 'at the same time', 'conflict',
    'pregnant', 'pregnancy', 'breastfeeding', 'sensitive', 'allergy',
    'can i use with', 'okay to use', 'dangerous', 'harmful',
  ],
  educational: [
    'learn', 'understand', 'explain', 'why', 'how', 'what happens', 'science',
    'works', 'mechanism', 'difference between', 'types of', 'guide',
  ],
  navigation: [
    'where', 'page', 'link', 'go to', 'take me', 'show', 'find the',
    'marketplace', 'discover', 'ingredients page', 'faq', 'community',
  ],
  workflow_continuation: [
    'next', 'continue', 'go on', 'what else', 'more', 'then', 'after that',
    'now', 'okay', 'sure', 'yes', 'proceed', 'keep going', 'and then',
    'pm routine', 'evening routine', 'add', 'another', 'show more',
  ],
  off_topic: [
    'weather', 'news', 'joke', 'story', 'movie', 'food', 'recipe', 'music',
    'politics', 'sports', 'game', 'unrelated',
  ],
};

/**
 * Safety signal keywords
 */
const SAFETY_KEYWORDS: Record<SafetySignal, string[]> = {
  pregnancy: ['pregnant', 'pregnancy', 'expecting', 'breastfeeding', 'nursing', 'ttc', 'trying to conceive'],
  sensitivity: ['sensitive', 'react', 'allergic', 'allergy', 'eczema', 'rosacea', 'dermatitis'],
  irritation: ['burning', 'stinging', 'irritation', 'irritated', 'red', 'inflamed', 'painful'],
  active_conflict: ['retinol', 'aha', 'bha', 'vitamin c', 'benzoyl peroxide', 'together', 'same time', 'combine'],
  overuse: ['every day', 'twice daily', 'too much', 'overuse', 'over-exfoliate', 'multiple acids'],
  medical_condition: ['eczema', 'psoriasis', 'rosacea', 'dermatitis', 'infection', 'cyst', 'diagnosed'],
  allergic_reaction: ['hives', 'swelling', 'allergic', 'reaction', 'anaphylaxis', 'severe'],
};

/**
 * Constraint detection patterns
 */
const CONSTRAINT_PATTERNS: Array<{
  type: DetectedConstraint['type'];
  patterns: RegExp[];
  extractor: (match: RegExpMatchArray) => string;
}> = [
  {
    type: 'budget',
    patterns: [/under \$?(\d+)/i, /less than \$?(\d+)/i, /budget/i, /affordable/i, /cheap/i, /premium/i, /high-end/i],
    extractor: (match) => match[1] ? `under $${match[1]}` : match[0],
  },
  {
    type: 'preference',
    patterns: [/fragrance[- ]?free/i, /unscented/i, /vegan/i, /cruelty[- ]?free/i, /clean/i, /natural/i, /organic/i],
    extractor: (match) => match[0].toLowerCase(),
  },
  {
    type: 'ingredient',
    patterns: [/without ([a-z\s]+)/i, /no ([a-z\s]+)/i, /avoid ([a-z\s]+)/i, /free of ([a-z\s]+)/i],
    extractor: (match) => `avoid ${match[1]}`,
  },
  {
    type: 'texture',
    patterns: [/lightweight/i, /rich/i, /gel/i, /cream/i, /oil[- ]?free/i, /watery/i, /thick/i],
    extractor: (match) => match[0].toLowerCase(),
  },
  {
    type: 'timing',
    patterns: [/morning/i, /evening/i, /night/i, /am/i, /pm/i, /daytime/i],
    extractor: (match) => match[0].toLowerCase(),
  },
  {
    type: 'experience',
    patterns: [/beginner/i, /new to/i, /just started/i, /advanced/i, /experienced/i],
    extractor: (match) => match[0].toLowerCase().includes('beginner') || match[0].toLowerCase().includes('new') || match[0].toLowerCase().includes('just') ? 'beginner' : 'advanced',
  },
];

/**
 * Workflow continuation cues
 */
const WORKFLOW_CONTINUATION_CUES = [
  'next', 'continue', 'go on', 'what\'s next', 'okay', 'sure', 'yes',
  'then', 'after that', 'now what', 'proceed', 'keep going', 'and',
  'more', 'another', 'also', 'additionally', 'pm', 'evening',
  'show me more', 'what else', 'anything else',
];

// ============================================================================
// INTENT DETECTION
// ============================================================================

/**
 * Classify user intent from message
 */
export function classifyIntent(
  message: string,
  context?: {
    hasActiveWorkflow?: boolean;
    workflowType?: string;
    previousIntent?: IntentCategory;
    skinProfile?: { skinType?: string; concerns?: string[] };
  }
): IntentClassification {
  const lowerMessage = message.toLowerCase().trim();

  // Detect all intents
  const detectedIntents = detectAllIntents(lowerMessage);

  // Detect constraints
  const constraints = detectConstraints(message);

  // Detect safety signals
  const safetySignals = detectSafetySignals(lowerMessage);

  // Check for workflow continuation
  const { isWorkflowContinuation, workflowCues } = detectWorkflowContinuation(
    lowerMessage,
    context?.hasActiveWorkflow
  );

  // Prioritize intents
  const { primary, secondary, hidden } = prioritizeIntents(
    detectedIntents,
    safetySignals,
    isWorkflowContinuation,
    context
  );

  // Check if clarification needed
  const { requiresClarification, suggestedClarification, interpretationOptions } =
    checkClarificationNeeded(primary, secondary, lowerMessage);

  return {
    primary,
    secondary,
    hidden,
    constraints,
    safetySignals,
    isWorkflowContinuation,
    workflowCues,
    requiresClarification,
    suggestedClarification,
    interpretationOptions,
  };
}

/**
 * Detect all matching intents from message
 */
function detectAllIntents(message: string): DetectedIntent[] {
  const intents: DetectedIntent[] = [];

  for (const [category, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const matchedKeywords = keywords.filter(kw => message.includes(kw.toLowerCase()));

    if (matchedKeywords.length > 0) {
      const confidence = matchedKeywords.length >= 3 ? 'high' :
                        matchedKeywords.length >= 2 ? 'medium' : 'low';

      intents.push({
        category: category as IntentCategory,
        confidence,
        keywords: matchedKeywords,
        subType: detectSubType(category as IntentCategory, message),
      });
    }
  }

  // If no intents detected, default to general product question
  if (intents.length === 0) {
    intents.push({
      category: 'product_question',
      confidence: 'low',
      keywords: [],
    });
  }

  return intents;
}

/**
 * Detect subtype for specific intents
 */
function detectSubType(category: IntentCategory, message: string): string | undefined {
  switch (category) {
    case 'comparison':
      if (message.includes('ingredient')) return 'ingredient_comparison';
      if (message.includes('product')) return 'product_comparison';
      if (message.includes('routine')) return 'routine_comparison';
      return 'general_comparison';

    case 'routine_building':
      if (message.includes('am') || message.includes('morning')) return 'am_routine';
      if (message.includes('pm') || message.includes('evening') || message.includes('night')) return 'pm_routine';
      return 'full_routine';

    case 'product_discovery':
      if (message.includes('serum')) return 'serum';
      if (message.includes('cleanser')) return 'cleanser';
      if (message.includes('moisturizer')) return 'moisturizer';
      if (message.includes('sunscreen') || message.includes('spf')) return 'sunscreen';
      if (message.includes('treatment')) return 'treatment';
      return undefined;

    default:
      return undefined;
  }
}

/**
 * Detect constraints from message
 */
function detectConstraints(message: string): DetectedConstraint[] {
  const constraints: DetectedConstraint[] = [];

  for (const { type, patterns, extractor } of CONSTRAINT_PATTERNS) {
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        constraints.push({
          type,
          value: extractor(match),
          confidence: 'high',
        });
        break; // Only one match per type
      }
    }
  }

  return constraints;
}

/**
 * Detect safety signals from message
 */
function detectSafetySignals(message: string): SafetySignal[] {
  const signals: SafetySignal[] = [];

  for (const [signal, keywords] of Object.entries(SAFETY_KEYWORDS)) {
    if (keywords.some(kw => message.includes(kw))) {
      signals.push(signal as SafetySignal);
    }
  }

  // Special detection for active conflicts
  const activeIngredients = ['retinol', 'aha', 'bha', 'glycolic', 'salicylic', 'benzoyl peroxide', 'vitamin c'];
  const mentionedActives = activeIngredients.filter(active => message.includes(active));

  if (mentionedActives.length >= 2 && (message.includes('together') || message.includes('same') || message.includes('combine') || message.includes('with'))) {
    if (!signals.includes('active_conflict')) {
      signals.push('active_conflict');
    }
  }

  return signals;
}

/**
 * Detect workflow continuation
 */
function detectWorkflowContinuation(
  message: string,
  hasActiveWorkflow?: boolean
): { isWorkflowContinuation: boolean; workflowCues: string[] } {
  const cues = WORKFLOW_CONTINUATION_CUES.filter(cue =>
    message.includes(cue.toLowerCase())
  );

  // Short affirmative responses with active workflow
  const isShortAffirmative = message.length < 30 && (
    message === 'yes' || message === 'okay' || message === 'ok' ||
    message === 'sure' || message === 'next' || message === 'continue' ||
    message.startsWith('yes') || message.startsWith('okay')
  );

  const isWorkflowContinuation = hasActiveWorkflow
    ? (cues.length > 0 || isShortAffirmative)
    : cues.length >= 2;

  return { isWorkflowContinuation, workflowCues: cues };
}

/**
 * Prioritize intents based on signals and context
 */
function prioritizeIntents(
  intents: DetectedIntent[],
  safetySignals: SafetySignal[],
  isWorkflowContinuation: boolean,
  context?: { previousIntent?: IntentCategory }
): { primary: DetectedIntent; secondary: DetectedIntent[]; hidden: DetectedIntent[] } {
  // Sort by confidence
  const sorted = [...intents].sort((a, b) => {
    const confidenceOrder = { high: 3, medium: 2, low: 1 };
    return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
  });

  // If safety signals present, safety_check becomes primary
  if (safetySignals.length > 0 && !sorted.some(i => i.category === 'safety_check')) {
    sorted.unshift({
      category: 'safety_check',
      confidence: 'high',
      keywords: [],
    });
  }

  // If workflow continuation, that becomes primary
  if (isWorkflowContinuation) {
    const workflowIntent: DetectedIntent = {
      category: 'workflow_continuation',
      confidence: 'high',
      keywords: [],
    };

    // Move existing workflow_continuation to front or add it
    const existingIndex = sorted.findIndex(i => i.category === 'workflow_continuation');
    if (existingIndex > 0) {
      sorted.splice(existingIndex, 1);
      sorted.unshift(workflowIntent);
    } else if (existingIndex === -1) {
      sorted.unshift(workflowIntent);
    }
  }

  // Identify hidden intents (implied but not explicitly stated)
  const hidden: DetectedIntent[] = [];

  // If asking about ingredient, they might also want product recommendations
  if (sorted[0]?.category === 'ingredient_question') {
    hidden.push({
      category: 'product_discovery',
      confidence: 'low',
      keywords: ['implied'],
    });
  }

  // If asking about concern, they might want routine help
  if (sorted[0]?.category === 'concern_question') {
    hidden.push({
      category: 'routine_optimization',
      confidence: 'low',
      keywords: ['implied'],
    });
  }

  return {
    primary: sorted[0] || { category: 'product_question', confidence: 'low', keywords: [] },
    secondary: sorted.slice(1, 3),
    hidden,
  };
}

/**
 * Check if clarification is needed
 */
function checkClarificationNeeded(
  primary: DetectedIntent,
  secondary: DetectedIntent[],
  message: string
): {
  requiresClarification: boolean;
  suggestedClarification?: string;
  interpretationOptions?: string[];
} {
  // Very short or vague messages may need clarification
  if (message.length < 15 && primary.confidence === 'low') {
    return {
      requiresClarification: true,
      suggestedClarification: 'Could you tell me a bit more about what you\'re looking for?',
      interpretationOptions: undefined,
    };
  }

  // Multiple high-confidence intents may need disambiguation
  if (secondary.length > 0 && secondary[0].confidence === 'high' && primary.confidence === 'high') {
    // Generate interpretation options
    const options = [primary, secondary[0]].map(intent => {
      switch (intent.category) {
        case 'ingredient_question':
          return 'Learn about an ingredient';
        case 'product_question':
        case 'product_discovery':
          return 'Find product recommendations';
        case 'concern_question':
          return 'Get help with a skin concern';
        case 'routine_building':
          return 'Build a new routine';
        case 'routine_optimization':
          return 'Improve your current routine';
        case 'comparison':
          return 'Compare options';
        default:
          return undefined;
      }
    }).filter(Boolean) as string[];

    if (options.length >= 2) {
      return {
        requiresClarification: true,
        suggestedClarification: `I can help with a few things here. Would you like me to: ${options.join(' or ')}?`,
        interpretationOptions: options,
      };
    }
  }

  return { requiresClarification: false };
}

// ============================================================================
// ROUTING
// ============================================================================

/**
 * Determine routing based on intent classification
 */
export function routeIntent(classification: IntentClassification): IntentRoute[] {
  const routes: IntentRoute[] = [];

  // Safety signals get highest priority
  if (classification.safetySignals.length > 0) {
    routes.push({
      targetModule: 'errorHandlingIntelligence',
      priority: 'safety',
      action: 'handleSafetySignals',
      context: { signals: classification.safetySignals },
    });
  }

  // Primary intent routing
  const primaryRoute = getRouteForIntent(classification.primary);
  if (primaryRoute) {
    routes.push({
      ...primaryRoute,
      priority: 'primary',
      context: {
        ...primaryRoute.context,
        constraints: classification.constraints,
      },
    });
  }

  // Secondary intent routing (for multi-intent responses)
  for (const secondary of classification.secondary.slice(0, 1)) {
    const secondaryRoute = getRouteForIntent(secondary);
    if (secondaryRoute) {
      routes.push({
        ...secondaryRoute,
        priority: 'secondary',
      });
    }
  }

  return routes;
}

/**
 * Get route for a specific intent
 */
function getRouteForIntent(intent: DetectedIntent): Omit<IntentRoute, 'priority'> | null {
  switch (intent.category) {
    case 'ingredient_question':
      return {
        targetModule: 'ingredientIntelligence',
        action: 'explainIngredient',
        context: { keywords: intent.keywords },
      };

    case 'product_question':
    case 'product_discovery':
      return {
        targetModule: 'productIntelligence',
        action: 'recommendProducts',
        context: { keywords: intent.keywords, subType: intent.subType },
      };

    case 'concern_question':
      return {
        targetModule: 'concernIntelligence',
        action: 'explainConcern',
        context: { keywords: intent.keywords },
      };

    case 'routine_building':
      return {
        targetModule: 'routineBuilder',
        action: 'buildRoutine',
        context: { subType: intent.subType },
      };

    case 'routine_optimization':
      return {
        targetModule: 'routineOptimizationIntelligence',
        action: 'optimizeRoutine',
        context: {},
      };

    case 'troubleshooting':
      return {
        targetModule: 'errorHandlingIntelligence',
        action: 'troubleshoot',
        context: { keywords: intent.keywords },
      };

    case 'comparison':
      return {
        targetModule: 'productIntelligence',
        action: 'compareProducts',
        context: { subType: intent.subType },
      };

    case 'safety_check':
      return {
        targetModule: 'errorHandlingIntelligence',
        action: 'checkSafety',
        context: {},
      };

    case 'educational':
      return {
        targetModule: 'searchRetrievalIntelligence',
        action: 'retrieveEducational',
        context: { keywords: intent.keywords },
      };

    case 'navigation':
      return {
        targetModule: 'chatRetrieval',
        action: 'detectNavigation',
        context: { keywords: intent.keywords },
      };

    case 'workflow_continuation':
      return {
        targetModule: 'workflowIntelligence',
        action: 'continueWorkflow',
        context: {},
      };

    case 'skin_profile_clarification':
      return {
        targetModule: 'skinProfileIntelligence',
        action: 'clarifyProfile',
        context: {},
      };

    case 'off_topic':
      return {
        targetModule: 'communicationIntelligence',
        action: 'redirectToSkincare',
        context: {},
      };

    default:
      return null;
  }
}

// ============================================================================
// MULTI-INTENT HANDLING
// ============================================================================

/**
 * Break down multi-intent query into structured components
 */
export function decomposeMultiIntent(
  classification: IntentClassification
): Array<{ intent: DetectedIntent; order: number; isSafetyCritical: boolean }> {
  const components: Array<{ intent: DetectedIntent; order: number; isSafetyCritical: boolean }> = [];
  let order = 1;

  // Safety-critical intents first
  if (classification.safetySignals.length > 0) {
    components.push({
      intent: { category: 'safety_check', confidence: 'high', keywords: [] },
      order: order++,
      isSafetyCritical: true,
    });
  }

  // Primary intent
  components.push({
    intent: classification.primary,
    order: order++,
    isSafetyCritical: false,
  });

  // Secondary intents
  for (const secondary of classification.secondary) {
    components.push({
      intent: secondary,
      order: order++,
      isSafetyCritical: false,
    });
  }

  return components;
}

/**
 * Generate structured response plan for multi-intent
 */
export function generateMultiIntentPlan(
  components: Array<{ intent: DetectedIntent; order: number; isSafetyCritical: boolean }>
): string {
  if (components.length <= 1) {
    return '';
  }

  const steps: string[] = [];

  for (const component of components) {
    if (component.isSafetyCritical) {
      steps.push('First, let me check the safety of what you\'re asking about.');
    } else {
      switch (component.intent.category) {
        case 'ingredient_question':
          steps.push('I\'ll explain the ingredient.');
          break;
        case 'product_question':
        case 'product_discovery':
          steps.push('I\'ll help you find the right product.');
          break;
        case 'comparison':
          steps.push('I\'ll compare the options.');
          break;
        case 'routine_building':
          steps.push('I\'ll help build your routine.');
          break;
        default:
          break;
      }
    }
  }

  return steps.length > 1 ? `I can help with both. ${steps.join(' Then ')}` : '';
}

// ============================================================================
// OFF-TOPIC HANDLING
// ============================================================================

/**
 * Check if message is off-topic
 */
export function isOffTopic(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check for off-topic keywords
  const offTopicKeywords = INTENT_KEYWORDS.off_topic;
  const hasOffTopicKeyword = offTopicKeywords.some(kw => lowerMessage.includes(kw));

  // Check if message has no skincare-related content
  const skincareKeywords = [
    ...INTENT_KEYWORDS.ingredient_question,
    ...INTENT_KEYWORDS.concern_question,
    ...INTENT_KEYWORDS.routine_building,
    'skin', 'face', 'product', 'cream', 'serum', 'sunscreen',
  ];

  const hasSkincareContent = skincareKeywords.some(kw => lowerMessage.includes(kw));

  return hasOffTopicKeyword && !hasSkincareContent;
}

/**
 * Generate off-topic redirect message
 */
export function generateOffTopicRedirect(): string {
  return 'I specialize in skincare guidance. I can help you with product recommendations, ingredient education, routine building, and skin concern guidance. What would you like to explore?';
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format intent classification for AI context
 */
export function formatIntentForAI(classification: IntentClassification): string {
  const lines: string[] = [];

  lines.push(`**Primary Intent:** ${formatIntentCategory(classification.primary.category)} (${classification.primary.confidence} confidence)`);

  if (classification.secondary.length > 0) {
    lines.push(`**Secondary Intents:** ${classification.secondary.map(i => formatIntentCategory(i.category)).join(', ')}`);
  }

  if (classification.constraints.length > 0) {
    lines.push(`**Detected Constraints:** ${classification.constraints.map(c => c.value).join(', ')}`);
  }

  if (classification.safetySignals.length > 0) {
    lines.push(`**Safety Signals:** ${classification.safetySignals.join(', ')}`);
  }

  if (classification.isWorkflowContinuation) {
    lines.push('**Workflow:** Continuing existing workflow');
  }

  return lines.join('\n');
}

/**
 * Format intent category for display
 */
function formatIntentCategory(category: IntentCategory): string {
  const formatMap: Record<IntentCategory, string> = {
    ingredient_question: 'Ingredient Question',
    product_question: 'Product Question',
    concern_question: 'Concern Question',
    routine_building: 'Routine Building',
    routine_optimization: 'Routine Optimization',
    product_discovery: 'Product Discovery',
    skin_profile_clarification: 'Skin Profile Clarification',
    troubleshooting: 'Troubleshooting',
    comparison: 'Comparison',
    safety_check: 'Safety Check',
    educational: 'Educational',
    navigation: 'Navigation',
    workflow_continuation: 'Workflow Continuation',
    off_topic: 'Off-Topic',
  };

  return formatMap[category] || category;
}

/**
 * Format routing decision for logging
 */
export function formatRoutingDecision(routes: IntentRoute[]): string {
  return routes.map(r =>
    `[${r.priority.toUpperCase()}] ${r.targetModule}.${r.action}`
  ).join(' → ');
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

/**
 * Intent classification principles
 */
export const INTENT_CLASSIFICATION_PRINCIPLES = {
  detection: [
    'Identify primary intent first',
    'Look for secondary and hidden intents',
    'Detect constraints and preferences',
    'Prioritize safety signals above all',
  ],
  ambiguity: [
    'Infer most likely skincare intent',
    'Ask one clarifying question only if essential',
    'Provide 2-3 interpretation options when helpful',
    'Never overwhelm with multiple questions',
  ],
  multiIntent: [
    'Break request into components',
    'Address safety-critical components first',
    'Handle each intent in structured order',
    'Maintain warm, expert tone throughout',
  ],
  safety: [
    'Detect combining strong actives',
    'Flag pregnancy-unsafe ingredients',
    'Identify over-exfoliation risks',
    'Redirect medical requests appropriately',
  ],
  workflow: [
    'Detect continuation cues',
    'Resume correct workflow',
    'Maintain progress state',
    'Avoid unnecessary restarts',
  ],
} as const;
