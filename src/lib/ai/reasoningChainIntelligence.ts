/**
 * Query Decomposition & Reasoning-Chain Intelligence for Lorem Curae AI
 *
 * Breaks down complex queries into smaller components, reasons through them
 * internally, and produces clear, safe, personalized answers. All reasoning
 * is internal and never exposed to the user.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Intelligence modules that can be activated
 */
export type IntelligenceModule =
  | 'ingredient'
  | 'product'
  | 'concern'
  | 'routine_builder'
  | 'routine_optimization'
  | 'safety'
  | 'retrieval'
  | 'navigation'
  | 'workflow'
  | 'shopping'
  | 'communication'
  | 'formatting';

/**
 * Task priority levels
 */
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Sub-task extracted from a complex query
 */
export interface SubTask {
  id: string;
  description: string;
  module: IntelligenceModule;
  priority: TaskPriority;
  dependencies: string[];
  isSafetyCritical: boolean;
  isResolved: boolean;
  result?: unknown;
}

/**
 * Decomposed query structure
 */
export interface DecomposedQuery {
  originalQuery: string;
  primaryGoal: string;
  subTasks: SubTask[];
  safetyChecksRequired: boolean;
  clarificationNeeded: boolean;
  suggestedClarification?: string;
  executionOrder: string[];
}

/**
 * Reasoning context for planning
 */
export interface ReasoningContext {
  userProfile?: {
    skinType?: string;
    concerns?: string[];
    sensitivities?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    isPregnant?: boolean;
  };
  conversationHistory?: Array<{ role: string; content: string }>;
  activeWorkflow?: {
    type: string;
    currentStep: number;
  };
  detectedEntities: {
    ingredients: string[];
    products: string[];
    concerns: string[];
    categories: string[];
  };
}

/**
 * Execution plan for responding
 */
export interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
  requiresMultiTurn: boolean;
  safetyGate: boolean;
}

/**
 * Individual execution step
 */
export interface ExecutionStep {
  order: number;
  module: IntelligenceModule;
  action: string;
  input: Record<string, unknown>;
  dependsOn: number[];
  isSafetyCheck: boolean;
}

/**
 * Safety check result
 */
export interface SafetyCheckResult {
  passed: boolean;
  issues: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }>;
  blocksExecution: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Keywords that indicate specific modules
 */
const MODULE_KEYWORDS: Record<IntelligenceModule, string[]> = {
  ingredient: [
    'ingredient', 'what is', 'what does', 'niacinamide', 'retinol', 'vitamin c',
    'hyaluronic', 'salicylic', 'glycolic', 'ceramide', 'peptide', 'aha', 'bha',
  ],
  product: [
    'product', 'recommend', 'best', 'buy', 'serum', 'cleanser', 'moisturizer',
    'sunscreen', 'which one', 'find me',
  ],
  concern: [
    'acne', 'dark spots', 'redness', 'sensitive', 'dry', 'oily', 'wrinkle',
    'hyperpigmentation', 'breakout', 'texture', 'pores',
  ],
  routine_builder: [
    'routine', 'build', 'create', 'morning', 'evening', 'order', 'steps',
  ],
  routine_optimization: [
    'improve', 'optimize', 'adjust', 'add to', 'my routine', 'change',
  ],
  safety: [
    'safe', 'together', 'combine', 'mix', 'pregnant', 'conflict', 'irritation',
  ],
  retrieval: [
    'learn', 'explain', 'how does', 'why', 'understand',
  ],
  navigation: [
    'where', 'page', 'link', 'go to', 'find the',
  ],
  workflow: [
    'next', 'continue', 'then', 'after that', 'okay',
  ],
  shopping: [
    'browse', 'shop', 'under $', 'budget', 'affordable', 'compare',
  ],
  communication: [
    'help', 'confused', 'not sure', 'what do you mean',
  ],
  formatting: [],
};

/**
 * Safety-critical keywords
 */
const SAFETY_CRITICAL_KEYWORDS = [
  'pregnant', 'pregnancy', 'breastfeeding',
  'retinol', 'retinoid',
  'aha', 'bha', 'glycolic', 'salicylic',
  'together', 'combine', 'mix', 'same time',
  'burning', 'irritation', 'reaction',
  'allergy', 'allergic',
];

/**
 * Module priority order (safety first)
 */
const MODULE_PRIORITY: Record<IntelligenceModule, number> = {
  safety: 1,
  concern: 2,
  ingredient: 3,
  product: 4,
  routine_builder: 5,
  routine_optimization: 6,
  shopping: 7,
  retrieval: 8,
  navigation: 9,
  workflow: 10,
  communication: 11,
  formatting: 12,
};

