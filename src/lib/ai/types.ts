/**
 * AI Request/Response Types for Lorem Curae
 *
 * Shared types for the AI chat API.
 */

/**
 * User's skin profile as structured data
 */
export interface SkinProfile {
  skinType: string | null;
  concerns: string[];
  sensitivities: string[];
  goals: string[];
  preferences: {
    crueltyFree?: boolean;
    vegan?: boolean;
    fragranceFree?: boolean;
    alcoholFree?: boolean;
    budgetRange?: 'budget' | 'mid' | 'premium';
  };
  lifestyle: Record<string, unknown>;
}

/**
 * Product reference for interaction history
 */
export interface ProductReference {
  id: number;
  name: string;
  brand: string;
  category: string;
  viewedAt?: string;
  savedAt?: string;
  purchasedAt?: string;
}

/**
 * User interaction history for personalized reasoning
 */
export interface UserInteractionHistory {
  /** Products the user has viewed */
  viewedProducts: ProductReference[];
  /** Products the user has favorited/saved */
  favoritedProducts: ProductReference[];
  /** Products the user has purchased (if available) */
  purchasedProducts: ProductReference[];
  /** Categories the user frequently browses */
  frequentCategories: string[];
  /** Concerns or filters the user frequently selects */
  frequentConcerns: string[];
  /** Search terms the user has used */
  recentSearches?: string[];
}

/**
 * Full user context for AI personalization
 */
export interface UserContext {
  skinProfile: SkinProfile | null;
  interactionHistory: UserInteractionHistory;
  /** When the user first joined */
  memberSince?: string;
  /** User's routine notes summary */
  routineNotesSummary?: {
    totalNotes: number;
    recentObservations: string[];
    productsUsed: string[];
  };
}

/**
 * Conversation message
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * AI chat settings
 */
export interface AIChatSettings {
  tone?: 'friendly' | 'professional' | 'encouraging' | 'direct';
  detailLevel?: 'brief' | 'balanced' | 'detailed';
  responseStyle?: 'conversational' | 'structured' | 'educational';
  customInstructions?: string;
}

/**
 * Request body sent to the AI chat API
 */
export interface AIChatRequest {
  message: string;
  conversationHistory?: ConversationMessage[];
  settings?: AIChatSettings;
  /** Client-side user context (favorites, recently viewed, etc.) */
  clientContext?: {
    viewedProducts?: ProductReference[];
    favoritedProducts?: ProductReference[];
    frequentCategories?: string[];
    recentSearches?: string[];
  };
}

/**
 * AI request payload (returned by the API for model consumption)
 */
export interface AIRequestPayload {
  systemPrompt: string;
  userMessage: string;
  skinProfile: SkinProfile | null;
  userContext?: UserContext;
  conversationHistory?: ConversationMessage[];
  settings?: AIChatSettings;
}

/**
 * AI chat API response
 */
export interface AIChatAPIResponse {
  success: boolean;
  payload: AIRequestPayload;
  meta: {
    authenticated: boolean;
    hasProfile: boolean;
    timestamp: string;
  };
}

/**
 * AI chat error response
 */
export interface AIChatErrorResponse {
  error: string;
}

// ============================================================================
// CONVERSATION MEMORY TYPES
// ============================================================================

/**
 * Allowed memory categories - strictly skincare-focused
 */
export type MemoryCategory =
  | 'skin_profile'
  | 'product_preferences'
  | 'budget_preferences'
  | 'experience_level'
  | 'product_history'
  | 'ingredient_preferences'
  | 'routine_preferences'
  | 'skincare_goals';

/**
 * Conversation memory state for AI personalization
 */
export interface ConversationMemory {
  skinProfile: {
    skinType?: string;
    concerns: string[];
    sensitivities: string[];
    goals: string[];
  };
  productPreferences: {
    fragranceFree?: boolean;
    lightweight?: boolean;
    nonComedogenic?: boolean;
    naturalIngredients?: boolean;
    minimalIngredients?: boolean;
  };
  budgetRange?: 'budget' | 'mid' | 'premium';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  ingredientPreferences: {
    liked: string[];
    disliked: string[];
    sensitivities: string[];
  };
  routinePreferences: {
    style?: 'minimalist' | 'moderate' | 'advanced';
    timing?: 'am-only' | 'pm-only' | 'both';
    currentProducts: string[];
  };
  skincareGoals: string[];
  metadata: {
    lastUpdated: string;
    sessionCount: number;
    firstInteraction?: string;
  };
}

