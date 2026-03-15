---
scope: "Agent routing — which business files each agent type should read"
authority: primary
last_synced: "2026-03-14"
sources: ["businessbrain/20-agent-guide.md"]
---

# Agent Usage Guide

How sub-agents should use the business context files:

| Agent | Files to Load | Example Task |
|---|---|---|
| **Research Agent** | `competitive.md`, `marketing.md`, `product.md` | "Compare our pricing to competitors" |
| **Reviewer Agent** | `tech.md`, `marketing.md` | "Review onboarding flow against retention model" |
| **QA/Testing Agent** | `tech.md`, `business-model.md` | "Verify GDPR compliance in data handling" |
| **Marketing Skills** | `identity.md`, `product.md`, `audience.md`, `marketing.md` | "Draft email sequence for B2C segment" |
| **Strategy Tasks** | `business-model.md`, `competitive.md` | "Evaluate whether to add a new pricing tier" |
| **Competitive Analysis** | `competitive.md`, `product.md`, `identity.md` | "How does our feature set compare to [competitor]?" |
| **Content / Copy Tasks** | `identity.md`, `audience.md`, `product.md` | "Write a landing page hero section" |
| **Product Agent** | `product.md`, `marketing.md` | "Prioritize next sprint features" |
| **Growth Agent** | `marketing.md`, `business-model.md`, `competitive.md` | "Design pre-launch waitlist campaign" |
