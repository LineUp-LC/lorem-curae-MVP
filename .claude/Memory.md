# Project Memory — Debugging Insights & Patterns

## Confirmed Patterns

- `taupe` color class used in 90+ files but NOT in tailwind.config.ts — always use `warm-gray`
- Edge Functions are Deno runtime — imports use `esm.sh`, NOT npm packages
- Auto-imports cover all React hooks + Router + i18n — never manually import these
- Review data source: `src/mocks/reviews.ts` → `getReviewsForProduct()`
- Guest policy: rule-based fallback only, no API calls for unauthenticated users

## Correction Log

<!-- Format: [date] Mistake → Rule that prevents recurrence -->

## Debugging Insights

<!-- Format: [symptom] → [root cause] → [fix] -->

## Observations (Not Yet Patterns)

<!-- Items seen once. Promote to Confirmed Patterns after 2+ occurrences. -->
