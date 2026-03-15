---
scope: "AI module registry, prompt construction, highlighting governance, validation, guardrails"
authority: primary
last_synced: "2026-03-14"
related: ["06-ai-product-voice.md", "04-state-management.md"]
---

# AI Pipeline & Module Governance

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

For full user-facing voice, tone, and surface behavior rules → `ai-governance/CLAUDE_PRODUCT.md`.

---

## AI-to-Personalization Integration

When personalization data is available:
- Reference the user's skin type, concerns, and preferences in recommendations
- Never contradict personalization-driven highlights on other surfaces
- If the product page highlights an ingredient as "matching," the AI must not say it is irrelevant
- Follow the same matching utilities (`04-state-management.md`) — no separate AI matching logic
- When data is missing, respond generically — never fabricate a profile

## AI Data Integrity

- Product names, ingredients, properties must come from the product database or mock data
- Retailer information must come from retailer data — never fabricated
- Ingredient science must follow claim boundary rules (`06-ai-product-voice.md`)
- If unsure about a data point, say so rather than guess

---

## AI Model

- Model: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- Proxy: `supabase/functions/ai-insight/index.ts`

---

## AI Module Registry

### Core Pipeline

| Module | Path | Purpose |
|--------|------|---------|
| surfaceContext | `src/lib/ai/surfaceContext.ts` | Unified context builder (9+ AI modes) |
| systemPrompt | `src/lib/ai/systemPrompt.ts` | 5-layer system prompt builder |
| surfaceClient | `src/lib/ai/surfaceClient.ts` | Client-side API caller with caching + fallback |
| AIInsightBlock | `src/components/feature/AIInsightBlock.tsx` | Shared AI insight rendering component |
| ai-insight | `supabase/functions/ai-insight/index.ts` | Edge Function (Claude Sonnet 4.5) |
| ai-chat | `supabase/functions/ai-chat/index.ts` | Conversational AI Edge Function |
| index barrel | `src/lib/ai/index.ts` | Public API exports |
| types | `src/lib/ai/types.ts` | AI type definitions |

### Chat & Conversation

| Module | Path |
|--------|------|
| chatClient | `src/lib/ai/chatClient.ts` |
| chatRetrieval | `src/lib/ai/chatRetrieval.ts` |
| conversationMemory | `src/lib/ai/conversationMemory.ts` |
| conversationState | `src/lib/ai/conversationState.ts` |

### Guided & Discovery

| Module | Path |
|--------|------|
| guidedAssistant | `src/lib/ai/guidedAssistant.ts` |
| guidedClient | `src/lib/ai/guidedClient.ts` |
| discoveryAssistant | `src/lib/ai/discoveryAssistant.ts` |
| discoveryClient | `src/lib/ai/discoveryClient.ts` |

### RAG & Knowledge

| Module | Path |
|--------|------|
| knowledgeBase | `src/lib/ai/knowledgeBase.ts` |
| embeddings | `src/lib/ai/embeddings.ts` |
| vectorStore | `src/lib/ai/vectorStore.ts` |
| retrievalPipeline | `src/lib/ai/retrievalPipeline.ts` |
| productIngestion | `src/lib/ai/productIngestion.ts` |

### Domain Intelligence

| Module | Path |
|--------|------|
| productIntelligence | `src/lib/ai/productIntelligence.ts` |
| ingredientIntelligence | `src/lib/ai/ingredientIntelligence.ts` |
| concernIntelligence | `src/lib/ai/concernIntelligence.ts` |
| skinProfileIntelligence | `src/lib/ai/skinProfileIntelligence.ts` |
| routineBuilder | `src/lib/ai/routineBuilder.ts` |
| routineOptimizationIntelligence | `src/lib/ai/routineOptimizationIntelligence.ts` |
| shoppingIntelligence | `src/lib/ai/shoppingIntelligence.ts` |

### Meta-Intelligence

| Module | Path |
|--------|------|
| behavioralIntelligence | `src/lib/ai/behavioralIntelligence.ts` |
| communicationIntelligence | `src/lib/ai/communicationIntelligence.ts` |
| reasoningChainIntelligence | `src/lib/ai/reasoningChainIntelligence.ts` |
| intentClassificationIntelligence | `src/lib/ai/intentClassificationIntelligence.ts` |
| modeSwitchingIntelligence | `src/lib/ai/modeSwitchingIntelligence.ts` |
| navigationIntelligence | `src/lib/ai/navigationIntelligence.ts` |
| searchRetrievalIntelligence | `src/lib/ai/searchRetrievalIntelligence.ts` |
| dataValidationIntelligence | `src/lib/ai/dataValidationIntelligence.ts` |
| errorHandlingIntelligence | `src/lib/ai/errorHandlingIntelligence.ts` |
| responseFormattingIntelligence | `src/lib/ai/responseFormattingIntelligence.ts` |
| workflowIntelligence | `src/lib/ai/workflowIntelligence.ts` |

### Content Generation Utilities

| Utility | Path | Purpose |
|---------|------|---------|
| seasonalModalContent | `src/lib/utils/seasonalModalContent.ts` | Learn More modal content |
| productKnowledge | `src/lib/environment/productKnowledge.ts` | Category, texture, mechanism KB |
| environmentFit | `src/lib/utils/environmentFit.ts` | Environment-fit scoring |
| highlightKeywords | `src/lib/utils/highlightKeywords.tsx` | AI keyword highlighting |

When adding new AI features, register them here. When modifying, verify all consumers are updated.

---

## Future AI Surfaces (Deferred per Roadmap)

| Future Surface | Additional Rules |
|----------------|-----------------|
| **Formulation Assistant** | Flag ingredient interactions, flag regulatory concerns, require human verification, never imply FDA approval |
| **Nutrition AI** | Follow evidence-based nutrition science, never make medical dietary claims, defer to professionals |
| **AR Analysis** | Include accuracy disclaimers, never present visual analysis as diagnosis, offer professional consultation links |

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
