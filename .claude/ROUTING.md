---
scope: "Query-pattern → file routing table for all governance files"
authority: primary
last_synced: "2026-03-14"
---

# Governance Routing Table

> When you need a rule, find your query below. Every row resolves to exactly 1 file.

---

## Workflow & Process

| Query Pattern | File |
|---------------|------|
| How to present changes / diff-first workflow | `rules/01-workflow.md` |
| What actions are forbidden without approval | `rules/01-workflow.md` |
| Session recovery / context limit handling | `rules/01-workflow.md` |
| Co-founder intelligence / proactive suggestions | `rules/01-workflow.md` |
| Output format requirements | `rules/01-workflow.md` |
| Role separation (developer vs product governance) | `rules/01-workflow.md` |

## Code Standards

| Query Pattern | File |
|---------------|------|
| Naming conventions (files, components, hooks, utils) | `rules/02-code-standards.md` |
| Import conventions / auto-imports list | `rules/02-code-standards.md` |
| File structure / where to put new files | `rules/02-code-standards.md` |
| Shared types rule / canonical type registry | `rules/02-code-standards.md` |
| Metadata "all" override behavior | `rules/02-code-standards.md` |
| Admin page data fetching pattern | `rules/02-code-standards.md` |
| ESLint / TypeScript config rules | `rules/02-code-standards.md` |

## Frontend & Design

| Query Pattern | File |
|---------------|------|
| Brand colors / Tailwind tokens | `rules/03-frontend.md` |
| Typography / font families | `rules/03-frontend.md` |
| Animation / motion system | `rules/03-frontend.md` |
| Copywriting tone and rules | `rules/03-frontend.md` |
| Component structure / states | `rules/03-frontend.md` |
| Accessibility / WCAG requirements | `rules/03-frontend.md` |
| Responsive breakpoints | `rules/03-frontend.md` |
| Premium design mindset / CTA tiers | `rules/03-frontend.md` |
| AI + UI visual coexistence | `rules/03-frontend.md` |
| taupe → warm-gray migration | `rules/03-frontend.md` |

## State & Personalization

| Query Pattern | File |
|---------------|------|
| Personalization data cascade (Supabase → session → localStorage) | `rules/04-state-management.md` |
| Cross-surface matching consistency | `rules/04-state-management.md` |
| State module registry (sessionState, cartState, etc.) | `rules/04-state-management.md` |
| Guest vs authenticated data flow | `rules/04-state-management.md` |
| Highlight profile / matching utilities | `rules/04-state-management.md` |
| Surface personalization registry | `rules/04-state-management.md` |

## AI Pipeline

| Query Pattern | File |
|---------------|------|
| AI reasoning guardrails / prohibited behaviors | `rules/05-ai-pipeline.md` |
| AI module registry (all 36 modules) | `rules/05-ai-pipeline.md` |
| Keyword highlighting governance / color tiers | `rules/05-ai-pipeline.md` |
| AI-to-personalization integration | `rules/05-ai-pipeline.md` |
| AI data integrity rules | `rules/05-ai-pipeline.md` |
| HighlightProfile interface | `rules/05-ai-pipeline.md` |
| Synonym maps (ingredient, concern, category, sentiment) | `rules/05-ai-pipeline.md` |
| Surface highlighting registry | `rules/05-ai-pipeline.md` |

## AI Product Voice & Content Safety

| Query Pattern | File |
|---------------|------|
| Content originality / copyright rules | `rules/06-ai-product-voice.md` |
| Claim verification workflow | `rules/06-ai-product-voice.md` |
| systemPrompt.ts ↔ CLAUDE_PRODUCT.md sync protocol | `rules/06-ai-product-voice.md` |
| Safety icon / risk explanation rules | `rules/06-ai-product-voice.md` |
| Cross-page content consistency | `rules/06-ai-product-voice.md` |
| Scientific accuracy pointers | `rules/06-ai-product-voice.md` |
| User-facing AI tone / voice / surface behavior | `ai-governance/CLAUDE_PRODUCT.md` |
| Prohibited phrasing / claim boundaries (§5) | `ai-governance/CLAUDE_PRODUCT.md` |
| AI surface-specific voice rules (§7) | `ai-governance/CLAUDE_PRODUCT.md` |

## Environment & Location

| Query Pattern | File |
|---------------|------|
| EnvironmentContext type definition | `rules/07-environment.md` |
| UV / climate / season pipeline | `rules/07-environment.md` |
| Location consent / privacy rules | `rules/07-environment.md` |
| Source determination (mock / partial / live) | `rules/07-environment.md` |
| Texture inference rules | `rules/07-environment.md` |
| Jargon-free environment copy | `rules/07-environment.md` |
| Product-fit narrative structure | `rules/07-environment.md` |
| Knowledge base maintenance | `rules/07-environment.md` |

## Commerce & Retailers

| Query Pattern | File |
|---------------|------|
| Trust score architecture | `rules/08-commerce.md` |
| Retailer data model / canonical type | `rules/08-commerce.md` |
| Retailer sorting / filtering | `rules/08-commerce.md` |
| Price freshness / staleness rules | `rules/08-commerce.md` |
| Sponsored / affiliate transparency | `rules/08-commerce.md` |
| Marketplace seller governance | `rules/08-commerce.md` |
| Stripe Connect / payment safety | `rules/09-security.md` |

## Security & Auth

