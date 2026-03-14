<!-- Brain Rule: Tech Stack & Architecture -->
<!-- Scope: Engineering agents, QA agents, reviewer agents, research agents -->
<!-- Source: businessbrain.md §3 (Tech Stack, Architecture Summary, Edge Functions) -->
<!-- Last updated: 2026-03-14 -->

# Tech Stack & Architecture

## Tech Stack

**Frontend**:
- React 19.1.0 + TypeScript 5.8.3
- Vite 7.0.3 (bundler) + @vitejs/plugin-react-swc 3.10.2
- Tailwind CSS 3.4.17
- React Router DOM 7.6.3 (78 lazy-loaded routes)
- Framer Motion 12.23.26 (animation)
- Recharts 3.2.0 (charts/data viz)
- @dnd-kit (drag & drop)
- i18next + react-i18next + browser-languagedetector (internationalization)
- html2canvas 1.4.1 (screenshots)
- unplugin-auto-import 19.3.0

**Backend (BaaS)**:
- Supabase (PostgreSQL, Auth, Edge Functions, Row Level Security)
- @supabase/supabase-js 2.57.4
- 15 Supabase Edge Functions (Deno runtime)
- 8 database migrations

**Database**: PostgreSQL (via Supabase) — tables for user routines, routine usage events, creator waitlist, routine versions, survey completion, retailer pricing, product catalog, admin RLS policies

**AI**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) via Supabase Edge Functions — 36 AI modules covering surface context, system prompts, chat, discovery, guided assistant, embeddings, vector store, RAG retrieval, knowledge base, product/ingredient/routine/skin intelligence, behavioral/communication/reasoning intelligence, workflow orchestration

**Hosting / Infrastructure**: Cloudflare (scaling planned), Supabase hosted PostgreSQL + Edge Functions

**Auth**: Supabase Auth — Email/password signup + hCaptcha + 6-digit OTP email verification, OAuth callback, password reset, periodic email verification, guest -> authenticated merge (guestMerge.ts), botid 1.5.10 bot detection

**Payments**: Stripe + Stripe Connect (@stripe/react-stripe-js 4.0.2) — subscriptions (free/plus/premium), marketplace seller onboarding, marketplace checkout, affiliate conversion tracking + webhooks

**Analytics / Tracking**: Firebase 12.0.0 (push notifications + analytics)

**Email / Notification service**: Resend (scaling planned)

**CI/CD**: ESLint 9.30 + typescript-eslint 8.35; vite build with sourcemaps; tsc --noEmit type checking. No test runner configured yet.

**Security**: hCaptcha (@hcaptcha/react-hcaptcha 1.17.3), botid 1.5.10, Supabase RLS policies, data anonymization Edge Function, password validation Edge Function

**Key third-party APIs / integrations**: Claude API (Anthropic) for Curae AI, Stripe + Stripe Connect, Firebase, hCaptcha, UV Index API, Geocoding API, Affiliate networks (Skimlinks, Rakuten, Impact — future), AR SDKs (future)

## Architecture Summary

**Scale**: 48 page directories, 78 lazy-loaded routes, 24 shared components, 36 AI modules, 43 business logic utilities, 15 Edge Functions, 8 database migrations

**State Management**:
- Global auth: React Context (AuthContext.tsx)
- Session profile: sessionState.ts (in-memory + localStorage)
- Persistence: localStorage for guests, Supabase for authenticated
- Cart, routines, favorites, recently viewed, location: dedicated state modules with localStorage + Supabase sync

**Personalization Data Flow**: Supabase profile -> sessionState -> localStorage -> graceful null fallback

**Environment Pipeline**: Browser geolocation (opt-in) -> geocode-location Edge Function -> UV index -> climate inference (Koppen-like) -> season inference (hemisphere-aware) -> texture inference -> useEnvironmentContext() hook -> all UI

**AI Architecture**: Surface/page -> buildAIContext() (9 modes) -> buildSystemPrompt() (5 layers) -> surfaceClient -> ai-insight Edge Function -> Claude Sonnet 4.5 -> response -> highlightRelevantKeywords() -> AIInsightBlock render

**Design System**: 8 brand color tokens (primary, cream, deep, sage, warm-gray, blush, light, dark) + 2 legacy (coral, forest) with full 50-900 scales. Fonts: Cormorant Garamond (serif headings), Inter/DM Sans (body). 14 keyframe animations, 6 duration tokens, 5 easing tokens. Breakpoints: xs(375) / sm(640) / md(768) / lg(1024) / xl(1280) / 2xl(1536)

**Payment Flows**: Stripe subscriptions (free/plus/premium tiers), Stripe Connect for marketplace sellers, marketplace checkout, affiliate conversion tracking + webhooks

**Governance**: CLAUDE.md (2177-line developer governance, 32 sections), .claude/CLAUDE.md (compact rules + module registry), ai-governance/CLAUDE_PRODUCT.md (user-facing AI tone/safety/content rules), src/lib/ai/systemPrompt.ts (runtime-compiled product governance), .claude/rules/ (5 rule files: code-style, frontend, git, security, testing)

## Supabase Edge Functions (15)

| Function | Domain |
|---|---|
| ai-insight | AI — Claude Sonnet 4.5 proxy |
| ai-chat | AI — conversational chat |
| get-uv-index | Environment — UV API wrapper |
| geocode-location | Environment — geocoding wrapper |
| ingest-retailer-feed | Data — retailer pricing ingestion |
| create-connect-account | Stripe Connect — seller onboarding |
| create-connect-dashboard-link | Stripe Connect — dashboard links |
| check-connect-status | Stripe Connect — status checks |
| create-marketplace-checkout | Stripe — marketplace purchases |
| create-subscription-checkout | Stripe — subscription flow |
| marketplace-payment-webhook | Stripe — payment webhook handler |
| affiliate-conversion | Affiliate — conversion tracking |
| affiliate-webhook | Affiliate — webhook handler |
| data-anonymization | Privacy — user data anonymization |
| password-check | Security — password validation |
