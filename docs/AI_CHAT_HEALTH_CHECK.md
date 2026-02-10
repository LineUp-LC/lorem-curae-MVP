# AI Chat System Health Check

This document defines the verification prompt used to validate that all AI chat system
features are correctly integrated, active, and functioning. Use this prompt for regression
testing after any changes to the AI system.

---

## How to Use This Health Check

1. Copy the verification prompt below into a new Claude Code session.
2. Run the health check after any AI-related changes.
3. Review the PASS/FAIL results.
4. If any section FAILs, apply the minimal patch provided.

---

## How to Extend This Health Check

When adding new AI features, append a new section following this template:

```markdown
## [N]. [Feature Name]

**PASS/FAIL Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Files to Verify:**
- `path/to/file.ts` (lines X-Y): Description

**Expected Behavior:**
- Behavior 1
- Behavior 2
```

---

## Verification Prompt

```
Follow all rules in CLAUDE.md.

Your task is to perform a full verification pass across the AI chat system to ensure that
all previously implemented features are correctly integrated, active, and functioning
together. Do NOT rewrite or re-implement anything unless a clear bug is found. This is a
validation and audit task.

Verify the following areas:

---

## 1. Marketplace vs Discovery Source Logic

**Verify:**
- Every product in the retrieval pipeline includes `source: 'marketplace' | 'discovery'`
- `productUrl` is generated correctly based on source:
  - marketplace → `/marketplace/product/:id`
  - discovery → `/product-detail/:id`
- AI chat ProductCard displays:
  - Correct source badge
  - Correct icon (`ri-shopping-bag-line` for marketplace, `ri-compass-3-line` for discovery)
  - Correct color (`text-primary` for marketplace, `text-sage` for discovery)
  - Correct routing via `productUrl`

**Files:**
- `src/mocks/products.ts`: All products have `source` field
- `src/lib/ai/productIngestion.ts:30-33`: URL generation logic
- `src/pages/ai-chat/page.tsx:45-120`: ProductCard component

---

## 2. Marketplace-Only and Discovery-Only Filtering

**Verify:**
- Intent detection is active via `detectSourceIntent()`
- `retrieveProducts()` filters BEFORE ranking using filter function
- AI chat only returns products matching the requested source
- Fallback behavior works: graceful message when no products match

**Files:**
- `src/lib/ai/chatRetrieval.ts:172-217`: `detectSourceIntent()`
- `src/lib/ai/retrievalPipeline.ts:261-281`: Filter function in search
- `src/lib/ai/chatRetrieval.ts:77-84`: Fallback message

---

## 3. User Context Reasoning

**Verify:**
- `getUserContext()` is implemented and returns:
  - `skinProfile`
  - `interactionHistory` (views, saves, purchases, categories, concerns)
- AI request payload includes `userContext`
- Model receives `userContext` and `retrievedProducts` together

**Files:**
- `supabase/functions/ai-chat/index.ts:211-351`: `getUserContext()`
- `supabase/functions/ai-chat/index.ts:541`: Payload includes userContext
- `src/lib/ai/chatClient.ts:23-78`: `getClientContext()`

---

## 4. Reasoning Style Rules

**Verify:**
- System prompt includes "Reasoning and Personalization" section
- Each product includes a `whyItFits` explanation that:
  - References survey data
  - References historical behavior (if available)
  - Uses varied, non-repetitive language
  - Avoids generic statements

**Files:**
- `src/pages/ai-chat/page.tsx:333-375`: Client system prompt
- `supabase/functions/ai-chat/index.ts:162-205`: Edge function system prompt

---

## 5. Retrieval Pipeline Integration

**Verify:**
- `RankedProduct` interface includes:
  - `similarityScore`
  - `attributeScore`
  - `matchReasons`
  - `source`
  - `productUrl`
- `retrieveProducts()` populates all fields
- AI chat handler passes `RankedProduct[]` to the model

**Files:**
- `src/lib/ai/retrievalPipeline.ts:58-83`: RankedProduct interface
- `src/lib/ai/retrievalPipeline.ts:284-318`: Field population
- `src/pages/ai-chat/page.tsx:988`: Products passed to message

---

## 6. System Prompt Integrity

**Verify presence of:**
- No looping rule
- Always answer rule
- Survey usage rules
- Retrieval rules
- Source filtering rules
- Reasoning rules
- Forbidden behaviors

**Files:**
- `src/pages/ai-chat/page.tsx:205-375`: Client CURAE_SYSTEM_INSTRUCTIONS
- `supabase/functions/ai-chat/index.ts:101-205`: Edge CURAE_SYSTEM_PROMPT

---

## 7. Output Formatting

**Verify:**
- `formatProductsForChat()` uses `productUrl` (not `marketplaceUrl`)
- Includes `availabilityLabel` (Marketplace vs Discovery)
- Includes `locationInfo` (Buy on Marketplace vs View in Discovery)
- Includes `whyItFits` reasoning

**Files:**
- `src/lib/ai/retrievalPipeline.ts:405-440`: formatProductsForChat()

---

## 8. Embedding System

**Verify:**
- `SKINCARE_VOCABULARY` contains weighted domain terms
- `generateProductEmbedding()` creates vectors from product data
- `generateSurveyEmbedding()` creates vectors from user surveys
- `cosineSimilarity()` correctly calculates vector similarity
- Embedding dimension is consistent (128)

**Files:**
- `src/lib/ai/embeddings.ts:10-29`: SKINCARE_VOCABULARY
- `src/lib/ai/embeddings.ts:102-152`: generateProductEmbedding()
- `src/lib/ai/embeddings.ts:157-205`: generateSurveyEmbedding()
- `src/lib/ai/embeddings.ts:217-232`: cosineSimilarity()
- `src/lib/ai/embeddings.ts:32`: EMBEDDING_DIM = 128

---

## 9. Vector Store State

**Verify:**
- `LocalVectorStore` class exists and is exported as singleton
- `search()` method applies filters before similarity ranking
- `upsertMany()` persists documents to localStorage
- `isPopulated()` correctly checks store state
- Store version is tracked for migrations

**Files:**
- `src/lib/ai/vectorStore.ts:43-230`: LocalVectorStore class
- `src/lib/ai/vectorStore.ts:126-155`: search() with filters
- `src/lib/ai/vectorStore.ts:233`: Singleton export
- `src/lib/ai/vectorStore.ts:11-12`: Version constant

---

## 10. Product Ingestion Pipeline

**Verify:**
- `initializeProductIngestion()` auto-ingests on first load
- `productToVectorDocument()` includes `source` and `productUrl`
- Re-ingestion triggers when catalog size changes
- All products from `productData` are ingested

**Files:**
- `src/lib/ai/productIngestion.ts:159-175`: initializeProductIngestion()
- `src/lib/ai/productIngestion.ts:16-64`: productToVectorDocument()
- `src/lib/ai/productIngestion.ts:169-173`: Re-ingestion logic

---

## 11. Routine Recommendations

**Verify:**
- `getRoutineRecommendations()` returns complete routine
- Routine includes cleanser, serum, moisturizer, sunscreen
- Formatted output includes morning and evening steps
- Products include source indicators

**Files:**
- `src/lib/ai/chatRetrieval.ts:97-167`: getRoutineRecommendations()
- `src/lib/ai/retrievalPipeline.ts:351-364`: retrieveRoutine()
- `src/pages/ai-chat/page.tsx:123-179`: RoutineCard component

---

## 12. AI Journey Insights

**Verify:**
- `generateInsightsFromNotes()` creates insights from routine notes
- Insight types include: progress, recommendation, consistency, warning
- Insights include confidence scores and data sources
- Related photos are attached when available

**Files:**
- `src/pages/ai-chat/page.tsx:594-728`: generateInsightsFromNotes()
- `src/pages/ai-chat/page.tsx:189-202`: AIInsight interface
- `src/pages/ai-chat/page.tsx:1210-1276`: Insights panel UI

---

## 13. Chat Session Persistence

**Verify:**
- `saveChatSession()` persists messages to localStorage
- `loadChatSession()` restores previous sessions
- Session list is displayed in sidebar
- Current session ID is tracked for restoration

**Files:**
- `src/pages/ai-chat/page.tsx:737-763`: saveChatSession()
- `src/pages/ai-chat/page.tsx:765-769`: loadChatSession()
- `src/pages/ai-chat/page.tsx:468-484`: Session restoration on mount

---

## 14. AI Settings Customization

**Verify:**
- Settings popup allows customization of:
  - Response tone (friendly, professional, encouraging, direct)
  - Detail level (brief, balanced, detailed)
  - Response style (conversational, structured, educational)
  - Custom instructions
- Settings are persisted to localStorage
- Settings are applied to AI responses

**Files:**
- `src/pages/ai-chat/page.tsx:1436-1539`: Settings popup UI
- `src/pages/ai-chat/page.tsx:543-549`: loadAISettings()
- `src/pages/ai-chat/page.tsx:1075-1078`: handleSaveSettings()

---

## 15. Skincare-Only Knowledge Domain

**Verify:**
- System prompt includes "Skincare-Only Knowledge Domain" section
- Allowed knowledge sources are explicitly listed:
  - Product catalog (Marketplace + Discovery)
  - Ingredient database
  - User context (survey, behavior)
  - Retrieved skincare documents
  - Site FAQ
- Forbidden knowledge sources are defined:
  - No general medical knowledge
  - No external websites/sources
  - No clinical claims beyond data
  - No dermatological diagnoses
- Off-topic handling redirects to skincare options

**Files:**
- `src/pages/ai-chat/page.tsx`: Section 11 in CURAE_SYSTEM_INSTRUCTIONS
- `supabase/functions/ai-chat/index.ts`: "Skincare-Only Knowledge Domain" section

---

## 16. Site-Aware Navigation

**Verify:**
- System prompt includes site map reference table
- Navigation rules are defined for:
  - Marketplace products → /marketplace/product/:id
  - Discovery products → /product-detail/:id
  - Ingredients → /ingredients
  - Concerns → /discover?concern=:concern
  - Categories → /discover?category=:category
  - Routines → /routines
  - Skin Survey → /skin-survey
  - FAQ → /faq
  - Community → /community
  - Progress Tracking → /my-skin
  - Brands → /marketplace?brand=:brand
- Intent detection patterns are defined
- Link format instructions are included

**Files:**
- `src/pages/ai-chat/page.tsx`: Section 12 in CURAE_SYSTEM_INSTRUCTIONS
- `supabase/functions/ai-chat/index.ts`: "Site-Aware Navigation" section

---

## 18. Navigation Intent Detection

**Verify:**
- `detectNavigationIntent()` function exists and is exported
- `formatNavigationSuggestion()` function exists and is exported
- `NavigationIntent` type is exported
- Intent detection covers:
  - Ingredient intent (KNOWN_INGREDIENTS list)
  - Concern intent (KNOWN_CONCERNS list)
  - Category intent (KNOWN_CATEGORIES list)
  - Routine intent
  - FAQ intent
  - Survey intent
  - Brand intent
  - My-Skin intent
  - Community intent
- Navigation suggestions are appended to chat responses
- Integration with `generateRetrievalBasedResponse()`

**Files:**
- `src/lib/ai/chatRetrieval.ts`: detectNavigationIntent(), formatNavigationSuggestion()
- `src/lib/ai/index.ts`: Export declarations
- `src/pages/ai-chat/page.tsx`: Integration in generateRetrievalBasedResponse()

---

## 17. Retrieval-First Answering

**Verify:**
- System prompt enforces retrieval before answering
- Empty retrieval handling is defined:
  - Do not invent information
  - Offer alternative paths
  - Suggest browsing categories, refining criteria, survey completion
- Retrieval transparency rules are included

**Files:**
- `src/pages/ai-chat/page.tsx`: Section 13 in CURAE_SYSTEM_INSTRUCTIONS
- `supabase/functions/ai-chat/index.ts`: "Retrieval-First Answering" section

---

## 19. Skincare Knowledge Base

**Verify:**
- `knowledgeBase.ts` module exists with all knowledge sources
- Knowledge types are defined:
  - `KnowledgeType` enum (ingredient, educational, faq, routine, product, concern, category)
  - `KnowledgeChunk` interface
  - `IngredientKnowledge` interface
  - `RoutineRule` interface
  - `FAQEntry` interface
  - `KnowledgeResult` interface
- Ingredient encyclopedia includes:
  - 10+ ingredients with full metadata
  - Benefits, usage guidelines, compatibility
  - Contraindications and safety notes
  - Concentration ranges
- Routine rules include:
  - Step order (1-7)
  - AM/PM timing
  - Layering rules
  - Ingredient conflicts
- FAQ content includes:
  - Shipping, returns, products, account, safety categories
- Educational content includes:
  - Skin barrier guide
  - Layering guide
  - Retinol guide
  - Concern-specific guides
- Knowledge vector store exists:
  - `knowledgeStore` singleton
  - `search()` method with similarity ranking
  - `getIngredient()` method
  - `getRoutineRules()` method
  - `checkConflicts()` method
  - `getFAQ()` method
- Retrieval functions exported:
  - `initializeKnowledgeBase()`
  - `retrieveKnowledge()`
  - `getIngredientInfo()`
  - `formatKnowledgeForAI()`
  - `getRoutineGuidance()`
  - `checkIngredientCompatibility()`
- System prompt includes Section 14 "Skincare Knowledge Base Usage"

**Files:**
- `src/lib/ai/knowledgeBase.ts`: Full knowledge base implementation
- `src/lib/ai/index.ts`: Export declarations
- `src/pages/ai-chat/page.tsx`: Section 14 in CURAE_SYSTEM_INSTRUCTIONS
- `supabase/functions/ai-chat/index.ts`: "Skincare Knowledge Base Usage" section

---

## 20. Routine Builder Intelligence

**Verify:**
- `routineBuilder.ts` module exists with all routine-building logic
- Types are defined:
  - `RoutineTiming` (AM | PM)
  - `ExperienceLevel` (beginner | intermediate | advanced)
  - `RoutineStep` interface
  - `SkincareRoutine` interface
  - `RoutineBuilderResult` interface
  - `IngredientConflict` interface
  - `RoutinePreferences` interface
  - `UserRoutineHistory` interface
- Routine order constants:
  - `AM_ROUTINE_ORDER` (6 steps ending with sunscreen)
  - `PM_ROUTINE_ORDER` (8 steps with treatments)
- Ingredient conflict detection:
  - `INGREDIENT_CONFLICTS` matrix
  - `checkIngredientConflicts()` function
  - High/Medium/Low severity levels
- Safety categorization:
  - `AM_SAFE_ACTIVES` list
  - `PM_ONLY_ACTIVES` list
  - `BEGINNER_FRIENDLY` list
  - `ADVANCED_ACTIVES` list
- Core functions:
  - `buildRoutines()` — generates AM and PM routines
  - `formatRoutineForChat()` — formats for AI response
  - `validateRoutine()` — checks for issues
  - `selectProductForStep()` — picks best product
  - `isAMSafe()` — checks AM compatibility
  - `isSuitableForLevel()` — checks experience level
  - `getUsageFrequency()` — returns usage guidance
  - `getSafetyNotes()` — returns safety warnings
- Validation rules:
  - AM must include sunscreen
  - No PM-only ingredients in AM
  - Max 1-2 actives per routine
  - No high-severity conflicts
  - Steps in correct order
- System prompt includes Section 15 "Routine Builder Intelligence"

**Files:**
- `src/lib/ai/routineBuilder.ts`: Full routine builder implementation
- `src/lib/ai/index.ts`: Export declarations
- `src/pages/ai-chat/page.tsx`: Section 15 in CURAE_SYSTEM_INSTRUCTIONS
- `supabase/functions/ai-chat/index.ts`: "Routine Builder Intelligence" section

---

## 21. Ingredient Intelligence

**Verify:**
- `ingredientIntelligence.ts` module exists with all exports
- Types defined: `IngredientUserProfile`, `IngredientExplanation`, `IngredientComparison`, `CompatibilityResult`
- Constants: `INGREDIENT_CATEGORIES`, `PHOTOSENSITIZING_INGREDIENTS`, `PREGNANCY_UNSAFE`, `COMPATIBILITY_MATRIX`
- Core functions:
  - `getIngredientKnowledge()` — retrieves ingredient data
  - `explainIngredient()` — generates user-friendly explanation
  - `checkCompatibility()` — validates ingredient pairs
  - `compareIngredients()` — side-by-side comparison
  - `getIngredientRecommendations()` — personalized suggestions
  - `getIngredientSafety()` — safety evaluation
- Slug generation via `toIngredientSlug()`
- System prompt includes "Ingredient Intelligence" section

**Files:**
- `src/lib/ai/ingredientIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 22. Concern Intelligence

