---
scope: "State layer: AuthContext, sessionState, localStorage, personalization cascade, cross-surface matching"
authority: primary
last_synced: "2026-03-14"
related: ["05-ai-pipeline.md", "07-environment.md", "09-security.md"]
---

# State Management & Personalization

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

## Personalization Cascade

1. **Supabase profile** (authenticated — canonical source)
2. **Session state** (quiz completion, in-memory)
3. **localStorage** (persisted guest state)
4. **Graceful degradation** (no highlights, no crash, no broken UI)

Never assume personalization data exists. Every component must handle null/empty.

---

## State Modules

| Module | Path | Purpose |
|--------|------|---------|
| AuthContext | `src/lib/auth/AuthContext.tsx` | Global auth provider (React Context) |
| sessionState | `src/lib/utils/sessionState.ts` | Profile state: `getEffectiveSkinType()`, `getEffectiveConcerns()`, `getEffectiveSensitivity()` |
| cartState | `src/lib/utils/cartState.ts` | Shopping cart operations |
| routineState | `src/lib/utils/routineState.ts` | Routine CRUD |
| favoritesState | `src/lib/utils/favoritesState.ts` | Saved products |
| recentlyViewedState | `src/lib/utils/recentlyViewedState.ts` | Recently viewed products |
| locationState | `src/lib/utils/locationState.ts` | User location |
| routineCompletionState | `src/lib/utils/routineCompletionState.ts` | Routine completion tracking |
| routineProgressState | `src/lib/utils/routineProgressState.ts` | Progress metrics |

**Persistence rules:**
- Guest users: localStorage only — no Supabase calls, no API calls
- Authenticated users: Supabase with RLS enforcement
- Guest → authenticated merge: `src/lib/auth/guestMerge.ts`

---

## Cross-Surface Matching Consistency

If an ingredient, product, concern, or skin type is highlighted as "matching" on one surface, it must be highlighted identically on every other surface.

**Canonical matching utilities (single source of truth):**
- `src/lib/utils/matching.ts` — concern matching, ingredient matching
- `src/lib/utils/reviewSimilarity.ts` — review-to-user matching
- `src/lib/utils/productSimilarity.ts` — product-to-user matching
- `src/lib/utils/personalizationEngine.ts` — master personalization scorer

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
- Make Supabase calls or API calls for guest users