// ============================================================================
// QUERY DECOMPOSITION
// ============================================================================

/**
 * Decompose a complex query into sub-tasks
 */
export function decomposeQuery(
  query: string,
  context?: ReasoningContext
): DecomposedQuery {
  const lowerQuery = query.toLowerCase();
  const subTasks: SubTask[] = [];
  let taskIdCounter = 0;

  // Detect which modules are needed
  const requiredModules = detectRequiredModules(lowerQuery);

  // Check if safety checks are required
  const safetyChecksRequired = requiresSafetyCheck(lowerQuery, context);

  // Add safety check as first task if needed
  if (safetyChecksRequired) {
    subTasks.push({
      id: `task_${taskIdCounter++}`,
      description: 'Verify ingredient/product safety',
      module: 'safety',
      priority: 'critical',
      dependencies: [],
      isSafetyCritical: true,
      isResolved: false,
    });
  }

  // Add tasks for each required module
  for (const module of requiredModules) {
    if (module === 'safety' && safetyChecksRequired) continue; // Already added

    const task: SubTask = {
      id: `task_${taskIdCounter++}`,
      description: getTaskDescription(module, lowerQuery),
      module,
      priority: getTaskPriority(module, safetyChecksRequired),
      dependencies: safetyChecksRequired && module !== 'safety' ? ['task_0'] : [],
      isSafetyCritical: module === 'safety',
      isResolved: false,
    };

    subTasks.push(task);
  }

  // Always add formatting as final step
  if (subTasks.length > 0) {
    subTasks.push({
      id: `task_${taskIdCounter++}`,
      description: 'Format response for user',
      module: 'formatting',
      priority: 'low',
      dependencies: subTasks.map(t => t.id),
      isSafetyCritical: false,
      isResolved: false,
    });
  }

  // Determine execution order
  const executionOrder = determineExecutionOrder(subTasks);

  // Check if clarification needed
  const { clarificationNeeded, suggestedClarification } = checkClarificationNeeded(
    lowerQuery,
    requiredModules
  );

  // Identify primary goal
  const primaryGoal = identifyPrimaryGoal(lowerQuery, requiredModules);

  return {
    originalQuery: query,
    primaryGoal,
    subTasks,
    safetyChecksRequired,
    clarificationNeeded,
    suggestedClarification,
    executionOrder,
  };
}

/**
 * Detect which modules are required for the query
 */
function detectRequiredModules(query: string): IntelligenceModule[] {
  const modules: Set<IntelligenceModule> = new Set();

  for (const [module, keywords] of Object.entries(MODULE_KEYWORDS)) {
    if (keywords.some(kw => query.includes(kw))) {
      modules.add(module as IntelligenceModule);
    }
  }

  // If no modules detected, default to product
  if (modules.size === 0) {
    modules.add('product');
  }

  return Array.from(modules).sort(
    (a, b) => MODULE_PRIORITY[a] - MODULE_PRIORITY[b]
  );
}

/**
 * Check if safety verification is required
 */
function requiresSafetyCheck(
  query: string,
  context?: ReasoningContext
): boolean {
  // Check for safety keywords
  if (SAFETY_CRITICAL_KEYWORDS.some(kw => query.includes(kw))) {
    return true;
  }

  // Check if user is pregnant
  if (context?.userProfile?.isPregnant) {
    return true;
  }

  // Check if multiple actives are mentioned
  const actives = ['retinol', 'aha', 'bha', 'vitamin c', 'benzoyl peroxide', 'glycolic', 'salicylic'];
  const mentionedActives = actives.filter(a => query.includes(a));
  if (mentionedActives.length >= 2) {
    return true;
  }

  // Check if user has sensitivities
  if (context?.userProfile?.sensitivities && context.userProfile.sensitivities.length > 0) {
    return true;
  }

  return false;
}

/**
 * Get task description for a module
 */
function getTaskDescription(module: IntelligenceModule, query: string): string {
  switch (module) {
    case 'ingredient':
      return 'Explain ingredient benefits and usage';
    case 'product':
      return 'Find and recommend suitable products';
    case 'concern':
      return 'Address skin concern with guidance';
    case 'routine_builder':
      return 'Build personalized routine';
    case 'routine_optimization':
      return 'Optimize existing routine';
    case 'safety':
      return 'Check for ingredient conflicts and safety';
    case 'retrieval':
      return 'Retrieve relevant knowledge';
    case 'navigation':
      return 'Provide navigation links';
    case 'workflow':
      return 'Continue active workflow';
    case 'shopping':
      return 'Assist with product discovery';
    case 'communication':
      return 'Clarify user needs';
    case 'formatting':
      return 'Format response for clarity';
    default:
      return 'Process request';
  }
}

