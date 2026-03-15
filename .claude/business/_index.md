---
scope: "Business context routing table — query-pattern → file lookup"
authority: primary
last_synced: "2026-03-14"
---

# Business Context — Routing Table

> Every business-context query resolves to exactly 1 file.

## File Summary

| File | Sources Merged | Scope |
|------|---------------|-------|
| `identity.md` | 00-identity + 01-founder + 07-brand-voice | Company, founder, brand voice, values |
| `product.md` | 02-product-overview + 03-features | Product description, features, roadmap |
| `tech.md` | 04-tech-stack | Tech stack, architecture, Edge Functions |
| `audience.md` | 05-audience | Target audience, personas, pain points |
| `business-model.md` | 06-business-model + 11-metrics + 12-legal + 13-resources + 16-extended-model | Revenue, pricing, metrics, legal, resources |
| `competitive.md` | 08-competitors + 14-strategy + 17-white-space + 19-exploit-mitigate | Competitors, strategy, SWOT, differentiation |
| `marketing.md` | 09-funnel + 10-marketing-growth + 15-references + 18-habit-loops | Funnel, growth, references, habit loops |
| `agent-guide.md` | 20-agent-guide | Agent routing table |

---

## Query Routing

### Identity & Brand

| Query Pattern | File |
|---------------|------|
| Company name, mission, vision, tagline | `identity.md` |
| Founder profile, origin story, credibility | `identity.md` |
| Brand personality, tone, voice examples | `identity.md` |
| Brand values, messaging pillars | `identity.md` |

### Product

| Query Pattern | File |
|---------------|------|
| Product description, value proposition | `product.md` |
| Problems solved, how it solves them | `product.md` |
| Feature list (MVP / Should / Could / Won't) | `product.md` |
| Product roadmap phases | `product.md` |

### Technical

| Query Pattern | File |
|---------------|------|
| Full tech stack (frontend, backend, AI, payments) | `tech.md` |
| Architecture summary, state management | `tech.md` |
| Supabase Edge Functions list | `tech.md` |
| Design system summary | `tech.md` |

### Audience

| Query Pattern | File |
|---------------|------|
| Target audience segments | `audience.md` |
| B2C persona, demographics, psychographics | `audience.md` |
| B2B persona (indie creators) | `audience.md` |
| Customer insights, emotional desires, pain points | `audience.md` |

### Business Model

| Query Pattern | File |
|---------------|------|
| Revenue model, revenue streams | `business-model.md` |
| Pricing tiers (free / enthusiast / enterprise) | `business-model.md` |
| Financial snapshot, cost structure | `business-model.md` |
| North star metric, KPI dashboard | `business-model.md` |
| Legal structure, compliance, data residency | `business-model.md` |
| Resources, constraints, bottlenecks | `business-model.md` |
| Key partners, activities, resources | `business-model.md` |

### Competitive

| Query Pattern | File |
|---------------|------|
| Direct / indirect competitors | `competitive.md` |
| SWOT analysis | `competitive.md` |
| Positioning statement (MVP / scaled) | `competitive.md` |
| Market size (TAM / SAM / SOM) | `competitive.md` |
| White space analysis | `competitive.md` |
| Strength exploitation / weakness mitigation | `competitive.md` |

### Marketing & Growth

| Query Pattern | File |
|---------------|------|
| Customer journey stages | `marketing.md` |
| Key conversion points (signup, activation, aha, upgrade) | `marketing.md` |
| Growth channels, partnerships | `marketing.md` |
| Content pillars, publishing cadence | `marketing.md` |
| Habit loop design (trigger → action → reward → investment) | `marketing.md` |
| Reference documents (Notion links) | `marketing.md` |

### Agent Routing

| Query Pattern | File |
|---------------|------|
| Which files should a research agent read | `agent-guide.md` |
| Which files should a marketing agent read | `agent-guide.md` |
| Agent → file routing table | `agent-guide.md` |
