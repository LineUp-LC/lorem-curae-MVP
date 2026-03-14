# Agent System — Lorem Curae

## Overview

Sub-agents handle specialized tasks that benefit from focused context and parallel execution. Each agent operates with a defined scope, tool set, and turn budget.

This file also provides project context for agents that don't inherit conversation history.

---

## Delegation Rules

- Delegate when the task matches an agent's specialty and would benefit from isolated context
- Do NOT delegate simple single-file edits or quick lookups
- Do NOT delegate tasks that require the full conversation history
- Agents return a single result — summarize it for the user
- Multiple independent agents can run in parallel

## Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| Reviewer | `reviewer.md` | Zero-context code review (no project bias) |
| Research | `research.md` | Web research + synthesis |
| QA Testing | `qa-testing.md` | Post-implementation QA validation |

## Model Selection

- Sub-agents: `claude-sonnet-4-5-20250929` (fast, cost-efficient)
- Complex architectural review: `claude-opus-4-6` (when depth matters)
- Quick searches: `haiku` model via Task tool

## Memory Scope

- Agents do NOT inherit conversation history unless explicitly provided in the prompt
- Agents do NOT write to Memory.md — only the parent session writes memory
- Agent results are ephemeral — capture important findings in the parent session

---

## Project Context (for Sub-Agents)

Lorem Curae: personalized skincare guidance SPA built with Vite + React 19 + TypeScript + Tailwind CSS + Supabase + Stripe.

### Build & Validation

```sh
npm run dev              # Vite dev server on port 3000
npm run build            # Production build → out/
npm run lint             # ESLint on src/**/*.{ts,tsx}
npm run type-check       # tsc --noEmit --project tsconfig.app.json
```

No test runner configured. Validation = `type-check` + `build` + `lint` (all must pass).

### Code Style Quick Reference

- Path alias: `@` → `src/`
- Auto-imports enabled — do NOT manually import `useState`, `useEffect`, `useNavigate`, `useTranslation`, `Link`, etc.
- Files: `camelCase.ts` (utils), `PascalCase.tsx` (components), `page.tsx` (routes)
- Business logic in `src/lib/utils/` — never inline in components
- Canonical types in `src/types/` — no duplicate interfaces
- Full details: `.claude/rules/code-style.md`

### Architecture

```
src/
├── pages/**/page.tsx            # Route pages (40+ routes, lazy-loaded)
├── components/feature/          # Shared UI components (24 files)
├── lib/
│   ├── ai/                      # AI integration (surfaceContext, systemPrompt, surfaceClient)
│   ├── auth/                    # Auth utilities
│   ├── environment/             # UV, climate, season pipeline
│   ├── utils/                   # Business logic (50+ modules)
│   └── supabase.ts              # Supabase client
├── mocks/                       # Mock data (products, reviews, ingredients)
├── types/                       # Canonical types (product.ts, retailer.ts)
├── router/config.tsx            # All route definitions
└── i18n/                        # Internationalization
supabase/
├── functions/                   # 15 Edge Functions (Deno runtime — NOT Vite/tsc)
└── migrations/                  # 8 SQL migrations
```

### Key Patterns

- **Personalization** cascades: Supabase profile → sessionState → localStorage → graceful null
- **Edge Functions** use Deno with `esm.sh` imports — separate from Vite/tsc build
- **AI model**: Claude Sonnet 4.5 via `supabase/functions/ai-insight/index.ts`
- **Guest users**: rule-based fallback only — no Supabase calls, no API calls, never crash

### Important Shared Utilities

| Utility | Path | Never Inline This |
|---------|------|-------------------|
| Concern/ingredient matching | `src/lib/utils/matching.ts` | Filter relevance, highlight logic |
| Reviewer similarity scoring | `src/lib/utils/reviewSimilarity.ts` | Review-to-user matching |
| Product similarity scoring | `src/lib/utils/productSimilarity.ts` | Product recommendations |
| Environment fit | `src/lib/utils/environmentFit.ts` | Location-based explanations |
| Retailer pricing | `src/lib/utils/retailerPricing.ts` | Price display, freshness |
| Product metadata | `src/lib/utils/productMetadata.ts` | `isAllMetadata()`, display labels |
| AI keyword highlighting | `src/lib/utils/highlightKeywords.tsx` | All AI text surfaces |

### Security (Hard Rules)

- NEVER hardcode secrets — use `process.env` (Vite) or `Deno.env.get()` (Edge Functions)
- NEVER commit `.env` files
- NEVER modify RLS policies, auth logic, or Stripe logic without approval
- NEVER fabricate product data or make medical claims
- Full details: `.claude/rules/security.md`

### Common Pitfalls

| Mistake | Rule |
|---------|------|
| Manually importing `useState`, `useNavigate`, etc. | Auto-imported — do not add import statements |
| Using `taupe` in Tailwind classes | Not in config — use `warm-gray` instead |
| Inline matching/scoring in components | Use shared utilities from `src/lib/utils/` |
| Calling Supabase/AI APIs for guest users | Guest = rule-based fallback only |
| Importing npm packages in Edge Functions | Use Deno imports from `esm.sh` |
| Running `type-check` on Edge Functions | Deno runtime, not part of Vite/tsc build |

### Governance Files

| File | Scope |
|------|-------|
| `.claude/CLAUDE.md` | Project rules, module registry, rule index |
| `.claude/rules/` | 16 detailed rule files by domain |
| `ai-governance/CLAUDE_PRODUCT.md` | User-facing AI tone, safety, content |
| `src/lib/ai/systemPrompt.ts` | Runtime product governance (must sync with CLAUDE_PRODUCT.md) |

This is NOT a monorepo. No nested `AGENTS.md` files needed.
