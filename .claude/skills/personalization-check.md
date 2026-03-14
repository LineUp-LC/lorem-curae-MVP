---
name: Personalization Consistency Check
description: Verifies all personalization surfaces use shared utilities, highlights are consistent, and guest fallback works.
tools: [Read, Grep, Glob]
trigger: "Use when: modifying personalization logic, adding a new personalized surface, or after changes to matching utilities"
---

## Steps

1. **Inventory personalized surfaces** — grep for imports of:
   - `getEffectiveSkinType`, `getEffectiveConcerns`, `getEffectiveSensitivity`
   - `calculateSimilarityWeight`, `matchesIngredient`
   - `highlightRelevantKeywords`
   - `useEnvironmentContext`
2. **Verify shared utility usage** — for each surface found:
   - Confirm matching logic uses `src/lib/utils/matching.ts` (not inline)
   - Confirm similarity uses `src/lib/utils/reviewSimilarity.ts` (not inline)
   - Confirm highlighting uses `src/lib/utils/highlightKeywords.tsx` (not inline)
   - Flag any inline matching regex, scoring, or highlight logic
3. **Check highlight consistency** — verify all AI surfaces pass:
   - Complete `HighlightProfile` with `excludeNames`
   - Same color tiers (primary, sage, yellow) — no custom highlight colors
   - `highlightSentiment` set correctly per surface registry (root CLAUDE.md §29.6)
4. **Guest fallback audit** — for each personalized surface:
   - Simulate null skin type, empty concerns, no sensitivity
   - Verify the component renders without crash
   - Verify no personalization highlights appear for guests
   - Verify no API calls fire for unauthenticated users
5. **Cross-surface consistency** — verify that if ingredient X is highlighted on product detail, it is also highlighted on discover, comparison, and AI chat surfaces
6. **Environment personalization** — verify:
   - All UV/climate/season references use `useEnvironmentContext()`
   - No hard-coded UV index or season strings
   - `source === 'mock'` never claims personalization

## Output

### Surface Registry

| Surface | Shared Utils | Highlights | Guest Safe | Status |
|---------|-------------|------------|------------|--------|
| Product Detail | PASS/FAIL | PASS/FAIL | PASS/FAIL | OK/ISSUE |
| Discover | ... | ... | ... | ... |
| ... | | | | |

### Issues Found
- [surface]: [description of inconsistency]

### Recommendations
- [specific fix with file path]

## Example Invocation

```
Run personalization consistency check. I just added a new AI surface on the ingredient detail page.
```
