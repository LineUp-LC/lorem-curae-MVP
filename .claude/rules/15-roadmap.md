---
scope: "Feature tiers (MoSCoW), priority enforcement, complexity proportionality, table stakes vs differentiators"
authority: primary
last_synced: "2026-03-15"
related: ["13-domain-features.md"]
---

# Roadmap & Priority Governance

---

## Feature Tiers (MoSCoW)

| Tier | Features | Implementation Depth |
|------|----------|---------------------|
| **MVP (Must-Have)** | Product/service comparison, smart search with retailer trust scoring, personalized filtering, ingredient transparency + education, routine management, self-tracking, basic AI interaction, nutrition management, situational guidance | Production-grade. Fully functional, integrated, tested. No shortcuts. |
| **Growth (Should-Have)** | Progress tracking & feedback, marketplace (basic), patch tests, advanced AI (adaptive), community features, gamification v1 (points economy, streaks, badges, rewards dashboard) | Extensible architecture. Build for scale, ship incrementally. |
| **Scale (Could-Have)** | AR (skin analysis, try-ons), product creation (creator tools), creator ecosystem, immersive experiences | Interface definitions and architectural placeholders only. Do not build until Growth is stable. |
| **Won't-Have (For Now)** | Advanced wellness integrations beyond core nutrition | Do not build, do not suggest, do not architect. |

---

## Table Stakes vs. Differentiators

| Category | Features |
|----------|----------|
| **Table Stakes** | Product/service comparison, routine management, nutrition management, self-tracking, progress tracking & feedback |
| **Differentiators** | Marketplace, patch tests, advanced AI interaction, AR, product creation |

Table-stakes features must be rock-solid. Differentiators earn the premium positioning.

---

## Priority Enforcement

- Never over-engineer an MVP feature with Scale-tier complexity
- Never suggest Won't-Have features unless the user brings them up
- When proposing architectural decisions, state which tier the decision serves
- When a feature spans tiers, implement the lower tier first and propose the higher tier as follow-up
- MVP = production-critical (zero partial implementations)
- Growth = extensible (build foundation, note future hooks)
- Scale = deferred (define interfaces, do not implement logic)
- Won't-Have = zero code, zero types, zero architecture

---

## Complexity Proportionality

| Tier | Implementation Depth |
|------|---------------------|
| MVP | Full: all states, edge cases, persistence, integration |
| Growth | Full + hooks for future expansion; document extension points |
| Scale | Type definitions, interface sketches, architectural notes only |
| Won't-Have | Nothing |
