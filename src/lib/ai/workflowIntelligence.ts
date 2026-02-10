/**
 * Multi-Turn Task & Workflow Intelligence for Lorem Curae AI
 *
 * Manages multi-step workflows, task state, progress tracking,
 * and orchestration across all intelligence layers.
 */

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

/**
 * Supported workflow types
 */
export type WorkflowType =
  | 'routine_building'       // AM/PM routine construction
  | 'product_selection'      // Finding the right product
  | 'ingredient_analysis'    // Understanding ingredients
  | 'concern_exploration'    // Exploring a skin concern
  | 'profile_refinement'     // Updating skin profile
  | 'troubleshooting'        // Diagnosing routine issues
  | 'routine_optimization'   // Improving existing routine
  | 'compatibility_check'    // Checking product compatibility
  | 'shopping_assistance';   // Guided shopping experience

/**
 * Workflow status
 */
export type WorkflowStatus =
  | 'not_started'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'abandoned';

/**
 * Individual step in a workflow
 */
export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  required: boolean;
  data?: Record<string, unknown>;
  completedAt?: string;
}

/**
 * Complete workflow state
 */
export interface WorkflowState {
  id: string;
  type: WorkflowType;
  status: WorkflowStatus;
  currentStepIndex: number;
  steps: WorkflowStep[];
  context: WorkflowContext;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * Workflow context - accumulated data across steps
 */
export interface WorkflowContext {
  // User constraints and preferences
  skinType?: string;
  concerns: string[];
  sensitivities: string[];
  budget?: 'budget' | 'mid' | 'premium';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferences: Record<string, boolean>;

  // Workflow-specific data
  selectedProducts: Array<{ id: number; name: string; category: string }>;
  excludedIngredients: string[];
  targetRoutine?: 'am' | 'pm' | 'both';
  routineStyle?: 'minimalist' | 'moderate' | 'advanced';

