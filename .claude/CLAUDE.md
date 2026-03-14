# Lorem Curae — Project Rules & Developer Governance

Personalized skincare SPA. Vite + React 19 + TypeScript + Tailwind CSS + Supabase + Stripe.

---

## Commands

```sh
npm run dev          # Vite dev server on port 3000
npm run build        # Production build → out/
npm run preview      # Preview production build
npm run lint         # ESLint (src/**/*.{ts,tsx})
npm run type-check   # tsc --noEmit --project tsconfig.app.json
```

No test runner configured. No test files exist.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 7 + SWC |
| Styling | Tailwind CSS 3.4 + custom brand tokens |
| Routing | React Router v7 (78 lazy-loaded routes) |
| Backend | Supabase (PostgreSQL, Auth, 15 Edge Functions) |
| State | React Context + localStorage observables |
| Payments | Stripe + Stripe Connect |
| AI | Claude Sonnet 4.5 via Supabase Edge Function |
| Animation | Framer Motion + Tailwind keyframes |
| Auto-imports | unplugin-auto-import (React hooks, Router, i18n) |

---

## File Organization

```
src/
├── pages/**/page.tsx            # Route pages (lazy-loaded, 40+ routes)
├── components/feature/          # Shared UI components (24 components)
├── lib/
│   ├── ai/                      # AI integration (surfaceContext, systemPrompt, surfaceClient)
│   ├── auth/                    # Auth utilities
│   ├── environment/             # UV, climate, season pipeline
│   ├── utils/                   # Business logic (50+ modules)
│   └── supabase.ts              # Supabase client
├── mocks/                       # Mock data (products, reviews, ingredients)
├── types/                       # Canonical types (product.ts, retailer.ts)
├── router/                      # Route config + navigation
└── i18n/                        # Internationalization
supabase/
├── functions/                   # 15 Edge Functions (Deno runtime — NOT Vite/tsc)
└── migrations/                  # 8 SQL migrations
```

---

## Key Conventions

- **Path alias:** `@` → `src/`
- **Auto-imports:** useState, useEffect, useNavigate, useTranslation, Link, etc. — never manually import these
- **Pages:** `src/pages/**/page.tsx` — one per route, lazy-loaded via `src/router/config.tsx`
- **Shared components:** `src/components/feature/` — reusable across pages
- **Business logic:** `src/lib/utils/` — never inline in components
- **Types:** `src/types/` — canonical definitions for cross-file entities
- **Edge Functions:** Deno runtime with `esm.sh` imports — completely separate from Vite build

---

## Critical Module Registry

### State Modules

| Module | Path | Key Exports |
|--------|------|-------------|
| sessionState | `src/lib/utils/sessionState.ts` | `getEffectiveSkinType()`, `getEffectiveConcerns()`, `getEffectiveSensitivity()` |
| cartState | `src/lib/utils/cartState.ts` | Cart operations |
| routineState | `src/lib/utils/routineState.ts` | Routine CRUD |
| favoritesState | `src/lib/utils/favoritesState.ts` | Saved products |
| matching | `src/lib/utils/matching.ts` | `matchesIngredient()`, concern matching |
| reviewSimilarity | `src/lib/utils/reviewSimilarity.ts` | `calculateSimilarityWeight()` |
| productSimilarity | `src/lib/utils/productSimilarity.ts` | Product-to-user scoring |
| environmentFit | `src/lib/utils/environmentFit.ts` | `generateEnvironmentFitExplanation()` |
| personalizationEngine | `src/lib/utils/personalizationEngine.ts` | Personalization scoring |

### AI Modules

| Module | Path | Purpose |
|--------|------|---------|
| surfaceContext | `src/lib/ai/surfaceContext.ts` | Unified context builder (9 AI modes) |
| systemPrompt | `src/lib/ai/systemPrompt.ts` | 5-layer system prompt builder |
| surfaceClient | `src/lib/ai/surfaceClient.ts` | Client-side caller (caching + fallback) |
| AIInsightBlock | `src/components/feature/AIInsightBlock.tsx` | Shared AI rendering component |
| ai-insight | `supabase/functions/ai-insight/index.ts` | Edge Function (Claude Sonnet 4.5) |
| highlightKeywords | `src/lib/utils/highlightKeywords.tsx` | AI keyword highlighting utility |

---

## Rule Files — Read When Triggered

