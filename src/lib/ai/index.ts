/**
 * Lorem Curae AI Engine
 *
 * Central export for all AI-related functionality.
 */

// Embeddings
export {
  generateEmbedding,
  generateProductEmbedding,
  generateSurveyEmbedding,
  generateQueryEmbedding,
  cosineSimilarity,
  EMBEDDING_SCHEMA,
  type EmbeddingRecord,
} from './embeddings';

// Vector Store
export {
  vectorStore,
  type VectorDocument,
  type SearchResult,
  type VectorStoreState,
} from './vectorStore';

// Product Ingestion
export {
  ingestProducts,
  ingestProduct,
  isIngested,
  reIngestProducts,
  getIngestionStatus,
  initializeProductIngestion,
} from './productIngestion';

// Retrieval Pipeline
export {
  retrieveProducts,
  retrieveByCategory,
  retrieveRoutine,
  searchProducts,
  formatProductsAsJSON,
  formatProductsForChat,
  type SkinSurvey,
  type RetrievalOptions,
  type RankedProduct,
  type RetrievalResult,
  type SourceIntent,
} from './retrievalPipeline';

// Chat Retrieval Helper
export {
  initializeRetrieval,
  getProductRecommendations,
  getRoutineRecommendations,
  parseUserQuery,
  detectSourceIntent,
  generateRetrievalResponse,
  // Navigation
  detectNavigationIntent,
  formatNavigationSuggestion,
  type NavigationIntent,
} from './chatRetrieval';

// AI Chat API Types
export {
  type SkinProfile,
  type ConversationMessage,
  type AIChatSettings,
  type AIChatRequest,
  type AIRequestPayload,
  type AIChatAPIResponse,
  type AIChatErrorResponse,
  type ProductReference,
  type UserInteractionHistory,
  type UserContext,
  type MemoryCategory,
  type ConversationMemory,
  type UserTone,
  type ResponseStyle,
  type ExplanationLevel,
  type CommunicationContext,
  type ErrorCategory,
  type ErrorSeverity,
  type DetectedError,
  type ErrorHandlingResult,
  type WorkflowType,
  type WorkflowStatus,
  type WorkflowStep,
  type WorkflowContext,
  type WorkflowState,
  type WorkflowDetectionResult,
  type ProductFilters,
  type SortOption,
  type FilterableProduct,
  type FilterResult,
  type ProductComparison,
  type ShoppingContext,
  type RoutineProduct,
  type UserRoutine,
  type IssueSeverity,
  type IssueType,
  type RoutineIssue,
  type RoutineChange,
  type FrequencyRecommendation,
  type OptimizationResult,
  type SimplificationResult,
  type ExpansionSuggestion,
  type RoutineUserContext,
  type RoutineOptimizationContext,
} from './types';

// AI Chat Client
export {
  callAIChatAPI,
  getClientContext,
} from './chatClient';

// Knowledge Base
export {
  knowledgeStore,
  initializeKnowledgeBase,
  retrieveKnowledge,
  getIngredientInfo,
  formatKnowledgeForAI,
  getRoutineGuidance,
  checkIngredientCompatibility,
  INGREDIENT_ENCYCLOPEDIA,
  ROUTINE_RULES,
  ROUTINE_CONFLICTS,
  LAYERING_ORDER,
  FAQ_CONTENT,
  EDUCATIONAL_CONTENT,
  type KnowledgeType,
  type KnowledgeChunk,
  type IngredientKnowledge,
  type RoutineRule,
  type FAQEntry,
  type KnowledgeResult,
} from './knowledgeBase';

// Search & Retrieval Intelligence
export {
  detectQueryIntent,
  retrieveIngredients,
  retrieveConcerns,
  retrieveFAQ,
  retrieveEducational,
  retrieveRoutineConflicts,
  applyPersonalizationFilters,
  applySafetyFilters,
  retrieve,
  retrieveForRoutine,
  formatRetrievedForAI,
  hasRelevantContent,
  getRetrievalConfidence,
  type QueryIntent,
  type RetrievalSource,
  type RetrievedChunk,
  type UserContext as RetrievalUserContext,
  type RetrievalOptions,
  type RetrievalResult,
  type SafetyFilterResult,
} from './searchRetrievalIntelligence';