// ============================================================================
// COMMUNICATION INTELLIGENCE TYPES
// ============================================================================

/**
 * Detected user communication tone
 */
export type UserTone =
  | 'casual'
  | 'formal'
  | 'confused'
  | 'excited'
  | 'frustrated'
  | 'anxious'
  | 'neutral';

/**
 * AI response style configuration
 */
export interface ResponseStyle {
  formality: 'casual' | 'balanced' | 'polished';
  enthusiasm: 'calm' | 'warm' | 'energetic';
  reassurance: 'minimal' | 'moderate' | 'high';
  complexity: 'simple' | 'balanced' | 'detailed';
}

/**
 * Explanation complexity level
 */
export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Full communication context for AI response generation
 */
export interface CommunicationContext {
  userTone: UserTone;
  responseStyle: ResponseStyle;
  toneInstructions: string;
  supportiveOpening: string;
  needsMedicalRedirect: boolean;
  experienceLevel: ExplanationLevel;
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

/**
 * Categories of errors the AI can detect and handle
 */
export type ErrorCategory =
  | 'missing_data'
  | 'conflicting_data'
  | 'unsupported_request'
  | 'unsafe_combination'
  | 'invalid_input'
  | 'retrieval_failure'
  | 'system_error';

/**
 * Severity levels for errors
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

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
// WORKFLOW TYPES
// ============================================================================

/**
 * Supported workflow types
 */
export type WorkflowType =
  | 'routine_building'
  | 'product_selection'
  | 'ingredient_analysis'
  | 'concern_exploration'
  | 'profile_refinement'
  | 'troubleshooting'
  | 'routine_optimization'
  | 'compatibility_check'
  | 'shopping_assistance';

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
 * Workflow context - accumulated data across steps
 */
export interface WorkflowContext {
  skinType?: string;
  concerns: string[];
  sensitivities: string[];
  budget?: 'budget' | 'mid' | 'premium';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferences: Record<string, boolean>;
  selectedProducts: Array<{ id: number; name: string; category: string }>;
  excludedIngredients: string[];
  targetRoutine?: 'am' | 'pm' | 'both';
  routineStyle?: 'minimalist' | 'moderate' | 'advanced';
  decisionsLog: Array<{ step: string; decision: string; timestamp: string }>;
  questionsAsked: string[];
  userResponses: Record<string, string>;
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
 * Workflow detection result
 */
export interface WorkflowDetectionResult {
  detected: boolean;
  workflowType?: WorkflowType;
  confidence: 'high' | 'medium' | 'low';
  suggestedFirstStep?: string;
}

// ============================================================================
// SHOPPING TYPES
// ============================================================================

/**
 * Product filter criteria
 */
export interface ProductFilters {
  skinType?: string[];
  concerns?: string[];
  includeIngredients?: string[];
  excludeIngredients?: string[];
  fragranceFree?: boolean;
  nonComedogenic?: boolean;
  pregnancySafe?: boolean;
  veganCrueltyFree?: boolean;
  priceMin?: number;
  priceMax?: number;
  priceRange?: 'budget' | 'mid' | 'premium';
  brand?: string[];
  category?: string[];
  texture?: string[];
  strengthLevel?: 'gentle' | 'moderate' | 'strong';
  source?: 'marketplace' | 'discovery' | 'all';
}

/**
 * Sort options for product results
 */
export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'gentleness'
  | 'strength'
  | 'concern_match'
  | 'popularity';

/**
 * Product for filtering/comparison
 */
export interface FilterableProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price?: number;
  ingredients?: string[];
  keyIngredients?: string[];
  concerns?: string[];
  skinTypes?: string[];
  texture?: string;
  isFragranceFree?: boolean;
  isNonComedogenic?: boolean;
  isPregnancySafe?: boolean;
  strengthLevel?: 'gentle' | 'moderate' | 'strong';
  source: 'marketplace' | 'discovery';
}

/**
 * Filter result with reasoning
 */
export interface FilterResult {
  products: FilterableProduct[];
  appliedFilters: string[];
  removedCount: number;
  safetyFiltersApplied: string[];
}

/**
 * Product comparison result
 */
export interface ProductComparison {
  products: FilterableProduct[];
  differences: Array<{
    attribute: string;
    values: Record<number, string | number | boolean | undefined>;
    winner?: number;
    explanation?: string;
  }>;
  recommendation?: {
    productId: number;
    reason: string;
  };
}

/**
 * Shopping context for AI
 */
export interface ShoppingContext {
  filters: ProductFilters;
  sortBy: SortOption;
  results: FilterableProduct[];
  appliedFilters: string[];
  safetyFiltersApplied: string[];
  totalAvailable: number;
  comparison?: ProductComparison;
}

// ============================================================================
// ROUTINE OPTIMIZATION TYPES
// ============================================================================

/**
 * Product within a user's routine
 */
export interface RoutineProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  keyIngredients?: string[];
  step: number;
  frequency?: 'daily' | 'every-other-day' | 'weekly' | '2x-weekly' | '3x-weekly';
  notes?: string;
}

