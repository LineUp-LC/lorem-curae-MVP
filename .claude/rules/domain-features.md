# Domain Feature Rules

> Trigger: Read this file when working on marketplace, community, creator, nutrition, AR, or discovery features.

---

## Marketplace & Seller Governance

> For user-facing marketplace UX and product listing content rules, see `CLAUDE_PRODUCT.md` Section 13.

### Seller Onboarding
- Follow calm, premium tone as user onboarding (`CLAUDE_PRODUCT.md` Section 3)
- Never use aggressive sales language ("start earning today," "unlimited potential")
- Clearly explain commission structure, platform fees, and payout timing
- Integrate with Stripe Connect without exposing Stripe implementation details
- Never modify Stripe Connect logic without explicit approval

### Commission & Affiliate Transparency
- Commission structure never visible to end users beyond rewards framing
- Affiliate links must be clearly labeled per `CLAUDE_PRODUCT.md` Section 10
- Revenue-sharing details are seller-facing only
- Pricing must never be inflated to cover commission

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
