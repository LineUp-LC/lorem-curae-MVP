---
name: Performance Audit
description: Scans components for animation perf, bundle impact, re-renders, memoization gaps, and lazy-load coverage.
tools: [Read, Grep, Glob, Bash]
trigger: "Use when: performance feels slow, before launch, or as periodic health check"
---

## Steps

1. **Animation audit**:
   - Grep for `transition`, `animation`, `transform` in TSX files
   - Flag animations NOT using GPU-friendly properties (transform, opacity)
   - Flag missing `will-change` on heavy animations
   - Flag scroll listeners without `{ passive: true }`
   - Check `prefers-reduced-motion` fallbacks exist
2. **Re-render detection**:
   - Scan for inline object/array/function creation in JSX props (new reference each render)
   - Flag components receiving unstable props without `useMemo` / `useCallback`
   - Flag context providers whose value object recreates every render
3. **Memoization audit**:
   - Identify expensive computations (`.filter().map()`, `.sort()`, similarity scoring)
   - Check if they are wrapped in `useMemo` with correct dependencies
   - Flag `memo()` components receiving non-memoized props (defeats the purpose)
4. **Lazy loading coverage**:
   - Read `src/router/config.tsx` — verify all page imports use `lazy()`
   - Flag any direct (non-lazy) page imports
   - Check for heavy components that could be code-split
5. **Bundle impact**:
   - Run `npm run build` and report output size
   - List the largest dependencies from `package.json`
   - Flag any dependencies imported but potentially unused
6. **Image optimization**:
   - Grep for `<img` tags without `loading="lazy"`
   - Check for missing `width`/`height` attributes (layout shift)

## Output

### Findings by Category

| Category | Issues Found | Severity |
|----------|-------------|----------|
| Animations | X | Critical/Warning/OK |
| Re-renders | X | Critical/Warning/OK |
| Memoization | X | Critical/Warning/OK |
| Lazy Loading | X | Critical/Warning/OK |
| Bundle Size | X MB | OK/Warning |
| Images | X | Warning/OK |

### Top 5 Fixes (by impact)
1. [fix with file:line]
2. ...

## Example Invocation

```
Run a performance audit focused on the product detail page and discover page.
```
