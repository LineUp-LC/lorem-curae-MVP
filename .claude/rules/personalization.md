# Personalization Engine Rules

> Trigger: Read this file when working on personalized content, matching logic, highlighting, or any surface that adapts to user profile.

---

## Canonical Data Model

| Field | Source | Fallback |
|-------|--------|----------|
| Skin type | Quiz → Supabase profile → sessionState → localStorage | `null` (no highlighting) |
| Primary concerns | Quiz → Supabase profile → sessionState → localStorage | `[]` (no highlighting) |
| Preferences | Quiz → Supabase profile → sessionState → localStorage | `{}` (no highlighting) |
| Location + climate | Settings → Supabase profile → localStorage | `null` (skip location features) |
| Age range | Quiz → Supabase profile | `null` (skip age matching) |
| Budget range | Settings → localStorage | `null` (show all price points) |
| Routine history | Routine builder → Supabase → localStorage | `[]` (skip routine matching) |

## Fallback Hierarchy

1. **Supabase profile** (authenticated — canonical source)
2. **Session state** (quiz completion, in-memory)
3. **localStorage** (persisted guest state)
4. **Graceful degradation** (no highlights, no crash, no broken UI)

Never assume personalization data exists. Every component must handle null/empty.

---

## Cross-Surface Matching Consistency

If an ingredient, product, concern, or skin type is highlighted as "matching" on one surface, it must be highlighted identically on every other surface.

**Canonical matching utilities (single source of truth):**
- `src/lib/utils/matching.ts` — concern matching, ingredient matching
- `src/lib/utils/reviewSimilarity.ts` — review-to-user matching
- `src/lib/utils/productSimilarity.ts` — product-to-user matching

**Rules:**
- All matching logic must flow through shared utilities — no inline matching in components
- Highlight style: `bg-light/30 text-primary-700 border-primary-300` with `ri-check-line`
- New matching dimensions must be added as shared utilities, not inline
- Guest users see no personalization highlights — never fake data

---

## Surface Registry

| Surface | What is Personalized |
|---------|---------------------|
| Product detail | Key ingredients, skin type suitability, concerns, preferences |
| Discover / catalog | Product cards (matching badge), sort by relevance, ingredient filter relevance, AI keyword highlighting |
| Ingredient library | Ingredient highlights for user concerns |
| Routine builder | Conflict detection based on user skin type and concerns |
| Product reviews | Reviewer similarity scoring, match breakdown |
| AI chat | Responses tailored to skin profile |
| Retailer comparison | Sort by user budget/preference (future) |
| Nutrition | Skin-relevant nutrition highlights (future) |

When adding personalization to a new surface, verify it aligns with all existing surfaces.

---

## Prohibited Behaviors

Claude must never:
- Hard-code personalization values in components
- Implement matching logic inline (must use shared utilities)
- Show personalization highlights without verifying the data source
- Assume personalization data is always present
- Display different matching results for the same user data on different surfaces
- Break graceful degradation for guest users

---

## Content Generation Utilities

All personalized content must flow through shared utilities:

| Utility | Path | Purpose |
|---------|------|---------|
| seasonalModalContent | `src/lib/utils/seasonalModalContent.ts` | Learn More modal content |
| productKnowledge | `src/lib/environment/productKnowledge.ts` | Category, texture, mechanism knowledge base |
| surfaceClient | `src/lib/ai/surfaceClient.ts` | AI insight generation |
| buildAIContext | `src/lib/ai/surfaceContext.ts` | Unified AI context assembly |
| sessionState getters | `src/lib/utils/sessionState.ts` | Profile data retrieval with fallback chain |
| environmentFit | `src/lib/utils/environmentFit.ts` | Environment-fit scoring and review aggregation |

No component may generate personalized text inline.

---

## Knowledge Base Maintenance

When modifying `CATEGORY_BEHAVIOR`, `TEXTURE_BEHAVIOR`, `SKIN_IMPACT`, `CLASS_BENEFIT`, `CLASS_CONDITION_OVERRIDE`, or `CONDITION_PROBLEM`:
- All text must be plain language — no jargon, no clinical terms
- Verify zero instances of prohibited terms: "transepidermal", "photoaging", "oxidative", "lipid barrier", "sebum", "photosensitizing", "formulation", "occlusion"
- Follow conditional language rules (no medical claims)
- Run `npx tsc --noEmit` and `npx vite build` after changes