// Skin Profile Intelligence
export {
  evaluateProfileSafety,
  generateIngredientFilter,
  getTextureRecommendations,
  analyzeProfile,
  buildPersonalizationContext as buildSkinProfileContext,
  isIngredientSuitable,
  generateProfilePrefix,
  formatProfileForChat,
  type SkinType,
  type ExperienceLevel,
  type SensitivityLevel,
  type FitzpatrickType,
  type SkinProfile,
  type ProfileSafetyResult,
  type IngredientFilterResult,
  type TextureRecommendation,
  type ProfileAnalysis,
  type PersonalizationContext,
} from './skinProfileIntelligence';

// Product Intelligence
export {
  evaluateProductSafety,
  explainProduct,
  compareProducts as compareProductDetails,
  checkRoutineCompatibility as checkProductRoutineCompatibility,
  generateRecommendationReasoning,
  formatProductForChat,
  getProductUrl as getProductDetailUrl,
  determineProductStrength,
  determineProductTiming,
  hasFragrance,
  type ProductUserProfile,
  type ProductSafetyResult,
  type ProductStrength,
  type ProductTiming,
  type ProductExplanation,
  type ProductComparison,
  type RoutineCompatibility,
} from './productIntelligence';

// Concern Intelligence
export {
  getConcernKnowledge,
  explainConcern,
  getConcernIngredientMapping,
  getConcernRoutineMapping,
  getConcernsForIngredient,
  getRecommendedConcernFocus,
  formatConcernForChat,
  toConcernSlug,
  CONCERN_ENCYCLOPEDIA,
  type ConcernId,
  type ConcernSeverity,
  type ConcernUserProfile,
  type ConcernKnowledge,
  type ConcernExplanation,
  type ConcernIngredientMapping,
  type ConcernRoutineMapping,
} from './concernIntelligence';

// Routine Builder
export {
  buildRoutines,
  formatRoutineForChat,
  checkIngredientConflicts,
  checkRoutineCompatibility,
  isAMSafe,
  isSuitableForLevel,
  getUsageFrequency,
  getSafetyNotes,
  validateRoutine,
  selectProductForStep,
  AM_ROUTINE_ORDER,
  PM_ROUTINE_ORDER,
  INGREDIENT_CONFLICTS as ROUTINE_INGREDIENT_CONFLICTS,
  AM_SAFE_ACTIVES,
  PM_ONLY_ACTIVES,
  BEGINNER_FRIENDLY,
  ADVANCED_ACTIVES,
  type RoutineTiming,
  type ExperienceLevel,
  type RoutineStep,
  type SkincareRoutine,
  type RoutineBuilderResult,
  type IngredientConflict,
  type RoutinePreferences,
  type UserRoutineHistory,
} from './routineBuilder';

// Conversation Memory
export {
  // Core functions
  createEmptyMemory,
  initializeMemoryFromContext,
  updateMemory,
  handleContradiction,
  forgetMemory,
  // Extraction
  extractMemoryFromMessage,
  containsForbiddenContent,
  // Personalization
  generatePersonalizationContext,
  generateMemoryReference,
  // Storage
  loadMemory,
  saveMemory,
  clearStoredMemory,
} from './conversationMemory';

// Communication Intelligence
export {
  // Tone detection
  detectUserTone,
  getResponseStyle,
  generateToneInstructions,
  // Empathy & support
  getEmpathyResponse,
  generateSupportiveOpening,
  // Explanation formatting
  formatExplanation,
  formatInstruction,
  // Medical redirect
  requiresMedicalRedirect,
  generateMedicalRedirect,
  // Context building
  buildCommunicationContext,
  formatCommunicationContextForPrompt,
  // Constants
  COMMUNICATION_PRINCIPLES,
} from './communicationIntelligence';

// Error Handling Intelligence
export {
  // Unsafe request detection
  isMedicalRequest,
  isPregnancyUnsafeRequest,
  isOveruseRequest,
  detectUnsafeRequest,
  // Ingredient conflict detection
  detectIngredientConflicts,
  // Data validation
  detectMissingData,
  validateProductData,
  validateSkinProfile,
  validateUserInput,
  // Conflict resolution
  resolveConflictingData,
  // System error handling
  createSystemErrorFallback,
  safeAsync,
  // Comprehensive detection
  detectAllErrors,
  // Safe alternatives
  generateConflictAlternative,
  generateMissingProductAlternative,
  generateOveruseAlternative,
  // Formatting
  formatErrorForUser,
  formatErrorsForUser,
  // Constants
  ERROR_HANDLING_PRINCIPLES,
} from './errorHandlingIntelligence';

