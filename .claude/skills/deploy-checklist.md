---
name: Deployment Checklist
description: Pre-deploy validation covering build, types, lint, env vars, Edge Functions, and Vercel config.
tools: [Bash, Read, Grep, Glob]
trigger: "Use when: preparing to deploy, before merging to master, or before pushing to Vercel"
---

## Steps

1. **Type check** — run `npm run type-check`, report pass/fail with error count
2. **Production build** — run `npm run build`, report pass/fail, note any warnings
3. **Lint** — run `npm run lint`, report pass/fail with warning count
4. **Check for debug artifacts**:
   - Grep for `console.log` in `src/` (excluding node_modules)
   - Grep for `debugger` statements
   - Grep for `TODO` or `FIXME` in changed files
5. **Environment variable audit**:
   - Read `src/lib/supabase.ts` for required frontend vars
   - Read Edge Functions for required secrets
   - Report which vars are needed for production
6. **Edge Function readiness**:
   - List all functions in `supabase/functions/`
   - Verify each has an `index.ts` with `Deno.serve` or `serve` pattern
   - Check imports use `esm.sh` (not npm)
7. **Vercel config** — read `vercel.json`, verify SPA rewrite rules are present
8. **Git status** — check for uncommitted changes, untracked files that should be committed
9. **Build output** — verify `out/` directory contains `index.html` and `assets/`

## Output

```
=== DEPLOY CHECKLIST ===

Type Check:    PASS / FAIL (X errors)
Build:         PASS / FAIL
Lint:          PASS / FAIL (X warnings)
Debug Artifacts: X found
Env Vars:      X required, all documented
Edge Functions: X functions, all valid
Vercel Config: PASS / FAIL
Git Status:    Clean / X uncommitted changes

Verdict: READY TO DEPLOY / BLOCKED (reasons)
```

## Example Invocation

```
Run deployment checklist before I push to production.
```
