---
name: Governance Sync
description: Validates that runtime governance (systemPrompt.ts) stays in sync with source governance (CLAUDE_PRODUCT.md).
tools: [Read, Grep, Glob]
trigger: "Use when: CLAUDE_PRODUCT.md is modified, systemPrompt.ts is modified, or before any PR that touches AI behavior"
---

## Steps

1. **Read both files**:
   - `ai-governance/CLAUDE_PRODUCT.md` (source of truth)
   - `src/lib/ai/systemPrompt.ts` (runtime version)
2. **Check GOVERNANCE_VERSION date** — compare the date comment in `systemPrompt.ts` against the last modification of `CLAUDE_PRODUCT.md`
3. **Diff prohibited terms** — extract prohibited term lists from both files, report any terms in one but not the other
4. **Diff surface modes** — verify every surface listed in `CLAUDE_PRODUCT.md` Section 7 has a corresponding `MODE_INSTRUCTIONS` entry in `systemPrompt.ts`
5. **Diff tone rules** — verify key tone/voice rules match between the two files
6. **Check highlight keywords** — verify `src/lib/utils/highlightKeywords.tsx` synonym maps include all ingredients/concerns referenced in governance
7. **Report drift** — list every discrepancy found with:
   - What drifted
   - Source file value vs runtime file value
   - Recommended fix

## Output

- Sync status: IN SYNC or DRIFTED
- Drift report table (if any discrepancies)
- Recommended changes as a checklist

## Example Invocation

```
Run governance sync check. I just updated CLAUDE_PRODUCT.md with new prohibited terms for nutrition claims.
```
