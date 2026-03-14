# Future-Proofing Rules

> Trigger: Read this file when implementing any new feature or modifying existing functionality.

---

## Core Requirements

Every new feature or modification must:

### 1. Scale to Real Production Data
- No hard-coded assumptions
- No mock-specific logic
- No reliance on static arrays or temporary values

### 2. Use Reusable Classification Utilities
- All filters (time of day, skin type, concerns, ingredients, routines) must use shared classification utilities
- Never implement filter logic inline inside components
- All classification logic must live in `src/lib/utils/`

### 3. Support Future Entities
Products, Ingredients, Retailers, Routines, Reviews, and future content types

### 4. Support Future Filters
Time of day, skin type, concern targeting, ingredient strength, sensitivity risk, acne/pregnancy safety, routine step, category, price, brand, retailer, and any future filter

### 5. Support Future Routing
- Every entity must have a stable ID or slug
- Search results must route correctly for all entity types
- No hard-coded paths

### 6. Support Future UI Surfaces
Discovery, product detail, ingredient library, retailer reviews, comparison, routine builder, dashboard, and future pages

---

## Mandatory Checklist

Before marking any feature complete:

- [ ] Scales to real products from Supabase?
- [ ] Works for future products with different naming conventions?
- [ ] Works for new filters added later?
- [ ] Works for new categories or product types?
- [ ] Works for new ingredients?
- [ ] Works for new pages or surfaces?
- [ ] Works for new routing patterns?
- [ ] Avoids hard-coding?
- [ ] Uses shared utilities instead of inline logic?
- [ ] Avoids duplication?
- [ ] Integrates with all existing systems?
- [ ] Avoids assumptions based on mock data?
- [ ] Follows canonical patterns across the site?

If ANY answer is "no": stop, explain the issue, propose the correct scalable architecture, wait for approval.

---

## Implementation Rules

### Extract Reusable Utilities
All classification logic → `src/lib/utils/`

### Normalize All Metadata
- IDs are stable, slugs are normalized
- Categories and ingredient names are normalized
- Filters use normalized values

### Avoid Inline Logic
No filter logic inside components, pages, or hooks. All logic must be centralized.

### Avoid Mock-Specific Assumptions
Never assume: product names follow a pattern, ingredients are always present, categories are consistent, time-of-day is provided manually.

### Build for Expansion
Every feature must support: additional fields, filters, entities, and pages.

---

## Entity Registry

Every entity must have:
- A canonical type in `src/types/`
- Shared utilities in `src/lib/utils/` for sorting, filtering, matching
- Normalized IDs and slugs
- A data shape compatible with existing personalization, sorting, and filtering utilities
- No hard-coded assumptions about entity count, naming, or structure

Current registry:
- Products (`src/types/product.ts`)
- Retailers (`src/types/retailer.ts`)
- Ingredients (inline — extract when shared)
- Routines (inline — extract when shared)
- Reviews (inline — extract when shared)

---

## Exit Conditions

A feature is complete only when:
- All future-proofing checks pass
- All integrations pass
- All QA checks pass
- No mock-specific logic remains
- The architecture supports future expansion
