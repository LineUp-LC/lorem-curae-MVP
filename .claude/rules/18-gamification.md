---
scope: "Points economy, badges, streaks, gamification triggers, rewards dashboard"
authority: primary
last_synced: "2026-03-15"
related: ["01-workflow.md", "03-frontend.md", "10-data-layer.md", "13-domain-features.md"]
---

# Gamification Rules

> Trigger: read this file when modifying points, badges, streaks, rewards page, or gamification triggers

---

## Architecture Overview

| Component | Path | Purpose |
|-----------|------|---------|
| Types | `src/types/gamification.ts` | Badge, BadgeDefinition, GamificationAction, StreakMilestone |
| Points economy | `src/lib/utils/curaePoints.ts` | POINTS_ACTIONS, tier calculation, Supabase CRUD |
| Badge engine | `src/lib/utils/badgeEngine.ts` | 20 badge definitions, unlock checks, Supabase CRUD |
| Triggers | `src/lib/utils/gamificationTriggers.ts` | `onAction()` dispatcher, duplicate prevention, event emitter |
| Streaks | `src/lib/utils/routineStreaks.ts` | Product streaks + milestone detection |
| Rewards page | `src/pages/rewards/page.tsx` | Dashboard with 5 sub-components |
| Toast | `src/components/feature/PointsEarnedToast.tsx` | Points/badge notification |

---

## Points Actions (17 total)

| Action | Points | Trigger Location |
|--------|--------|-----------------|
| SIGNUP | 100 | auth/callback |
| SKIN_SURVEY | 50 | skin-survey completion |
| PRODUCT_REVIEW | 25 | review submit (future — no review form yet) |
| COMMUNITY_POST | 15 | community post (future) |
| ROUTINE_CREATED | 30 | routine save (new only) |
| ROUTINE_LOGGED | 10 | routine completion |
| PRODUCT_PURCHASE | 1/$ | purchase flow (future) |
| REFERRAL | 200 | referral flow (future) |
| INGREDIENT_SEARCH | 10 | ingredient detail view |
| PROFILE_COMPLETE | 75 | settings profile save |
| MONTHLY_ACTIVE | 50 | cron (future) |
| PRODUCT_SCAN | 15 | scan match success (once-ever) |
| PRODUCT_SAVED | 5 | product save (once-ever) |
| AI_CHAT | 5 | first chat message (once-ever) |
| STREAK_7_DAY | 50 | streak milestone |
| STREAK_30_DAY | 200 | streak milestone |
| FIRST_COMPARISON | 20 | comparison modal open |

### Adding a New Points Action
1. Add to `POINTS_ACTIONS` in `curaePoints.ts`
2. Add type to `GamificationAction` union in `gamification.ts`
3. Wire `onAction()` call at the trigger location
4. Decide duplicate prevention: once-ever, once-per-session, or unlimited

---

## Trigger Wiring Pattern

All triggers follow the **non-blocking** pattern:

```ts
// Fire-and-forget — never await in the critical path
onAction(userId, 'ACTION_NAME', { ...context }).catch(() => {});
```

Rules:
- Triggers must NEVER break the parent feature
- Wrap in `.catch(() => {})` to swallow errors
- Guest users (no userId) are handled by `onAction()` — returns null
- Duplicate prevention is handled by `onAction()` — callers don't need to check

---

## Badge Addition Process

1. Add definition to `BADGE_DEFINITIONS` array in `badgeEngine.ts`
2. Set `checkUnlock()` predicate — receives `BadgeCheckContext`
3. No migration needed — badge IDs are strings stored in `user_badges.badge_id`
4. Update this file's badge count if adding badges

---

## Database Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `curae_points` | User balance + tier (1 row per user) | user_id = auth.uid() |
| `points_transactions` | Append-only point events | user_id = auth.uid() |
| `user_badges` | Unlocked badges (user_id + badge_id unique) | user_id = auth.uid() |

Migration: `20260316000000_create_gamification_tables.sql`

---

## Prohibited Actions

Claude must never:
- Award points without going through `onAction()` dispatcher
- Make gamification triggers blocking (must be fire-and-forget)
- Skip duplicate prevention for once-ever actions
- Make Supabase calls for guest users from gamification code
- Modify tier thresholds without updating `TIER_THRESHOLDS` and this file
- Add badges without a `checkUnlock` predicate
