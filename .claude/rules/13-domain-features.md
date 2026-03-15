---
scope: "Community, creator ecosystem, nutrition, AR, discovery filters, future-proofing, entity registry"
authority: primary
last_synced: "2026-03-14"
related: ["08-commerce.md", "15-roadmap.md", "04-state-management.md"]
---

# Domain Features & Future-Proofing

---

## Community Feature Governance

> For community tone, progress sharing safety, and reviewer evidence framing, see `CLAUDE_PRODUCT.md` Section 9.

### User-Generated Content
- Content must be clearly attributed to the user, not the platform
- Platform must not edit user content without disclosure
- Sensitive content (skin conditions, personal details) handled with care
- UI must support content reporting without making the reporter feel guilty
- Empty states must feel inviting ("Be the first to share" with warm tone)

### Community-to-User Matching
- Use shared matching utilities from `src/lib/utils/`
- Follow same similarity scoring as product reviews (`reviewSimilarity.ts`)
- Never expose raw similarity scores — translate to tiers ("Very Similar," "Similar")
- Degrade gracefully when profile data is missing
- Never match users on sensitive attributes without explicit opt-in

### Review Display Consistency
- Product detail, discover, retailer reviews, and community pages use same review card pattern
- Similarity badges, match breakdowns, helpful/report actions must behave identically
- Sorting and filtering use shared utilities — never inline

---

## Creator Ecosystem (Scale-Tier Placeholder)

Per roadmap, this is Scale-tier. Full governance defined when Growth features are stable.

- Formulation workflows require mandatory ingredient interaction checks
- Creator product launches follow governed pipeline: formulation → patch test guidance → content review → pricing → marketplace listing
- AI formulation assistance must follow AI safety rules

> For creator product framing and liability-safe language, see `CLAUDE_PRODUCT.md` Section 16.

---

## Nutrition & Wellness (Placeholder)

Basic nutrition management is MVP; advanced integration is Won't-Have.

> All user-facing nutrition voice, claim boundaries, dietary restriction rules, and safety disclaimers → `CLAUDE_PRODUCT.md` Section 12.

Developer constraint: Nutrition features must integrate with the personalization engine for skin-relevant highlights and follow the same data flow patterns.

---

## AR Surface (Scale-Tier Placeholder)

AR is Scale-tier. Full governance defined when AR development begins.

Key constraints:
- Never present visual analysis as clinical diagnosis
- Integration with personalization engine
- 60fps performance with graceful degradation
- Reduced-motion alternatives

> For AR disclaimer copy and camera permission UX copy, see `CLAUDE_PRODUCT.md` Section 16.

---

## Discovery Filter Governance

### Ingredient Filter UX

Hybrid approach:
1. **All ingredients shown** — never curate or hide
2. **Profile-relevant sort first** — via `matchesIngredient(label, userConcerns)` from `src/lib/utils/matching.ts`
3. **Three visual tiers:**
   - Active (selected): primary background + white text
   - Relevant (profile match, not selected): light background + checkmark
   - Default (no match, not selected): white background

Rules:
- Relevance sorting must use `matchesIngredient()` — never inline
- Guest users see all ingredients in default order (by product count)
- `sortedIngredientOptions` must be memoized via `useMemo`
- New ingredient→concern mappings go in `matching.ts`, not filter UI

### Guest-Aware Sort Behavior
- **Profiled users**: default sort = `'relevance'` (Best Match)
- **Guest users**: default sort = `'rating'` (Highest Rated)
- "Best Match" sort option hidden from guests entirely
- Reset button compares against profile-aware default
- If profiled user clears profile mid-session, sort falls back to `'rating'`

### Comparison State Sync
The `ComparisonPickerModal` must sync state back to parent `DiscoverPage` via `onSelectionChange`:
- `handleToggleProduct` → calls `onSelectionChange(next)`
- `handleRemoveProduct` → calls `onSelectionChange(next)`
- `handleClearSelection` → calls `onSelectionChange([])`

---

## Future-Proofing Requirements

Every new feature or modification must:

### 1. Scale to Real Production Data
- No hard-coded assumptions
- No mock-specific logic
- No reliance on static arrays or temporary values

### 2. Use Reusable Classification Utilities
- All filters must use shared classification utilities in `src/lib/utils/`
- Never implement filter logic inline inside components

### 3. Support Future Entities & Filters
- Products, Ingredients, Retailers, Routines, Reviews, and future content types
- Time of day, skin type, concern targeting, ingredient strength, sensitivity risk, price, brand, retailer

### 4. Support Future Routing & UI Surfaces
- Every entity must have a stable ID or slug
- Search results must route correctly for all entity types
- Discovery, product detail, ingredient library, comparison, routine builder, dashboard, and future pages

---

## Scalability Checklist

Before marking any feature complete:

- [ ] Scales to real products from Supabase?
- [ ] Works for future products with different naming conventions?
- [ ] Works for new filters, categories, ingredients, pages?
- [ ] Avoids hard-coding and mock-specific assumptions?
- [ ] Uses shared utilities instead of inline logic?
- [ ] Avoids duplication and follows canonical patterns?

If ANY answer is "no": stop, explain the issue, propose the correct scalable architecture, wait for approval.

---

## Entity Registry

Every entity must have:
- A canonical type in `src/types/`
- Shared utilities in `src/lib/utils/` for sorting, filtering, matching
- Normalized IDs and slugs
- A data shape compatible with existing personalization, sorting, and filtering utilities

Current registry:
- Products (`src/types/product.ts`)
- Retailers (`src/types/retailer.ts`)
- Ingredients (inline — extract when shared)
- Routines (inline — extract when shared)
- Reviews (inline — extract when shared)