/**
 * Get task priority
 */
function getTaskPriority(
  module: IntelligenceModule,
  hasSafetyDependency: boolean
): TaskPriority {
  if (module === 'safety') return 'critical';
  if (hasSafetyDependency) return 'high';
  if (module === 'formatting') return 'low';
  return 'medium';
}

/**
 * Determine execution order based on dependencies
 */
function determineExecutionOrder(tasks: SubTask[]): string[] {
  const order: string[] = [];
  const resolved = new Set<string>();

  // Simple topological sort
  while (order.length < tasks.length) {
    for (const task of tasks) {
      if (resolved.has(task.id)) continue;

      const depsResolved = task.dependencies.every(dep => resolved.has(dep));
      if (depsResolved) {
        order.push(task.id);
        resolved.add(task.id);
      }
    }

    // Prevent infinite loop
    if (order.length === resolved.size && order.length < tasks.length) {
      // Add remaining tasks
      for (const task of tasks) {
        if (!resolved.has(task.id)) {
          order.push(task.id);
          resolved.add(task.id);
        }
      }
      break;
    }
  }

  return order;
}

/**
 * Check if clarification is needed
 */
function checkClarificationNeeded(
  query: string,
  modules: IntelligenceModule[]
): { clarificationNeeded: boolean; suggestedClarification?: string } {
  // Very short queries may need clarification
  if (query.length < 15 && modules.length === 1 && modules[0] === 'product') {
    return {
      clarificationNeeded: true,
      suggestedClarification: 'Could you tell me more about what you\'re looking for?',
    };
  }

  // Multiple competing intents
  if (modules.includes('ingredient') && modules.includes('product')) {
    // Check if query is clear about what they want
    if (!query.includes('recommend') && !query.includes('product') && !query.includes('learn') && !query.includes('what is')) {
      return {
        clarificationNeeded: true,
        suggestedClarification: 'Would you like to learn about this ingredient, or find products containing it?',
      };
    }
  }

  return { clarificationNeeded: false };
}

/**
 * Identify the primary goal of the query
 */
function identifyPrimaryGoal(query: string, modules: IntelligenceModule[]): string {
  // Safety always becomes primary if present
  if (modules.includes('safety')) {
    return 'Verify safety and provide guidance';
  }

  // Check for explicit goals
  if (query.includes('routine') || query.includes('build')) {
    return 'Build or optimize skincare routine';
  }

  if (query.includes('recommend') || query.includes('find') || query.includes('best')) {
    return 'Find suitable product recommendations';
  }

  if (query.includes('what is') || query.includes('how does') || query.includes('explain')) {
    return 'Provide educational information';
  }

  if (query.includes('compare') || query.includes('vs') || query.includes('versus')) {
    return 'Compare options and recommend best fit';
  }

  // Default based on primary module
  const primaryModule = modules[0];
  switch (primaryModule) {
    case 'ingredient':
      return 'Explain ingredient and its benefits';
    case 'product':
      return 'Recommend suitable products';
    case 'concern':
      return 'Address skin concern';
    case 'routine_builder':
    case 'routine_optimization':
      return 'Help with skincare routine';
    default:
      return 'Provide skincare guidance';
  }
}

// ============================================================================
// EXECUTION PLANNING
// ============================================================================

/**
 * Create an execution plan from decomposed query
 */
export function createExecutionPlan(
  decomposed: DecomposedQuery,
  context?: ReasoningContext
): ExecutionPlan {
  const steps: ExecutionStep[] = [];

  for (let i = 0; i < decomposed.executionOrder.length; i++) {
    const taskId = decomposed.executionOrder[i];
    const task = decomposed.subTasks.find(t => t.id === taskId);

    if (!task) continue;

    const dependsOn = task.dependencies.map(depId => {
      const depIndex = decomposed.executionOrder.indexOf(depId);
      return depIndex >= 0 ? depIndex : -1;
    }).filter(idx => idx >= 0);

    steps.push({
      order: i,
      module: task.module,
      action: task.description,
      input: buildStepInput(task, decomposed, context),
      dependsOn,
      isSafetyCheck: task.isSafetyCritical,
    });
  }

  // Determine complexity
  const complexity = steps.length <= 2 ? 'simple' :
                    steps.length <= 4 ? 'moderate' : 'complex';

  // Check if multi-turn needed
  const requiresMultiTurn = decomposed.clarificationNeeded ||
    decomposed.subTasks.some(t => t.module === 'workflow');

  return {
    steps,
    estimatedComplexity: complexity,
    requiresMultiTurn,
    safetyGate: decomposed.safetyChecksRequired,
  };
}

