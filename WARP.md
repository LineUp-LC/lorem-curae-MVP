# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview
- Frontend: Vite + React (TypeScript) single-page app.
- Styling: Tailwind CSS (see `tailwind.config.ts`, `src/index.css`).
- Routing: React Router with route config in `src/router/config.tsx`.
- Backend/integrations:
  - Supabase (client in `src/lib/supabase.ts`; Edge Functions in `supabase/functions/*`).
  - Stripe is primarily used from Supabase Edge Functions (checkout + webhooks).

## Common commands
This repo only includes npm scripts (no test runner configured).

### Install
```sh
npm install
```

### Run the dev server
```sh
npm run dev
```
- Vite dev server runs on port **3000** (`vite.config.ts`).

### Build / Preview production build
```sh
npm run build
npm run preview
```
- Build output goes to `out/` (`vite.config.ts`).

### Lint
```sh
npm run lint
```
Lint a single file (or folder):
```sh
npx eslint src/pages/home/page.tsx --ext ts,tsx
```

### Type-check
```sh
npm run type-check
```

### Tests
- No `test` script and no `*.test.*` / `*.spec.*` files were found.

## Environment variables and build-time constants
### Vite env vars used by the frontend
- `VITE_PUBLIC_SUPABASE_URL`
- `VITE_PUBLIC_SUPABASE_ANON_KEY`
These are required at runtime; `src/lib/supabase.ts` throws if they’re missing.

### Build-time constants defined in `vite.config.ts`
- `BASE_PATH` -> compiled into `__BASE_PATH__` (used as `BrowserRouter basename` in `src/App.tsx`).
- `IS_PREVIEW` -> compiled into `__IS_PREVIEW__`.
- `PROJECT_ID`, `VERSION_ID`, `READDY_AI_DOMAIN` -> compiled into `__READDY_*` constants.

PowerShell examples:
```powershell
$env:BASE_PATH = "/"; npm run dev
$env:IS_PREVIEW = "1"; npm run build
```

## Code architecture (big picture)
### App entry points
- `index.html` mounts the app at `#root` and loads `src/main.tsx`.
- `src/main.tsx` initializes i18n (`import './i18n'`) and renders `<App />`.
- `src/App.tsx` composes global providers:
  - `PasswordGate` wraps the entire app.
  - `I18nextProvider` for translations.
  - `BrowserRouter` with `basename={__BASE_PATH__}`.

### Routing + page organization
- Routes are declared centrally in `src/router/config.tsx` as a `RouteObject[]`.
  - Pages are lazy-loaded from `src/pages/**/page.tsx`.
- `src/router/index.ts` exposes `<AppRoutes />` and also exports a `navigatePromise` that resolves to React Router’s `navigate()`; this allows navigation from non-component code once initialized.

### Feature pages vs shared UI
- `src/pages/` is feature-oriented (each route has its own folder with a `page.tsx`).
- `src/components/` holds reusable UI components used across multiple pages.

### Client-side “business logic” modules
Key state/logic modules live outside React components:
- `src/utils/personalizationEngine.ts` / `src/utils/adaptiveAI.ts`: personalization + AI-related logic.
- `src/utils/cartState.ts`, `src/utils/sessionState.ts`, `src/utils/curaePoints.ts`: app state + rewards/cart logic.

### Supabase integration
- `src/lib/supabase.ts` creates the browser Supabase client and exports shared TypeScript interfaces for app data (profiles, communities, subscription plans, marketplace entities, etc.).

### Supabase Edge Functions (Stripe + site gating)
- Edge Function sources live in `supabase/functions/<function-name>/index.ts` (Deno).
- Notable functions:
  - `password-check`: used by `src/PasswordGate.tsx` to gate access; reads `SITE_PASSWORD` and returns a simple token.
  - `create-subscription-checkout`, `create-marketplace-checkout`: create Stripe Checkout sessions.
  - `marketplace-payment-webhook`: Stripe webhook handler; uses `SUPABASE_SERVICE_ROLE_KEY`.
  - `create-connect-account`, `create-connect-dashboard-link`, `check-connect-status`: Stripe Connect onboarding/dashboard.
- Common env vars referenced by functions (names only):
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `SITE_PASSWORD`

### i18n
- i18n is initialized in `src/i18n/index.ts`.
- Translation resources are loaded via `import.meta.glob('./*/*.ts')` from `src/i18n/local/` (`src/i18n/local/index.ts`).
  - Expected layout: `src/i18n/local/<lang>/<namespace>.ts` exporting a default `{ key: string }` map.
  - Currently, only the loader file exists; no language resource folders are present.

## Repo-specific implementation details to remember
- Auto-imports are enabled via `unplugin-auto-import` in `vite.config.ts` for many React / React Router / react-i18next symbols. If you see identifiers used without imports (e.g. `useState`, `useNavigate`, `useTranslation`), they may be auto-injected.
- Path alias: `@` maps to `src/` (see `vite.config.ts` + `tsconfig.app.json`).
