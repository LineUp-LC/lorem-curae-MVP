---
scope: "Tech stack, architecture summary, Edge Functions, state management, design system"
authority: primary
last_synced: "2026-03-14"
sources: ["businessbrain/04-tech-stack.md"]
---

# Tech Stack & Architecture

---

## Tech Stack

**Frontend**: React 19.1.0 + TypeScript 5.8.3, Vite 7.0.3 + SWC, Tailwind CSS 3.4.17, React Router DOM 7.6.3 (78 lazy-loaded routes), Framer Motion 12.23.26, Recharts 3.2.0, @dnd-kit, i18next, html2canvas 1.4.1, unplugin-auto-import 19.3.0

**Backend (BaaS)**: Supabase (PostgreSQL, Auth, Edge Functions, RLS), @supabase/supabase-js 2.57.4, 15 Edge Functions (Deno runtime), 8 database migrations

**Database**: PostgreSQL (via Supabase) — tables for user routines, routine usage events, creator waitlist, routine versions, survey completion, retailer pricing, product catalog, admin RLS policies

**AI**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) via Supabase Edge Functions — 36 AI modules

**Hosting**: Cloudflare (scaling planned), Supabase hosted PostgreSQL + Edge Functions

**Auth**: Supabase Auth — Email/password + hCaptcha + 6-digit OTP, OAuth callback, guest → authenticated merge (guestMerge.ts), botid 1.5.10

**Payments**: Stripe + Stripe Connect (@stripe/react-stripe-js 4.0.2) — subscriptions (free/plus/premium), marketplace seller onboarding, checkout, affiliate tracking + webhooks

**Analytics**: Firebase 12.0.0 (push notifications + analytics)

**Email**: Resend (scaling planned)

**CI/CD**: ESLint 9.30 + typescript-eslint 8.35; vite build with sourcemaps; tsc --noEmit. No test runner configured.

**Security**: hCaptcha (@hcaptcha/react-hcaptcha 1.17.3), botid 1.5.10, Supabase RLS, data anonymization + password validation Edge Functions

**Third-party APIs**: Claude API (Anthropic), Stripe + Stripe Connect, Firebase, hCaptcha, UV Index API, Geocoding API, Affiliate networks (future), AR SDKs (future)

---

## Architecture Summary

**Scale**: 48 page directories, 78 lazy-loaded routes, 24 shared components, 36 AI modules, 43 business logic utilities, 15 Edge Functions, 8 database migrations

**State Management**: Global auth (React Context), session profile (sessionState.ts), persistence (localStorage for guests, Supabase for authenticated), dedicated modules for cart, routines, favorites, recently viewed, location

**Personalization Data Flow**: Supabase profile → sessionState → localStorage → graceful null fallback

**Environment Pipeline**: Browser geolocation (opt-in) → geocode Edge Function → UV index → climate inference → season inference → texture inference → useEnvironmentContext() → UI

**AI Architecture**: Surface/page → buildAIContext() (9 modes) → buildSystemPrompt() (5 layers) → surfaceClient → ai-insight Edge Function → Claude Sonnet 4.5 → response → highlightRelevantKeywords() → AIInsightBlock

**Design System**: 8 brand colors + 2 legacy with full 50-900 scales. Fonts: Cormorant Garamond (headings), Inter/DM Sans (body). 14 keyframe animations, 6 duration tokens, 5 easing tokens. Breakpoints: xs(375)/sm(640)/md(768)/lg(1024)/xl(1280)/2xl(1536)

**Payment Flows**: Stripe subscriptions (free/plus/premium), Stripe Connect for marketplace, affiliate conversion tracking + webhooks

---

## Supabase Edge Functions (15)

| Function | Domain |
|----------|--------|
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
