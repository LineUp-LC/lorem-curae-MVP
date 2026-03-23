---
scope: "Auth, env vars, hCaptcha, Supabase safety, Stripe safety, GDPR, guest vs authenticated"
authority: primary
last_synced: "2026-03-22"
related: ["04-state-management.md", "08-commerce.md", "10-data-layer.md"]
---

# Security & Privacy

---

## Environment Variables

### Frontend (Vite)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- Referenced in `src/lib/supabase.ts` — throws if missing

### Build-Time Constants (vite.config.ts)
- `BASE_PATH` → `__BASE_PATH__`
- `IS_PREVIEW` → `__IS_PREVIEW__`
- `PROJECT_ID`, `VERSION_ID`, `READDY_AI_DOMAIN` → `__READDY_*`

### Edge Function Secrets
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_PASSWORD`
- `ANTHROPIC_API_KEY` (for ai-insight and ai-chat functions)
- `SERPER_API_KEY` (for product-search function — Serper.dev web search)

### Rules
- NEVER hardcode secrets in source code
- NEVER commit `.env` files
- Access secrets via `process.env` (Vite) or `Deno.env.get()` (Edge Functions)
- No `.env.example` currently exists — when creating one, list variable names without values

---

## Safe Development & Deployment

Claude must ALWAYS:
- Assume the user is working on a live production system
- Treat every change as potentially breaking
- Ask for confirmation before modifying: Supabase tables, RLS policies, auth logic, Stripe logic, environment variables, routing structure, database migrations, deleting files

Claude must NEVER:
- Apply migrations automatically
- Modify production tables without explicit approval
- Suggest destructive SQL unless explicitly requested
- Assume the user understands the consequences of a change

### Safe Supabase & Database Workflow
1. Generate SQL in diff-first mode
2. Explain the impact of every migration
3. Provide a rollback plan
4. Check for RLS compatibility
5. Check for Supabase client compatibility

### Beginner-Protection
- Explain dangerous operations
- Provide context and suggest safer alternatives
- Avoid jargon, provide step-by-step instructions

---

## Authentication

- Auth provider: Supabase Auth
- Signup flow: email/password + hCaptcha → OTP email verification → session
- OTP verification: 6-digit code, auto-advance, paste support, 60s resend cooldown
- OAuth callback: `/auth/callback`
- All auth pages: no-layout (no Navbar/Footer)
- NEVER bypass email verification
- NEVER remove hCaptcha from signup
- NEVER modify OTP verification without explicit approval

### Email Verification Flow

| Step | Route | Behavior |
|------|-------|----------|
| 1. Signup | `/auth/signup` | User submits form → Supabase `signUp()` with hCaptcha token |
| 2. Redirect | — | On success with no session → redirect to `/auth/verify-email?email=...` |
| 3. OTP Entry | `/auth/verify-email` | 6-digit code input with auto-advance, paste support |
| 4. Verify | — | `supabase.auth.verifyOtp({ email, token, type: 'signup' })` |
| 5. Success | `/account` | Redirect after verified |

### OTP Page Rules
- 6 individual digit fields, numeric-only, auto-advance on entry
- Paste support: intercept paste event, distribute digits across fields
- Auto-submit when all 6 digits entered
- Backspace: focus previous input when current is empty
- Resend: 60-second cooldown via `supabase.auth.resend({ type: 'signup', email })`
- Expiration: 5-minute warning displayed
- Error: invalid code (clear + refocus first), expired code (prompt resend)
- No email param: redirect to `/auth/signup`

### Canonical Auth Routes

| Route | Page | Layout |
|-------|------|--------|
| `/auth/login` | LoginPage | No layout |
| `/auth/signup` | SignupPage | No layout |
| `/auth/verify-email` | VerifyEmailPage | No layout |
| `/auth/reset-password` | ResetPasswordPage | No layout |
| `/auth/callback` | AuthCallbackPage | No layout |
| `/forgot-password` | ForgotPasswordPage | No layout |

All auth pages: centered card, gradient background, Lorem Curae wordmark, brand colors.

---

## Supabase Safety

- Assume the project is live production
- NEVER apply migrations automatically
- NEVER modify RLS policies without approval
- NEVER run destructive SQL without explicit request
- Always explain migration impact + provide rollback plan
- Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` — this bypasses RLS

## Stripe Safety

- NEVER modify Stripe Connect onboarding flows without approval
- NEVER expose commission/affiliate internals to end users
- NEVER log or print payment-related secrets
- Webhook secrets must only be used in Edge Functions, never in frontend

## API Rate Limiting

- `product-search` Edge Function: requires authentication (returns 401 for unauth)
- Client-side rate limit: 10 Serper.dev calls per scan session (`src/lib/api/productSearch.ts`)
- Server-side cache: 24h TTL in `web_search_cache` table (SHA-256 query hash key)
- Gamification duplicate prevention: once-ever actions checked against `points_transactions` table (Supabase-backed, not localStorage)

## Auth Hydration Guard

- `AuthContext.tsx` uses `hasHydratedRef` to skip re-hydration on session recovery events
- Supabase `onAuthStateChange` fires `SIGNED_IN` on session recovery (tab refocus, token refresh), not just actual sign-ins
- Full hydration (mergeGuestData, loadUserProfile, getRoutineCount) only runs on first `SIGNED_IN` per user
- `hasHydratedRef` resets on `SIGNED_OUT` to allow fresh hydration on next sign-in
- Hydration timeout (8s) warns instead of throwing — uses cached profile data as fallback
- Any page gated on `authLoading` (e.g., scan page) will NOT flash a loading spinner on navigation

## Guest vs Authenticated

- Guest users: rule-based fallback only — no Supabase calls, no API calls
- Authenticated users: full Supabase integration with RLS enforcement
- Personalization data cascade: see `04-state-management.md`
- NEVER crash on missing personalization data
