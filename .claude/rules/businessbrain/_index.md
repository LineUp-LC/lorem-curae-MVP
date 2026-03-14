<!-- Brain Rule: Master Index -->
<!-- Scope: All agents — table of contents for the Brain rule directory -->
<!-- Source: businessbrain.md (full document) -->
<!-- Last updated: 2026-03-14 -->

# Brain Rules — Master Index

This directory contains the segmented business context for Lorem Curae. Each file is a standalone rule file that can be loaded independently by Claude Code agents.

**Source**: `Brain/businessbrain.md` (canonical single-file backup)

## File Directory

| File | Title | Description |
|---|---|---|
| `00-identity.md` | Company Identity | Company name, mission, vision, tagline, stage, founder basics |
| `01-founder.md` | Founder & Credibility | Origin story, founder profile, proof points, unique edge |
| `02-product-overview.md` | Core Product | Product name, description, category, problems solved, value props |
| `03-features.md` | Features & Roadmap | All feature tables (must-have through won't-have) + product roadmap phases |
| `04-tech-stack.md` | Tech Stack & Architecture | Full frontend/backend/infra/AI/auth/payments breakdown, architecture summary, Edge Functions list |
| `05-audience.md` | Target Audience | Sophistication, segments, B2C/B2B personas, customer insights, emotional desires, pain points |
| `06-business-model.md` | Business Model & Pricing | Revenue model, all 5 revenue streams, pricing tiers, financial snapshot, cost structure |
| `07-brand-voice.md` | Brand & Voice | Personality, tone, anti-tone, voice examples, brand values, messaging pillars |
| `08-competitors.md` | Competitive Landscape | Direct/indirect competitor tables, positioning, SWOT summary |
| `09-funnel-journey.md` | Customer Journey & Funnel | 7-stage journey map, key conversion points (signup, activation, aha, upgrade) |
| `10-marketing-growth.md` | Marketing & Growth Channels | SEO/content, social media, awareness channels, partnerships, growth levers |
| `11-metrics.md` | Metrics & KPIs | North star metric, key metrics dashboard table |
| `12-legal-compliance.md` | Legal, Compliance & Constraints | Legal structure, data residency, content restrictions, regulatory considerations |
| `13-resources.md` | Resources & Constraints | Budget, tools, time, skills, bottlenecks |
| `14-strategy.md` | Strategic Context | Why now, market size (TAM/SAM/SOM), trends, risks, assumptions, milestones |
| `15-references.md` | Reference Materials | All Notion workspace links |
| `16-extended-model.md` | Key Business Model Details | Key partners, key activities, key resources |
| `17-white-space.md` | White Space & Differentiation | MVP and fully scaled white space analysis |
| `18-habit-loops.md` | Habit Loop Design | MVP and growth phase habit loops (trigger/action/reward/investment) |
| `19-exploit-mitigate.md` | Exploitation & Mitigation | Strength exploitation strategies, weakness mitigation strategies |
| `20-agent-guide.md` | Agent Usage Guide | Which agents read which files, with file references |
| `_index.md` | Master Index | This file — directory listing and agent routing |

## Agent Routing (Quick Reference)

| Agent | Files to Load |
|---|---|
| **Research Agent** | `08-competitors.md`, `10-marketing-growth.md`, `14-strategy.md`, `02-product-overview.md`, `17-white-space.md` |
| **Reviewer Agent** | `04-tech-stack.md`, `18-habit-loops.md` |
| **QA/Testing Agent** | `04-tech-stack.md`, `12-legal-compliance.md` |
| **Marketing Skills** | `01-founder.md`, `02-product-overview.md`, `05-audience.md`, `07-brand-voice.md`, `09-funnel-journey.md`, `10-marketing-growth.md` |
| **Strategy Tasks** | `06-business-model.md`, `11-metrics.md`, `14-strategy.md`, `16-extended-model.md`, `19-exploit-mitigate.md` |
| **Competitive Analysis** | `08-competitors.md`, `03-features.md`, `06-business-model.md`, `01-founder.md`, `17-white-space.md` |
| **Content / Copy Tasks** | `01-founder.md`, `05-audience.md`, `07-brand-voice.md`, `02-product-overview.md` |
| **Product Agent** | `03-features.md`, `18-habit-loops.md`, `09-funnel-journey.md`, `16-extended-model.md` |
| **Growth Agent** | `10-marketing-growth.md`, `09-funnel-journey.md`, `11-metrics.md`, `19-exploit-mitigate.md` |