| Query Pattern | File |
|---------------|------|
| Environment variables (frontend + Edge Function) | `rules/09-security.md` |
| Authentication flow / OTP verification | `rules/09-security.md` |
| Supabase safety rules | `rules/09-security.md` |
| Stripe safety rules | `rules/09-security.md` |
| Guest vs authenticated policy | `rules/09-security.md` |
| Safe development / deployment rules | `rules/09-security.md` |
| Auth route registry | `rules/09-security.md` |

## Data Layer

| Query Pattern | File |
|---------------|------|
| Supabase client configuration | `rules/10-data-layer.md` |
| Data access module registry | `rules/10-data-layer.md` |
| Edge Function registry (all 16) | `rules/10-data-layer.md` |
| Edge Function development rules | `rules/10-data-layer.md` |
| Database migration registry (all 8) | `rules/10-data-layer.md` |
| Migration safety rules | `rules/10-data-layer.md` |
| Mock data conventions | `rules/10-data-layer.md` |

## Testing & QA

| Query Pattern | File |
|---------------|------|
| Build validation commands | `rules/11-testing.md` |
| Full-functionality enforcement | `rules/11-testing.md` |
| QA execution mode / checklists | `rules/11-testing.md` |
| Post-implementation checklist | `rules/11-testing.md` |
| Verification protocols (flow, state, edge case) | `rules/11-testing.md` |
| Edge Function validation | `rules/11-testing.md` |

## Git

| Query Pattern | File |
|---------------|------|
| Branch naming conventions | `rules/12-git-workflow.md` |
| Commit message format | `rules/12-git-workflow.md` |
| Pre-commit checklist | `rules/12-git-workflow.md` |
| PR requirements | `rules/12-git-workflow.md` |
| Prohibited git operations | `rules/12-git-workflow.md` |

## Domain Features

| Query Pattern | File |
|---------------|------|
| Community UGC rules / matching | `rules/13-domain-features.md` |
| Creator ecosystem placeholder | `rules/13-domain-features.md` |
| Nutrition feature constraints | `rules/13-domain-features.md` |
| AR surface placeholder | `rules/13-domain-features.md` |
| Discovery filter governance | `rules/13-domain-features.md` |
| Future-proofing checklist | `rules/13-domain-features.md` |
| Entity registry | `rules/13-domain-features.md` |

## Consistency & Governance

| Query Pattern | File |
|---------------|------|
| Duplicate detection / canonical alignment | `rules/14-consistency.md` |
| Shared component propagation | `rules/14-consistency.md` |
| Full-site audit protocol | `rules/14-consistency.md` |
| Error graduation system (observation → pattern → rule) | `rules/14-consistency.md` |
| File governance (500-line limit, 100-file limit) | `rules/14-consistency.md` |

## Routing

| Query Pattern | File |
|---------------|------|
| Active route registry / route config | `rules/16-routing.md` |
| Navigation components (Navbar, Footer, ProfileDropdown) | `rules/16-routing.md` |
| Deferred route governance / uncommenting routes | `rules/16-routing.md` |
| Adding new routes / catch-all behavior | `rules/16-routing.md` |

## Camera Scan

| Query Pattern | File |
|---------------|------|
| Camera scan page / product scanner | `rules/17-camera-scan.md` |
| Image compression / resize pipeline | `rules/17-camera-scan.md` |
| product-scan Edge Function / Claude Vision | `rules/17-camera-scan.md` |
| Scan result types / ScanResult / ScanResponse | `rules/17-camera-scan.md` |
| Scan UX state machine (idle/captured/processing/result/error) | `rules/17-camera-scan.md` |
| Barcode / UPC scanning (future) | `rules/17-camera-scan.md` |

## Gamification

| Query Pattern | File |
|---------------|------|
| Points economy / POINTS_ACTIONS / tier thresholds | `rules/18-gamification.md` |
| Badge definitions / badge unlock logic | `rules/18-gamification.md` |
| Streak milestones / routine streaks | `rules/18-gamification.md` |
| Gamification triggers / onAction dispatcher | `rules/18-gamification.md` |
| Rewards dashboard / /rewards route | `rules/18-gamification.md` |
| Adding new points actions or badges | `rules/18-gamification.md` |
| Gamification database tables (curae_points, points_transactions, user_badges) | `rules/18-gamification.md` |

## Roadmap & Priority

| Query Pattern | File |
|---------------|------|
| Feature tier classification (MoSCoW) | `rules/15-roadmap.md` |
| Table stakes vs differentiators | `rules/15-roadmap.md` |
| Priority enforcement rules | `rules/15-roadmap.md` |
| Complexity proportionality | `rules/15-roadmap.md` |

## Business Context

| Query Pattern | File |
|---------------|------|
| Company identity / mission / vision | `business/identity.md` |
| Founder profile / origin story | `business/identity.md` |
| Brand voice / personality / values | `business/identity.md` |
| Product overview / value proposition | `business/product.md` |
| Feature list / roadmap phases | `business/product.md` |
| Tech stack / architecture details | `business/tech.md` |
| Target audience / personas | `business/audience.md` |
| Revenue model / pricing tiers | `business/business-model.md` |
| KPIs / metrics dashboard | `business/business-model.md` |
| Legal / compliance / constraints | `business/business-model.md` |
| Resources / bottlenecks | `business/business-model.md` |
| Competitor analysis / SWOT | `business/competitive.md` |
| Market size / TAM / SAM / SOM | `business/competitive.md` |
| White space / differentiation | `business/competitive.md` |
| Customer journey / funnel | `business/marketing.md` |
| Growth channels / partnerships | `business/marketing.md` |
| Habit loop design | `business/marketing.md` |
| Agent file routing table | `business/agent-guide.md` |