| Rule File | Trigger | Covers |
|-----------|---------|--------|
| `workflow.md` | Implementing features, making decisions, session recovery | Core workflow, diff-first, forbidden actions, UX reasoning, co-founder intelligence, role separation |
| `code-style.md` | Writing components, naming, formatting | Naming, formatting, imports, file structure, shared types, metadata "all", admin patterns |
| `frontend.md` | Editing React, Tailwind, animations, layout, design system | Colors, typography, motion, premium design, copywriting, components, cross-surface consistency, accessibility |
| `testing.md` | Running builds, type-checking, QA | Validation protocol, full-functionality enforcement, QA execution mode, verification protocols |
| `security.md` | Auth, env vars, API keys, Supabase, Stripe, deployment | Env vars, safe dev, auth flow (OTP), Supabase/Stripe safety, guest vs authenticated |
| `git-workflow.md` | Commits, branches, PRs | Branch naming, commit format, pre-commit checklist, PR requirements |
| `retailer.md` | Retailer data, trust scores, pricing, sorting | Trust score architecture, data model, sorting/filtering, affiliate transparency, price freshness |
| `personalization.md` | Personalized content, matching, highlighting | Data model, fallback hierarchy, cross-surface matching, surface registry, content utilities |
| `ai-governance.md` | AI features, chat, recommendations, highlighting | AI guardrails, module registry, systemPrompt sync protocol, keyword highlighting governance |
| `environment.md` | UV, climate, season, location, product-fit | EnvironmentContext type, canonical modules, source determination, consent/privacy, jargon-free rules |
| `consistency.md` | Shared components, duplicates, site audits | Duplicate detection, global propagation, prop consistency, full-site audit |
| `roadmap.md` | Feature scoping, priority, architectural decisions | MoSCoW tiers, table stakes vs differentiators, complexity proportionality |
| `future-proofing.md` | Any new feature or modification | Scalability checks, entity registry, reusable utilities, mock-free architecture |
| `content-safety.md` | Ingredient descriptions, safety explanations, product content | Copyright safety, scientific accuracy, claim verification, cross-page consistency |
| `domain-features.md` | Marketplace, community, creator, nutrition, AR, discovery | Seller onboarding, UGC rules, community matching, discovery filters, placeholder governance |
| `file-governance.md` | Creating or editing .md files | 500-line max for .md files, 100-file max per rule folder |

---

## Governance Files

| File | Scope |
|------|-------|
| `.claude/CLAUDE.md` (this file) | Project rules, module registry, rule index |
| `.claude/rules/` | 16 rule files covering all governance domains |
| `ai-governance/CLAUDE_PRODUCT.md` | User-facing AI tone, safety, content rules |
| `src/lib/ai/systemPrompt.ts` | Runtime CLAUDE_PRODUCT.md (sync protocol in `ai-governance.md`) |
| `.claude/rules/businessbrain/` | Business context (21 files) |

---

## Stacking Order (Priority)

1. Core workflow rules (`workflow.md`)
2. Code style & architecture (`code-style.md`)
3. Frontend design system (`frontend.md`)
4. Security & safe development (`security.md`)
5. Testing & QA enforcement (`testing.md`)
6. Retailer architecture (`retailer.md`)
7. Personalization engine (`personalization.md`)
8. AI safety & governance (`ai-governance.md`)
9. Environment & location (`environment.md`)
10. Consistency & propagation (`consistency.md`)
11. Roadmap governance (`roadmap.md`)
12. Future-proofing (`future-proofing.md`)
13. Content accuracy & safety (`content-safety.md`)
14. Domain features (`domain-features.md`)
15. File governance (`file-governance.md`)
16. Git workflow (`git-workflow.md`)

These layers augment each other. They do NOT override — they extend and reinforce.

---

## Core Rules (Always Active)

### Brand Identity
- Colors: Terracotta `#C4704D`, Cream `#FDF8F5`, Deep `#2D2A26`, Sage `#7A8B7A`, Warm Gray `#6B635A`
- Fonts: Cormorant Garamond (headings), DM Sans (body)
- Tone: Calm, premium, educational, supportive, science-rooted — never salesy
- Motion: Soft, slow, premium — no bounce, spring, or playful animation
- `taupe` is used in 90+ files but NOT in Tailwind — use `warm-gray` instead

### Coding
- Match existing patterns in the file being edited
- All business logic in `src/lib/utils/` — never inline in components
- All matching logic via shared utilities — never inline
- Canonical types in `src/types/` — no duplicate interfaces
- `"all"` metadata: use `isAllMetadata()` from `productMetadata.ts`
- Guest users: rule-based fallback only (no API calls, never crash)

### Personalization Data Flow
1. Supabase profile (authenticated — canonical)
2. Session state (quiz completion, in-memory)
3. localStorage (persisted guest state)
4. Graceful degradation (no highlights, no crash)

Never assume personalization data exists. Every component handles null/empty.

### AI
- Model: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- Never make medical diagnoses or guarantee results
- Always cite basis for recommendations
- Defer to professionals for medical concerns
- All highlighting via `highlightRelevantKeywords()` — never inline
- `systemPrompt.ts` must stay in sync with `CLAUDE_PRODUCT.md`

### Forbidden Without Explicit Approval
- Modify Supabase Edge Functions, auth logic, Stripe logic
- Change routing structure
- Add or remove dependencies
- Change brand colors, fonts, or motion system
- Apply database migrations
- Run destructive git commands
- Apply changes without user confirmation

---

## Navigation Quick Reference

| Looking for... | Go to |
|----------------|-------|
| Route definitions | `src/router/config.tsx` |
| A specific page | `src/pages/<name>/page.tsx` |
| Shared UI component | `src/components/feature/<Name>.tsx` |
| Business logic utility | `src/lib/utils/<name>.ts` |
| Canonical type | `src/types/<entity>.ts` |
| Environment pipeline | `src/lib/environment/` |
| AI integration | `src/lib/ai/` |
| Mock data | `src/mocks/` |
| Edge Function | `supabase/functions/<name>/index.ts` |
| Tailwind config | `tailwind.config.ts` |
| Vite config | `vite.config.ts` |
| Product AI voice | `ai-governance/CLAUDE_PRODUCT.md` |
| Business context | `.claude/rules/businessbrain/` |
