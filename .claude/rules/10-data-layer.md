---
scope: "Supabase queries, RLS, migrations, Edge Functions, data access patterns, mock data conventions"
authority: primary
last_synced: "2026-03-14"
related: ["09-security.md", "11-testing.md"]
---

# Data Layer

---

## Supabase Client

- Client: `src/lib/supabase.ts` — throws if `VITE_PUBLIC_SUPABASE_URL` or `VITE_PUBLIC_SUPABASE_ANON_KEY` missing
- Browser helper: `src/lib/supabase-browser.ts`
- All client-side queries go through the anon key with RLS enforcement
- Service role key used only in Edge Functions (bypasses RLS)

---

## Data Access Modules

| Module | Path | Purpose |
|--------|------|---------|
| products | `src/lib/data/products.ts` | Product data access |
| supabaseProducts | `src/lib/data/supabaseProducts.ts` | Supabase product queries |
| supabaseProductsAdmin | `src/lib/data/supabaseProductsAdmin.ts` | Admin product operations |
| retailerData | `src/lib/utils/retailerData.ts` | Retailer data access |
| productRetrieval | `src/lib/utils/productRetrieval.ts` | Product data fetching |

---

## Edge Functions (Deno Runtime)

16 Edge Functions in `supabase/functions/`. These run on Deno — NOT part of Vite/tsc build.

| Function | Domain |
|----------|--------|
| ai-insight | AI — Claude Sonnet 4.5 proxy |
| ai-chat | AI — conversational chat |
| product-scan | AI — Claude Vision product identification |
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

### Edge Function Rules
- Use `Deno.serve()` pattern
- Imports from `esm.sh` (not npm)
- Cannot be validated with `npm run type-check`
- Validate manually: check import paths, verify `Deno.serve` pattern
- Test via `supabase functions serve` if local Supabase is running
- Never modify without explicit approval

---

## Database Migrations

9 migrations in `supabase/migrations/`:

| Migration | Purpose |
|-----------|---------|
| `20240214000000_create_user_routines_table` | User routines |
| `20240215000000_create_routine_usage_events` | Routine tracking events |
| `20240215000001_create_creator_waitlist` | Creator waitlist |
| `20260215000000_create_routine_versions` | Routine versioning |
| `20260220000000_add_survey_completed` | Survey completion tracking |
| `20260306000000_create_retailer_pricing_tables` | Retailer pricing |
| `20260308000000_create_products_table` | Product catalog |
| `20260309000000_add_admin_rls_policies` | Admin RLS policies |
| `20260316000000_create_gamification_tables` | Points economy, transactions, badges |

### Migration Rules
- Never apply automatically
- Always explain impact + provide rollback plan
- Check RLS compatibility
- Check Supabase client query compatibility
- Generate SQL in diff-first mode

---

## Mock Data

| File | Purpose |
|------|---------|
| `src/mocks/products.ts` | Product catalog mock data |
| `src/mocks/reviews.ts` | Review mock data → `getReviewsForProduct()` |

### Mock Data Rules
- Mock data is for development and pre-launch only
- Never write logic that assumes mock-specific naming, counts, or structure
- All code must scale to real Supabase data without changes
- Mock data shapes must match Supabase table schemas
