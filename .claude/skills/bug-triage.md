---
name: Bug Triage & Fix
description: Systematic bug investigation from symptom to verified fix with no collateral damage.
tools: [Read, Grep, Glob, Bash]
trigger: "Use when: a bug is reported, something is broken, or unexpected behavior is observed"
---

## Steps

1. **Reproduce** — confirm the symptom by reading the relevant code path end-to-end
2. **Isolate** — narrow down to the exact file, function, and line using Grep across all consumers
3. **Root cause** — identify WHY it fails, not just WHERE:
   - Data issue (null/undefined, wrong shape, stale state)?
   - Logic issue (wrong condition, off-by-one, race condition)?
   - Integration issue (API contract mismatch, missing RLS, wrong import)?
4. **Check blast radius** — grep all importers/consumers of the affected code to assess impact
5. **Minimal fix** — write the smallest change that fixes the root cause:
   - Do NOT refactor surrounding code
   - Do NOT "improve" adjacent logic
   - Do NOT change unrelated files
6. **Verify no regression** — run `npm run type-check` and `npm run build`
7. **Trace related surfaces** — check if the same bug pattern exists on other pages using the same utility

## Output

- Root cause (1-2 sentences)
- Files changed (with before/after)
- Blast radius assessment (what else uses this code)
- Regression check results (type-check + build)

## Example Invocation

```
Bug: The ingredient filter on /discover shows wrong relevance order for guest users.
Expected: sorted by product count. Actual: sorted by match score (but guest has no profile).
```
