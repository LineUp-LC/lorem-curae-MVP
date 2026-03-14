---
name: New Feature Scaffold
description: Generates all boilerplate files for a new Lorem Curae feature following architecture conventions.
tools: [Read, Write, Grep, Glob]
trigger: "Use when: adding a new page, feature, or route to the application"
---

## Steps

1. **Confirm scope** — ask for feature name, route path, and whether it needs auth
2. **Check existing patterns** — read `src/router/config.tsx` for route conventions, scan `src/pages/` for nearest similar feature
3. **Generate page file** — create `src/pages/<feature>/page.tsx` with:
   - Default export (for lazy loading)
   - PageWrapper with document title
   - Loading/empty/error states
   - Mobile-responsive layout using existing Tailwind patterns
4. **Generate types** (if needed) — add to `src/types/<entity>.ts` or extend existing type file
5. **Generate utility** (if needed) — create `src/lib/utils/<feature>.ts` for business logic
6. **Register route** — add lazy import + RouteObject to `src/router/config.tsx`
   - Wrap in `RequireAuth` if auth-required
   - Use `AppLayout` wrapper if it needs Navbar/Footer
7. **Wire navigation** — add link to relevant navigation components (Navbar, sidebar, etc.)
8. **Verify** — run `npm run type-check` and `npm run build`

## Output

- List of created/modified files with line counts
- Route path and how to access it
- Checklist of manual steps remaining (if any)

## Example Invocation

```
Scaffold a new "patch-test-tracker" feature at /patch-tests with auth required.
It needs a list page and a detail page with route param.
```