/**
 * Build input for an execution step
 */
function buildStepInput(
  task: SubTask,
  decomposed: DecomposedQuery,
  context?: ReasoningContext
): Record<string, unknown> {
  const input: Record<string, unknown> = {
    query: decomposed.originalQuery,
    goal: decomposed.primaryGoal,
  };

  // Add context if available
  if (context) {
    if (context.userProfile) {
      input.skinType = context.userProfile.skinType;
      input.concerns = context.userProfile.concerns;
      input.sensitivities = context.userProfile.sensitivities;
      input.experienceLevel = context.userProfile.experienceLevel;
    }

    if (context.detectedEntities) {
      input.ingredients = context.detectedEntities.ingredients;
      input.products = context.detectedEntities.products;
    }
  }

  return input;
}

// ============================================================================
// SAFETY CHECKS
// ============================================================================

/**
 * Run safety checks on the query context
 */
export function runSafetyChecks(
  decomposed: DecomposedQuery,
  context?: ReasoningContext
): SafetyCheckResult {
  const issues: SafetyCheckResult['issues'] = [];
  const query = decomposed.originalQuery.toLowerCase();

  // Check for pregnancy-unsafe ingredients
  const pregnancyUnsafe = ['retinol', 'retinoid', 'tretinoin', 'adapalene', 'salicylic acid'];
  if (context?.userProfile?.isPregnant) {
    for (const ingredient of pregnancyUnsafe) {
      if (query.includes(ingredient)) {
        issues.push({
          type: 'pregnancy_unsafe',
          severity: 'critical',
          message: `${ingredient} is not recommended during pregnancy`,
          suggestion: 'Consider pregnancy-safe alternatives like azelaic acid or niacinamide',
        });
      }
    }
  }

  // Check for ingredient conflicts
  const conflicts = [
    { a: 'retinol', b: 'aha', message: 'Retinol and AHAs can cause irritation when used together' },
    { a: 'retinol', b: 'bha', message: 'Retinol and BHAs may be too harsh together' },
    { a: 'retinol', b: 'vitamin c', message: 'Retinol and Vitamin C work best used at different times' },
    { a: 'retinol', b: 'benzoyl peroxide', message: 'Benzoyl peroxide can deactivate retinol' },
    { a: 'aha', b: 'vitamin c', message: 'AHAs and Vitamin C together can irritate' },
  ];

  for (const conflict of conflicts) {
    if (query.includes(conflict.a) && query.includes(conflict.b)) {
      issues.push({
        type: 'ingredient_conflict',
        severity: 'warning',
        message: conflict.message,
        suggestion: 'Use on alternate days or at different times (AM/PM)',
      });
    }
  }

  // Check for overuse patterns
  const overusePatterns = [
    { pattern: /daily.*retinol|retinol.*daily/i, message: 'Daily retinol may be too frequent for beginners' },
    { pattern: /daily.*aha|aha.*daily/i, message: 'Daily AHA use can over-exfoliate' },
    { pattern: /multiple.*acid|several.*acid/i, message: 'Using multiple acids can damage skin barrier' },
  ];

  for (const pattern of overusePatterns) {
    if (pattern.pattern.test(query)) {
      issues.push({
        type: 'overuse',
        severity: 'warning',
        message: pattern.message,
        suggestion: 'Start slowly and build tolerance gradually',
      });
    }
  }

  // Check for beginner safety
  const advancedIngredients = ['retinol', 'tretinoin', 'glycolic acid', 'tca'];
  if (context?.userProfile?.experienceLevel === 'beginner') {
    for (const ingredient of advancedIngredients) {
      if (query.includes(ingredient)) {
        issues.push({
          type: 'experience_mismatch',
          severity: 'info',
          message: `${ingredient} is a strong active for beginners`,
          suggestion: 'Start with lower concentrations and build up slowly',
        });
      }
    }
  }

  // Determine if execution should be blocked
  const blocksExecution = issues.some(i => i.severity === 'critical');

  return {
    passed: issues.length === 0,
    issues,
    blocksExecution,
  };
}

// ============================================================================
// RESPONSE PLANNING
// ============================================================================