/**
 * User's current routine
 */
export interface UserRoutine {
  timing: 'am' | 'pm';
  products: RoutineProduct[];
  lastUpdated?: string;
}

/**
 * Issue severity levels
 */
export type IssueSeverity = 'critical' | 'warning' | 'suggestion';

/**
 * Issue types that can be detected in routines
 */
export type IssueType =
  | 'conflict'
  | 'ordering'
  | 'overuse'
  | 'missing_step'
  | 'redundancy'
  | 'timing'
  | 'frequency'
  | 'experience_mismatch'
  | 'sensitivity';

/**
 * Detected issue in a routine
 */
export interface RoutineIssue {
  type: IssueType;
  severity: IssueSeverity;
  message: string;
  affectedProducts: number[];
  suggestion: string;
  educationalNote?: string;
}

/**
 * Change to apply to a routine
 */
export interface RoutineChange {
  type: 'reorder' | 'remove' | 'add' | 'frequency' | 'timing' | 'replace';
  productId?: number;
  newPosition?: number;
  newFrequency?: string;
  newTiming?: 'am' | 'pm';
  replacementProductId?: number;
  reason: string;
}

/**
 * Frequency recommendation for a product
 */
export interface FrequencyRecommendation {
  productId: number;
  productName: string;
  currentFrequency?: string;
  recommendedFrequency: string;
  reason: string;
  adjustmentPeriod?: string;
}

/**
 * Result of routine optimization
 */
export interface OptimizationResult {
  originalRoutine: UserRoutine;
  optimizedRoutine: UserRoutine;
  changes: RoutineChange[];
  issuesResolved: RoutineIssue[];
  remainingIssues: RoutineIssue[];
  explanation: string;
}

/**
 * Routine simplification result
 */
export interface SimplificationResult {
  originalStepCount: number;
  simplifiedStepCount: number;
  removedProducts: RoutineProduct[];
  keptProducts: RoutineProduct[];
  reasoning: string[];
}

/**
 * Expansion suggestion for a routine
 */
export interface ExpansionSuggestion {
  category: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggestedIngredients?: string[];
  timing: 'am' | 'pm' | 'both';
}

/**
 * User context for routine optimization
 */
export interface RoutineUserContext {
  skinType?: string;
  sensitivities?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  pregnancySafe?: boolean;
  concerns?: string[];
  goals?: string[];
  budgetRange?: 'budget' | 'mid' | 'premium';
}

/**
 * Complete routine optimization context for AI
 */
export interface RoutineOptimizationContext {
  amRoutine?: UserRoutine;
  pmRoutine?: UserRoutine;
  issues: RoutineIssue[];
  optimizationResult?: OptimizationResult;
  frequencyRecommendations: FrequencyRecommendation[];
  expansionSuggestions: ExpansionSuggestion[];
  userContext: RoutineUserContext;
}
