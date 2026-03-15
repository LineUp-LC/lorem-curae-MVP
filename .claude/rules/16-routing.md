---
scope: "Route config, navigation components, deferred route governance"
authority: primary
last_synced: "2026-03-15"
related: ["01-workflow.md", "03-frontend.md", "13-domain-features.md"]
---

# Routing Rules

> Trigger: read this file when modifying src/router/config.tsx, adding new routes, or changing navigation

## Active Routes (Phase 1 Hub)

- 22 active routes defined in src/router/config.tsx
- All other routes are commented out with: `// DEFERRED: Phase [X] — see Notion "Deferred Work Tracker" for trigger condition`
- Do NOT uncomment deferred routes without checking the Notion Deferred Work Tracker for the trigger condition
- Do NOT add new routes without confirming they belong to the current phase

## Navigation Components

- Navbar (`src/components/feature/Navbar.tsx`): 5 items — Discover, Ingredients, Routines, AI Chat, Account
- ProfileDropdown (`src/components/feature/ProfileDropdown.tsx`): links to /account, /routines-list, /ai-chat, /settings, /skin-survey-account, sign out
- Footer (`src/components/feature/Footer.tsx`): 4 columns — Explore, Support, Company, Newsletter + Social
- Any new nav link must point to an active (non-deferred) route

## Catch-All

- All unmatched paths redirect to `/` via `<Navigate to="/" replace />`
- This replaces the previous NotFoundPage — any deferred route visited directly will redirect to home