// Workflow Intelligence
export {
  // Detection
  detectWorkflow,
  // State management
  createWorkflow,
  advanceWorkflow,
  skipStep,
  updateWorkflowContext,
  logDecision,
  pauseWorkflow,
  resumeWorkflow,
  abandonWorkflow,
  // Progress tracking
  getWorkflowProgress,
  getCurrentStep,
  getRemainingSteps,
  getCompletedSteps,
  // Clarification
  needsClarification,
  wasQuestionAsked,
  recordQuestion,
  // Summaries
  generateProgressSummary,
  generateCompletionSummary,
  // Branching
  handleDirectionChange,
  handleGoBack,
  // Storage
  saveWorkflow,
  loadWorkflow,
  clearWorkflow,
  // Constants
  WORKFLOW_PRINCIPLES,
} from './workflowIntelligence';

// Shopping Intelligence
export {
  // Filter extraction
  extractFiltersFromMessage,
  // Filtering
  filterProducts,
  applySafetyFilters as applyShoppingSafetyFilters,
  // Sorting
  sortProducts,
  // Comparison
  compareProducts as compareShoppingProducts,
  // Links
  getProductLink,
  formatProductWithLink,
  // Alternatives
  findAlternatives,
  // Bundles
  buildStarterBundle,
  // Context
  buildShoppingContext,
  // Constants
  SHOPPING_PRINCIPLES,
} from './shoppingIntelligence';

// Routine Optimization Intelligence
export {
  // Evaluation
  evaluateRoutine,
  detectConflicts,
  detectOrderingIssues,
  detectOveruse,
  detectMissingSteps,
  detectRedundancy,
  detectTimingIssues,
  detectFrequencyIssues,
  detectExperienceMismatch,
  detectSensitivityIssues,
  // Optimization
  optimizeRoutine,
  reorderProducts,
  resolveConflicts,
  // Frequency
  getFrequencyRecommendations,
  adjustFrequencyForBeginner,
  // Simplification & Expansion
  simplifyRoutine,
  suggestExpansions,
  // Formatting
  formatRoutineIssuesForChat,
  formatOptimizationForChat,
  // Context building
  buildRoutineOptimizationContext,
  // Constants
  OPTIMIZATION_PRINCIPLES as ROUTINE_OPTIMIZATION_PRINCIPLES,
  CATEGORY_ORDER,
  ACTIVE_FREQUENCY_LIMITS,
} from './routineOptimizationIntelligence';

// Intent Classification Intelligence
export {
  // Classification
  classifyIntent,
  routeIntent,
  // Multi-intent
  decomposeMultiIntent,
  generateMultiIntentPlan,
  // Off-topic handling
  isOffTopic,
  generateOffTopicRedirect,
  // Formatting
  formatIntentForAI,
  formatRoutingDecision,
  // Constants
  INTENT_CLASSIFICATION_PRINCIPLES,
  // Types
  type IntentCategory,
  type SafetySignal,
  type DetectedConstraint,
  type DetectedIntent,
  type IntentClassification,
  type IntentRoute,
} from './intentClassificationIntelligence';

// Navigation Intelligence
export {
  // Slug generation
  toIngredientSlug,
  toConcernSlug as toNavigationConcernSlug,
  toCategorySlug,
  toUrlSlug,
  // URL generation
  getIngredientUrl,
  getProductUrl,
  getConcernUrl,
  getCategoryUrl,
  getBrandUrl,
  getRoutineUrl,
  getSurveyUrl,
  getFaqUrl,
  getMySkinUrl,
  getCommunityUrl,
  // Navigation detection
  detectNavigationFromMessage,
  // Link generation
  generateContextualLinks,
  generateProductLinks,
  // Formatting
  formatLink,
  formatLinks,
  formatInlineLink,
  formatNavigationSuggestionFromLink,
  formatNavigationForAI,
  // Validation
  isValidInternalUrl,
  isValidIngredientSlug,
  isValidConcernSlug,
  isValidCategorySlug,
  // Constants
  VALID_INGREDIENT_SLUGS,
  VALID_CONCERN_SLUGS,
  VALID_CATEGORY_SLUGS,
  SITE_NAVIGATION,
  NAVIGATION_PRINCIPLES,
  // Types
  type NavigationTarget,
  type ProductSource,
  type NavigationLink,
  type NavigationContext,
  type PageLink,
} from './navigationIntelligence';

