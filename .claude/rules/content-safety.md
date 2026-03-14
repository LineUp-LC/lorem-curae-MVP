# Content Accuracy & Copyright Safety Rules

> Trigger: Read this file when writing ingredient descriptions, safety explanations, product summaries, or any user-facing skincare content.

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

## Scientific Accuracy

> All user-facing prohibited/allowed phrasing for ingredients, nutrition, patch tests, and environment claims is consolidated in `CLAUDE_PRODUCT.md` Section 5.

Claude must verify all generated content against those rules before presenting it.

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

## Domain-Specific Claim Boundaries

- Nutrition science accuracy → `CLAUDE_PRODUCT.md` Section 5.4
- Patch test claim boundaries → `CLAUDE_PRODUCT.md` Section 5.5
- Retailer trust score transparency → `CLAUDE_PRODUCT.md` Section 10
