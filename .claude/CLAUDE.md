# Lorem Curae — Project Rules

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

## Rule Index

| # | File | Scope |
|---|------|-------|
| 01 | `rules/01-workflow.md` | Diff-first, output format, forbidden actions, co-founder intelligence |
| 02 | `rules/02-code-standards.md` | Naming, formatting, imports, patterns, admin data fetching |
| 03 | `rules/03-frontend.md` | Design system, motion, copywriting, components, accessibility |
| 04 | `rules/04-state-management.md` | Personalization cascade, matching, surface registry, state modules |
| 05 | `rules/05-ai-pipeline.md` | AI guardrails, module registry, highlighting governance |
| 06 | `rules/06-ai-product-voice.md` | Content originality, copyright, claim verification, systemPrompt sync |
| 07 | `rules/07-environment.md` | UV, climate, season, location, texture inference, jargon-free rules |
| 08 | `rules/08-commerce.md` | Retailer data, trust scores, pricing, sorting, marketplace governance |
| 09 | `rules/09-security.md` | Auth, env vars, Supabase safety, Stripe safety, guest vs authenticated |
| 10 | `rules/10-data-layer.md` | Supabase client, data access, Edge Functions, migrations, mock data |
| 11 | `rules/11-testing.md` | Build validation, QA protocol, verification, checklists |
| 12 | `rules/12-git-workflow.md` | Commits, branches, PRs, pre-commit checklist |
| 13 | `rules/13-domain-features.md` | Community, creator, nutrition, AR, discovery, future-proofing |
| 14 | `rules/14-consistency.md` | Duplicate detection, propagation, audits, error graduation, file governance |
| 15 | `rules/15-roadmap.md` | Feature tiers (MoSCoW), priority enforcement |
| 16 | `rules/16-routing.md` | Active routes, deferred route governance, navigation components |
| 17 | `rules/17-camera-scan.md` | Scan page, product-scan Edge Function, image pipeline, Claude Vision |

> Full query-pattern routing: `.claude/ROUTING.md`

---

## Business Context

| File | Scope |
|------|-------|
| `business/identity.md` | Company, founder, brand voice |
| `business/product.md` | Product overview, features, roadmap |
| `business/tech.md` | Tech stack, architecture, Edge Functions |
| `business/audience.md` | Target audience, personas, pain points |
| `business/business-model.md` | Revenue, pricing, metrics, legal, resources |
| `business/competitive.md` | Competitors, strategy, white space, SWOT |
| `business/marketing.md` | Funnel, growth channels, references, habit loops |
| `business/agent-guide.md` | Agent routing table |

> Full query-pattern routing: `.claude/business/_index.md`

---

## Governance Files

| File | Scope |
|------|-------|
| `.claude/CLAUDE.md` | This file — master index |
| `.claude/ROUTING.md` | Query-pattern → file routing table |
| `ai-governance/CLAUDE_PRODUCT.md` | User-facing AI tone, safety, content rules |
| `src/lib/ai/systemPrompt.ts` | Runtime mirror of CLAUDE_PRODUCT.md |

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
| Business context | `.claude/business/` |
