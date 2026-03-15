---
scope: "Code style, naming, formatting, imports, file structure, shared types, metadata patterns"
authority: primary
last_synced: "2026-03-14"
related: ["03-frontend.md", "04-state-management.md"]
---

# Code Standards

---

## Naming

- Files: `camelCase.ts` for utils, `PascalCase.tsx` for components, `page.tsx` for routes
- Components: PascalCase (`AIInsightBlock`, `SafetyBadge`)
- Hooks: `use` prefix (`useEnvironmentContext`, `useLocalStorageState`)
- Utils: camelCase functions (`getEffectiveSkinType`, `calculateSimilarityWeight`)
- Types: PascalCase, in `src/types/` when shared across files
- Constants: UPPER_SNAKE for true constants (`INGREDIENT_SYNONYMS`, `MECHANISM_PHRASES`)
- Event handlers: `handle` prefix (`handleToggleProduct`, `handleClearSelection`)

## Formatting

- TypeScript strict mode
- ESLint flat config with `@typescript-eslint/recommended`
- `@typescript-eslint/no-explicit-any` is OFF (any is permitted)
- `react-refresh/only-export-components` is WARN with `allowConstantExport: true`
- No Prettier configured — match existing formatting in each file
- Indent: 2 spaces (match existing files)

## Imports

- Use `@/` path alias for all `src/` imports
- Auto-imported symbols (do NOT import manually):
  - React: useState, useEffect, useCallback, useMemo, useRef, useContext, memo, lazy, forwardRef, etc.
  - Router: useNavigate, useLocation, useParams, useSearchParams, Link, NavLink, Navigate, Outlet
  - i18n: useTranslation, Trans
- Import order: externals → `@/` paths → relative paths

## File Structure

- Pages: `src/pages/**/page.tsx`
- Shared UI: `src/components/feature/`
- Business logic: `src/lib/utils/`
- Shared types: `src/types/`
- Supabase logic: `src/lib/`
- Supabase auth: `src/lib/auth/`

## Shared Types Rule

Every entity used across multiple files must have a canonical type in `src/types/`.

Established types:
- `src/types/retailer.ts` — `Retailer`, `RetailerSortKey`
- `src/types/product.ts` — product-related types

When creating a new entity type:
1. Check if a canonical type already exists in `src/types/`
2. If yes, import and use it — never create a local duplicate
3. If no, create it in `src/types/` and import from there
4. Inline interfaces only for single-file, page-specific data shapes

Never create a local `interface` in a component if the same shape exists or could exist in `src/types/`.

## Metadata "All" Override Rule

When a product metadata array (e.g., `skinTypes`, `concerns`, `timeOfDay`) contains `"all"`:

1. `"all"` overrides all other values — it is the only active metadata
2. UI displays only the `"all"` tag, not other values alongside it
3. `"all"` tag always displays a checkmark (`ri-check-line`) regardless of user profile
4. Display label via `getMetadataDisplayLabel()` (e.g., "All Skin Types")
5. Detection via `isAllMetadata()` from `src/lib/utils/productMetadata.ts`
6. No hard-coded "all" strings in components

## Core Patterns

- Match existing patterns in the file being edited — do not impose new conventions
- Business logic belongs in `src/lib/utils/` — never inline in components
- All matching/scoring via shared utilities — never duplicate
- Canonical types in `src/types/` — no local interfaces for shared shapes
- `"all"` metadata: use `isAllMetadata()` — no inline string comparisons

## Admin Page Data Fetching

Admin pages must use the cancelled-flag pattern:

```ts
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  fetchData(params).then(data => {
    if (!cancelled) {
      setData(data);
      setLoading(false);
    }
  });
  return () => { cancelled = true; };
}, [dependencies]);
```

Rules:
- Never use `useCallback` + separate `useEffect` for data fetching in admin pages
- Always include cleanup with `cancelled = true`
- Always check `!cancelled` before setState
- Loading state set synchronously before the async call

## What NOT To Do

- Do not add comments to self-evident code
- Do not add type annotations the compiler can infer
- Do not create abstractions for one-time logic
- Do not rename variables or restructure code unless requested
- Do not introduce new patterns — follow existing ones