  // Progress tracking
  decisionsLog: Array<{ step: string; decision: string; timestamp: string }>;
  questionsAsked: string[];
  userResponses: Record<string, string>;
}

/**
 * Workflow detection result
 */
export interface WorkflowDetectionResult {
  detected: boolean;
  workflowType?: WorkflowType;
  confidence: 'high' | 'medium' | 'low';
  suggestedFirstStep?: string;
}

// ============================================================================
// WORKFLOW TEMPLATES
// ============================================================================

/**
 * Template steps for each workflow type
 */
const WORKFLOW_TEMPLATES: Record<WorkflowType, Omit<WorkflowStep, 'id' | 'status' | 'data'>[]> = {
  routine_building: [
    { name: 'identify_goals', description: 'Understand routine goals and concerns', required: true },
    { name: 'determine_timing', description: 'Determine AM, PM, or both routines', required: true },
    { name: 'select_cleanser', description: 'Choose appropriate cleanser', required: true },
    { name: 'select_treatment', description: 'Choose treatment/serum if needed', required: false },
    { name: 'select_moisturizer', description: 'Choose moisturizer', required: true },
    { name: 'select_sunscreen', description: 'Choose sunscreen for AM routine', required: false },
    { name: 'review_routine', description: 'Review complete routine and check conflicts', required: true },
    { name: 'provide_guidance', description: 'Share usage tips and next steps', required: true },
  ],

  product_selection: [
    { name: 'identify_category', description: 'Determine product category needed', required: true },
    { name: 'gather_constraints', description: 'Understand preferences and restrictions', required: true },
    { name: 'retrieve_options', description: 'Find matching products', required: true },
    { name: 'present_recommendations', description: 'Present top options with reasoning', required: true },
    { name: 'compare_if_needed', description: 'Compare options if user wants', required: false },
    { name: 'finalize_selection', description: 'Confirm final choice', required: true },
  ],

  ingredient_analysis: [
    { name: 'identify_ingredient', description: 'Confirm which ingredient to analyze', required: true },
    { name: 'explain_benefits', description: 'Explain what it does and benefits', required: true },
    { name: 'check_suitability', description: 'Assess fit for user\'s skin', required: true },
    { name: 'provide_usage_guidance', description: 'Share usage tips and timing', required: true },
    { name: 'suggest_products', description: 'Recommend products containing it', required: false },
  ],

  concern_exploration: [
    { name: 'identify_concern', description: 'Confirm the skin concern', required: true },
    { name: 'explain_causes', description: 'Explain common causes (non-medical)', required: true },
    { name: 'map_ingredients', description: 'Identify helpful ingredients', required: true },
    { name: 'suggest_routine_changes', description: 'Recommend routine adjustments', required: true },
    { name: 'recommend_products', description: 'Suggest products for the concern', required: false },
  ],

  profile_refinement: [
    { name: 'review_current_profile', description: 'Review existing profile data', required: true },
    { name: 'identify_gaps', description: 'Find missing or outdated info', required: true },
    { name: 'gather_updates', description: 'Collect new information', required: true },
    { name: 'confirm_changes', description: 'Confirm profile updates', required: true },
  ],

  troubleshooting: [
    { name: 'identify_issue', description: 'Understand the problem', required: true },
    { name: 'gather_context', description: 'Learn about current routine and products', required: true },
    { name: 'analyze_causes', description: 'Identify likely causes', required: true },
    { name: 'suggest_fixes', description: 'Recommend solutions', required: true },
    { name: 'provide_alternatives', description: 'Offer alternative approaches', required: false },
  ],

  routine_optimization: [
    { name: 'review_current_routine', description: 'Understand current routine', required: true },
    { name: 'identify_improvements', description: 'Find optimization opportunities', required: true },
    { name: 'check_conflicts', description: 'Check for ingredient conflicts', required: true },
    { name: 'suggest_changes', description: 'Recommend specific changes', required: true },
    { name: 'explain_benefits', description: 'Explain expected improvements', required: true },
  ],

  compatibility_check: [
    { name: 'gather_products', description: 'List products to check', required: true },
    { name: 'extract_ingredients', description: 'Identify key ingredients', required: true },
    { name: 'check_conflicts', description: 'Detect any conflicts', required: true },
    { name: 'suggest_ordering', description: 'Recommend application order', required: true },
    { name: 'provide_timing', description: 'Suggest AM/PM distribution', required: false },
  ],

  shopping_assistance: [
    { name: 'understand_needs', description: 'Learn what user is looking for', required: true },
    { name: 'set_filters', description: 'Apply preferences and constraints', required: true },
    { name: 'browse_options', description: 'Present matching products', required: true },
    { name: 'refine_selection', description: 'Narrow down based on feedback', required: false },
    { name: 'complete_selection', description: 'Finalize purchase decision', required: true },
  ],
};

// ============================================================================
// WORKFLOW DETECTION
// ============================================================================

/**
 * Patterns for detecting workflow intent
 */
const WORKFLOW_PATTERNS: Record<WorkflowType, RegExp[]> = {
  routine_building: [
    /\b(build|create|make|start|help me with)\s+(a\s+)?(skincare\s+)?(routine|regimen)\b/i,
    /\b(morning|evening|am|pm|night)\s+routine\b/i,
    /\bwhat\s+(should|do)\s+I\s+(use|apply)\b/i,
    /\b(beginner|simple|basic|advanced)\s+routine\b/i,
  ],
  product_selection: [
    /\b(find|recommend|suggest|help me (find|choose)|looking for)\s+(a\s+)?(good\s+)?(cleanser|serum|moisturizer|sunscreen|toner|treatment|product)\b/i,
    /\bwhat\s+(cleanser|serum|moisturizer|sunscreen|toner|treatment)\s+(should|would|do)\b/i,
    /\bbest\s+(cleanser|serum|moisturizer|sunscreen|toner|treatment)\s+for\b/i,
  ],
  ingredient_analysis: [
    /\b(what|how)\s+(is|does|about)\s+([a-z\s]+)?(acid|retinol|niacinamide|vitamin c|hyaluronic|ceramide)\b/i,
    /\b(tell me about|explain|learn about)\s+([a-z\s]+)?(acid|retinol|niacinamide|vitamin c|hyaluronic|ceramide)\b/i,
    /\b(is|should I use)\s+([a-z\s]+)?(acid|retinol|niacinamide|vitamin c|hyaluronic|ceramide)\b.*\b(good|safe|right)\b/i,
  ],
  concern_exploration: [
    /\b(help with|deal with|fix|treat|address|reduce)\s+(my\s+)?(acne|breakouts|dark spots|hyperpigmentation|wrinkles|dryness|oiliness|redness|sensitivity|pores)\b/i,
    /\bhow\s+(do I|can I|to)\s+(get rid of|reduce|treat|fix)\s+(my\s+)?(acne|breakouts|dark spots|wrinkles|dryness|oiliness|redness|pores)\b/i,
  ],
  profile_refinement: [
    /\b(update|change|edit)\s+(my\s+)?(skin\s+)?(profile|survey|preferences)\b/i,
    /\bmy\s+skin\s+(has changed|is different|type changed)\b/i,
  ],
  troubleshooting: [
    /\b(why|what's wrong|not working|breaking out|irritated|burning|stinging)\b/i,
    /\bsince\s+I\s+started\s+using\b/i,
    /\bproduct\s+(isn't|not|stopped)\s+working\b/i,
  ],
  routine_optimization: [
    /\b(improve|optimize|upgrade|level up|enhance)\s+(my\s+)?routine\b/i,
    /\bwhat\s+(can I|should I)\s+add\s+to\s+(my\s+)?routine\b/i,
    /\bis\s+my\s+routine\s+(good|okay|right|missing)\b/i,
  ],
  compatibility_check: [
    /\bcan\s+I\s+(use|mix|combine|layer)\s+(.+)\s+(with|and)\s+(.+)\b/i,
    /\b(compatible|conflict|work together|use together)\b/i,
    /\bwhat\s+order\s+(should|do)\s+I\s+(apply|use)\b/i,
  ],
  shopping_assistance: [
    /\b(shopping|browse|show me|what do you have)\b/i,
    /\b(under|around|about)\s+\$?\d+\b/i,
    /\blooking\s+for\s+(something|products|options)\b/i,
  ],
};

/**
 * Detect workflow type from user message
 */
export function detectWorkflow(message: string): WorkflowDetectionResult {
  const lowerMessage = message.toLowerCase();

  for (const [workflowType, patterns] of Object.entries(WORKFLOW_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerMessage)) {
        const template = WORKFLOW_TEMPLATES[workflowType as WorkflowType];
        return {
          detected: true,
          workflowType: workflowType as WorkflowType,
          confidence: 'high',
          suggestedFirstStep: template[0]?.name,
        };
      }
    }
  }

  // Check for medium-confidence signals
  const workflowSignals = [
    { type: 'routine_building' as WorkflowType, keywords: ['routine', 'daily', 'morning', 'night', 'regimen'] },
    { type: 'product_selection' as WorkflowType, keywords: ['product', 'recommend', 'suggest', 'best', 'good'] },
    { type: 'concern_exploration' as WorkflowType, keywords: ['acne', 'aging', 'dark spots', 'dry', 'oily', 'sensitive'] },
  ];

  for (const signal of workflowSignals) {
    const matchCount = signal.keywords.filter(kw => lowerMessage.includes(kw)).length;
    if (matchCount >= 2) {
      return {
        detected: true,
        workflowType: signal.type,
        confidence: 'medium',
        suggestedFirstStep: WORKFLOW_TEMPLATES[signal.type][0]?.name,
      };
    }
  }

  return { detected: false, confidence: 'low' };
}

// ============================================================================
// WORKFLOW STATE MANAGEMENT
// ============================================================================

/**
 * Create a new workflow state
 */
export function createWorkflow(type: WorkflowType, initialContext?: Partial<WorkflowContext>): WorkflowState {
  const template = WORKFLOW_TEMPLATES[type];
  const now = new Date().toISOString();

  const steps: WorkflowStep[] = template.map((step, index) => ({
    id: `${type}_step_${index}`,
    ...step,
    status: index === 0 ? 'in_progress' : 'pending',
  }));

  return {
    id: `workflow_${Date.now()}`,
    type,
    status: 'in_progress',
    currentStepIndex: 0,
    steps,
    context: {
      concerns: [],
      sensitivities: [],
      preferences: {},
      selectedProducts: [],
      excludedIngredients: [],
      decisionsLog: [],
      questionsAsked: [],
      userResponses: {},
      ...initialContext,
    },
    startedAt: now,
    updatedAt: now,
  };
}

/**
 * Advance workflow to next step
 */
export function advanceWorkflow(
  workflow: WorkflowState,
  stepData?: Record<string, unknown>
): WorkflowState {
  const currentStep = workflow.steps[workflow.currentStepIndex];
  if (!currentStep) return workflow;

  const now = new Date().toISOString();

  // Mark current step as completed
  const updatedSteps = [...workflow.steps];
  updatedSteps[workflow.currentStepIndex] = {
    ...currentStep,
    status: 'completed',
    data: stepData,
    completedAt: now,
  };

  // Find next pending step
  let nextIndex = workflow.currentStepIndex + 1;
  while (nextIndex < updatedSteps.length && updatedSteps[nextIndex].status === 'skipped') {
    nextIndex++;
  }

  // Check if workflow is complete
  const isComplete = nextIndex >= updatedSteps.length;

  if (!isComplete && updatedSteps[nextIndex]) {
    updatedSteps[nextIndex] = {
      ...updatedSteps[nextIndex],
      status: 'in_progress',
    };
  }

  return {
    ...workflow,
    status: isComplete ? 'completed' : 'in_progress',
    currentStepIndex: isComplete ? workflow.currentStepIndex : nextIndex,
    steps: updatedSteps,
    updatedAt: now,
    completedAt: isComplete ? now : undefined,
  };
}

/**
 * Skip a step in the workflow
 */
export function skipStep(workflow: WorkflowState, stepId: string): WorkflowState {
  const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
  if (stepIndex === -1) return workflow;

  const step = workflow.steps[stepIndex];
  if (step.required) return workflow; // Cannot skip required steps

  const updatedSteps = [...workflow.steps];
  updatedSteps[stepIndex] = { ...step, status: 'skipped' };

  // If skipping current step, advance
  if (stepIndex === workflow.currentStepIndex) {
    return advanceWorkflow({ ...workflow, steps: updatedSteps });
  }

  return { ...workflow, steps: updatedSteps, updatedAt: new Date().toISOString() };
}

/**
 * Update workflow context with new data
 */
export function updateWorkflowContext(
  workflow: WorkflowState,
  updates: Partial<WorkflowContext>
): WorkflowState {
  return {
    ...workflow,
    context: {
      ...workflow.context,
      ...updates,
      // Merge arrays instead of replacing
      concerns: updates.concerns
        ? [...new Set([...workflow.context.concerns, ...updates.concerns])]
        : workflow.context.concerns,
      sensitivities: updates.sensitivities
        ? [...new Set([...workflow.context.sensitivities, ...updates.sensitivities])]
        : workflow.context.sensitivities,
      selectedProducts: updates.selectedProducts
        ? [...workflow.context.selectedProducts, ...updates.selectedProducts]
        : workflow.context.selectedProducts,
      excludedIngredients: updates.excludedIngredients
        ? [...new Set([...workflow.context.excludedIngredients, ...updates.excludedIngredients])]
        : workflow.context.excludedIngredients,
      preferences: { ...workflow.context.preferences, ...updates.preferences },
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Log a decision in the workflow
 */
export function logDecision(
  workflow: WorkflowState,
  step: string,
  decision: string
): WorkflowState {
  return {
    ...workflow,
    context: {
      ...workflow.context,
      decisionsLog: [
        ...workflow.context.decisionsLog,
        { step, decision, timestamp: new Date().toISOString() },
      ],
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Pause workflow
 */
export function pauseWorkflow(workflow: WorkflowState): WorkflowState {
  return {
    ...workflow,
    status: 'paused',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Resume workflow
 */
export function resumeWorkflow(workflow: WorkflowState): WorkflowState {
  if (workflow.status !== 'paused') return workflow;
  return {
    ...workflow,
    status: 'in_progress',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Abandon workflow
 */
export function abandonWorkflow(workflow: WorkflowState): WorkflowState {
  return {
    ...workflow,
    status: 'abandoned',
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * Get workflow progress as percentage
 */
export function getWorkflowProgress(workflow: WorkflowState): number {
  const totalSteps = workflow.steps.filter(s => s.required).length;
  const completedSteps = workflow.steps.filter(s => s.status === 'completed' && s.required).length;
  return Math.round((completedSteps / totalSteps) * 100);
}

/**
 * Get current step info
 */
export function getCurrentStep(workflow: WorkflowState): WorkflowStep | null {
  return workflow.steps[workflow.currentStepIndex] || null;
}

/**
 * Get remaining steps
 */
export function getRemainingSteps(workflow: WorkflowState): WorkflowStep[] {
  return workflow.steps.filter(s => s.status === 'pending' || s.status === 'in_progress');
}

/**
 * Get completed steps
 */
export function getCompletedSteps(workflow: WorkflowState): WorkflowStep[] {
  return workflow.steps.filter(s => s.status === 'completed');
}

// ============================================================================
// CLARIFICATION LOGIC
// ============================================================================

/**
 * Determine if clarification is needed for current step
 */
export function needsClarification(
  workflow: WorkflowState,
  currentStep: WorkflowStep
): { needed: boolean; question?: string } {
  const context = workflow.context;

  // Check what's missing for each step type
  switch (currentStep.name) {
    case 'identify_goals':
      if (context.concerns.length === 0) {
        return { needed: true, question: 'What skin concerns would you like to address?' };
      }
      break;

    case 'determine_timing':
      if (!context.targetRoutine) {
        return { needed: true, question: 'Would you like an AM routine, PM routine, or both?' };
      }
      break;

    case 'gather_constraints':
      if (!context.budget && !context.skinType) {
        return { needed: true, question: 'Do you have any specific preferences—like budget range or fragrance-free?' };
      }
      break;

    case 'select_cleanser':
    case 'select_moisturizer':
    case 'select_sunscreen':
      if (!context.skinType) {
        return { needed: true, question: 'What\'s your skin type—oily, dry, combination, or sensitive?' };
      }
      break;
  }

  return { needed: false };
}

/**
 * Check if question was already asked
 */
export function wasQuestionAsked(workflow: WorkflowState, question: string): boolean {
  return workflow.context.questionsAsked.some(q =>
    q.toLowerCase().includes(question.toLowerCase().slice(0, 20))
  );
}

/**
 * Record that a question was asked
 */
export function recordQuestion(workflow: WorkflowState, question: string): WorkflowState {
  return {
    ...workflow,
    context: {
      ...workflow.context,
      questionsAsked: [...workflow.context.questionsAsked, question],
    },
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// WORKFLOW SUMMARIES
// ============================================================================

/**
 * Generate progress summary for user
 */
export function generateProgressSummary(workflow: WorkflowState): string {
  const completed = getCompletedSteps(workflow);
  const remaining = getRemainingSteps(workflow);
  const progress = getWorkflowProgress(workflow);

  if (completed.length === 0) {
    return `Let's get started with your ${formatWorkflowType(workflow.type)}.`;
  }

  const completedNames = completed.map(s => formatStepName(s.name)).join(', ');

  if (remaining.length === 0) {
    return `We've completed your ${formatWorkflowType(workflow.type)}. Here's what we covered: ${completedNames}.`;
  }

  const currentStep = getCurrentStep(workflow);
  const nextStepName = currentStep ? formatStepName(currentStep.name) : 'next step';

  return `We're ${progress}% through. So far: ${completedNames}. Next: ${nextStepName}.`;
}

/**
 * Generate completion summary
 */
export function generateCompletionSummary(workflow: WorkflowState): string {
  const decisions = workflow.context.decisionsLog;
  const products = workflow.context.selectedProducts;

  let summary = `## ${formatWorkflowType(workflow.type)} Complete\n\n`;

  if (decisions.length > 0) {
    summary += '### Key Decisions\n';
    decisions.slice(-5).forEach(d => {
      summary += `- ${d.decision}\n`;
    });
    summary += '\n';
  }

  if (products.length > 0) {
    summary += '### Selected Products\n';
    products.forEach(p => {
      summary += `- ${p.name} (${p.category})\n`;
    });
    summary += '\n';
  }

  summary += '### Next Steps\n';
  summary += getNextStepSuggestions(workflow.type);

  return summary;
}

/**
 * Format workflow type for display
 */
function formatWorkflowType(type: WorkflowType): string {
  const names: Record<WorkflowType, string> = {
    routine_building: 'Routine Building',
    product_selection: 'Product Selection',
    ingredient_analysis: 'Ingredient Analysis',
    concern_exploration: 'Concern Exploration',
    profile_refinement: 'Profile Update',
    troubleshooting: 'Troubleshooting',
    routine_optimization: 'Routine Optimization',
    compatibility_check: 'Compatibility Check',
    shopping_assistance: 'Shopping Assistance',
  };
  return names[type] || type;
}

/**
 * Format step name for display
 */
function formatStepName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Get next step suggestions after workflow completion
 */
function getNextStepSuggestions(type: WorkflowType): string {
  const suggestions: Record<WorkflowType, string> = {
    routine_building: '- Try your new routine for 2 weeks\n- Track your progress in the Routine Tracker\n- Return if you have questions about layering or timing',
    product_selection: '- View the product page for more details\n- Add to your routine in the Routine Builder\n- Check ingredient compatibility with your current products',
    ingredient_analysis: '- Explore products containing this ingredient\n- Learn about compatible ingredients\n- Consider adding it to your routine',
    concern_exploration: '- Browse products for this concern\n- Build a targeted routine\n- Track your progress over time',
    profile_refinement: '- Get updated product recommendations\n- Rebuild your routine with new preferences\n- Explore products matching your profile',
    troubleshooting: '- Implement the suggested changes\n- Monitor your skin for improvements\n- Return if issues persist',
    routine_optimization: '- Gradually introduce new products\n- Track changes in the Routine Tracker\n- Re-evaluate in 4-6 weeks',
    compatibility_check: '- Follow the suggested application order\n- Space actives appropriately\n- Monitor for any irritation',
    shopping_assistance: '- Complete your purchase\n- Add products to your routine\n- Save favorites for later',
  };
  return suggestions[type] || '- Continue exploring\n- Ask follow-up questions';
}

// ============================================================================
// BRANCHING LOGIC
// ============================================================================

/**
 * Handle user direction change mid-workflow
 */
export function handleDirectionChange(
  workflow: WorkflowState,
  newConstraints: Partial<WorkflowContext>
): { workflow: WorkflowState; message: string } {
  const updatedWorkflow = updateWorkflowContext(workflow, newConstraints);

  // Log the change
  const changeDescription = Object.entries(newConstraints)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ');

  const loggedWorkflow = logDecision(
    updatedWorkflow,
    'direction_change',
    `User updated preferences: ${changeDescription}`
  );

  return {
    workflow: loggedWorkflow,
    message: 'Got it—I\'ve updated your preferences. Let me adjust my recommendations.',
  };
}

/**
 * Handle user request to go back
 */
export function handleGoBack(workflow: WorkflowState): WorkflowState {
  if (workflow.currentStepIndex === 0) return workflow;

  const prevIndex = workflow.currentStepIndex - 1;
  const updatedSteps = [...workflow.steps];

  // Reset current step to pending
  updatedSteps[workflow.currentStepIndex] = {
    ...updatedSteps[workflow.currentStepIndex],
    status: 'pending',
  };

  // Set previous step to in_progress
  updatedSteps[prevIndex] = {
    ...updatedSteps[prevIndex],
    status: 'in_progress',
    data: undefined,
    completedAt: undefined,
  };

  return {
    ...workflow,
    currentStepIndex: prevIndex,
    steps: updatedSteps,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// STORAGE
// ============================================================================

const WORKFLOW_STORAGE_KEY = 'curae_active_workflow';

/**
 * Save workflow to localStorage
 */
export function saveWorkflow(workflow: WorkflowState): void {
  try {
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflow));
  } catch {
    console.warn('[WorkflowIntelligence] Failed to save workflow');
  }
}

/**
 * Load workflow from localStorage
 */
export function loadWorkflow(): WorkflowState | null {
  try {
    const stored = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as WorkflowState;
    }
  } catch {
    console.warn('[WorkflowIntelligence] Failed to load workflow');
  }
  return null;
}

/**
 * Clear stored workflow
 */
export function clearWorkflow(): void {
  try {
    localStorage.removeItem(WORKFLOW_STORAGE_KEY);
  } catch {
    console.warn('[WorkflowIntelligence] Failed to clear workflow');
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Workflow intelligence principles
 */
export const WORKFLOW_PRINCIPLES = {
  structure: [
    'Break complex tasks into clear steps',
    'Execute steps sequentially',
    'Provide progress updates',
    'Complete with summary and next steps',
  ],
  clarification: [
    'Ask only essential questions',
    'Limit to 1-2 questions at a time',
    'Never repeat questions already answered',
    'Accept partial information and proceed',
  ],
  flexibility: [
    'Allow users to change direction',
    'Support skipping optional steps',
    'Enable going back to previous steps',
    'Adapt to new constraints mid-workflow',
  ],
  completion: [
    'Summarize what was accomplished',
    'Highlight key decisions made',
    'Offer relevant next steps',
    'Don\'t restart unless asked',
  ],
} as const;