// Response Formatting Intelligence
export {
  // Core formatters
  formatHeading,
  formatSubheading,
  formatBulletList,
  formatNumberedList,
  formatBold,
  formatKeyValue,
  formatParagraph,
  addSectionSpacing,
  // Content-specific formatters
  formatIngredientExplanation,
  formatProductExplanation,
  formatConcernExplanation,
  formatRoutine,
  formatComparison,
  formatTroubleshooting,
  formatSafetyNote,
  formatRecommendationList,
  // Structure helpers
  buildStructuredResponse,
  trimResponse,
  addClosingCTA,
  formatSimpleAnswer,
  // Template detection
  detectContentType,
  getFormattingInstructions,
  // Constants
  FORMAT_LIMITS,
  SECTION_HEADINGS,
  FORMATTING_PRINCIPLES,
  // Types
  type ContentType,
  type ResponseSection,
  type IngredientExplanation,
  type ProductExplanation,
  type ConcernExplanation,
  type RoutineStep,
  type RoutineFormat,
  type ComparisonItem,
  type TroubleshootingFormat,
} from './responseFormattingIntelligence';

// Reasoning Chain Intelligence
export {
  // Query decomposition
  decomposeQuery,
  // Execution planning
  createExecutionPlan,
  // Safety checks
  runSafetyChecks,
  // Response planning
  planResponseStructure,
  // Multi-intent handling
  getIntentTransition,
  getMultiIntentIntro,
  // AI context formatting
  formatDecompositionForAI,
  formatPlanForAI,
  // Constants
  REASONING_PRINCIPLES,
  // Types
  type IntelligenceModule,
  type TaskPriority,
  type SubTask,
  type DecomposedQuery,
  type ReasoningContext,
  type ExecutionPlan,
  type ExecutionStep,
  type SafetyCheckResult,
} from './reasoningChainIntelligence';

// Behavioral Intelligence
export {
  // Pattern analysis
  analyzePatterns,
  // Trend detection
  detectTrends,
  // Preference application
  applyBehavioralPreferences,
  // Conflict detection
  detectPreferenceConflicts,
  // Context building
  buildPersonalizationContext as buildBehavioralContext,
  // Formatting
  formatBehavioralContextForAI,
  generatePersonalizationReference,
  // Data safety
  isSafeToStore,
  sanitizeBehaviorData,
  // Constants
  BEHAVIORAL_PRINCIPLES,
  // Types
  type BehaviorSignalType,
  type BehaviorSignal,
  type BehaviorPatterns,
  type BehavioralTrend,
  type PreferenceConflict,
  type PersonalizationContext,
} from './behavioralIntelligence';

// Mode Switching Intelligence
export {
  // Mode detection
  detectModes,
  // Mode state management
  createModeState,
  transitionMode,
  canTransition,
  // Mode behavior
  getModeInstructions,
  getModeFormatInstructions,
  // Persona management
  getPersonaModifiers,
  checkPersonaBoundaries,
  // Formatting
  formatModeContextForAI,
  // Constants
  MODE_CONFIGS,
  CORE_PERSONA,
  MODE_SWITCHING_PRINCIPLES,
  // Types
  type FunctionalMode,
  type ModePriority,
  type ModeConfig,
  type ActiveModeState,
  type ModeDetectionResult,
  type CorePersona,
} from './modeSwitchingIntelligence';

// Data Validation Intelligence
export {
  // Validation functions
  validateIngredient,
  validateProduct,
  validateConcern,
  validateUserProfile,
  // Cross-checking
  crossCheckProductIngredients,
  crossCheckProfileProduct,
  // Slug/ID validation
  validateSlug,
  validateProductId,
  // Fallbacks
  getSafeFallback,
  // Formatting
  formatValidationForAI,
  formatCrossCheckForAI,
  // Constants
  VALIDATION_PRINCIPLES,
  // Types
  type ValidationStatus,
  type ValidationSeverity,
  type ValidationIssue,
  type ValidationResult,
  type IngredientMetadata,
  type ProductMetadata,
  type ConcernMetadata,
  type UserProfileMetadata,
  type CrossCheckResult,
} from './dataValidationIntelligence';
