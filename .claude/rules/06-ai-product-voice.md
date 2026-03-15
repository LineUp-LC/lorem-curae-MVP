---
scope: "Content originality, copyright safety, claim verification, systemPrompt sync protocol"
authority: primary
last_synced: "2026-03-14"
related: ["05-ai-pipeline.md", "ai-governance/CLAUDE_PRODUCT.md"]
---

# AI Product Voice & Content Safety

The full user-facing AI voice, tone, claim boundaries, surface behavior, and output structures
are defined in `ai-governance/CLAUDE_PRODUCT.md` (790 lines, 21 sections). This file governs
the **developer-side** rules that ensure content quality, originality, and governance sync.

---

## Content Originality & Copyright

Claude must write **original** ingredient descriptions, safety explanations, and product summaries.

- Avoid copying text from external sources
- Avoid paraphrasing copyrighted content too closely
- Ensure all content is unique to the project
- Ensure no text resembles brand-owned or retailer-owned descriptions
- Ensure no text resembles INCIdecoder, Paula's Choice, Sephora, or any other skincare database

Claude must NEVER:
- Pull ingredient descriptions from external websites
- Reproduce copyrighted product descriptions
- Use trademarked marketing phrases
- Copy scientific summaries from journals or articles

---

## Safety Icon & Risk Explanations

When generating safety explanations:
- Explain WHY the safety rating is what it is
- Reference ingredient properties (not external databases or third-party ratings)
- Use neutral, factual language
- Avoid overstating risk or safety

---

## Cross-Page Content Consistency

All content across ingredient, product, and review pages must be consistent:
- Safety explanations follow the same structure
- Review explanations follow the same structure
- Product recommendations follow the same structure
- Tone remains calm, premium, educational
- No contradictions across pages
- No missing metadata
- No unexplained icons or labels

---

## Claim Verification Workflow

Before generating ANY ingredient or product-related content:

1. Verify the claim is allowed (non-medical, non-diagnostic)
2. Verify the claim is evidence-based
3. Verify the claim is consistent with other ingredients
4. Verify the claim does not contradict safety metadata
5. Verify the claim is comprehensible to non-experts
6. Verify the claim does not resemble copyrighted text

If ANY step fails, stop and flag the issue before proceeding.

---

## Scientific Accuracy

All claim boundaries are consolidated in `CLAUDE_PRODUCT.md` Section 5:
- §5.1 — General rules (conditional voice, no absolutes)
- §5.2 — Diagnostic-adjacent safety
- §5.3 — Ingredient claims
- §5.4 — Nutrition claims
- §5.5 — Patch test claims
- §5.6 — Environment & mechanism claims

Claude must verify all generated content against those rules before presenting it.

---

## systemPrompt.ts Sync Protocol

`src/lib/ai/systemPrompt.ts` contains a hardcoded `GOVERNANCE_PROMPT` string — the
runtime-optimized version of `ai-governance/CLAUDE_PRODUCT.md`. The two files can drift.

// SYNC PAIR: ai-governance/CLAUDE_PRODUCT.md ↔ src/lib/ai/systemPrompt.ts

### Sync Rules

1. When `CLAUDE_PRODUCT.md` is modified, `systemPrompt.ts` must be updated in the same PR
2. The `GOVERNANCE_VERSION` comment must be updated with the date
3. New prohibited terms in `CLAUDE_PRODUCT.md` §5 must be added to `validateAIResponse()` prohibited terms array
4. New surfaces in `CLAUDE_PRODUCT.md` §7 must have corresponding `MODE_INSTRUCTIONS` entries
5. Never modify `GOVERNANCE_PROMPT` without verifying alignment with `CLAUDE_PRODUCT.md`

### Current Sync Status

- GOVERNANCE_VERSION: 2.0 — Last synced 2026-03-04
- `CLAUDE_PRODUCT.md` covers Sections 1-21 (790 lines)
- `systemPrompt.ts` GOVERNANCE_PROMPT covers sections 1-3, 5-11, 15 in compressed form
- MODE_INSTRUCTIONS covers 15 modes; CLAUDE_PRODUCT.md §7 lists 8 core surfaces + §18-21 detail 4 more
- `validateAIResponse()` prohibited terms aligned with §5

### GOVERNANCE_VERSION Tracking

When updating, increment and note the date:
```
// GOVERNANCE_VERSION: X.Y — Last synced YYYY-MM-DD (CLAUDE_PRODUCT.md Sections covered)
```