/**
 * Plan the structure of the final response
 */
export function planResponseStructure(
  decomposed: DecomposedQuery,
  safetyResult: SafetyCheckResult
): {
  sections: string[];
  includesSafetyWarning: boolean;
  includesLinks: boolean;
  estimatedLength: 'short' | 'medium' | 'long';
} {
  const sections: string[] = [];

  // Safety warnings first
  if (safetyResult.issues.length > 0) {
    sections.push('safety_warning');
  }

  // Add sections based on modules
  const modules = decomposed.subTasks.map(t => t.module).filter(m => m !== 'formatting');

  if (modules.includes('ingredient')) {
    sections.push('ingredient_explanation');
  }

  if (modules.includes('product') || modules.includes('shopping')) {
    sections.push('product_recommendations');
  }

  if (modules.includes('concern')) {
    sections.push('concern_guidance');
  }

  if (modules.includes('routine_builder') || modules.includes('routine_optimization')) {
    sections.push('routine_steps');
  }

  // Navigation links
  if (modules.includes('navigation') || modules.length > 1) {
    sections.push('navigation_links');
  }

  // Estimate length
  const estimatedLength = sections.length <= 2 ? 'short' :
                         sections.length <= 4 ? 'medium' : 'long';

  return {
    sections,
    includesSafetyWarning: safetyResult.issues.length > 0,
    includesLinks: sections.includes('navigation_links'),
    estimatedLength,
  };
}

// ============================================================================
// MULTI-INTENT HANDLING
// ============================================================================

/**
 * Generate a transition phrase for multi-intent responses
 */
export function getIntentTransition(
  fromModule: IntelligenceModule,
  toModule: IntelligenceModule
): string {
  // Safety transitions
  if (fromModule === 'safety') {
    return 'Now that we\'ve addressed safety,';
  }

  // Common transitions
  const transitions: Record<string, Record<string, string>> = {
    ingredient: {
      product: 'If you\'d like products with this ingredient,',
      routine: 'To incorporate this into your routine,',
    },
    product: {
      routine: 'Here\'s how to use it in your routine:',
      comparison: 'Comparing your options:',
    },
    concern: {
      ingredient: 'Key ingredients that help:',
      product: 'Products that can help:',
      routine: 'Here\'s a routine approach:',
    },
  };

  return transitions[fromModule]?.[toModule] || 'Additionally,';
}

/**
 * Generate intro for multi-intent response
 */
export function getMultiIntentIntro(intents: IntelligenceModule[]): string {
  if (intents.includes('safety')) {
    return 'I can help with both. First, let me check something important about safety.';
  }

  if (intents.length === 2) {
    return 'I can help with both of those.';
  }

  return 'I\'ll address each of your questions.';
}

// ============================================================================
// FORMATTING FOR AI CONTEXT
// ============================================================================

/**
 * Format decomposition for internal AI context (not shown to user)
 */
export function formatDecompositionForAI(decomposed: DecomposedQuery): string {
  const lines: string[] = [
    `INTERNAL REASONING (do not reveal):`,
    `Goal: ${decomposed.primaryGoal}`,
    `Tasks: ${decomposed.subTasks.length}`,
    `Safety required: ${decomposed.safetyChecksRequired}`,
    `Execution order: ${decomposed.executionOrder.join(' → ')}`,
  ];

  return lines.join('\n');
}

/**
 * Format execution plan for internal AI context
 */
export function formatPlanForAI(plan: ExecutionPlan): string {
  const lines: string[] = [
    `EXECUTION PLAN (internal):`,
    `Complexity: ${plan.estimatedComplexity}`,
    `Steps: ${plan.steps.length}`,
    `Safety gate: ${plan.safetyGate}`,
  ];

  return lines.join('\n');
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

/**
 * Reasoning chain principles
 */
export const REASONING_PRINCIPLES = {
  decomposition: [
    'Break complex queries into sub-tasks',
    'Identify dependencies between tasks',
    'Prioritize safety-critical tasks first',
    'Determine required intelligence modules',
  ],
  safety: [
    'Always check for ingredient conflicts',
    'Flag pregnancy-unsafe ingredients',
    'Detect over-exfoliation risks',
    'Consider user sensitivity profile',
  ],
  execution: [
    'Solve sub-tasks in dependency order',
    'Maintain internal reasoning state',
    'Produce single clean response',
    'Never reveal chain-of-thought',
  ],
  output: [
    'Be concise and user-friendly',
    'Include no internal reasoning',
    'Structure for scannability',
    'Always personalize to profile',
  ],
} as const;