**Verify:**
- `concernIntelligence.ts` module exists with all exports
- Types defined: `ConcernId`, `ConcernSeverity`, `ConcernKnowledge`, `ConcernExplanation`
- `CONCERN_ENCYCLOPEDIA` contains 15+ skin concerns with full metadata
- Core functions:
  - `getConcernKnowledge()` — retrieves concern data
  - `explainConcern()` — generates explanation
  - `getConcernIngredientMapping()` — maps concerns to ingredients
  - `getConcernRoutineMapping()` — maps concerns to routine steps
  - `getConcernsForIngredient()` — reverse lookup
- Slug generation via `toConcernSlug()`
- System prompt includes "Concern Intelligence" section

**Files:**
- `src/lib/ai/concernIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 23. Product Intelligence

**Verify:**
- `productIntelligence.ts` module exists with all exports
- Types defined: `ProductUserProfile`, `ProductSafetyResult`, `ProductStrength`, `ProductTiming`
- Core functions:
  - `evaluateProductSafety()` — safety evaluation for user
  - `explainProduct()` — product explanation
  - `compareProducts()` — side-by-side comparison
  - `checkRoutineCompatibility()` — routine fit check
  - `generateRecommendationReasoning()` — whyItFits logic
  - `getProductUrl()` — URL generation by source
  - `determineProductStrength()` — gentle/moderate/strong
  - `determineProductTiming()` — AM/PM/both
- System prompt includes "Product Intelligence" section

**Files:**
- `src/lib/ai/productIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 24. Skin Profile Intelligence

