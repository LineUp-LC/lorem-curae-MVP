---
scope: "Build validation, QA protocol, verification protocols, post-implementation checklist"
authority: primary
last_synced: "2026-03-14"
related: ["02-code-standards.md", "10-data-layer.md"]
---

# Testing & QA

---

## Available Checks

```sh
npm run type-check   # tsc --noEmit --project tsconfig.app.json
npm run build        # vite build (production build → out/)
npm run lint         # ESLint on src/**/*.{ts,tsx}
```

No test runner (Vitest/Jest) is configured. No test files exist.

## Validation Protocol

After every code change, verify:

1. `npm run type-check` — zero TypeScript errors
2. `npm run build` — zero build errors
3. `npm run lint` — zero lint errors (warnings are acceptable)

---

## Full-Functionality Enforcement

Every feature must be **fully functional, fully integrated, and fully verified** before being presented. No "basic version," "first pass," or "we can add that later."

### What "Fully Functional" Means

1. All user flows work end-to-end (action → state change → persistence → UI feedback)
2. All UI states implemented (loading, empty, populated, error, success, disabled)
3. All edge cases handled (guest users, empty data, network failure, rapid interactions, first-time use)
4. All integrations wired (analytics, auth/RLS, versioning, completion tracking, localStorage, routing)
5. All persistence works (data survives navigation, page refresh, browser restart)

### What "Fully Integrated" Means

1. Feature connects to every relevant system
2. Data created → appears in analytics, timeline, version history
3. Routine modifications → versioning fires, completion tracking updates
4. Auth required → RLS policies exist and enforced
5. Migration required → created and queries match schema

### What "Fully Verified" Means

1. `npx tsc --noEmit` passes with zero errors
2. `npx vite build` passes with zero errors
3. Feature traced through every relevant code path
4. Regressions checked in existing features
5. QA checklist provided for the user

### Enforcement Behavior

1. **Read** all relevant files before writing code
2. **Identify** all systems the feature must integrate with
3. **Ask** if any requirement is ambiguous — do not guess
4. **Implement** complete feature with all states, flows, integrations
5. **Verify** end-to-end across all relevant pages
6. **Report** what was built, verified, and what user should test
7. **Never** present a partial implementation as complete

If speed vs. completeness conflicts, **completeness wins**.

---

## Post-Implementation Checklist

**Pre-Implementation:**
- [ ] Read all files involved before writing code
- [ ] Identify existing patterns, utilities, functions to reuse
- [ ] Confirm feature scope — ask if ambiguous
- [ ] Identify all interacting systems

**Post-Implementation:**
- [ ] No unused imports remain
- [ ] No `console.log` debug statements (production `console.error` is OK)
- [ ] All new functions handle null/empty/error cases
- [ ] Guest user path does not crash
- [ ] Authenticated user path works end-to-end
- [ ] State persists across navigation and page refresh
- [ ] No regressions in existing features

---

## QA Execution Mode

Triggered by: "Run QA", "QA this", "Validate implementation", "Check for regressions"

### Checklist Selection

Determine which checklist based on context:
- Reviews → Review QA Checklist
- Comparison → Comparison QA Checklist
- Metadata → Metadata QA Checklist
- Filters → Filter QA Checklist
- Personalization → Personalization QA Checklist
- Shared components → Shared Component QA Checklist
- Multiple surfaces → run all relevant checklists

### Execution Rules

1. Evaluate each item: **PASS** or **FAIL** with 1-2 sentence explanation
2. For FAIL: identify exact cause, propose minimal fix
3. Do NOT generate diffs during QA — wait for user approval

### Output Format

```
[Category Name]
- [ ] PASS/FAIL — Description
```

**Summary of Failures:** (list)
**Priority Fix List:** 1. Highest → 3. Lowest
**Ship Readiness:** "Safe to ship" OR "Not safe to ship — fixes required"

### Entry/Exit

Enter QA mode: after any implementation, integration, refactor, multi-file change, or when user requests
Exit QA mode only when user says: "apply", "proceed with diffs", "fix these", "implement fixes"

After exiting: generate minimal diffs, fix only failed items, re-run QA after fixes (unless user disables)

### Prohibitions

- Do NOT generate diffs during QA mode
- Do NOT modify code during QA mode
- Do NOT skip checklist items
- Do NOT assume correctness without verification

---

## Verification Protocols

### Flow Verification
1. Trace end-to-end: user action → state change → UI update → persistence
2. Verify across all relevant pages and components
3. Verify integration with existing systems (analytics, RLS, conflict engine, notes)
4. Verify guest user behavior (degrade gracefully, never crash)
5. Verify authenticated user behavior (Supabase calls, RLS enforcement)

### State Verification
1. UI reflects state changes immediately
2. State persists across navigation (localStorage or Supabase)
3. State persists across page refresh
4. Revert/undo flows restore previous state

### Edge Case Verification
1. Empty data (no routines, no notes, no versions)
2. Single item
3. Maximum data (many routines, steps, long text)
4. Network failure (fail silently or show error)
5. Concurrent actions (rapid clicking, multiple saves)

---

## Cross-File Verification

When modifying shared utilities or types:
- Grep all importers and verify they still compile
- Check that changes propagate correctly to all consumers
- Verify no type mismatches at call sites

## Edge Function Validation

Edge Functions use Deno runtime — NOT part of Vite/tsc build.
- Cannot be validated with `npm run type-check`
- Validate manually: check import paths use `esm.sh`, verify `Deno.serve` pattern
- Test via `supabase functions serve` if local Supabase is running
