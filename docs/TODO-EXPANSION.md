# Complete Architectural To-Do Expansion — Lorem Curae MVP

Generated: February 28, 2026
Scope: Every category, subcategory, feature, function, and system responsibility that should exist based on the full architecture.

---

## 1. Core Pages & Flows

### Home
- Page shell and layout
- HeroSection with primary CTA
- WhyWeExistSection (mission statement)
- WhyThisMattersSection (problem/solution)
- ConnectedSystemSection (ecosystem overview)
- DifferentiationSection (key differentiators)
- IngredientIntelligence section
- IngredientCarousel (ingredient showcase)
- EducationHub (educational content)
- PersonalizedAIGuidance (AI preview)
- ProductComparison showcase
- QuizCTA (skin survey call-to-action)
- MarketplaceSection (marketplace promotion)
- RewardsSection (points/rewards)
- RoutineTracker preview
- TestimonialSection (user testimonials)
- TrustBanner (trust/safety messaging)
- CommunityStories (community highlights)
- SmartProductSearch preview
- YourJourneySection (journey framing)
- Scroll-triggered animation orchestration
- Section lazy-loading / viewport gating
- Personalized hero variant based on returning-user state
- Deep-link anchors for each section (e.g., /#rewards)

### Discover
- ProductCatalog grid with pagination or infinite scroll
- Multi-dimension filter panel (category, skin type, concerns, price, brand, preferences)
- Sort controls (relevance, price low/high, rating, newest)
- Personalized "Recommended for You" ranking
- Search integration (keyword, ingredient, concern)
- QuizFlow inline quiz for guided discovery
- ResultsDisplay for quiz-driven recommendations
- Product card with match badge, safety badge, save button
- Comparison picker (select up to 3 products)
- ComparisonPickerModal with side-by-side metrics
- Empty state when no products match filters
- Loading skeleton for catalog
- URL-driven filter state (query params for shareable links)
- Category quick-filter chips
- "Recently Viewed" sidebar or section
- Guest vs. authenticated personalization fallback

### Product Detail
- ProductOverview (hero image gallery, name, brand, price range, rating)
- Image gallery with thumbnail navigation
- Key ingredients list with match highlighting
- Skin type suitability indicator
- Concern match badges
- Preference match badges (vegan, cruelty-free, etc.)
- Location Fit Block (environment-aware: UV, climate, season)
- Location Explanation Modal
- Safety badge (safe / caution / not-recommended)
- CompatibleWith section (complementary products)
- PurchaseOptions (retailer comparison table)
- Retailer trust scores with explanation tooltip
- About Pricing tooltip
- Price range across retailers
- SimilarProducts section
- ProductReviews section with similarity-based reviewer matching
- Comparison picker integration
- Save/unsave product
- Recently viewed tracking
- Tab navigation (overview, reviews, purchase)
- Share product (URL copy, social)
- Breadcrumb navigation

### Product Search Detail (secondary product surface)
- ProductOverview with environment block
- Skin type match
- Concern match
- Environment data (gated by source: mock hidden, partial/live shown)
- PurchaseOptions with canonical pricing tooltip
- Add to comparison
- View reviews link

### Ingredients
- IngredientLibrary browse/search with category filters
- Ingredient cards with safety icon, concern tags
- IngredientDetail view with full breakdown
- Ingredient safety explanation
- Ingredient-to-product matching (products containing this ingredient)
- Personalized ingredient highlights (user concern matches)
- Ingredient conflict warnings
- Concentration information where available
- ExplainWhyDropdown for safety ratings
- URL-driven detail view (?id=slug)
- Empty state for no results
- Alphabet / first-letter filter

### Routines
- RoutineBuilder (step-by-step editor)
- AM/PM time-of-day classification
- Drag-and-drop step reordering
- ProductPickerModal (browse & add products to steps)
- CustomStepModal (create non-product step)
- ConflictDetection engine (ingredient conflicts)
- ConflictDetectionPopup modal
- AIAssistant (AI-powered routine suggestions)
- NotesSection (per-routine notes with photo attachments)
- RoutineTutorial (first-time onboarding)
- Version history (VersionHistoryModal)
- Version diff (step-by-step comparison)
- Version revert
- TimelineTab (activity timeline)
- InsightsPanel (automated routine insights)
- Completion tracking (AM/PM daily checkboxes)
- Streak computation
- Save to localStorage (guest) + Supabase (auth)
- Routine analytics event logging

### Routines List
- Saved routines listing
- RoutineListTutorial (first-time guidance)
- Per-routine actions (view, edit, delete, duplicate)
- NotesSection integration
- VersionHistoryModal integration
- TimelineTab integration
- Routine count badge
- Empty state for no routines
- Sort by recency, name, time-of-day
- Filter by AM/PM/both

### Skin Survey
- QuizFlow (multi-step wizard)
- Skin type assessment
- Concern selection
- Sensitivity evaluation
- Complexion / Fitzpatrick type
- Lifestyle factors
- Product preferences (vegan, fragrance-free, etc.)
- Budget range
- AuthPrompt (login/signup prompt mid-survey)
- Progress indicator
- Results page (SurveyResultsPage)
- Personalized product recommendations on results
- Save to sessionState + localStorage + Supabase profile
- Resume incomplete survey
- Retake survey flow
- Guest survey → account merge on signup

### My Skin
- Editable skin type
- Editable concerns list
- Editable allergens
- Editable preferences
- Save to Supabase profile + sessionState
- Sync with skin survey data
- Empty state for incomplete profile
- Link to retake survey

### Account
- Account overview dashboard
- Saved products list with filtering/sorting
- Recent purchases
- Bio editing
- Points display (PointsDisplay component)
- Tier progress bar
- Transaction history link
- Quick links to settings, routines, badges
- Guest vs. authenticated state

### Settings
- Profile tab (bio, display name, avatar)
- Account tab (email, password change)
- Notifications tab (email, product reminders, community updates)
- Privacy tab (profile visibility, show routines)
- Preferences tab (language, theme)
- Location tab (city, state, zip, country, geolocation, manual lat/lon, clear, privacy note)
- Display name change with cooldown logic
- Password change modal with current password verification
- Tab navigation via URL query param (?tab=location)
- Save confirmation toast
- Supabase profile sync

### Cart
- Cart items list
- Quantity adjustment
- Remove item
- Price subtotal / total
- Checkout flow
- Empty cart state
- Persist cart across sessions (localStorage)

### AI Chat
- Chat interface (message input, conversation thread)
- AI response rendering (markdown, product links)
- Conversation history (multi-turn memory)
- Context-aware from user profile (skin type, concerns, saved products)
- Product recommendations with marketplace links
- Routine suggestions
- Ingredient analysis
- Navigation intent detection
- Tone settings (casual, professional, educational)
- Detail level settings (brief, detailed, comprehensive)
- Loading state during AI response
- Error state for API failure
- NeuralBloomIcon branding
- Clear conversation

### Nutrition
- FoodLibrary (browse foods)
- FoodDetailModal (nutrition facts, skin-relevant nutrients)
- MealPlanner (plan meals by date/time)
- NutrientTracker (daily intake analytics)
- Skin-relevant nutrient highlighting
- Dietary restriction handling
- Meal saving
- Daily intake logging
- Nutrient goal setting
- Tab navigation (library, planner, tracker)
- Supabase persistence (meal_plans, nutrient_goals, daily_nutrient_intake)
- Disclaimer: educational, not medical advice

### Services
- Services directory landing
- ServicesSearchPage (search & filter)
- ServiceDetailPage (service info, provider, pricing)
- ServicesComparePage (compare multiple services)
- ServicesBookingPage (booking form)
- ServicesBookingSuccessPage (confirmation)
- Service ratings and reviews
- Provider trust indicators
- Booking calendar/scheduling
- Mock service data

### Marketplace
- Marketplace landing (featured products, categories)
- MarketplaceAllPage (full product listing)
- MarketplaceProductDetailPage (product detail with checkout)
- MarketplaceSuccessPage (purchase confirmation)
- Subscription tier discount display
- Creator storefront links
- Trust score display
- Category browsing
- Search within marketplace
- Stripe Checkout integration
- Transaction tracking

### Community
- Community feed (posts from joined communities)
- Community discover (browse communities)
- My Communities tab
- CommunityCreatePage (create new community)
- Community detail / feed view
- Post creation (text, images)
- Post likes and comments
- Community membership (join/leave)
- Community moderation indicators
- Member count display
- Empty states for each tab
- Loading states

### Seller & Creator
- SellerOnboardingPage (become a seller)
- SellerDashboardPage (seller overview)
- SellerApplicationStatusPage (check application)
- CreatorOnboardingPage (creator program)
- CreatorDashboardPage (creator workspace)
- CreatorProductsPage (manage products)
- CreatorPatchTestsPage (manage patch tests)
- CreatePatchTestPage (create new patch test)
- CreatorAudiencePage (audience analytics)
- CreatorAnalyticsPage (analytics dashboard)
- CreatorStorefrontPage (storefront customization)
- Stripe Connect onboarding integration
- Stripe dashboard link

### Storefront
- StorefrontDetailPage (public storefront view)
- StorefrontProductDetailsPage (storefront product detail)
- StorefrontJoinPage (join storefront program)
- StorefrontRegisterPage (register as storefront with Stripe)

### Affiliate
- AffiliateDashboardPage (earnings, clicks, conversions)
- AffiliateRedirectPage (click tracking + redirect)
- Affiliate link generation
- Commission tracking
- Cashback display

### Reviews
- RetailerReviewsPage (retailer trust scores + reviews)
- ReviewsProductsPage (aggregated product reviews)
- Reviewer similarity scoring and badges
- Aspect ratings (shipping, service, packaging)
- Helpful/report actions
- Sort and filter reviews
- ExplainWhyDropdown for similarity

### Badges
- Achievement/badge display
- Badge categories
- Earn conditions per badge
- Progress toward next badge
- Badge notifications

### Subscription
- SubscriptionPage (tier selection)
- PremiumPackagesPage (premium feature listing)
- Tier comparison table
- Stripe subscription checkout
- Current tier display
- Upgrade/downgrade flow

### Static & Legal Pages
- AboutPage
- ContactPage (with Supabase form submission)
- PrivacyPage
- FAQPage
- AccessibilityPage
- CommunityGuidelinesPage
- DataImpactPage (data transparency)
- DataAnonymizationPage (data deletion)
- IngredientPatchTestPage (patch test guide)

### Waitlist / Early Access
- WaitlistLandingPage (preview site)
- MarketplaceWaitlistPage (marketplace preview)
- Password-gated access (password-check Edge Function)

### Error Pages
- NotFoundPage (404 catch-all)

---

## 2. Authentication & User Identity

### Auth Flows
- Email/password signup
- Email/password login
- OAuth redirect handling (callback page)
- Forgot password (email-based recovery)
- Reset password (token-based reset)
- HCaptcha bot prevention on login/signup
- Auto-redirect after login (return to previous page)
- Session persistence across tabs/refresh

### Session Management
- Supabase Auth session (JWT + refresh token)
- Auth state context (AuthContext)
- Profile loading on auth state change
- Guest-to-authenticated state transition
- Session expiry handling
- Auto-refresh token logic

### Auth Logic
- AuthContext provider (user, profile, loading, refreshProfile)
- signUp function (create auth user + profile)
- signIn function
- signOut function
- Profile sync to sessionState on auth change
- Routine count hydration on login
- Survey completion flag sync

### Guest-to-Account Data Merge
- Merge survey answers from localStorage
- Merge saved products (dedupe by ID)
- Merge routines (INSERT into user_routines)
- Merge search history
- Merge viewed products
- Merge location data
- Clear guest localStorage after merge
- MergeResult reporting

### Profile Management
- Create profile on signup (with guest data)
- Load profile from Supabase
- Update profile fields (bio, name, avatar, skin_type, concerns, preferences)
- Delete profile (data anonymization)
- Profile hydration cascade: Supabase → sessionState → localStorage
- Display name change with cooldown (30-day, 2 free changes)

---

## 3. Skin Survey & Profile System

### Survey Flow
- Multi-step quiz wizard
- Skin type question (oily, dry, combination, normal, sensitive)
- Primary concerns selection (acne, aging, hyperpigmentation, texture, etc.)
- Sensitivity level
- Complexion / Fitzpatrick type (I–VI)
- Allergen identification
- Lifestyle factors (sleep, stress, diet, water, exercise, environment)
- Product preferences (vegan, cruelty-free, fragrance-free, etc.)
- Budget range
- Age range (optional)

### Survey State Management
- Save answers to localStorage (skinSurveyData) during quiz
- Save to sessionState on completion
- Save to Supabase profile on login/signup
- Resume incomplete survey
- Retake survey (clear and restart)
- survey_completed flag on profile

### Profile Data Model
- Skin type (canonical: oily, dry, combination, normal, sensitive)
- Primary concerns (array)
- Sensitivity level
- Complexion / Fitzpatrick type
- Allergens (array)
- Lifestyle factors (object)
- Product preferences (object: vegan, crueltyFree, fragranceFree, etc.)
- Budget range
- Age range
- Sex at birth (for hormonal context)
- Acne type / scarring type (if applicable)

### Personalization Fallback Hierarchy
- Supabase profile (canonical source for auth users)
- Session state (tempSkinType, tempConcerns from in-session actions)
- localStorage skinSurveyData (guest persistence)
- Graceful degradation (no personalization, no crash)

### Effective Getters
- getEffectiveSkinType()
- getEffectiveConcerns()
- getEffectivePreferences()
- getEffectiveComplexion()
- getEffectiveSensitivity()
- getEffectiveLifestyle()

---

## 4. Routines

### Routine Builder
- Step-by-step routine creation
- AM/PM/both time-of-day assignment
- Product picker (browse and add from catalog)
- Custom step creation (non-product steps)
- Step reordering (drag-and-drop)
- Step removal
- Step editing
- Routine naming
- Routine description

### Conflict Detection
- Ingredient conflict engine (retinol + AHAs, etc.)
- Conflict popup with explanation
- Conflict severity levels
- Resolution suggestions

### AI Assistant
- AI-powered routine suggestions
- Step recommendations based on profile
- Product alternatives
- Ordering optimization

### Notes & Photos
- Per-routine notes (text)
- Photo attachments (Supabase Storage: routine-photos bucket)
- Notes timeline

### Version Control
- Automatic version snapshot on save
- Version history list
- Version diff (step-by-step changes)
- Version revert
- Change summary per version
- Version labeling

### Completion Tracking
- Daily AM/PM completion checkboxes
- Completion rate calculation
- Streak computation (current, longest, active)
- Completion persistence (localStorage)

### Analytics & Insights
- Usage event logging (created, updated, deleted, viewed)
- Automated insights generation (consistency, conflicts, progress)
- Insight severity levels
- Activity timeline (versions + notes + usage combined)

### Routine Persistence
- localStorage for guest users
- Supabase user_routines table for auth users
- Merge on signup (guest → account)
- Routine count tracking
- Active/inactive toggle

### Routine Resume
- Track last step, time filter, unfinished status
- Resume from where user left off

---

## 5. Products & Ingredients

### Product Data Model
- Canonical Product type (src/types/product.ts)
- Fields: id, name, brand, category, price, rating, reviewCount, image, description, skinTypes, concerns, keyIngredients, inStock, source, size, activeIngredients, timeOfDay, preferences
- ActiveIngredient sub-type (name, concentration, unit, isKeyActive)
- ProductCategory union type (14 categories)
- ProductSource (marketplace, discovery)
- ProductSize (value, unit)

### Product Categories (Registry)
- Cleanser, Toner, Serum, Essence, Moisturizer, Sunscreen, Treatment, Eye Care, Lip Care, Mask, Exfoliator, Oil, Mist, Tool
- getCategoryLabel() and getCategoryIcon() helpers

### Product Matching & Similarity
- scoreSimilarProducts() — weighted scoring (category, concerns, skin type, ingredients, preferences, ratings)
- findCompatibleProducts() — compatibility levels
- Concern matching with synonym mapping (matchesConcern)
- Ingredient matching (matchesIngredient)
- isProductRecommended() — boolean helper
- productMatchesUserConcerns() — array matching

### Product Safety
- assessProductSafety() — returns safe/caution/not-recommended
- Allergen checking against user profile
- Skin-type compatibility
- Contraindication detection
- Pregnancy safety flags

### Product Metrics
- Price per milliliter (PPML) calculation
- Concentration analysis
- Best/worst value comparison
- Highest concentration per ingredient
- convertToMl(), calculatePPML(), formatPPML()

### Product Metadata
- Skin type normalization (normalizeSkinTypes)
- isSkinTypeMatch()
- "All" skin type wildcard

### Time of Day Classification
- classifyTimeOfDay() — returns ['am'], ['pm'], or ['am', 'pm']
- AM_INGREDIENTS, PM_INGREDIENTS lists
- AM_KEYWORDS, PM_KEYWORDS lists
- 3-layer logic: keywords → ingredients → category defaults → fallback

### Ingredient Data
- Ingredient category registry (hydration, brightening, antiaging, soothing, exfoliation)
- Ingredient-to-product matching (getProductsForIngredient)
- Slug-to-name normalization map
- Ingredient encyclopedia (in AI knowledge base)
- Pregnancy-unsafe ingredient list
- Advanced ingredient list

### Search Index
- Unified search index builder (products + ingredients + pages)
- SearchResult shape (link, category, description)
- Category filter
- First-letter matching
- 9 canonical ingredients
- 6 page entries

### Mock Data
- products.ts — full product database with all schema fields
- Scales to Supabase when real data available

---

## 6. Reviews & Community

### Product Reviews
- Review display with reviewer info
- Similarity scoring (user-to-reviewer matching)
- Similarity tiers (Full ≥70, Strong ≥50, Partial ≥30, Related ≥15, None <15)
- Similarity badge with tier info
- Match breakdown (skin type, concerns, complexion, sensitivity, lifestyle, age)
- Helpful/report actions
- Review sorting (most similar, newest, highest rated)
- Review filtering
- ExplainWhyDropdown for similarity explanation
- Aspect ratings
- Review count display
- Star rating display

### Reviewer Similarity Engine
- calculateSimilarityWeight() — weighted scoring
- Weights: skin type (40), concern (15 each), complexion (±1 Fitzpatrick = 10), sensitivity (10), lifestyle (5), age (±5 years = 5)
- getTierBadgeInfo() — tier name, color, icon
- isComplexionMatch() — Fitzpatrick proximity check

### Retailer Reviews
- Retailer trust score display
- Trust score explanation
- Retailer-level aspect ratings (shipping, service, packaging, authenticity)
- Retailer comparison
- Sort by trust score, price, delivery
- Filter by features

### Community Features
- Community creation
- Community membership (join/leave)
- Community feed (posts)
- Post creation (text + images)
- Post interactions (likes, comments)
- Community discovery
- My communities list
- Member count
- Community moderation framework
- Content reporting

### Progress Sharing
- Skin journey updates
- Progress photos (with privacy controls)
- Optional sharing (never pressured)
- Progress framing (neutral, non-comparative)

---

## 7. Marketplace & Commerce

### Marketplace Product Listing
- Product grid with category browsing
- Search within marketplace
- Filter by category, price, rating
- Sort by relevance, price, newest
- Creator storefront attribution
- Trust score per seller

### Marketplace Product Detail
- Full product information
- Creator storefront link
- Stripe Checkout "Buy Now" button
- Subscription tier discount display (10% Plus, 20% Premium)
- Transaction tracking

### Checkout Flow
- create-marketplace-checkout Edge Function
- Stripe Checkout Session creation
- Platform fee calculation (10%)
- Creator payout calculation (90%)
- Subscription discount application
- marketplace_transactions record (pending → completed)
- MarketplaceSuccessPage (confirmation)

### Payment Webhook
- marketplace-payment-webhook Edge Function
- Stripe signature verification
- checkout.session.completed handler
- payment_intent.succeeded handler
- payment_intent.payment_failed handler
- transfer.created handler (creator payout)

### Subscription / Tiers
- subscription_plans table
- Free / Plus / Premium tiers
- create-subscription-checkout Edge Function
- Stripe subscription checkout
- Stripe customer creation/reuse
- Stripe price/product creation
- Tier-based marketplace discounts
- Tier display in UI

### Stripe Connect (Sellers)
- create-connect-account Edge Function
- Express account creation
- Onboarding link generation
- check-connect-status Edge Function
- Account verification (charges_enabled, payouts_enabled)
- create-connect-dashboard-link Edge Function
- stripe_connected_accounts table

### Affiliate System
- affiliate_partners table (tracking codes, commission rates)
- affiliate_clicks table (click tracking)
- affiliate_transactions table (conversions, cashback)
- affiliate-conversion Edge Function (click → transaction)
- affiliate-webhook Edge Function (external partner integration)
- AffiliateRedirectPage (click tracking + redirect)
- AffiliateDashboardPage (earnings display)
- Cashback calculation (purchase_amount × commission_rate)

### Rewards / Points
- curae_points table (user balance)
- points_transactions table (ledger)
- Point actions: signup (100), survey (50), review (25), community post (15), routine created (30), routine logged (5), purchase (1/$), referral (200), ingredient search (10), profile complete (75), monthly active (50)
- Tier thresholds: Bronze (0), Silver (500), Gold (2000), Platinum (5000)
- PointsDisplay component (tier, balance, progress)
- PointsEarnedNotification (toast)
- Point redemption
- Transaction history

### Cart
- Cart state management (cartState)
- Add/remove/update quantity
- Cart count badge
- Persist across sessions (localStorage)
- Checkout integration

---

## 8. AI Systems

### Chat Client
- callAIChatAPI() — Supabase Edge Function caller
- getClientContext() — gathers saved products, recently viewed, categories, searches
- Conversation history management
- Settings: tone, detail level, response style, custom instructions

### AI Chat Edge Function
- Anthropic Claude API integration (claude-3-5-sonnet)
- System prompt with skincare domain knowledge
- User profile context injection
- Routine notes context
- Product recommendation logic
- Ingredient intelligence
- Routine building guidance
- Safety guardrails (no medical claims)
- Domain restriction (skincare only)
- Tone enforcement (calm, premium, educational)

### Conversation Memory
- ConversationMemory class
- Memory categories: skin profile, product preferences, budget, experience level, ingredient preferences, routine preferences, goals, product history
- Confidence levels: explicit, inferred
- Memory persistence

### Intelligence Modules (26 modules)
- embeddings.ts — vector embeddings for semantic search
- vectorStore.ts — vector database management
- retrievalPipeline.ts — RAG pipeline
- productIngestion.ts — product data vectorization
- chatRetrieval.ts — retrieval for chat context
- knowledgeBase.ts — ingredient encyclopedia
- routineBuilder.ts — AI-assisted routine building
- ingredientIntelligence.ts — ingredient safety & compatibility
- concernIntelligence.ts — concern-specific reasoning
- skinProfileIntelligence.ts — skin type analysis
- searchRetrievalIntelligence.ts — search query understanding
- communicationIntelligence.ts — tone detection & response style
- errorHandlingIntelligence.ts — error detection & recovery
- workflowIntelligence.ts — workflow detection & management
- shoppingIntelligence.ts — product filtering & comparison
- routineOptimizationIntelligence.ts — routine conflict/ordering
- intentClassificationIntelligence.ts — user intent detection
- responseFormattingIntelligence.ts — response structure
- reasoningChainIntelligence.ts — multi-step reasoning
- modeSwitchingIntelligence.ts — context switching
- dataValidationIntelligence.ts — input validation
- productIntelligence.ts — product-specific knowledge
- behavioralIntelligence.ts — user behavior analysis
- navigationIntelligence.ts — route recommendation
- index.ts — module exports

### Adaptive AI (Legacy)
- AdaptiveAIEngine
- Topic detection (routine, products, ingredients, skin-analysis, concerns)
- Intent detection (information, learning, recommendation, troubleshooting, comparison)
- Contextual response generation

### Product Retrieval (Legacy)
- retrieveProducts() — relevance scoring
- retrieveByCategory()
- retrieveRoutineProducts()
- searchByIngredient()
- Budget range filtering (budget, mid, premium)
- formatProductForResponse(), formatRecommendations()

### AI Personalization Integration
- Profile-aware recommendations
- Saved product context
- Recently viewed context
- Frequent category context
- Search history context
- Routine notes context
- Concern-to-ingredient mapping
- Conflict-aware suggestions

---

## 9. Shared Components

### Layout Components
- AppLayout (root wrapper: Navbar + Outlet + Footer)
- PageWrapper (page styling, safe area, brand CSS)
- Navbar (mobile menu, search, cart, profile dropdown, scroll-based styling)
- Footer (links, newsletter, motion effects)

### Feature Components
- ProfileDropdown (guest/auth states, badges, quick stats, sign out)
- SearchOverlay (product/ingredient/page search, recently viewed, keyboard navigation)
- ComparisonPickerModal (select up to 3 products, side-by-side metrics, PPML)
- RetailerComparisonModal (3-column grid, price breakdown, trust score)
- CompatibleWith (4-column product grid, compatibility badges)
- SafetyBadge (not-recommended / caution, compact & expanded, tooltip)
- PointsDisplay (tier, balance, progress bar, benefits)
- PointsEarnedNotification (auto-dismiss toast)
- Toast (notification with auto-dismiss)
- ScrollToTop (scroll restoration on route change)
- LastVisitedPageRestorer (session continuity)
- PersistenceDebugPanel (dev-only localStorage viewer)

### UI Components
- Dropdown (accessible select alternative)
- Skeleton / SkeletonCard / SkeletonText (loading placeholders)
- ConcentrationRow (ingredient concentration display)

### Shared Components
- ExplainWhyDropdown (expandable explanation)

### Icon Components
- NeuralBloomIcon (Curae AI brand symbol)

---

## 10. Database & Backend

### Database Tables (26 total)

#### Core
- auth.users (Supabase Auth built-in)
- users_profiles (profiles, subscription tier, skin data, preferences)

#### Routines
- user_routines (routine data with JSONB steps)
- routine_versions (version history snapshots)
- routine_usage_events (analytics events)
- routine_notes (per-routine notes)
- routine-photos (Supabase Storage bucket)

#### Marketplace
- marketplace_products (seller products)
- marketplace_storefronts (seller storefronts)
- marketplace_transactions (purchase records)
- stripe_connected_accounts (seller Stripe accounts)
- subscription_plans (tier definitions)

#### Affiliate
- affiliate_partners (partner configs)
- affiliate_clicks (click tracking)
- affiliate_transactions (conversion records)

#### Rewards
- curae_points (user balance)
- points_transactions (ledger)

#### Community
- communities (user-created communities)
- community_members (membership)
- community_posts (posts)

#### Data Impact
- data_impact_contributions (opt-in tracking)
- anonymized_data_points (anonymized behavior data)

#### Nutrition
- meal_plans
- nutrient_goals
- daily_nutrient_intake
- nutrition_foods
- saved_meals

#### Other
- creator_waitlist (seller applications)
- avatars (avatar images)

### SQL Migrations
- user_routines table creation
- routine_usage_events table creation
- creator_waitlist table creation
- routine_versions table creation
- users_profiles survey_completed column
- Missing migrations for 22 application tables (need `supabase db pull`)

### RLS Policies
- user_routines: SELECT, INSERT, UPDATE, DELETE scoped to auth.uid()
- routine_versions: SELECT, INSERT scoped to auth.uid()
- routine_usage_events: SELECT, INSERT scoped to auth.uid()
- creator_waitlist: SELECT, INSERT scoped to auth.uid()
- users_profiles: RLS policies (need verification)
- Missing RLS for marketplace, affiliate, community, nutrition tables

### Edge Functions (13 total)
- affiliate-conversion (click → transaction)
- affiliate-webhook (external partner webhook)
- ai-chat (Claude AI skincare assistant)
- check-connect-status (Stripe Connect status)
- create-connect-account (Stripe Connect onboarding)
- create-connect-dashboard-link (seller dashboard link)
- create-marketplace-checkout (Stripe Checkout for marketplace)
- create-subscription-checkout (Stripe subscription checkout)
- data-anonymization (anonymize user data for research)
- marketplace-payment-webhook (Stripe payment webhook)
- geocode-location (server-side geocoding)
- get-uv-index (server-side UV lookup)
- password-check (early-access password validation)

### External API Integrations
- Anthropic Claude (AI chat)
- Stripe (payments, subscriptions, Connect)
- OpenCage (geocoding)
- OpenUV (UV index)

### Supabase Clients
- supabase-browser.ts (frontend client with persistence + auto-refresh)
- supabase.ts (types, profile CRUD operations)

---

## 11. State Management

### Observable State Managers (Singleton + Listener Pattern)
- sessionState (user interactions, preferences, personalization context)
- cartState (cart items, quantities)
- savedProductsState / favoritesState (saved products with Supabase sync)
- recentlyViewedState (recently viewed products, max 10)
- locationState (user location with lat/lon, hemisphere)
- routineCompletionState (daily completion tracking)
- routineProgressState (routine builder resume)

### Personalization Engine
- personalizationEngine.ts (rule-based recommendations)
- generateProductRecommendations()
- generateAIResponse()
- analyzeProgress()
- generateRoutineSuggestions()
- compareProducts()
- Daily logs (skin condition 1-5, mood, product usage)

### Matching Utilities
- matching.ts (concern synonym mapping, ingredient matching)
- reviewSimilarity.ts (user-to-reviewer matching)
- productSimilarity.ts (product-to-user matching)
- productSafety.ts (safety assessment)

### Hooks
- useLocalStorageState<T>() (generic localStorage hook)
- useDocumentTitle() (page title management)
- useUserLocation() (location state hook)
- useEnvironmentContext() (environment data hook)
- useCartCount(), useCartItems()
- useSavedProducts(), useSavedProductStatus()
- useRecentlyViewed()
- useRoutineCompletion()
- useRoutineProgress()
- useSessionState()
- useAuth()

### Environment Context
- EnvironmentContext type (location, UV, climate, season, source)
- buildEnvironmentContext() (pipeline orchestrator)
- inferClimate() (Köppen-like classification)
- inferSeason() (hemisphere + date)
- inferHemisphere() (lat → hemisphere)
- getUvIndex() (Edge Function caller)
- useEnvironmentContext() (React hook)

### Persistence Layers
- localStorage (guest state: cart, saved products, survey, routines, location, session)
- Supabase (auth state: profile, routines, versions, events, points)
- Session memory (in-memory during session via sessionState)

---

## 12. Error & Empty States

### Page-Level Error States
- Product not found (product detail with invalid ID)
- Route not found (404 NotFoundPage)
- Auth required (redirect to login)
- Profile loading error
- Network failure fallback

### Component-Level Empty States
- No products match filters (Discover)
- No saved products (Account)
- No routines (Routines List)
- No reviews (Product Detail reviews tab)
- No communities joined (Community)
- No posts in community feed
- No meal plans (Nutrition)
- No search results (SearchOverlay)
- No badges earned (Badges)
- No transaction history (Points)
- Empty cart

### Form Error States
- Login failed (invalid credentials)
- Signup failed (email taken, weak password)
- Password reset failed (invalid token)
- Profile save failed
- Location save failed
- Routine save failed
- Contact form submission failed
- Geolocation permission denied

### API Error States
- Supabase Edge Function failure (graceful fallback)
- AI chat API failure (error message to user)
- Stripe checkout failure
- UV index API failure (latitude-based estimation fallback)
- Geocoding API failure (fallback lookup table)

### Loading States
- Page-level Suspense fallback (spinner)
- Skeleton loaders (SkeletonCard, SkeletonText)
- Button loading states (spinner + disabled)
- Toast notifications for async operations

---

## 13. Image & Asset Loading

### Product Images
- Main product image
- Image gallery with thumbnails
- Fallback for missing images
- Lazy loading for off-screen images

### User Avatars
- Profile avatar display
- Avatar upload
- Fallback avatar (initials or default)
- Supabase Storage for avatar files

### Routine Photos
- Photo attachment in notes
- Supabase Storage: routine-photos bucket
- Image preview
- Upload progress indicator

### Brand Assets
- Logo
- NeuralBloomIcon (AI brand mark)
- Placeholder product SVG
- Retailer logos (via placeholder URLs)

### External Images
- Unsplash product photography
- Community post images
- Marketplace product images

---

## 14. Performance & Loading

### Code Splitting
- All 73 pages lazy-loaded via React.lazy()
- Suspense fallback with loading spinner
- Route-based code splitting

### State Performance
- Observable pattern with selective listeners (only re-render subscribers)
- localStorage reads cached in memory
- Debounced writes where applicable

### Build Optimization
- Vite production build
- Tree-shaking
- Chunk size warnings (>500kB index chunk)
- Manual chunks consideration for large dependencies

### API Performance
- Promise.all for parallel async calls (UV + climate + season)
- Cached environment context (re-fetch only on location change)
- Supabase connection reuse

---

## 15. Mobile Responsiveness

### Layout
- Mobile-first responsive design
- PageWrapper safe area support
- Responsive grid layouts (grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4)
- Max-width containers (max-w-7xl)

### Navigation
- Mobile hamburger menu (Navbar)
- Bottom-safe-area spacing
- Touch-friendly button sizes
- Scroll-based navbar styling

### Components
- Responsive product grids
- Collapsible sections on mobile
- Full-width modals on small screens
- Touch-friendly comparison picker
- Responsive settings tab layout

### Typography
- Responsive font scaling (text-3xl md:text-4xl)
- Readable line lengths on all screens
- Proper text wrapping (no overflow)

---

## 16. Accessibility

### Keyboard Navigation
- Escape key to close modals
- Focus management in modals
- focus-visible ring styling
- Keyboard-navigable search overlay
- Tab order for form controls

### ARIA
- aria-label on icon-only buttons
- aria-expanded on collapsible sections
- Role attributes on interactive elements
- Screen reader support for dynamic content

### Visual
- WCAG AA contrast compliance
- Reduced motion support (motion-safe: prefix)
- Sufficient touch targets (min 44px)
- Focus indicators

### Content
- Alt text on images
- Accessible form labels
- Error messages linked to fields
- Accessible dropdown alternative (Dropdown component)

### Accessibility Statement
- Dedicated /accessibility page
- WCAG compliance level
- Known limitations
- Contact for accessibility issues

---

## 17. Branding & Visual Identity

### Brand Colors (Tailwind Tokens)
- Terracotta (#C4704D) — primary
- Cream (#FDF8F5) — background
- Deep (#2D2A26) — text
- Sage (#7A8B7A) — accent
- Warm Gray (#6B635A) — secondary text
- Blush — border / divider

### Typography
- Headings: Cormorant Garamond (serif)
- Body: DM Sans (sans-serif)
- Consistent font-weight usage
- No additional font families

### Motion System
- Soft, slow, premium motion
- No bounce/spring/playful motion
- cubic-bezier curves from motionVariants.ts
- Framer Motion for scroll-triggered animations
- motion-safe: reduced motion fallbacks
- Duration tokens (fast, normal, slow)
- Easing tokens (natural, gentle)

### Component Patterns
- Rounded corners (rounded-xl, rounded-2xl)
- Soft shadows
- Cream/white card backgrounds
- Primary color CTAs
- Border-blush dividers
- Icon system (Remix Icon: ri-*)

### Brand Tone
- Calm, premium, educational, supportive
- Science-rooted, never salesy
- No exclamation marks unless requested
- No hype language
- No urgency/scarcity language

---

## 18. Routing & Navigation

### Router Configuration
- React Router v7
- Two layout groups: no-layout (auth, creator dashboard) and AppLayout (all public pages)
- All routes lazy-loaded with Suspense
- Catch-all 404 route

### Navigation Components
- Navbar with route links
- Footer with section links
- Breadcrumb navigation (product detail)
- Tab navigation (settings, account, nutrition, community)
- URL query param navigation (?tab=, ?id=)

### Route State
- URL params for product IDs (/product-detail/:id)
- Search params for filters and tabs
- ScrollToTop on route change
- LastVisitedPageRestorer for session continuity

### Deep Linking
- Settings tab deep link (/settings?tab=location)
- Product detail by ID (/product-detail/5)
- Marketplace product by ID (/marketplace/product/:id)
- Service by ID (/services/:id)
- Storefront by ID (/storefront/:id)
- Community post links

### Navigation Analytics
- sessionState.navigateTo() — track page navigation
- sessionState.trackInteraction() — track user interactions
- Recently viewed products on navigation

---

## 19. Internationalization

### i18n Setup
- i18next configuration
- Language detection (browser)
- Fallback language: English

### Supported Languages
- English (en)
- Spanish (es)
- French (fr)

### Translation Resources
- Common translation keys per language
- Language switcher in Settings → Preferences
- Language persistence (localStorage + Supabase)

---

## 20. Data Impact & Privacy

### Data Impact
- DataImpactPage (transparency dashboard)
- Opt-in data contribution program
- data_impact_contributions table
- Contribution count tracking
- Impact score

### Data Anonymization
- data-anonymization Edge Function
- Process user data (anonymize patterns)
- Generate anonymized insights (aggregated)
- Generate research datasets
- anonymized_data_points table
- User segment classification (tier + account age)
- No PII in output

### Data Deletion
- DataAnonymizationPage (user-facing deletion)
- deleteUserProfile() function
- Full account deletion flow
- Confirmation steps

### Privacy Controls
- Profile visibility toggle (Settings → Privacy)
- Show routines toggle
- Location data consent (explicit opt-in for geolocation)
- Location clear functionality
- Privacy policy page
- Privacy note on location settings

---

## 21. Environment & Location Personalization

### Location Data
- UserLocation type (city, state, zip, region, country, lat, lon, timezone, hemisphere)
- LocationStateManager (localStorage persistence)
- useUserLocation() hook
- Supabase profile sync (preferences.location)

### Environment Context
- EnvironmentContext type (location, uvIndex, uvBand, climate, season, source)
- Source modes: mock (no location), partial (text only), live (full coords)
- buildEnvironmentContext() pipeline
- useEnvironmentContext() React hook

### Inference Engines
- inferClimate() — Köppen-like lat/lon classification
- inferSeason() — hemisphere + date
- inferHemisphere() — lat → northern/southern
- estimateUvFromLatitude() — fallback UV estimation

### Edge Functions
- get-uv-index (OpenUV API wrapper with latitude fallback)
- geocode-location (OpenCage API wrapper with city fallback table)

### Settings UI
- Location tab with city/state/zip/country inputs
- "Use my current location" button (browser geolocation)
- Advanced lat/lon manual input (collapsible)
- "Clear my location" button
- Privacy note
- Geocoding on save (text → coords)
- Save to localStorage + Supabase

### UI Consumption
- Product detail: Location Fit Block (live/partial shown, mock hidden)
- Product search detail: Environment block (live/partial shown, mock hidden)
- Source-aware copy (personalized / partially personalized / default data)
- Location explanation modal

### Governance (CLAUDE.md §26)
- Never claim personalization when source === 'mock'
- All UV/climate/season must use useEnvironmentContext()
- No hard-coded environment values in components
- No direct external API calls from frontend
- Geolocation only on explicit user action

---

## 22. Testing & QA

### Type Safety
- TypeScript strict mode
- npx tsc --noEmit verification
- Canonical types in src/types/

### Build Verification
- npx vite build verification
- Chunk size monitoring
- Zero-error builds

### QA Execution Mode (CLAUDE.md §14)
- Post-implementation QA checklist
- PASS/FAIL per item
- Category-specific checklists (reviews, comparison, metadata, filters, personalization, shared components)
- Ship readiness assessment

### Cross-Surface Consistency (CLAUDE.md §12.15)
- Duplicate detection across pages
- Canonical version identification
- Alignment enforcement

### Future-Proofing (CLAUDE.md §15)
- Scales to real production data
- Reusable classification utilities
- No mock-specific logic
- Shared utilities instead of inline logic
- Entity registry compliance

---

## 23. Security

### Authentication Security
- HCaptcha on login/signup
- JWT-based session management
- Auto-refresh tokens
- Password validation

### Database Security
- RLS on all user-scoped tables
- Service role only for webhooks + analytics
- No service role key in frontend

### API Security
- All external APIs called server-side only (Edge Functions)
- Stripe webhook signature verification
- Environment variables for API keys
- No API keys in frontend code

### Content Security
- No user-generated HTML rendering (XSS prevention)
- Input validation on forms
- Rate limiting (via Supabase/Stripe)

### Password-Gated Access
- password-check Edge Function
- Early-access page protection
- Token-based session after password entry