**Verify:**
- `skinProfileIntelligence.ts` module exists with all exports
- Types defined: `SkinType`, `ExperienceLevel`, `SensitivityLevel`, `FitzpatrickType`, `SkinProfile`
- Core functions:
  - `evaluateProfileSafety()` — safety evaluation
  - `generateIngredientFilter()` — filter rules based on profile
  - `getTextureRecommendations()` — texture preferences
  - `analyzeProfile()` — comprehensive analysis
  - `buildPersonalizationContext()` — context for AI
  - `isIngredientSuitable()` — ingredient-profile compatibility
  - `generateProfilePrefix()` — response opener
- System prompt includes "Skin Profile Intelligence" section

**Files:**
- `src/lib/ai/skinProfileIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 25. Conversation Memory

**Verify:**
- `conversationMemory.ts` module exists with all exports
- Types defined: `MemoryCategory`, `MemoryEntry`, `ConversationMemory`
- Core functions:
  - `createEmptyMemory()` — initializes memory
  - `initializeMemoryFromContext()` — seeds from user context
  - `updateMemory()` — adds new entries
  - `extractMemoryFromMessage()` — parses user input
  - `generatePersonalizationContext()` — formats for AI
  - `generateMemoryReference()` — creates memory callouts
  - `loadMemory()` / `saveMemory()` / `clearStoredMemory()` — persistence
- `containsForbiddenContent()` prevents unsafe storage
- System prompt includes "Memory Intelligence" section

**Files:**
- `src/lib/ai/conversationMemory.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 26. Communication Intelligence

