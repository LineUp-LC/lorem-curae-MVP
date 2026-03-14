# AI Safety, Modules & Highlighting Rules

> Trigger: Read this file when working on AI features, AI chat, recommendations, keyword highlighting, or the AI module registry.

---

## AI Reasoning Guardrails

AI features must NEVER:
- Make medical diagnoses or imply diagnostic authority
- Prescribe treatments or medications
- Guarantee results ("this will clear your acne")
- Recommend against a doctor's or dermatologist's advice
- Present AI opinions as scientific facts
- Hallucinate product data, ingredient properties, or retailer information
- Contradict safety metadata displayed elsewhere in the UI
- Generate content that violates content-safety rules

AI features must ALWAYS:
- Cite the basis for recommendations ("Based on your skin profile...")
- Acknowledge uncertainty ("This ingredient is commonly associated with...")
- Defer to professionals for medical concerns ("Consider consulting a dermatologist...")
- Match brand tone: calm, educational, supportive, never salesy
- Include soft disclaimers on analysis surfaces

> AI tone, surface-specific voice rules, and multi-modal behavior → `CLAUDE_PRODUCT.md` Sections 6-7.

---

## AI-to-Personalization Integration

When personalization data is available:
- Reference the user's skin type, concerns, and preferences in recommendations
- Never contradict personalization-driven highlights on other surfaces
- If the product page highlights an ingredient as "matching," the AI must not say it is irrelevant
- Follow the same matching utilities (`personalization.md`) — no separate AI matching logic
- When data is missing, respond generically — never fabricate a profile

## AI Data Integrity

- Product names, ingredients, properties must come from the product database or mock data
- Retailer information must come from retailer data — never fabricated
- Ingredient science must follow content-safety rules
- If unsure about a data point, say so rather than guess

---

## Future AI Surfaces (Deferred per Roadmap)

| Future Surface | Additional Rules |
|----------------|-----------------|
| **Formulation Assistant** | Flag ingredient interactions, flag regulatory concerns, require human verification, never imply FDA approval |
| **Nutrition AI** | Follow evidence-based nutrition science, never make medical dietary claims, defer to professionals |
| **AR Analysis** | Include accuracy disclaimers, never present visual analysis as diagnosis, offer professional consultation links |

---

## AI Module Registry

| Module | Path | Purpose |
|--------|------|---------|
| surfaceContext | `src/lib/ai/surfaceContext.ts` | Unified context builder (9 AI modes) |
| systemPrompt | `src/lib/ai/systemPrompt.ts` | 5-layer system prompt builder |
| surfaceClient | `src/lib/ai/surfaceClient.ts` | Client-side API caller with caching + fallback |
| AIInsightBlock | `src/components/feature/AIInsightBlock.tsx` | Shared AI insight rendering component |
| ai-insight | `supabase/functions/ai-insight/index.ts` | Edge Function (Claude Sonnet 4.5) |
| index barrel | `src/lib/ai/index.ts` | Public API exports |
| highlightKeywords | `src/lib/utils/highlightKeywords.tsx` | Shared keyword highlighting (see below) |

When adding new AI features, register them here. When modifying, verify all consumers are updated.

---

## SystemPrompt.ts Sync Protocol

`systemPrompt.ts` contains a hardcoded `GOVERNANCE_PROMPT` string — the runtime-optimized version of `CLAUDE_PRODUCT.md`. The two files can drift.

### Sync Rules

1. When `CLAUDE_PRODUCT.md` is modified, `systemPrompt.ts` must be updated in the same PR
2. The `GOVERNANCE_VERSION` comment must be updated with the date
3. New prohibited terms in `CLAUDE_PRODUCT.md` §5 must be added to `validateAIResponse()` prohibited terms array
4. New surfaces in `CLAUDE_PRODUCT.md` §7 must have corresponding `MODE_INSTRUCTIONS` entries
5. Never modify `GOVERNANCE_PROMPT` without verifying alignment with `CLAUDE_PRODUCT.md`

---

## AI Keyword Highlighting Governance

### Canonical Utility

All keyword highlighting must flow through:
**`src/lib/utils/highlightKeywords.tsx`** → `highlightRelevantKeywords(text, profile)`

No component may implement inline keyword matching, regex highlighting, or custom markup.

### HighlightProfile Interface

Every AI surface must pass a complete `HighlightProfile`:

| Field | Source | Required |
|-------|--------|----------|
| `skinType` | `getEffectiveSkinType()` | Yes (nullable) |
| `concerns` | `getEffectiveConcerns()` | Yes (defaults `[]`) |
| `sensitivity` | `getEffectiveSensitivity()` | Yes (nullable) |
| `ingredients` | Product-specific ingredients | Optional |
| `excludeNames` | `[product.name, product.brand]` | Yes — prevents false-matching |
| `highlightSentiment` | `true` for review summaries | Optional (default `false`) |

### Color Tiers

| Tier | CSS Classes | When Applied |
|------|------------|--------------|
| Default | `bg-primary/15 text-primary` | Matching ingredients, concerns, skin type |
| Positive sentiment | `bg-sage/15 text-sage` | "positively," "effective," "well-reviewed" |
| Negative sentiment | `bg-yellow-500/15 text-yellow-700` | "negatively," "ineffective," "poorly rated" |

### Synonym Maps

- `INGREDIENT_SYNONYMS` — canonical names → aliases
- `CONCERN_SYNONYMS` — skin concerns → related terms
- `CATEGORY_SYNONYMS` — product categories → related terms
- `POSITIVE_SENTIMENT` / `NEGATIVE_SENTIMENT` — sentiment word sets

All ingredient synonyms always included regardless of user profile.

### Word Boundary Rule

All keywords must use `\b...\b` word boundaries to prevent partial-word matches.

### Surface Highlighting Registry

| Surface | Component | `excludeNames` | `highlightSentiment` |
|---------|-----------|----------------|---------------------|
| Product AI Insight | `AIInsightBlock` | `[product.name, product.brand]` | `false` |
| Discovery AI Bar | `AIDiscoveryBar` | All visible product names + brands | `false` |
| Review AI Summary | `AIReviewSummary` | `[product.name, product.brand]` | `true` |
| AI Explain Panel | `AIExplainPanel` | `[product.name, product.brand]` | `false` |
| Comparison Modal | `ComparisonPickerModal` | All compared product names + brands | `false` |

### Modification Constraints

Claude must never:
- Implement highlighting inline in a component
- Add synonyms without verifying no partial-word collisions
- Change highlight colors without updating this file
- Remove word boundary enforcement
- Add tiers beyond the three defined without approval
