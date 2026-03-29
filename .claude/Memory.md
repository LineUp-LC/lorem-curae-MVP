# Project Memory — Debugging Insights & Patterns

## Confirmed Patterns

- `taupe` color class used in 90+ files but NOT in tailwind.config.ts — always use `warm-gray`
- Edge Functions are Deno runtime — imports use `esm.sh`, NOT npm packages
- Auto-imports cover all React hooks + Router + i18n — never manually import these
- Review data source: `src/mocks/reviews.ts` → `getReviewsForProduct()`
- Guest policy: rule-based fallback only, no API calls for unauthenticated users

## Correction Log

<!-- Format: [date] Mistake → Rule that prevents recurrence -->

## Debugging Insights

<!-- Format: [symptom] → [root cause] → [fix] -->
- AI summary timeout in RetailerReviews → Sonnet 4.5 used for 256-token task + 15s client timeout too tight for Deno cold start → Route lightweight modes (retailer_review_summary, curated_review_summary, natural_discovery) to Haiku 4.5 in ai-insight Edge Function; increase timeout to 25s
- surfaceClient.ts fetch() has no AbortController → hangs indefinitely if Edge Function stalls → only protected by Promise.race in consuming component (known gap, not fixed)
- Where to Buy sheet shows "Not available online" on search failure → `searchWhereToBuy` collapsed all errors (auth, timeout, network) into `null`, UI treated `null` same as empty results → Return `{ products, error }` instead, add error state UI with retry button. Note: `buy` type is in `RATE_LIMIT_EXEMPT` — rate limiter was never the cause

## Phase 1: Website Hub Restructure (Steps 2-3)

- Date: 2026-03-15
- Route config: 78 routes → 22 active, 56 commented out with DEFERRED labels
- Navbar: 7 links → 5 (Discover, Ingredients, Routines, AI Chat, Account)
- ProfileDropdown: removed 5 deferred links (-91 lines), kept auth + active routes
- Footer: removed Community column (4 deferred links, -22 lines), added Data Deletion to Support
- Files modified: src/router/config.tsx, src/components/feature/Navbar.tsx, src/components/feature/ProfileDropdown.tsx, src/components/feature/Footer.tsx
- Verification: all 9 checks passed (build, types, lint, onboarding flow, discover flow, auth flow, guest fallback, edge functions, dead imports)
- Deferred Work Tracker: created in Notion under Product Architecture (Pivot), 28 rows
- Step 4.1: Fixed 2 stale route refs (`/product/` → `/product-detail/`) in GuidedAssistantPanel.tsx, ProductComparison.tsx
- Step 4.2: Home Page Restructure
  - Removed MarketplaceSection from page.tsx (deferred feature, linked to /marketplace)
  - DifferentiationSection: removed 2 deferred bullets (community, marketplace), kept AI assistant bullet (ai-chat upgrade planned as detour)
  - TestimonialSection: removed Marketplace stat from stats array
  - Home page sections: 9 → 8 (MarketplaceSection removed)
  - Files modified: src/pages/home/page.tsx, DifferentiationSection.tsx, TestimonialSection.tsx
  - Verification: build, types, lint, grep check all passed
- Step 5: Shared Module Inventory
  - Scanned src/lib/ (103 files), src/components/feature/ (24 files), src/types/ (2 files)
  - 71 portable modules, 26 need adapters (localStorage/hooks), 3 web-only (lib/)
  - All 24 feature components are WEB ONLY (React Router, DOM, Tailwind, RemixIcon)
  - Both type files are PORTABLE
  - Key: StorageAdapter interface would make 26 adapter files portable (96% shared code)
  - Documented for future React Native extraction (Phase 6)
- Step 6: Phase 1 Final Regression
  - All checks passed: build, types, lint, dead imports, route integrity
  - Phase 1 Website Hub Restructure: COMPLETE

## Observations (Not Yet Patterns)

<!-- Items seen once. Promote to Confirmed Patterns after 2+ occurrences. -->