**Verify:**
- `communicationIntelligence.ts` module exists with all exports
- Core functions:
  - `detectUserTone()` — identifies user emotional state
  - `getResponseStyle()` — adapts response style
  - `generateToneInstructions()` — AI tone guidance
  - `getEmpathyResponse()` — supportive openings
  - `formatExplanation()` — structured explanations
  - `requiresMedicalRedirect()` — detects medical questions
  - `generateMedicalRedirect()` — safe redirect message
- `COMMUNICATION_PRINCIPLES` constant defined
- System prompt includes "Tone & Communication Intelligence" section

**Files:**
- `src/lib/ai/communicationIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 27. Error Handling Intelligence

**Verify:**
- `errorHandlingIntelligence.ts` module exists with all exports
- Types defined: `ErrorCategory`, `ErrorSeverity`, `DetectedError`, `ErrorHandlingResult`
- Detection functions:
  - `isMedicalRequest()` — medical question detection
  - `isPregnancyUnsafeRequest()` — pregnancy safety
  - `isOveruseRequest()` — over-exfoliation detection
  - `detectUnsafeRequest()` — comprehensive safety check
  - `detectIngredientConflicts()` — conflict detection
  - `detectMissingData()` — missing data detection
- Validation functions:
  - `validateProductData()` — product validation
  - `validateSkinProfile()` — profile validation
  - `validateUserInput()` — input validation
- `ERROR_HANDLING_PRINCIPLES` constant defined
- System prompt includes "Error Handling Intelligence" section

**Files:**
- `src/lib/ai/errorHandlingIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 28. Workflow Intelligence

**Verify:**
- `workflowIntelligence.ts` module exists with all exports
- Types defined: `WorkflowType`, `WorkflowStatus`, `WorkflowStep`, `WorkflowState`, `WorkflowContext`
- Core functions:
  - `detectWorkflow()` — identifies workflow from message
  - `createWorkflow()` — initializes workflow
  - `advanceWorkflow()` — moves to next step
  - `skipStep()` / `pauseWorkflow()` / `resumeWorkflow()` / `abandonWorkflow()` — state control
  - `getWorkflowProgress()` — completion percentage
  - `getCurrentStep()` / `getRemainingSteps()` / `getCompletedSteps()` — step queries
  - `generateProgressSummary()` / `generateCompletionSummary()` — summaries
  - `handleDirectionChange()` / `handleGoBack()` — user control
- Persistence: `saveWorkflow()` / `loadWorkflow()` / `clearWorkflow()`
- `WORKFLOW_PRINCIPLES` constant defined
- System prompt includes "Workflow Intelligence" section

**Files:**
- `src/lib/ai/workflowIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 29. Shopping Intelligence

**Verify:**
- `shoppingIntelligence.ts` module exists with all exports
- Types defined: `ProductFilters`, `SortOption`, `FilterableProduct`, `FilterResult`, `ShoppingContext`
- Core functions:
  - `extractFiltersFromMessage()` — parses filters from text
  - `applySafetyFilters()` — safety-based filtering
  - `filterProducts()` — applies all filters
  - `sortProducts()` — sorting by various criteria
  - `compareProducts()` — comparison logic
  - `getProductLink()` / `formatProductWithLink()` — link generation
  - `findAlternatives()` — alternative suggestions
  - `buildStarterBundle()` — bundle recommendations
  - `buildShoppingContext()` — context for AI
- `SHOPPING_PRINCIPLES` constant defined
- System prompt includes "Shopping Intelligence" section

**Files:**
- `src/lib/ai/shoppingIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 30. Routine Optimization Intelligence

**Verify:**
- `routineOptimizationIntelligence.ts` module exists with all exports
- Detection functions:
  - `evaluateRoutine()` — comprehensive evaluation
  - `detectConflicts()` — ingredient conflicts
  - `detectOrderingIssues()` — step order problems
  - `detectOveruse()` — over-exfoliation
  - `detectMissingSteps()` — missing essentials
  - `detectRedundancy()` — duplicate products
  - `detectTimingIssues()` — AM/PM misuse
  - `detectFrequencyIssues()` — usage frequency
  - `detectExperienceMismatch()` — level appropriateness
- Optimization functions:
  - `optimizeRoutine()` — comprehensive optimization
  - `reorderProducts()` — correct ordering
  - `resolveConflicts()` — conflict resolution
  - `simplifyRoutine()` — beginner simplification
  - `suggestExpansions()` — routine expansion
- `CATEGORY_ORDER`, `ACTIVE_FREQUENCY_LIMITS` constants defined
- System prompt includes "Routine Optimization Intelligence" section

**Files:**
- `src/lib/ai/routineOptimizationIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 31. Intent Classification Intelligence

**Verify:**
- `intentClassificationIntelligence.ts` module exists with all exports
- Types defined: `IntentCategory`, `SafetySignal`, `DetectedIntent`, `IntentClassification`, `IntentRoute`
- Core functions:
  - `classifyIntent()` — primary classification
  - `routeIntent()` — routing decision
  - `decomposeMultiIntent()` — multi-intent handling
  - `generateMultiIntentPlan()` — multi-intent planning
  - `isOffTopic()` — off-topic detection
  - `generateOffTopicRedirect()` — redirect message
  - `formatIntentForAI()` — AI context formatting
- `INTENT_CLASSIFICATION_PRINCIPLES` constant defined
- System prompt includes "Intent Classification" section

**Files:**
- `src/lib/ai/intentClassificationIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 32. Navigation Intelligence

