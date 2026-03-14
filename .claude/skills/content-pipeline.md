---
name: Content Pipeline
description: Generates brand-aligned ingredient descriptions, product copy, and environment-fit explanations following CLAUDE_PRODUCT.md rules.
tools: [Read, Grep, Write]
trigger: "Use when: adding new product/ingredient content, writing environment-fit explanations, or generating user-facing AI copy"
---

## Steps

1. **Load governance** — read `ai-governance/CLAUDE_PRODUCT.md` for:
   - Allowed/prohibited phrasing (Section 5)
   - Tone rules (Section 3)
   - Surface-specific voice (Section 7)
   - Mechanism phrase rules (Section 5.6)
2. **Load knowledge base** — read `src/lib/environment/productKnowledge.ts` for:
   - Existing `CATEGORY_BEHAVIOR`, `TEXTURE_BEHAVIOR`, `SKIN_IMPACT` entries
   - Existing `MECHANISM_PHRASES` and `CLASS_BENEFIT` mappings
3. **Identify content type** from the request:
   - **Ingredient description**: plain-language, evidence-based, no medical claims
   - **Product copy**: ties product qualities to user skin type + environment
   - **Environment-fit explanation**: follows §26.13 structure (environment opener → product action → concern alignment)
   - **AI insight text**: matches surface-specific tone from §7
4. **Generate content** following rules:
   - No jargon (prohibited terms list from §26.13)
   - No ingredient class names exposed to users
   - Conditional language only ("may help", "commonly associated with")
   - Cause-and-effect structure for environment claims
   - Max 4 bullets for product-fit narratives
5. **Validate content**:
   - Check against prohibited terms list
   - Verify no medical/diagnostic claims
   - Verify no copyrighted text patterns (INCIdecoder, Paula's Choice, etc.)
   - Verify plain-language test: "would a first-time skincare user understand this?"
6. **Output** the content with placement instructions (which file, which function/variable)

## Output

- Generated content blocks with file placement instructions
- Validation checklist (all prohibited terms cleared)
- Any governance questions flagged for human review

## Example Invocation

```
Generate environment-fit explanations for 3 new sunscreen products.
User context: combination skin, acne-prone, summer in Houston (humid, high UV).
Follow CLAUDE_PRODUCT.md rules for mechanism phrases and jargon-free language.
```