**Verify:**
- `navigationIntelligence.ts` module exists with all exports
- Types defined: `NavigationTarget`, `ProductSource`, `NavigationLink`, `NavigationContext`, `PageLink`
- Slug generators:
  - `toIngredientSlug()` / `toConcernSlug()` / `toCategorySlug()` / `toUrlSlug()`
- URL generators:
  - `getIngredientUrl()` / `getProductUrl()` / `getConcernUrl()` / `getCategoryUrl()`
  - `getBrandUrl()` / `getRoutineUrl()` / `getSurveyUrl()` / `getFaqUrl()` / `getMySkinUrl()`
- Core functions:
  - `detectNavigationFromMessage()` — navigation detection
  - `generateContextualLinks()` — smart link suggestions
  - `generateProductLinks()` — product-specific links
  - `formatLink()` / `formatLinks()` / `formatInlineLink()` — formatting
- Validation: `isValidInternalUrl()`, `isValidIngredientSlug()`, `isValidConcernSlug()`
- `VALID_INGREDIENT_SLUGS`, `VALID_CONCERN_SLUGS`, `SITE_NAVIGATION` constants
- System prompt includes "Navigation Intelligence" section

**Files:**
- `src/lib/ai/navigationIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: System prompt section

---

## 33. Response Formatting Intelligence

**Verify:**
- `responseFormattingIntelligence.ts` module exists with all exports
- Core formatters:
  - `formatHeading()` / `formatSubheading()` / `formatBulletList()` / `formatNumberedList()`
  - `formatBold()` / `formatKeyValue()` / `formatParagraph()` / `addSectionSpacing()`
- Content formatters:
  - `formatIngredientExplanation()` / `formatProductExplanation()` / `formatConcernExplanation()`
  - `formatRoutine()` / `formatComparison()` / `formatTroubleshooting()` / `formatSafetyNote()`
- Structure helpers:
  - `buildStructuredResponse()` / `trimResponse()` / `addClosingCTA()` / `formatSimpleAnswer()`
- Template detection:
  - `detectContentType()` / `getFormattingInstructions()`
- `FORMAT_LIMITS`, `SECTION_HEADINGS`, `FORMATTING_PRINCIPLES` constants
- System prompt includes formatting rules

**Files:**
- `src/lib/ai/responseFormattingIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: Formatting sections

---

## 34. Reasoning Chain Intelligence

**Verify:**
- `reasoningChainIntelligence.ts` module exists with all exports
- Types defined: `IntelligenceModule`, `TaskPriority`, `SubTask`, `DecomposedQuery`, `ExecutionPlan`
- Core functions:
  - `decomposeQuery()` — breaks down complex queries
  - `createExecutionPlan()` — plans response steps
  - `runSafetyChecks()` — pre-response safety checks
  - `planResponseStructure()` — structures response
  - `getIntentTransition()` / `getMultiIntentIntro()` — multi-intent handling
  - `formatDecompositionForAI()` / `formatPlanForAI()` — AI context formatting
- Safety checks include pregnancy-unsafe detection
- `REASONING_PRINCIPLES` constant defined
- System prompt includes reasoning rules (hidden from user)

**Files:**
- `src/lib/ai/reasoningChainIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: Reasoning sections

---

## 35. Mode Switching Intelligence

**Verify:**
- `modeSwitchingIntelligence.ts` module exists with all exports
- Types defined: `FunctionalMode`, `ModePriority`, `ModeConfig`, `ActiveModeState`, `CorePersona`
- `MODE_CONFIGS` defines all modes:
  - product_advisor, routine_builder, ingredient_educator, concern_educator
  - shopping_assistant, troubleshooter, navigator, general_helper, safety_guardian
- `CORE_PERSONA` defines unified persona
- Core functions:
  - `detectModes()` — detects active modes from message
  - `createModeState()` / `transitionMode()` / `canTransition()` — state management
  - `getModeInstructions()` / `getModeFormatInstructions()` — mode-specific guidance
  - `getPersonaModifiers()` — persona adjustments
  - `checkPersonaBoundaries()` — boundary validation
- `MODE_SWITCHING_PRINCIPLES` constant defined
- System prompt includes mode switching rules

**Files:**
- `src/lib/ai/modeSwitchingIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: Mode switching sections

---

## 36. Data Validation Intelligence

**Verify:**
- `dataValidationIntelligence.ts` module exists with all exports
- Types defined: `ValidationStatus`, `ValidationSeverity`, `ValidationIssue`, `ValidationResult`
- Metadata types: `IngredientMetadata`, `ProductMetadata`, `ConcernMetadata`, `UserProfileMetadata`
- Validation functions:
  - `validateIngredient()` / `validateProduct()` / `validateConcern()` / `validateUserProfile()`
- Cross-checking:
  - `crossCheckProductIngredients()` / `crossCheckProfileProduct()`
- Slug/ID validation:
  - `validateSlug()` / `validateProductId()`
- Safe fallbacks:
  - `getSafeFallback()` — provides safe alternatives
- Formatting:
  - `formatValidationForAI()` / `formatCrossCheckForAI()`
- `VALIDATION_PRINCIPLES` constant defined
- System prompt includes "Data Validation Intelligence" section

**Files:**
- `src/lib/ai/dataValidationIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: Data validation section

---

## 37. Behavioral Intelligence

**Verify:**
- `behavioralIntelligence.ts` module exists with all exports
- Types defined: `BehaviorSignalType`, `BehaviorSignal`, `BehaviorPatterns`, `BehavioralTrend`, `PersonalizationContext`
- Core functions:
  - `analyzePatterns()` — pattern analysis from signals
  - `detectTrends()` — trend detection
  - `applyBehavioralPreferences()` — preference application
  - `detectPreferenceConflicts()` — conflict detection
  - `buildPersonalizationContext()` — context building
  - `formatBehavioralContextForAI()` — AI formatting
  - `generatePersonalizationReference()` — personalized references
- Safety functions:
  - `isSafeToStore()` / `sanitizeBehaviorData()` — data safety
- Pregnancy-unsafe detection included
- `BEHAVIORAL_PRINCIPLES` constant defined
- System prompt includes "Behavioral Intelligence" section

**Files:**
- `src/lib/ai/behavioralIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: Behavioral sections

---

## 38. Search & Retrieval Intelligence

**Verify:**
- `searchRetrievalIntelligence.ts` module exists with all exports
- Types defined: `QueryIntent`, `RetrievalSource`, `RetrievedChunk`, `SafetyFilterResult`
- Core functions:
  - `detectQueryIntent()` — intent detection
  - `retrieveIngredients()` / `retrieveConcerns()` / `retrieveFAQ()` / `retrieveEducational()`
  - `retrieveRoutineConflicts()` — conflict retrieval
  - `applyPersonalizationFilters()` / `applySafetyFilters()` — post-retrieval filters
  - `retrieve()` / `retrieveForRoutine()` — main retrieval
  - `formatRetrievedForAI()` — AI context formatting
  - `hasRelevantContent()` / `getRetrievalConfidence()` — confidence evaluation
- System prompt includes "Retrieval Intelligence" section

**Files:**
- `src/lib/ai/searchRetrievalIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts`: Export declarations
- `supabase/functions/ai-chat/index.ts`: Retrieval sections

---

## 39. Final System Assembly & Hierarchy

**Verify:**
- System prompt includes "Final System Assembly, Hierarchy & Enforcement" section
- Hierarchy defined (13 priority levels):
  1. Safety Rules (highest)
  2. Data Validation & Metadata Integrity
  3. User Intent Classification
  4. Mode Switching & Persona Control
  5. Reasoning-Chain Intelligence
  6. Domain Intelligence (Ingredient, Product, Concern, Routine, Shopping)
  7. Behavioral & Personalization Intelligence
  8. Formatting & Output Structuring
  9. Navigation & Linking
  10. Tone & Communication Style
  11. Memory & Context Intelligence
  12. Workflow Intelligence
  13. Fallback & Error Handling (lowest)
- Conflict resolution rules defined
- Unified persona enforcement defined
- Response pipeline (internal) defined
- System-wide enforcement rules defined

**Files:**
- `supabase/functions/ai-chat/index.ts`: Final System Assembly section (lines 2141+)

---

## Output Requirements

For each section above, provide:
- **PASS** if the feature is correctly implemented
- **FAIL** with:
  - Exact file + line number
  - What is missing or incorrect
  - Minimal patch (diff) to fix

Do NOT rewrite entire files. Only provide targeted fixes if needed.
```

---

## Changelog

| Date | Section Added | Reason |
|------|---------------|--------|
| 2024-XX-XX | 1-7 | Initial health check |
| 2024-XX-XX | 8 | Embedding System detected in `src/lib/ai/embeddings.ts` |
| 2024-XX-XX | 9 | Vector Store State detected in `src/lib/ai/vectorStore.ts` |
| 2024-XX-XX | 10 | Product Ingestion Pipeline detected in `src/lib/ai/productIngestion.ts` |
| 2024-XX-XX | 11 | Routine Recommendations detected in `src/lib/ai/chatRetrieval.ts` |
| 2024-XX-XX | 12 | AI Journey Insights detected in `src/pages/ai-chat/page.tsx` |
| 2024-XX-XX | 13 | Chat Session Persistence detected in `src/pages/ai-chat/page.tsx` |
| 2024-XX-XX | 14 | AI Settings Customization detected in `src/pages/ai-chat/page.tsx` |
| 2024-XX-XX | 15 | Skincare-Only Knowledge Domain added to system prompts |
| 2024-XX-XX | 16 | Site-Aware Navigation added to system prompts |
| 2024-XX-XX | 17 | Retrieval-First Answering added to system prompts |
| 2024-XX-XX | 18 | Navigation Intent Detection added to chatRetrieval.ts |
| 2024-XX-XX | 19 | Skincare Knowledge Base added to knowledgeBase.ts |
| 2024-XX-XX | 20 | Routine Builder Intelligence added to routineBuilder.ts |
| 2026-02-08 | 40 | Adaptive AI Engine detected in `src/lib/utils/adaptiveAI.ts` |
| 2026-02-08 | 41 | Legacy Product Retrieval Integration detected in `src/lib/utils/productRetrieval.ts` |
| 2026-02-08 | 42 | Shared AI Types Module detected in `src/lib/ai/types.ts` |
| 2026-02-08 | 43 | Central AI Engine Exports detected in `src/lib/ai/index.ts` |
| 2026-02-08 | 44 | AI Chat Client detected in `src/lib/ai/chatClient.ts` |
| 2026-02-08 | 45 | Ingredient Intelligence Module detected in `src/lib/ai/ingredientIntelligence.ts` |
| 2026-02-08 | 46 | UI Component Integration detected in `src/pages/ai-chat/page.tsx` |

---

## Quick Reference: File Locations

| Feature | Primary File | Lines |
|---------|--------------|-------|
| Source Logic | `productIngestion.ts` | 30-33 |
| Source Filtering | `retrievalPipeline.ts` | 261-281 |
| User Context | `ai-chat/index.ts` (edge) | 211-351 |
| Reasoning Rules | `ai-chat/index.ts` (edge) | 162-205 |
| Retrieval Pipeline | `retrievalPipeline.ts` | 58-318 |
| System Prompt | `ai-chat/page.tsx` | 205-450 |
| Output Formatting | `retrievalPipeline.ts` | 405-440 |
| Embeddings | `embeddings.ts` | 10-270 |
| Vector Store | `vectorStore.ts` | 43-233 |
| Product Ingestion | `productIngestion.ts` | 16-175 |
| Routine Recs | `chatRetrieval.ts` | 97-167 |
| AI Insights | `ai-chat/page.tsx` | 594-728 |
| Session Persistence | `ai-chat/page.tsx` | 737-769 |
| AI Settings | `ai-chat/page.tsx` | 1436-1539 |
| Skincare-Only Domain | `ai-chat/page.tsx` + edge | Section 11 |
| Site Navigation | `ai-chat/page.tsx` + edge | Section 12 |
| Retrieval-First | `ai-chat/page.tsx` + edge | Section 13 |
| Navigation Intent | `chatRetrieval.ts` | detectNavigationIntent() |
| Knowledge Base | `knowledgeBase.ts` | All exports |
| Routine Builder | `routineBuilder.ts` | All exports |
| Adaptive AI Engine | `adaptiveAI.ts` | generateResponse() |
| Legacy Retrieval | `productRetrieval.ts` | retrieveProducts() |
| Shared Types | `types.ts` | All type exports |
| Central AI Exports | `index.ts` | All module exports |
| AI Chat Client | `chatClient.ts` | callAIChatAPI(), getClientContext() |

---

## 40. Adaptive AI Engine

**Verify:**
- `AdaptiveAIEngine` class exists as singleton export (`adaptiveAI`)
- `generateResponse()` method accepts userInput and context
- `getAdaptiveResponse()` helper function is exported
- Conversation context analysis includes:
  - Topic detection (routine, products, ingredients, skin-analysis, concerns)
  - Sentiment detection (positive, neutral, negative)
  - Complexity preference (simple, moderate, detailed)
  - User intent (information, learning, recommendation, troubleshooting, comparison)
- Topic knowledge tracking via `topicKnowledge` Map
- Conversation history management (max 20 messages)
- Response confidence calculation based on preference data
- Integration with sessionState for personalization context
- Integration with legacy productRetrieval for fallback recommendations

**Files:**
- `src/lib/utils/adaptiveAI.ts:42-452`: AdaptiveAIEngine class
- `src/lib/utils/adaptiveAI.ts:454-455`: Singleton export
- `src/lib/utils/adaptiveAI.ts:457-460`: getAdaptiveResponse helper

**PASS/FAIL Criteria:**
- [ ] AdaptiveAIEngine class is defined and exported
- [ ] generateResponse() returns AIResponse with message, suggestions, confidence, reasoning
- [ ] Topic detection covers all expected categories
- [ ] Sentiment analysis works for positive/negative/neutral
- [ ] Conversation history is capped at 20 messages
- [ ] Integration with sessionState.getPersonalizationContext() works

---

## 41. Legacy Product Retrieval Integration

**Verify:**
- `retrieveProducts()` function exists and returns RetrievalResult
- `retrieveByCategory()` returns products filtered by category
- `retrieveRoutineProducts()` returns Record<string, RetrievedProduct[]>
- `searchByIngredient()` returns products matching ingredient
- `formatProductForResponse()` formats single product
- `formatRecommendations()` formats multiple products
- RetrievedProduct interface includes relevanceScore and matchReasons
- Budget range filtering (budget, mid, premium)
- Concern mapping via CONCERN_MAPPINGS
- Skin type matching via product.skinTypes

**Files:**
- `src/lib/utils/productRetrieval.ts:147-179`: retrieveProducts()
- `src/lib/utils/productRetrieval.ts:184-190`: retrieveByCategory()
- `src/lib/utils/productRetrieval.ts:195-206`: retrieveRoutineProducts()
- `src/lib/utils/productRetrieval.ts:211-248`: searchByIngredient()
- `src/lib/utils/productRetrieval.ts:253-266`: formatProductForResponse()
- `src/lib/utils/productRetrieval.ts:271-289`: formatRecommendations()

**PASS/FAIL Criteria:**
- [ ] retrieveProducts returns scored and ranked products
- [ ] Category filtering works correctly
- [ ] Budget range filtering respects BUDGET_RANGES
- [ ] Concern matching uses CONCERN_MAPPINGS for fuzzy matching
- [ ] Products include marketplace URL in formatted output
- [ ] All exported types are correctly defined

---

## 42. Shared AI Types Module

**Verify:**
- Core types are exported:
  - `SkinProfile`, `ProductReference`, `UserInteractionHistory`, `UserContext`
  - `ConversationMessage`, `AIChatSettings`, `AIChatRequest`, `AIRequestPayload`
  - `AIChatAPIResponse`, `AIChatErrorResponse`
- Memory types are exported:
  - `MemoryCategory`, `ConversationMemory`
- Communication types are exported:
  - `UserTone`, `ResponseStyle`, `ExplanationLevel`, `CommunicationContext`
- Error handling types are exported:
  - `ErrorCategory`, `ErrorSeverity`, `DetectedError`, `ErrorHandlingResult`
- Workflow types are exported:
  - `WorkflowType`, `WorkflowStatus`, `WorkflowStep`, `WorkflowContext`, `WorkflowState`
  - `WorkflowDetectionResult`
- Shopping types are exported:
  - `ProductFilters`, `SortOption`, `FilterableProduct`, `FilterResult`
  - `ProductComparison`, `ShoppingContext`
- Routine optimization types are exported:
  - `RoutineProduct`, `UserRoutine`, `IssueSeverity`, `IssueType`, `RoutineIssue`
  - `RoutineChange`, `FrequencyRecommendation`, `OptimizationResult`
  - `SimplificationResult`, `ExpansionSuggestion`, `RoutineUserContext`
  - `RoutineOptimizationContext`

**Files:**
- `src/lib/ai/types.ts:10-23`: SkinProfile interface
- `src/lib/ai/types.ts:28-36`: ProductReference interface
- `src/lib/ai/types.ts:41-54`: UserInteractionHistory interface
- `src/lib/ai/types.ts:59-70`: UserContext interface
- `src/lib/ai/types.ts:75-88`: AIChatSettings interface
- `src/lib/ai/types.ts:93-104`: AIChatRequest interface
- `src/lib/ai/types.ts:109-117`: AIRequestPayload interface
- `src/lib/ai/types.ts:138-190`: ConversationMemory and MemoryCategory
- `src/lib/ai/types.ts:192-234`: Communication types
- `src/lib/ai/types.ts:236-278`: Error handling types
- `src/lib/ai/types.ts:280-363`: Workflow types
- `src/lib/ai/types.ts:365-462`: Shopping types
- `src/lib/ai/types.ts:464-605`: Routine optimization types

**PASS/FAIL Criteria:**
- [ ] All 50+ types are exported from types.ts
- [ ] Types are correctly re-exported from index.ts
- [ ] No circular dependencies exist
- [ ] All interfaces have required fields defined
- [ ] Union types have all expected values

---

## 43. Central AI Engine Exports

**Verify:**
- All intelligence modules are exported from `src/lib/ai/index.ts`:
  - Embeddings: generateEmbedding, generateProductEmbedding, generateSurveyEmbedding, cosineSimilarity
  - Vector Store: vectorStore, VectorDocument, SearchResult
  - Product Ingestion: ingestProducts, initializeProductIngestion
  - Retrieval Pipeline: retrieveProducts, formatProductsForChat, RankedProduct
  - Chat Retrieval: getProductRecommendations, getRoutineRecommendations, detectNavigationIntent
  - Knowledge Base: knowledgeStore, initializeKnowledgeBase, retrieveKnowledge
  - Search & Retrieval: detectQueryIntent, retrieve, formatRetrievedForAI
  - Skin Profile: evaluateProfileSafety, buildPersonalizationContext
  - Product Intelligence: evaluateProductSafety, explainProduct, compareProducts
  - Concern Intelligence: getConcernKnowledge, explainConcern
  - Routine Builder: buildRoutines, checkIngredientConflicts, validateRoutine
  - Conversation Memory: createEmptyMemory, updateMemory, saveMemory, loadMemory
  - Communication: detectUserTone, getResponseStyle, generateMedicalRedirect
  - Error Handling: detectUnsafeRequest, detectIngredientConflicts, validateProductData
  - Workflow: detectWorkflow, createWorkflow, advanceWorkflow
  - Shopping: extractFiltersFromMessage, filterProducts, sortProducts
  - Routine Optimization: evaluateRoutine, optimizeRoutine, detectConflicts
  - Intent Classification: classifyIntent, routeIntent, isOffTopic
  - Navigation: getIngredientUrl, getProductUrl, formatNavigationSuggestion
  - Response Formatting: formatHeading, buildStructuredResponse, trimResponse
  - Reasoning Chain: decomposeQuery, createExecutionPlan, runSafetyChecks
  - Mode Switching: detectModes, transitionMode, getModeInstructions
  - Data Validation: validateIngredient, validateProduct, getSafeFallback
  - Behavioral: analyzePatterns, detectTrends, applyBehavioralPreferences

**Files:**
- `src/lib/ai/index.ts:1-661`: All module exports

**PASS/FAIL Criteria:**
- [ ] All 28 intelligence modules have exports in index.ts
- [ ] No missing exports that break imports elsewhere
- [ ] Type exports match runtime exports
- [ ] Constants and principles are exported for each module
- [ ] All function signatures are correctly typed

---

## 44. AI Chat Client

**Verify:**
- `callAIChatAPI()` function exists and makes API calls to edge function
- `buildLocalPayload()` constructs AI request payload for client-side
- `getClientContext()` gathers client-side context:
  - Recently viewed products from localStorage
  - Favorited products from localStorage
  - Frequent categories derived from interaction history
  - Recent searches from localStorage
- Error handling for API failures
- Timeout handling for slow responses
- Response parsing and validation

**Files:**
- `src/lib/ai/chatClient.ts:23-78`: getClientContext()
- `src/lib/ai/chatClient.ts`: callAIChatAPI() implementation
- `src/lib/ai/chatClient.ts`: buildLocalPayload() implementation

**PASS/FAIL Criteria:**
- [ ] getClientContext() returns UserInteractionHistory with all fields
- [ ] localStorage reads are wrapped in try/catch
- [ ] Product references include id, name, brand, category
- [ ] Frequent categories are derived from viewed/favorited products
- [ ] API calls include proper headers and error handling

---

## 45. Ingredient Intelligence Module

**Verify:**
- `ingredientIntelligence.ts` module exports all required functions
- Types defined: `IngredientUserProfile`, `IngredientExplanation`, `IngredientComparison`, `CompatibilityResult`
- Constants defined: `INGREDIENT_CATEGORIES`, `PHOTOSENSITIZING_INGREDIENTS`, `PREGNANCY_UNSAFE`, `COMPATIBILITY_MATRIX`
- Core functions:
  - `getIngredientKnowledge()` — retrieves ingredient data from encyclopedia
  - `explainIngredient()` — generates user-friendly explanation
  - `checkCompatibility()` — validates ingredient pairs for conflicts
  - `compareIngredients()` — side-by-side comparison
  - `getIngredientRecommendations()` — personalized suggestions based on profile
  - `getIngredientSafety()` — safety evaluation for specific users
- `toIngredientSlug()` generates valid URL slugs
- Photosensitivity warnings for retinoids, AHAs, BHAs
- Pregnancy-unsafe ingredient detection

**Files:**
- `src/lib/ai/ingredientIntelligence.ts`: Full implementation
- `src/lib/ai/index.ts:188-207`: Export declarations

**PASS/FAIL Criteria:**
- [ ] All 6 core functions are implemented and exported
- [ ] COMPATIBILITY_MATRIX includes retinol, AHAs, BHAs, vitamin C, benzoyl peroxide
- [ ] PREGNANCY_UNSAFE includes retinoids, high-dose salicylic acid, hydroquinone
- [ ] toIngredientSlug() produces lowercase hyphenated slugs
- [ ] Explanations are personalized when user profile is provided

---

## 46. UI Component Integration

**Verify:**
- `ProductCard` component in AI chat displays:
  - Product image with fallback to placeholder
  - Source badge (Marketplace vs Discovery) with correct styling
  - Source icon (`ri-shopping-bag-line` for marketplace, `ri-compass-3-line` for discovery)
  - Match label (Best Match, Alternative, Budget-Friendly)
  - Price, rating, and review count
  - Match reasons from retrieval
  - Correct link via `product.productUrl`
- `RoutineCard` component displays:
  - Personalized routine header with skin type
  - Steps: Cleanse, Treat, Moisturize, Protect
  - Products with source badges
  - Links to correct product pages
- Quick prompts array provides starting suggestions
- Message rendering supports products and routines

**Files:**
- `src/pages/ai-chat/page.tsx:48-123`: ProductCard component
- `src/pages/ai-chat/page.tsx:125-182`: RoutineCard component
- `src/pages/ai-chat/page.tsx:735-743`: quickPrompts array

**PASS/FAIL Criteria:**
- [ ] ProductCard links use productUrl (not marketplaceUrl)
- [ ] Source badges have correct colors (primary for marketplace, sage for discovery)
- [ ] RoutineCard renders all 4 routine steps when present
- [ ] Placeholder image path is correct
- [ ] All links are wrapped in React Router Link components
