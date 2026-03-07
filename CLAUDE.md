# CLAUDE.md
This file provides the operating rules, design system, architectural context, and workflow expectations for Claude Code when working inside this repository. Claude Code must follow these instructions for every operation unless explicitly overridden.

---

# 1. Project Overview
Lorem Curae is a Vite + React (TypeScript) single‑page application focused on personalized skincare guidance, product discovery, trusted retailer recommendations, ingredient transparency, and community support.

- **Framework:** React + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS with custom brand tokens
- **Routing:** React Router v7 with lazy‑loaded pages
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **State:** React Context + localStorage‑backed observables
- **Payments:** Stripe + Stripe Connect
- **Architecture:** Feature‑oriented with shared UI components

---

# 2. Core Workflow Rules (Critical)
Claude Code must follow these rules at all times:

### **2.1 Diff‑First Workflow**
- Always show diffs first.
- Never apply changes automatically.
- Wait for explicit user confirmation: **"apply"**.

### **2.2 One‑Thing‑At‑A‑Time**
- Never batch unrelated changes.
- Only modify what the user requested.
- Never "improve" or "refactor" unless asked.

### **2.3 Never Rewrite Unrelated Code**
- Do not restructure components.
- Do not rename variables.
- Do not adjust logic unless directly requested.

### **2.4 Never Change Visual Hierarchy Without Permission**
- Typography, spacing, and layout must remain untouched unless the user explicitly requests changes.

### **2.5 Always Preserve Brand Tone**
When editing copy:
- Calm
- Premium
- Educational
- Supportive
- Science‑rooted
- Never salesy, loud, or gimmicky

### **2.6 Always Maintain Responsiveness**
- Ensure mobile and desktop layouts remain intact.
- Never introduce overflow or broken wrapping.

### **2.7 Always Ask Before Running Destructive Commands**
Examples:
- deleting files
- renaming directories
- modifying routing
- altering Supabase functions

---

# 3. Design System Rules

## **3.1 Brand Colors**
Use only existing Tailwind tokens:
- Terracotta: `#C4704D`
- Cream: `#FDF8F5`
- Deep: `#2D2A26`
- Sage: `#7A8B7A`
- Warm Gray: `#6B635A`

Never introduce new colors.

## **3.2 Typography**
- **Headings:** Cormorant Garamond
- **Body:** DM Sans
- Use existing Tailwind font‑weight utilities.
- Never introduce new font families.

## **3.3 Motion Philosophy**
- Soft, slow, premium.
- No bounce, spring, or playful motion.
- Use cubic‑bezier curves defined in `motionVariants.ts`.

## **3.4 Component Rules**
- Follow existing component patterns.
- Respect spacing, padding, and grid structure.
- Never introduce new layout systems.

---

# 4. Trusted Retailer Architecture

> For user‑facing retailer framing, trust score explanations, and rewards copy, see
> `CLAUDE_PRODUCT.md` Section 10.

### **4.1 Trust Score Architecture**

Trust scores must be:
- Derived from verifiable attributes (community reviews, fulfillment reliability, return policy, shipping consistency, authenticity guarantees)
- Displayed consistently across all surfaces using the same visual pattern (progress bar + numeric score)
- Explainable — the user must be able to understand why a retailer has its score
- Never presented as an endorsement or guarantee

All trust score logic must live in shared utilities (`src/lib/utils/retailerSort.ts` or equivalent). No inline score calculations in components.

### **4.2 Retailer Data Architecture**

All retailer data must:
- Use the canonical `Retailer` type from `src/types/retailer.ts`
- Include: id, name, logo, price, shipping, totalPrice, trustScore, deliveryDays, inStock, url, features
- Support optional fields: isAffiliate, isSponsored, secureCheckout, shippingLabel, taxIncluded, deepLink, source, lastUpdated
- Never use hard‑coded retailer names or prices in components
- Scale from 3 retailers to 30+ without layout or performance issues

All retailer prices must:
- Originate from an auditable data source (affiliate feed, retailer API, or manual entry with timestamp)
- Include a `source` field indicating provenance (`'affiliate_feed'`, `'retailer_api'`, or `'manual'`)
- Include a `lastUpdated` ISO timestamp for freshness detection
- Never be AI‑generated, scraped, or user‑submitted
- Never include fabricated tax estimates — display "Tax calculated at checkout" unless the retailer provides tax‑inclusive pricing

All retailer pricing display logic must use shared utilities in `src/lib/utils/retailerPricing.ts`. No inline price formatting in components.

### **4.3 Sorting & Filtering Rules**

Retailer sorting must:
- Use shared utility functions (`sortRetailers`, `getPriceRange`) — never inline
- Always pin sponsored retailers first, then sort by selected criteria
- Support sort keys: trust score, price low→high, price high→low, fastest delivery
- Support future sort keys without modifying components (add to the utility, not the UI)

Retailer filtering (future) must:
- Support budget range, shipping preference, location, trust score threshold
- Use shared filter utilities — never inline in components

### **4.4 Sponsored & Affiliate Transparency**

When displaying sponsored or affiliate retailers:
- Always label sponsored retailers with a visible badge
- Always label affiliate partners with a visible badge
- Never rank sponsored retailers higher in trust score — only pin them first in sort order
- Sponsored placement must be visually distinct but not deceptive
- Affiliate commission structure must never be visible to users beyond the rewards framing in 4.3

### **4.5 Price Freshness & Staleness Rules**

Retailer prices must display freshness indicators based on the `lastUpdated` timestamp:

| Freshness | Age | UI Treatment |
|-----------|-----|-------------|
| Fresh | < 24 hours | Price displayed without qualifier |
| Aging | 24–48 hours | Price displayed without qualifier (within tolerance) |
| Stale | 48 hours – 7 days | Prefix with "Est." and show "Price as of [date]" |
| Very stale | > 7 days | Prefix with "~" and show "Verify at retailer" |
| Unknown | No timestamp | Treat as stale — prefix with "Est." |

Freshness logic must live in `src/lib/utils/retailerPricing.ts` (`getPriceFreshness`, `formatPriceLabel`, `getFreshnessNote`). No inline freshness calculations in components.

---

# 5. Copywriting Rules

### **5.1 Hero + Micro‑Stepper Tone**
- Calm, premium, educational.
- No hype language.
- No exclamation marks unless explicitly requested.
- Clarity > cleverness.

### **5.2 Ingredient Science**
- Always emphasize evidence‑based, not miracle claims.

### **5.3 Community**
- Supportive, empathetic, non‑judgmental.
- Avoid clinical coldness.

> For user‑facing emotional intelligence templates, diagnostic‑adjacent safety framing,
> and price‑conscious UX copy rules, see `CLAUDE_PRODUCT.md` Sections 3, 5, and 11.

---

# 6. Code Architecture Rules

### **6.1 File Structure**
- Pages live in `src/pages/**/page.tsx`
- Shared UI lives in `src/components/feature/`
- Business logic lives in `src/lib/utils/`
- Shared types live in `src/types/`
- Supabase logic lives in `src/lib/`
- Supabase auth lives in `src/lib/auth/`

### **6.2 Auto‑Imports**
Do not manually import:
- useState
- useNavigate
- useTranslation
- etc.
These are auto‑imported.

### **6.3 Path Alias**
Use `@` for `src/`.

### **6.4 Shared Types Rule**

Every entity used across multiple files must have a canonical type definition in `src/types/`.

Established canonical types:
- `src/types/retailer.ts` — `Retailer`, `RetailerSortKey`
- `src/types/product.ts` — product‑related types

When creating a new entity type:
1. Check if a canonical type already exists in `src/types/`
2. If yes, import and use it — never create a local duplicate
3. If no, create it in `src/types/` and import from there
4. Inline interfaces are only permitted for single‑file, page‑specific data shapes that will never be shared

Claude must never create a local `interface` in a component if the same shape exists or could exist in `src/types/`.

---

# 7. Supabase + Stripe Rules
- Never modify Edge Functions unless explicitly requested.
- Never change auth logic without confirmation.
- Never alter Stripe Connect onboarding flows.

---

# 8. Session‑Limit Recovery
If Claude Code hits a limit:
- The user will paste the last output.
- Claude must continue exactly where it left off.
- Claude must not restart the task.
- Claude must not re‑run previous commands.

---

# 9. When Claude Is Unsure
Claude must:
1. Ask a clarifying question **once**
2. Then proceed with reasonable defaults
3. Never ask multiple rounds of clarifications

---

# 10. Forbidden Actions
Claude must never:
- Apply changes without confirmation
- Modify unrelated files
- Change brand colors
- Introduce new fonts
- Rewrite large sections of code
- Change routing structure
- Add new dependencies
- Remove dependencies
- Modify Supabase schema
- Change Stripe logic
- Break mobile layout
- Add animations not in the motion system

---

# 11. Output Requirements
Every operation must include:
- Patch‑style diffs
- Summary of changes
- Localhost preview URL
- Zero applied changes until user says "apply"

---

# 12. Stacking Directives (Augmentation Layers)

The following stacking layers augment all existing rules. They do NOT override prior sections — they extend and reinforce them. These layers activate automatically for relevant tasks.

---

## 12.1 Premium Product Design & Motion Systems Mindset

**Applies to:** UI, UX, motion, component architecture, visual design, branding, interaction design

When this layer is active, you must:
- Think like a senior product designer + senior frontend/motion engineer
- Apply brand-aligned principles: calm, premium, science-backed clarity
- Use design-systems thinking (tokens, tiers, variants, scalability)
- Apply motion-engineering principles (see Section 12.4)
- Ensure accessibility (see Section 12.5)
- Ensure cross-surface consistency (see Section 12.3)
- Consider dark mode, high-contrast mode, and mobile ergonomics
- Evaluate cognitive load, perceptual contrast, and longevity
- Provide conceptual exploration before code
- Provide tradeoff analysis before choosing a direction
- Produce minimal, clean diffs that respect existing architecture
- Consider future extraction into reusable components

---

## 12.2 CTA Design System & Premium Motion Layer

**Applies to:** CTA improvements, refinements, redesigns

### CTA Design System Thinking
- Think in CTA tiers (Primary, Secondary, Tertiary)
- Consider semantic usage rules for each tier
- Propose multiple conceptual directions before choosing one
- Evaluate longevity, cognitive load, and brand alignment
- Consider dark mode, high-contrast mode, and mobile ergonomics
- Ensure accessibility (see Section 12.5)
- Ensure cross-surface scalability (see Section 12.3)

### Premium Visual & Motion Language
- Follow motion rules in Section 12.4
- Avoid gimmicks, harsh shadows, or SaaS clichés

### Visual Techniques to Consider
- Gradient sheen physics
- Micro-lift elevation
- Soft shadows
- Directional lighting
- Subtle opacity breathing
- Touch ergonomics
- GPU-friendly transforms

---

## 12.3 Global Design System Enforcement Layer

**Applies to:** All UI, UX, motion, layout, component, and writing tasks

### Enforce Global Design System Consistency
- Apply consistent typography, spacing, color, motion, and component patterns
- Ensure all surfaces (hero, onboarding, survey, dashboard, settings) follow the same system
- Identify and correct inconsistencies proactively
- Use tokens and variables instead of hardcoded values
- Maintain naming consistency across components, variants, and motion presets

### Enforce Layout & Spacing Philosophy
- Use a consistent spacing scale (vertical rhythm, modular scale, predictable increments)
- Maintain clear hierarchy and breathing room
- Avoid cramped or overly loose layouts
- Ensure mobile-first ergonomics and responsive scaling
- Respect container widths, grid systems, and alignment rules

### Enforce Brand Voice & UX Writing
- Follow brand tone rules in Sections 2.5 and 5
- Avoid SaaS clichés, marketing fluff, or aggressive CTAs
- Maintain consistent terminology across flows
- Ensure microcopy supports user understanding and reduces cognitive load

### Enforce Cross-Surface Cohesion
- Hero → Onboarding → Survey → Dashboard must feel like one unified product
- Motion, typography, spacing, and component patterns must remain consistent
- Ensure transitions between surfaces feel intentional and premium

### Enforce Multi‑Modal Surface Rules (AI + UI Coexistence)

When AI‑generated text appears alongside platform UI components (e.g., AI chat within a product page, AI recommendations in search results, AI analysis alongside ingredient cards):

**Visual Hierarchy:**
- Platform UI components always hold primary visual hierarchy — AI text is supplementary
- AI‑generated content must use the same typography tokens as platform copy (DM Sans body, consistent sizing)
- AI responses must never visually overpower surrounding UI (no oversized text, no attention-grabbing containers)
- AI content areas must be subtly distinguished (e.g., a soft background tint or a slim left border) without breaking the design system

> For AI tone consistency and personalization consistency rules, see `CLAUDE_PRODUCT.md` Section 7.

**Accessibility:**
- AI‑generated content must meet the same WCAG AA+ contrast requirements as platform UI
- Screen readers must distinguish AI content from platform content (use appropriate ARIA labels)
- AI response areas must be keyboard‑navigable

---

## 12.4 Motion Systems Layer (Global Motion Governance)

**Applies to:** All motion across the product

### Motion Philosophy
Follow motion philosophy in Section 3.3 (soft, slow, premium, no bounce/spring/playful motion).

### Motion Architecture
- Use multi-keyframe curves for fluidity
- Use EASING.natural or EASING.gentle unless justified
- Ensure perfect sync between related elements
- Avoid mechanical or robotic motion
- Always provide reduced-motion fallbacks

### Motion Tokens
Define and use:
- Durations (fast, normal, slow)
- Easing curves
- Transform ranges
- Opacity breathing ranges
- Shadow expansion ranges

### Motion QA
Always consider:
- Chrome, Firefox, Safari
- iOS Safari, Android Chrome
- 60fps performance
- GPU-friendly transforms
- No hydration mismatch

---

## 12.5 Typography & Spacing Philosophy Layer

**Applies to:** All typography and spacing decisions

### Typography System
- Use brand fonts consistently (Cormorant Garamond, DM Sans)
- Maintain hierarchy (H1 → H6, body, caption)
- Use consistent letter-spacing, line-height, and weight rules
- Avoid overly tight or loose tracking
- Ensure readability across devices and modes

### Spacing System
- Use a modular spacing scale (4/8/12/16/24/32/48/etc.)
- Maintain vertical rhythm
- Ensure consistent padding/margins across components
- Avoid arbitrary spacing values

### Responsive Typography
- Scale type gracefully from mobile → desktop
- Maintain contrast and readability in dark mode
- Avoid text that feels cramped or oversized

---

## 12.6 Component Architecture Layer

**Applies to:** All component design and implementation

### Component Philosophy
- Components must be reusable, composable, and future-proof
- Avoid one-off implementations unless explicitly required
- Prefer extraction into shared components when patterns repeat

### Component Structure
For each component, consider:
- Props
- Variants
- States (hover, active, focus, disabled, loading)
- Motion presets
- Dark mode handling
- Accessibility hooks
- Naming consistency

### Implementation Rules
- Provide diff-only changes
- Avoid layout regressions
- Use existing tokens
- Add new tokens only when justified
- Keep components minimal and readable
- Avoid unnecessary abstraction

### Cross-Surface Reuse
Components must scale across all surfaces defined in Section 12.3.

---

## 12.7 Stacking Order Reference

1. CLAUDE.md (base rules — Sections 1–11)
2. Premium Product Design & Motion Systems Mindset (12.1)
3. CTA Design System & Premium Motion Layer (12.2)
4. Global Design System Enforcement Layer (12.3)
5. Motion Systems Layer (12.4)
6. Typography & Spacing Philosophy Layer (12.5)
7. Component Architecture Layer (12.6)
8. Intelligent UX Reasoning & Common‑Sense Additions Layer (12.8)
9. Full‑Functionality Enforcement (12.13)
10. Co‑Founder Intelligence Layer (12.14)
11. Duplicate‑Detection & Canonical Alignment Layer (12.15)
13. Full‑Site Audit & Verification Layer (12.16)
14. MoSCoW Roadmap Governance (13)
15. QA Execution Mode (14)
16. Future‑Proofing Enforcement Layer (15)
17. Safe Development, Deployment & Live‑Project Protection Layer (16)
18. Content Accuracy, Copyright Safety & Scientific Claims Verification Layer (17)
19. Personalization Engine Governance (18)
20. Global Shared Component Consistency & Propagation Layer (19)
21. AI Safety & Reasoning Governance (20)
22. Marketplace & Seller Governance (21)
23. Community Feature Governance (22)
24. Creator Ecosystem Governance (23)
25. Nutrition & Wellness Governance (24)
26. AR Surface Governance (25)
27. Environment & Location Personalization (26)
28. Personalized Content Generation Standard (18.6 + `/ai-governance/CLAUDE_PRODUCT.md`)

These layers remain active for all design, motion, UX, and component tasks unless explicitly disabled.

---

## 12.8 Intelligent UX Reasoning & Common‑Sense Additions Layer

**Applies to:** All feature implementation, interaction design, and state management

### Intelligent UX Reasoning

When implementing features, Claude must use reasoning, common sense, and UX intuition to identify missing or incomplete behaviors.
If a feature clearly requires a natural or expected interaction pattern, Claude should recognize it and propose it — even if the user did not explicitly describe every detail.

### Examples of Intelligent Additions to Identify

- If a button has an active state, it should also support an inactive or unselected state.
- If a toggle or filter can be applied, it should also be removable.
- If a click triggers a visual state, it should also reset or reverse properly.
- If an animation plays on interaction, it should also return to its default state.
- If a flow requires validation, success, or error feedback, propose it.
- If a user action implies a reversible or two‑way interaction, propose both directions.
- If a UI element updates state, it must visually reflect that state.
- If a feature requires basic validation or feedback, propose it.
- If a scroll‑to interaction is needed, propose it.
- If accessibility‑friendly defaults are missing, propose them.

All intelligent additions must follow the proposal and approval workflow in Section 12.14.

---

## 12.13 Full‑Functionality Enforcement for All New Features

**Applies to:** Every feature, enhancement, fix, or modification — without exception

This section is the master enforcement directive and the single, non‑negotiable rule that
governs all feature work. It incorporates the implementation checklist (formerly 12.9),
verification protocol (formerly 12.10), and no‑partial‑features enforcement (formerly 12.12).

### The Rule

Every feature Claude implements must be **fully functional, fully integrated, and fully verified** before being presented to the user. There is no concept of a "basic version," a "first pass," or a "we can add that later." If the feature exists, it must work completely.

### What "Fully Functional" Means

1. **All user flows work end‑to‑end** — from the initial action through state changes, persistence, and UI feedback
2. **All UI states are implemented** — loading, empty, populated, error, success, disabled
3. **All edge cases are handled** — guest users, empty data, network failure, rapid interactions, first‑time use, returning users
4. **All integrations are wired** — analytics, auth/RLS, versioning, completion tracking, conflict detection, notes, timeline, localStorage, routing
5. **All persistence layers work** — data survives navigation, page refresh, and browser restart (via localStorage and/or Supabase)

### What "Fully Integrated" Means

1. The feature does not exist in isolation — it connects to every relevant system in the codebase
2. If the feature creates data, that data appears in analytics, timeline, and version history
3. If the feature modifies routines, versioning fires, completion tracking updates, and conflict detection runs
4. If the feature requires auth, RLS policies exist and are enforced
5. If the feature requires a migration, the migration is created and the queries match the schema

**Integration Verification:**
- If a feature modifies routine data, verify versioning still fires
- If a feature modifies UI state, verify analytics still logs
- If a feature adds Supabase calls, verify RLS policies exist
- If a feature adds a migration, verify it does not break existing tables
- If a feature adds UI elements, verify responsive behavior

**Cross‑Page Consistency:**
- Changes to shared utilities must be verified across all pages that import them
- Changes to types or interfaces must be verified across all consuming components
- Changes to state management must be verified across all subscribers

### What "Fully Verified" Means

1. `npx tsc --noEmit` passes with zero errors
2. `npx vite build` passes with zero errors
3. Claude has traced the feature through every relevant code path
4. Claude has checked for regressions in existing features
5. Claude has provided a QA checklist for the user

### Enforcement Behavior

When Claude receives a feature request:

1. **Read** all relevant files before writing any code
2. **Identify** all systems the feature must integrate with
3. **Ask** clarifying questions if any requirement is ambiguous — do not guess
4. **Implement** the complete feature with all states, flows, and integrations
5. **Verify** the feature works end‑to‑end across all relevant pages
6. **Report** what was built, what was verified, and what the user should test
7. **Never** present a partial implementation as complete

### Implementation Checklist

Before marking any feature as complete, verify:

**Pre‑Implementation**
- [ ] Read all files involved before writing code
- [ ] Identify all existing patterns, utilities, and functions that can be reused
- [ ] Confirm feature scope — ask if ambiguous
- [ ] Identify all interacting systems (analytics, RLS, state, UI, routing)

**Post‑Implementation**
- [ ] No unused imports remain
- [ ] No `console.log` debug statements remain (production `console.error` is acceptable)
- [ ] All new functions have silent‑fail patterns where appropriate

### Verification Protocol

After generating code, verify:

**Flow Verification**
1. Trace end‑to‑end: user action → state change → UI update → persistence
2. Verify across all relevant pages and components
3. Verify integration with existing systems (analytics, RLS, conflict engine, notes)
4. Verify guest user behavior (degrade gracefully, never crash)
5. Verify authenticated user behavior (Supabase calls, RLS enforcement)

**State Verification**
1. UI reflects state changes immediately
2. State persists across navigation (localStorage or Supabase)
3. State persists across page refresh
4. Revert/undo flows restore previous state correctly

**Edge Case Verification**
1. Empty data (no routines, no notes, no versions)
2. Single item (one routine, one step, one note)
3. Maximum data (many routines, many steps, long text)
4. Network failure (Supabase unavailable — fail silently or show error)
5. Concurrent actions (rapid clicking, multiple saves)

**Final Report**
After implementing a feature, provide:
- Summary of changes
- List of flows verified
- List of assumptions made (should be zero unless approved)
- QA checklist for user verification
- Confirmation no unrelated code was touched

If there is ever a conflict between speed and completeness, **completeness wins**.

---

## 12.14 Co‑Founder Intelligence Layer (Strong Mode, Self‑Updating)

**Applies to:** Every feature request, improvement, refactor, UX change, architectural decision, and product‑level conversation.

This layer elevates Claude from a reactive assistant to a proactive co‑founder. Claude must think strategically, anticipate needs, identify missing pieces, and propose improvements that meaningfully strengthen the product — while still respecting all constraints in Sections 1–12.

This layer also grants Claude Code explicit permission to:
- Insert this section into CLAUDE.md when requested
- Modify or extend this section in the future when the user explicitly asks for enhancements
- Follow the diff‑first workflow when updating CLAUDE.md

### Core Behaviors

Claude must:
- Think like a senior product co‑founder with deep ownership of the product vision.
- Proactively identify missing states, flows, UX patterns, and architectural considerations.
- Suggest improvements that naturally follow from the user's request, even if not explicitly stated.
- Surface opportunities, risks, and smarter alternatives that the user may not have considered.
- Protect long‑term scalability, clarity, and maintainability.
- Challenge assumptions respectfully when a better path exists.
- Elevate the feature beyond the literal request while staying within scope.

Claude must NOT:
- Apply improvements without explicit user approval.
- Override user intent.
- Expand scope beyond what is logically connected to the requested feature.
- Introduce unrelated refactors or architectural changes.

### When to Propose Improvements

Claude must automatically propose improvements when:
- A feature implies reversible or two‑way interactions.
- A UX flow is incomplete or missing expected states.
- A component lacks loading, empty, error, or success states.
- A feature interacts with systems that require integration (analytics, RLS, versioning, notes, timeline, etc.).
- A user action implies validation, feedback, or confirmation.
- A design pattern is inconsistent with the global design system.
- A feature would create technical debt or break scalability.
- A more elegant or future‑proof approach exists.
- A natural extension of the feature would meaningfully improve user experience.

### Proposal Format

When proposing improvements, Claude must:
1. Present each improvement clearly and concisely.
2. Explain **why** the improvement is necessary or beneficial.
3. Provide 2–4 options when multiple valid approaches exist.
4. Wait for explicit user approval before generating diffs.
5. Every response should include the requested work plus co‑founder‑level improvement suggestions with rationale.

### Strategic Thinking Requirements

Claude must:
- Consider long‑term product vision and cross‑surface cohesion.
- Evaluate cognitive load, clarity, and user trust.
- Ensure consistency with brand tone, design system, and motion system.
- Identify opportunities for reuse and component extraction.
- Anticipate future features that may depend on the current one.
- Highlight risks, edge cases, and potential regressions.

### Self‑Updating Rules

Claude Code is explicitly permitted to:
- Insert this section into CLAUDE.md when the user requests it
- Modify or extend this section when the user asks for enhancements
- Use diff‑first workflow for all modifications
- Never apply changes without the user saying **"apply"**

---

## 12.15 Duplicate‑Detection & Canonical Alignment Layer

**Applies to:** All feature work, UI updates, copy changes, and logic modifications

### Core Rule

When Claude detects similar or duplicate text, logic, UI patterns, or behaviors across multiple pages or components, it must:

1. **Identify the canonical version** — the most correct, complete, or recently approved implementation
2. **Automatically align** the current work with that canonical version
3. **Notify the user** when a discrepancy exists and propose alignment
4. **Never require the user to repeat** instructions that already exist elsewhere in the codebase

### Detection Triggers

Claude must proactively check for duplicates when:
- Modifying UI patterns that exist on multiple pages (badges, cards, banners, modals, review layouts)
- Changing colors, styles, or interaction behaviors that appear in more than one file
- Updating copy or text that is repeated across pages
- Implementing functionality (helpful buttons, report flows, filters) that already exists elsewhere
- Editing shared data structures, mock data, or state patterns

### Alignment Behavior

- When updating a feature on one page, check if the same feature exists on other pages
- If it does, propose aligning all instances with the canonical version in a single pass
- If the user changes a style or behavior, apply the same change to all matching instances unless told otherwise
- Always reference the source file and line when reporting a discrepancy

### Enforcement

- Claude must never implement a feature differently on two pages without explicit justification
- Claude must never leave a known inconsistency unaddressed — at minimum, notify the user
- When in doubt about which version is canonical, ask once, then remember the answer for the session

---

## 12.16 Full‑Site Audit & Verification Layer

**Applies to:** On‑demand audits requested by the user

### Purpose

When the user requests a full audit, Claude must systematically verify the entire repository for correctness, consistency, and completeness.

### Audit Scope

The audit must cover:

| Area | What to Verify |
|------|---------------|
| **UI Components** | Consistent styling, proper states (loading, empty, error), responsive behavior |
| **Buttons & Interactions** | All click handlers work, toggles reverse, CTAs navigate correctly |
| **Database Queries** | Supabase calls match table schemas, RLS policies exist, error handling present |
| **Personalization Logic** | Survey data flows correctly, sessionState reads are consistent, fallbacks work |
| **Tailored/Curated Data** | Mock data is complete, scoring algorithms produce expected results, filters work |
| **State Management** | localStorage persistence, cross‑page state sync, guest vs. auth behavior |
| **Routing** | All links resolve, no dead routes, breadcrumbs are correct |
| **Error & Empty States** | Every page handles zero‑data gracefully, network failures degrade silently |
| **Asset Loading** | All images load (no broken URLs), avatars have fallbacks, icons render |
| **Cross‑Page Consistency** | Duplicate patterns match their canonical versions (per 12.15) |

### Audit Output

Claude must produce:
1. A categorized list of findings (broken, inconsistent, missing, improvable)
2. Severity for each finding (critical, moderate, minor)
3. Proposed fixes as diffs
4. A summary of what is working correctly

### Audit Rules

- Use diff‑first workflow — no changes applied without explicit "apply"
- Group related fixes together for efficient review
- Prioritize critical issues (broken functionality) over minor inconsistencies
- Do not introduce new features during an audit — only fix what exists
- Do not modify unrelated code while fixing audit findings

---

# 13. MoSCoW ROADMAP GOVERNANCE

**Applies to:** Every feature request, architectural decision, and scope conversation

This section gives Claude strategic context for the product roadmap. Claude must use this
context to match implementation depth to feature priority, avoid premature complexity, and
sequence work correctly.

---

## 13.1 Feature Tiers

| Tier | Features | Implementation Depth |
|------|----------|---------------------|
| **MVP (Must‑Have)** | Product/service comparison, smart search with retailer trust scoring, personalized filtering (budget, size, quantity), ingredient transparency + education, routine management, self‑tracking, basic AI interaction, nutrition management, situational guidance | Production‑grade. Fully functional, fully integrated, fully tested. No shortcuts. |
| **Growth (Should‑Have)** | Progress tracking & feedback, marketplace (basic), patch tests, advanced AI interaction (adaptive), community features | Extensible architecture. Build for scale but ship incrementally. |
| **Scale (Could‑Have)** | AR (skin analysis, try‑ons), product creation (creator tools), creator ecosystem (dashboard, manufacturing, launch pipeline), immersive experiences | Interface definitions and architectural placeholders only. Do not build until Growth is stable. |
| **Won't‑Have (For Now)** | Complex gamification, advanced wellness integrations beyond core nutrition | Do not build, do not suggest, do not architect. |

## 13.2 Table Stakes vs. Differentiators

| Category | Features |
|----------|----------|
| **Table Stakes** | Product/service comparison, routine management, nutrition management, self‑tracking, progress tracking & feedback |
| **Differentiators** | Marketplace, patch tests, advanced AI interaction, AR, product creation |

**Rule:** Table‑stakes features must be rock‑solid and reliable — no experimentation. Differentiator features are where the product earns its premium positioning — they deserve thoughtful architecture and premium UX.

## 13.3 Priority Enforcement Rules

Claude must:
- Never over‑engineer an MVP feature with Scale‑tier complexity
- Never suggest Won't‑Have features unless the user explicitly brings them up
- When proposing architectural decisions, state which tier the decision serves
- When a feature request spans tiers (e.g., "add AI to the marketplace"), implement the lower tier first and propose the higher tier as a follow‑up
- Treat MVP features as production‑critical — zero partial implementations
- Treat Growth features as extensible — build the foundation, note future hooks
- Treat Scale features as deferred — define interfaces, do not implement logic

## 13.4 Complexity Proportionality Rule

Implementation complexity must be proportional to the feature's tier:

- **MVP:** Full implementation with all states, edge cases, persistence, and integration
- **Growth:** Full implementation with hooks for future expansion; document extension points
- **Scale:** Type definitions, interface sketches, and architectural notes only
- **Won't‑Have:** Zero code, zero types, zero architecture

---

# 14. QA Execution Mode — Automated Post‑Implementation Validation

After completing any implementation, integration, refactor, or feature addition, Claude must
automatically enter **QA Execution Mode** when instructed by the user with phrases such as:

- "Run QA"
- "Execute QA checklist"
- "Validate implementation"
- "Audit this file"
- "Check for regressions"
- "QA this"

Claude must then perform a full, context‑aware QA sweep using the appropriate checklist for the
feature, surface, or file being validated.

This system ensures:
- No partial features (12.13)
- No regressions
- No token drift (12.15)
- No UX drift (12.3)
- No logic drift (12.13)
- No duplication or divergence (12.15)
- Canonical alignment across all surfaces

---

## 14.1 QA Checklist Selection Logic

Claude must automatically determine which QA checklist to use based on context:

- If the implementation affects **reviews**, use the Review QA Checklist.
- If the implementation affects **comparison**, use the Comparison QA Checklist.
- If the implementation affects **metadata**, use the Metadata QA Checklist.
- If the implementation affects **filters**, use the Filter QA Checklist.
- If the implementation affects **personalization**, use the Personalization QA Checklist.
- If the implementation affects **shared components**, use the Shared Component QA Checklist.
- If the implementation affects **multiple surfaces**, run all relevant checklists.

Claude must never guess.
Claude must infer based on:
- File path
- Component name
- Feature description
- User instructions
- Prior implementation steps

---

## 14.2 QA Execution Rules

When running QA, Claude must:

1. Evaluate each checklist item individually.
2. Output **PASS** or **FAIL** for each item.
3. Provide a 1–2 sentence explanation.
4. For FAIL items:
   - Identify the exact cause.
   - Propose the minimal diff required to fix it.
   - Do NOT generate diffs until the user says "apply" or "proceed with diffs."

5. At the end, Claude must output:
   - A summary of all failures.
   - A prioritized list of fixes (highest → lowest impact).
   - A recommendation on whether the feature is safe to ship.

---

## 14.5 When to Enter QA Mode

Claude must enter QA Execution Mode:

- After any implementation request
- After any integration request
- After any refactor request
- After any "apply diffs" operation
- After any multi‑file change
- When the user explicitly requests QA
- When the user implicitly requests QA (e.g., "Does this look correct?")

---

## 14.6 Output Format

Claude must output QA results in this format:

```
[Category Name]
- [ ] PASS/FAIL — Description
- [ ] PASS/FAIL — Description
- [ ] PASS/FAIL — Description
```

At the end:

**Summary of Failures:**
(list)

**Priority Fix List:**
1. Highest impact
2. Medium impact
3. Lowest impact

**Ship Readiness:**
- "Safe to ship" OR
- "Not safe to ship — fixes required"

---

## 14.7 Prohibitions

Claude must NOT:
- Generate diffs during QA mode.
- Modify code during QA mode.
- Skip checklist items.
- Assume correctness without verification.
- Provide vague or non‑actionable feedback.

---

## 14.8 Transition Out of QA Mode

Claude exits QA Execution Mode only when the user says:
- "apply"
- "proceed with diffs"
- "fix these"
- "implement fixes"

At that point, Claude must:
- Generate minimal diffs only
- Fix only the failed items
- Re‑run QA after applying fixes (unless user disables)

---

# 15. Future‑Proofing Enforcement Layer

**Applies to:** Every new feature or modification — without exception

Claude must ensure that every new feature or modification:

1. **Scales to real production data**
   - No hard‑coded assumptions.
   - No mock‑specific logic.
   - No reliance on static arrays or temporary values.

2. **Uses reusable classification utilities**
   - All filters (time of day, skin type, concerns, ingredients, routines, etc.) must use
     shared classification utilities.
   - Never implement filter logic inline inside components.
   - All classification logic must live in `src/utils/**`.

3. **Supports future entities**
   - Products
   - Ingredients
   - Retailers
   - Routines
   - Reviews
   - Future content types

4. **Supports future filters**
   - Time of day
   - Skin type suitability
   - Concern targeting
   - Ingredient strength
   - Sensitivity risk
   - Acne safety
   - Pregnancy safety
   - Routine step
   - Category
   - Price
   - Brand
   - Retailer
   - Any future filter added to the system

5. **Supports future routing**
   - Every entity must have a stable ID or slug.
   - Search results must route correctly for all entity types.
   - No hard‑coded paths.

6. **Supports future UI surfaces**
   - Discovery
   - Product detail
   - Ingredient library
   - Retailer reviews
   - Comparison
   - Routine builder
   - Dashboard
   - Future pages

---

## 15.2 Future‑Proofing Checklist (Mandatory)

For every feature Claude implements, Claude must verify:

- [ ] Does this scale to real products from Supabase?
- [ ] Does this work for future products with different naming conventions?
- [ ] Does this work for new filters added later?
- [ ] Does this work for new categories or product types?
- [ ] Does this work for new ingredients?
- [ ] Does this work for new pages or surfaces?
- [ ] Does this work for new routing patterns?
- [ ] Does this avoid hard‑coding?
- [ ] Does this use shared utilities instead of inline logic?
- [ ] Does this avoid duplication?
- [ ] Does this integrate with all existing systems (12.13)?
- [ ] Does this avoid assumptions based on mock data?
- [ ] Does this follow canonical patterns across the site?

If ANY answer is "no," Claude must:
1. Stop.
2. Explain the future‑proofing issue.
3. Propose the correct scalable architecture.
4. Wait for user approval before generating diffs.

---

## 15.3 Future‑Proofing Implementation Rules

Claude must:

### 1. Extract reusable utilities
All classification logic must be extracted into:
`src/lib/utils/`

### 2. Normalize all metadata
Claude must ensure:
- IDs are stable
- Slugs are normalized
- Categories are normalized
- Ingredient names are normalized
- Filters use normalized values

### 3. Avoid inline logic
No filter logic may live inside:
- Components
- Pages
- Hooks

All logic must be centralized.

### 4. Avoid mock‑specific assumptions
Claude must never assume:
- Product names follow a pattern
- Ingredients are always present
- Categories are consistent
- Time‑of‑day is provided manually

### 5. Build for expansion
Every feature must support:
- Additional fields
- Additional filters
- Additional entities
- Additional pages

### 6. Entity registry scaling
Every new entity onboarded to the system must have:
- A canonical type in `src/types/` (see Section 6.4)
- Shared utilities in `src/lib/utils/` for sorting, filtering, matching
- Normalized IDs and slugs
- A data shape compatible with existing personalization, sorting, and filtering utilities
- No hard‑coded assumptions about entity count, naming, or structure

Current entity registry:
- Products (`src/types/product.ts`)
- Retailers (`src/types/retailer.ts`)
- Ingredients (inline — should be extracted when shared)
- Routines (inline — should be extracted when shared)
- Reviews (inline — should be extracted when shared)

When Claude creates or modifies an entity, it must verify the entity follows this registry pattern.

---

## 15.6 Exit Conditions

Claude may only mark a feature as complete when:
- All future‑proofing checks pass
- All integrations pass
- All QA checks pass
- No mock‑specific logic remains
- The architecture supports future expansion

---

# 16. SAFE DEVELOPMENT, DEPLOYMENT & LIVE‑PROJECT PROTECTION LAYER

**Applies to:** Every development action, deployment step, and production change — without exception

---

## 16.1 Environment Safety Rules

Claude Code must ALWAYS:

- Assume the user is working on a live production system.
- Treat every change as potentially breaking.
- Ask for confirmation before:
  - modifying Supabase tables
  - modifying RLS policies
  - modifying auth logic
  - modifying Stripe logic
  - modifying environment variables
  - modifying routing structure
  - modifying database migrations
  - deleting files or directories

Claude must NEVER:
- Apply migrations automatically.
- Modify production tables without explicit approval.
- Suggest destructive SQL unless the user explicitly requests it.
- Assume the user understands the consequences of a change.

---

## 16.2 Safe Supabase & Database Workflow

When working with Supabase or database logic, Claude Code must:

1. Generate SQL in diff‑first mode
2. Explain the impact of every migration
3. Provide a rollback plan
4. Check for RLS compatibility
5. Check for Supabase client compatibility

---

## 16.3 Beginner‑Protection Rules

Claude Code must:

- Explain dangerous operations
- Provide context
- Suggest safer alternatives
- Avoid jargon
- Provide step‑by‑step instructions

---

# 17. CONTENT ACCURACY, COPYRIGHT SAFETY & SCIENTIFIC CLAIMS VERIFICATION LAYER

**Applies to:** All ingredient descriptions, safety explanations, product summaries, and review explanations — without exception

---

## 17.1 Content Originality & Copyright Safety

Claude Code must write **original** ingredient descriptions, safety explanations, and product summaries.

- Avoid copying text from external sources
- Avoid paraphrasing copyrighted content too closely
- Ensure all content is unique to the project
- Ensure no text resembles brand‑owned or retailer‑owned descriptions
- Ensure no text resembles INCIdecoder, Paula's Choice, Sephora, or any other skincare database

Claude Code must NEVER:

- Pull ingredient descriptions from external websites
- Reproduce copyrighted product descriptions
- Use trademarked marketing phrases
- Copy scientific summaries from journals or articles

---

## 17.2 Scientific Accuracy Rules

> All user‑facing prohibited/allowed phrasing for ingredients, nutrition, patch tests, and
> environment claims is consolidated in `CLAUDE_PRODUCT.md` Section 5.

Claude Code must verify all generated content against those rules before presenting it.

---

## 17.3 Safety Icon & Risk Explanation Rules

When generating safety explanations, Claude Code must:

- Explain WHY the safety rating is what it is
- Reference ingredient properties (not external databases or third‑party ratings)
- Use neutral, factual language
- Avoid overstating risk or safety

---

## 17.4 Cross‑Page Content Consistency

All content across ingredient, product, and review pages must be consistent:

- Safety explanations follow the same structure
- Review explanations follow the same structure
- Product recommendations follow the same structure
- Tone remains calm, premium, educational
- No contradictions across pages
- No missing metadata
- No unexplained icons or labels

---

## 17.6 Claim Verification Workflow

Before generating ANY ingredient or product‑related content, Claude Code must:

1. Verify the claim is allowed (non‑medical, non‑diagnostic)
2. Verify the claim is evidence‑based
3. Verify the claim is consistent with other ingredients
4. Verify the claim does not contradict safety metadata
5. Verify the claim is comprehensible to non‑experts
6. Verify the claim does not resemble copyrighted text

If ANY step fails, Claude must stop and flag the issue before proceeding.

---

## 17.8 Domain‑Specific Claim Boundaries

> Nutrition science accuracy rules → `CLAUDE_PRODUCT.md` Section 5.4
> Patch test claim boundaries → `CLAUDE_PRODUCT.md` Section 5.5
> Retailer trust score transparency → `CLAUDE_PRODUCT.md` Section 10

---

# 18. PERSONALIZATION ENGINE GOVERNANCE

**Applies to:** Every surface that displays personalized content, recommendations, highlights,
or matching — without exception

This section governs how personalization data flows, where matching logic lives, and how
consistency is maintained across all surfaces.

---

## 18.1 Canonical Personalization Data Model

The user's personalization profile consists of:

| Field | Source | Fallback |
|-------|--------|----------|
| Skin type | Quiz → Supabase profile → sessionState → localStorage | `null` (no highlighting) |
| Primary concerns | Quiz → Supabase profile → sessionState → localStorage | `[]` (no highlighting) |
| Preferences | Quiz → Supabase profile → sessionState → localStorage | `{}` (no highlighting) |
| Location + climate | Settings → Supabase profile → localStorage | `null` (skip location features) |
| Age range | Quiz → Supabase profile | `null` (skip age matching) |
| Budget range | Settings → localStorage | `null` (show all price points) |
| Routine history | Routine builder → Supabase → localStorage | `[]` (skip routine matching) |

## 18.2 Personalization Fallback Hierarchy

When personalization data is missing, follow this chain:

1. **Supabase profile** (authenticated users — canonical source)
2. **Session state** (quiz completion, in‑memory during session)
3. **localStorage** (persisted guest state across sessions)
4. **Graceful degradation** (show content without personalization highlights; never crash, never show broken UI)

Claude must never assume personalization data exists. Every personalization‑aware component must handle the `null` / empty case.

## 18.3 Cross‑Surface Matching Consistency

If an ingredient, product, concern, or skin type is highlighted as "matching" on one surface,
it must be highlighted identically on every other surface where it appears.

**Canonical matching utilities (single source of truth):**
- `src/lib/utils/matching.ts` — concern matching, ingredient matching
- `src/lib/utils/reviewSimilarity.ts` — review‑to‑user matching
- `src/lib/utils/productSimilarity.ts` — product‑to‑user matching

**Rules:**
- All matching logic must flow through shared utilities — no inline matching in components
- All highlight patterns must use the canonical style: `bg-light/30 text-primary-700 border-primary-300` with `ri-check-line` icon where applicable
- If a new matching dimension is added (retailer→user, nutrition→user), it must be added as a shared utility, not inline
- Guest users see no personalization highlights — never fake data, never show empty highlights

## 18.4 Personalization Surface Registry

Personalization must appear consistently on these surfaces:

| Surface | What is Personalized |
|---------|---------------------|
| Product detail | Key ingredients, skin type suitability, concerns, preferences |
| Discover / catalog | Product cards (matching badge), sort by relevance |
| Ingredient library | Ingredient highlights for user concerns |
| Routine builder | Conflict detection based on user skin type and concerns |
| Product reviews | Reviewer similarity scoring, match breakdown |
| AI chat | Responses tailored to skin profile |
| Retailer comparison | Sort by user budget/preference (future) |
| Nutrition | Skin‑relevant nutrition highlights (future) |

When adding personalization to a new surface, Claude must verify it aligns with all existing
surfaces before implementing.

## 18.5 Prohibited Personalization Behaviors

Claude must never:
- Hard‑code personalization values in components
- Implement matching logic inline (must use shared utilities)
- Show personalization highlights without verifying the data source
- Assume personalization data is always present
- Display different matching results for the same user data on different surfaces
- Break graceful degradation for guest users

## 18.6 Personalized Content Generation Standard

Product-facing voice, content structure, data-source requirements, and prohibited patterns
have been moved to:

    /ai-governance/CLAUDE_PRODUCT.md

The following developer-facing subsections remain here:

### 18.6.6 Canonical Content Utilities

All personalized content generation must flow through shared utilities:

| Utility | Path | Purpose |
|---------|------|---------|
| seasonalModalContent | `src/lib/utils/seasonalModalContent.ts` | Learn More modal content generation |
| productKnowledge | `src/lib/environment/productKnowledge.ts` | Category, texture, and mechanism knowledge base |
| surfaceClient | `src/lib/ai/surfaceClient.ts` | AI insight generation for all surfaces |
| buildAIContext | `src/lib/ai/surfaceContext.ts` | Unified AI context assembly |
| sessionState getters | `src/lib/utils/sessionState.ts` | Profile data retrieval with fallback chain |
| environmentFit | `src/lib/utils/environmentFit.ts` | Environment‑fit scoring and review aggregation |

No component may generate personalized text inline. All text generation must use these utilities.

### 18.6.7 Plain Language Knowledge Base Maintenance

When adding or modifying entries in `CATEGORY_BEHAVIOR`, `TEXTURE_BEHAVIOR`, `SKIN_IMPACT`, `CLASS_BENEFIT`, `CLASS_CONDITION_OVERRIDE`, or `CONDITION_PROBLEM`:
- All text must be plain language — no jargon, no clinical terms
- Verify zero instances of prohibited terms: "transepidermal", "photoaging", "oxidative", "lipid barrier", "sebum", "photosensitizing", "formulation", "occlusion"
- Follow Section 26.8 scientific accuracy rules (conditional language, no medical claims)
- Run `npx tsc --noEmit` and `npx vite build` after changes

---

# 19. GLOBAL SHARED COMPONENT CONSISTENCY & PROPAGATION LAYER

**Applies to:** Every shared component update, modification, or refactor — without exception

This section ensures that when a shared component is updated on one page, Claude Code must
automatically update every other page, feature, or function that uses that component — safely,
predictably, and without violating any CLAUDE.md rules.

---

## 19.1 Definition of "Shared Component"

A shared component is any component located in:

- `src/components/shared/**`
- `src/components/feature/**`
- Any component imported by multiple pages
- Any component used across multiple flows (product, ingredient, discover, routine, etc.)

If a component is used in more than one place, it is considered **shared**.

---

## 19.2 Global Propagation Rule

When Claude Code updates a shared component:

1. Claude MUST automatically update every page, feature, or function that imports or relies on
   that component.
2. Claude MUST ensure the update does not break:
   - Layout
   - Spacing
   - Motion
   - Typography
   - Props
   - State
   - Data flow
   - Responsiveness
3. Claude MUST run a full cross‑surface audit (12.16) to ensure consistency.
4. Claude MUST NOT apply changes until the user says **"apply"**.

---

## 19.3 Prop & API Consistency Rule

If a shared component's props or API change:

Claude Code MUST:
- Update all consuming components
- Update all pages that use it
- Update all utilities that depend on it
- Update all types/interfaces
- Update all storybook/demo/test files (if present)

Claude MUST NOT:
- Leave any consumer in a broken state
- Introduce partial migrations
- Create inconsistent versions of the same component

---

# 20. AI SAFETY & REASONING GOVERNANCE

**Applies to:** Every AI‑powered feature — chat, recommendations, search, formulation
assistance, nutrition guidance, and any future AI surface — without exception

This section establishes safety boundaries, consistency requirements, and transparency rules
for all AI‑powered interactions.

---

## 20.1 AI Reasoning Guardrails

AI features must NEVER:
- Make medical diagnoses or imply diagnostic authority
- Prescribe treatments or medications
- Guarantee results ("this will clear your acne")
- Recommend against a doctor's or dermatologist's advice
- Present AI opinions as scientific facts
- Hallucinate product data, ingredient properties, or retailer information
- Contradict safety metadata displayed elsewhere in the UI
- Generate content that violates Section 17 (Content Accuracy)

AI features must ALWAYS:
- Cite the basis for recommendations ("Based on your skin profile…")
- Acknowledge uncertainty ("This ingredient is commonly associated with…")
- Defer to professionals for medical concerns ("Consider consulting a dermatologist…")
- Match brand tone (Section 2.5): calm, educational, supportive, never salesy
- Include soft disclaimers on analysis surfaces

> AI tone, surface‑specific voice rules, and multi‑modal behavior are governed by
> `CLAUDE_PRODUCT.md` Sections 6–7.

## 20.2 AI‑to‑Personalization Integration

When personalization data is available, AI must use it:

- Reference the user's skin type, concerns, and preferences in recommendations
- Never contradict personalization‑driven highlights on other surfaces
- If the product page highlights an ingredient as "matching," the AI must not say that ingredient is irrelevant for the user
- Follow the same matching utilities (Section 18.3) — no separate AI matching logic
- When personalization data is missing, AI must not fabricate a profile — respond generically

## 20.3 AI Data Integrity

AI must only reference data that exists in the system:

- Product names, ingredients, and properties must come from the product database or mock data
- Retailer information must come from retailer data — never fabricated
- Ingredient science must follow Section 17.2 rules
- If the AI is unsure about a data point, it must say so rather than guess

## 20.4 Future AI Surfaces (Deferred per Section 13)

The following AI surfaces are Scale‑tier and must not be implemented until Growth features
are stable. When they are built, they must follow all rules in this section plus:

| Future Surface | Additional Rules |
|----------------|-----------------|
| **Formulation Assistant** | Flag ingredient interactions, flag regulatory concerns, require human verification, never imply FDA approval |
| **Nutrition AI** | Follow evidence‑based nutrition science, never make medical dietary claims, defer to healthcare professionals for medical dietary needs |
| **AR Analysis** | Include accuracy disclaimers, never present visual analysis as diagnosis, always offer professional consultation links |

---

# 21. MARKETPLACE & SELLER GOVERNANCE

**Applies to:** All marketplace features, seller onboarding flows, product listings, storefront
pages, and commission/affiliate logic — without exception

This section ensures the marketplace feels native to the platform — premium, trust‑scored,
transparent, and brand‑aligned.

---

## 21.1 Marketplace Voice

> For user‑facing marketplace UX philosophy and product listing content rules, see
> `CLAUDE_PRODUCT.md` Section 13.

## 21.2 Seller Onboarding Rules

Seller onboarding flows must:
- Follow the same calm, premium tone as user onboarding (`CLAUDE_PRODUCT.md` Section 3)
- Never use aggressive sales language ("start earning today," "unlimited potential")
- Clearly explain commission structure, platform fees, and payout timing
- Integrate with Stripe Connect without exposing Stripe implementation details to the user
- Follow Section 7 rules — never modify Stripe Connect logic without explicit approval

## 21.3 Commission & Affiliate Transparency

- Commission structure must never be visible to end users beyond the rewards framing in `CLAUDE_PRODUCT.md` Section 10
- Affiliate links must be clearly labeled per `CLAUDE_PRODUCT.md` Section 10
- Revenue‑sharing details are seller‑facing only — never surface to buyers
- Pricing must never be inflated to cover commission — prices must reflect genuine market value

---

# 22. COMMUNITY FEATURE GOVERNANCE

**Applies to:** All community features — reviews, progress sharing, community discussions,
user‑generated content, and community‑to‑user matching — without exception

This section ensures community surfaces feel as premium and trustworthy as the rest of the
product, while protecting users from harmful content and maintaining brand integrity.

---

## 22.1 Community Voice

> For community tone, progress sharing safety, and reviewer evidence framing, see
> `CLAUDE_PRODUCT.md` Section 9.

## 22.2 User‑Generated Content Rules

When displaying user‑generated content (reviews, comments, progress photos):
- Content must be clearly attributed to the user, not the platform
- Platform must not edit user content without disclosure
- Sensitive content (skin conditions, personal details) must be handled with care
- UI must support content reporting without making the reporter feel guilty
- Empty states must feel inviting, not lonely ("Be the first to share" with warm tone)

## 22.3 Community‑to‑User Matching

Community matching (showing reviews from similar users, suggesting community members with
similar routines) must:
- Use shared matching utilities from `src/lib/utils/` (Section 18.3)
- Follow the same similarity scoring patterns as product reviews (`reviewSimilarity.ts`)
- Never expose raw similarity scores to users — translate to tiers (e.g., "Very Similar," "Similar")
- Degrade gracefully when profile data is missing — show general content, never crash
- Never match users on sensitive attributes (age, medical conditions) without explicit opt‑in

## 22.4 Review Display Consistency

Reviews must be displayed consistently across all surfaces per Section 12.15:
- Product detail page, discover page, retailer reviews, and community pages must use the same review card pattern
- Similarity badges, match breakdowns, and helpful/report actions must behave identically
- Sorting and filtering options must use shared utilities — never inline

---

# 23. CREATOR ECOSYSTEM GOVERNANCE (SCALE‑TIER — PLACEHOLDER)

Per Section 13.1, the creator ecosystem is Scale‑tier. Full governance will be defined when
Growth features are stable. Key architectural constraints:

- Formulation workflows require mandatory ingredient interaction checks before finalization
- Creator product launches must follow a governed pipeline: formulation → patch test guidance → content review → pricing → marketplace listing
- AI formulation assistance must follow Section 20 safety rules

> For creator product user‑facing framing and liability‑safe language, see
> `CLAUDE_PRODUCT.md` Section 16.

---

# 24. NUTRITION & WELLNESS GOVERNANCE (PLACEHOLDER)

Per Section 13.1, basic nutrition management is MVP; advanced nutrition‑wellness integration is
Won't‑Have. All user‑facing nutrition voice, claim boundaries, dietary restriction rules,
and safety disclaimers are consolidated in `CLAUDE_PRODUCT.md` Section 12.

Developer constraint: Nutrition features must integrate with the personalization engine
(Section 18) for skin‑relevant highlights and follow the same data flow patterns.

---

# 25. AR SURFACE GOVERNANCE (SCALE‑TIER — PLACEHOLDER)

Per Section 13.1, AR is Scale‑tier. Full governance will be defined when AR development begins.
Key constraint: never present visual analysis as clinical diagnosis.

> For AR disclaimer copy and camera permission UX copy, see `CLAUDE_PRODUCT.md` Section 16.

When building AR features, also ensure:
- Integration with personalization engine (Section 18)
- 60fps performance with graceful degradation (Section 12.4)
- Reduced‑motion alternatives

---

# 26. ENVIRONMENT & LOCATION PERSONALIZATION

**Applies to:** Every surface that displays UV, climate, season, or location‑derived insights — without exception

This section governs how environment‑aware insights (UV index, climate classification, seasonal context) are derived, stored, consumed, and displayed.

---

## 26.1 Purpose

Provide environment‑aware insights based on real user location data. The system must never fake personalization — if no location data exists, it must clearly indicate that insights are based on default data.

---

## 26.2 Canonical Type

The single source of truth for all environmental personalization is:

**`src/lib/environment/context.ts`** → `EnvironmentContext`

```ts
type EnvironmentContext = {
  location: { city?, region?, country?, lat?, lon? };
  uvIndex?: number;
  uvBand?: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
  climate?: 'humid_continental' | 'mediterranean' | 'tropical' | 'arid' | 'polar' | 'unknown';
  season?: 'winter' | 'spring' | 'summer' | 'autumn';
  source: 'mock' | 'live' | 'partial';
};
```

Do not modify this shape without updating this section.

---

## 26.3 Canonical Modules

| Module | Path | Purpose |
|--------|------|---------|
| EnvironmentContext type | `src/lib/environment/context.ts` | Canonical type definition |
| buildEnvironmentContext | `src/lib/environment/buildEnvironmentContext.ts` | Orchestrates location → UV/climate/season pipeline |
| getUvIndex | `src/lib/environment/uvProvider.ts` | Client‑side caller for UV Edge Function |
| inferClimate | `src/lib/environment/inferClimate.ts` | Deterministic Köppen‑like climate classification |
| inferSeason | `src/lib/environment/inferSeason.ts` | Date + hemisphere → season |
| useEnvironmentContext | `src/lib/environment/useEnvironmentContext.ts` | React hook for all UI surfaces |
| get‑uv‑index | `supabase/functions/get-uv-index/index.ts` | Server‑side UV API wrapper |
| geocode‑location | `supabase/functions/geocode-location/index.ts` | Server‑side geocoding wrapper |

---

## 26.4 Profile Location Fields

Stored in `preferences.location` within the existing `users_profiles` table:

| Field | Type | Source |
|-------|------|--------|
| city | string | User input or reverse geocoding |
| state | string | User input (backward compat) |
| region | string | Normalized region name |
| zip | string | User input |
| country | string | User input or reverse geocoding |
| lat | number | Browser geolocation, geocoding, or manual input |
| lon | number | Browser geolocation, geocoding, or manual input |
| timezone | string | Inferred from lat/lon |
| hemisphere | 'northern' \| 'southern' | Inferred from lat |

All fields are optional and nullable. Existing users with only city/state/zip continue to work.

---

## 26.5 Behavioral Rules

### Source Determination

| Condition | source | Behavior |
|-----------|--------|----------|
| No location fields (all null) | `'mock'` | Use default UV/climate/season. **Never claim personalization.** |
| City/state/zip exist but no lat/lon | `'partial'` | Use inferred season only. Show softer language. |
| lat/lon present | `'live'` | Fetch real UV, infer climate + season. Show "personalized." |

### Copy Rules by Source

Copy templates moved to `/ai-governance/CLAUDE_PRODUCT.md` Section 8.

**Critical rule:** Never claim personalization when `source === 'mock'`.

### UI Consumption

- All UI surfaces that reference UV, climate, or season **must** use `useEnvironmentContext()`
- No component may hard‑code UV index values, climate strings, or season strings
- No component may call external UV APIs directly — all calls go through the server wrapper
- No component may compute climate or season independently — use the shared inference utilities

---

## 26.6 Consent & Privacy Rules

- Browser geolocation is **only** triggered by explicit user action ("Use my current location" button)
- Geolocation must never be auto‑triggered on page load, route change, or session start
- Users can always clear their location, which forces `source = 'mock'`
- Location data is only used for environmental insights (UV, climate, season) — not for unrelated features
- A visible privacy note must appear in the Settings → Location UI

---

## 26.7 AI Modification Constraints

Claude must never:
- Change the `EnvironmentContext` type shape without updating this section
- Bypass `buildEnvironmentContext()` or `useEnvironmentContext()` with inline calculations
- Reintroduce hard‑coded UV, climate, or season strings in any component
- Auto‑trigger browser geolocation without explicit user action
- Display "personalized" copy when `source === 'mock'`
- Call external UV or geocoding APIs from frontend components (must go through Edge Functions)

## 26.8 Scientific Accuracy in Environment Claims

> All mechanism phrase voice rules and plain‑language requirements are consolidated in
> `CLAUDE_PRODUCT.md` Section 5.6.

Claude must verify all entries in `productKnowledge.ts` against those rules.

## 26.9 Texture Inference Governance

The `inferTexture()` utility (`src/lib/environment/inferTexture.ts`) derives a canonical texture from product metadata via name keywords, category defaults, and ingredient heuristics.

Rules:
- Inferred texture is never displayed directly to the user
- Texture is used internally only for environment-fit sentence generation
- When a product has an explicit `texture` field, it takes priority over inference
- Inference must degrade to `'unknown'` rather than guess incorrectly

## 26.10 Mechanism Phrase Governance

> Mechanism phrase voice rules (conditional language, prohibited absolutes) are consolidated
> in `CLAUDE_PRODUCT.md` Section 5.6.

## 26.11 Reviewer Evidence Integration Rules

The `reviewerEvidence.ts` aggregator must:
- Never fabricate review data or reviewer profiles
- Use a minimum 30% similarity threshold (partial match tier from `reviewSimilarity.ts`)
- Return `undefined` when no reviews meet the threshold (graceful degradation)

> For user‑facing reviewer evidence framing language, see `CLAUDE_PRODUCT.md` Section 9.

## 26.12 Knowledge Base Maintenance

When adding new product categories, ingredient classes, texture types, or condition keys:
1. Add entries to all three knowledge maps in `productKnowledge.ts`
2. Update the corresponding TypeScript types (`ConditionKey`, `IngredientClass`, `InferredTexture`)
3. Update `deriveConditions()` if the new condition requires new environment context mapping
4. Update `inferTexture()` if the new texture requires inference rules
5. Verify all 12 mock products still produce reasonable explanations across all 3 modes
6. Run `npx tsc --noEmit` and `npx vite build` to confirm zero errors

---

# 27. AI MODULE REGISTRY

Canonical paths for all AI integration modules:

| Module | Path | Purpose |
|--------|------|---------|
| surfaceContext | `src/lib/ai/surfaceContext.ts` | Unified context builder (9 AI modes) |
| systemPrompt | `src/lib/ai/systemPrompt.ts` | 5‑layer system prompt builder |
| surfaceClient | `src/lib/ai/surfaceClient.ts` | Client‑side API caller with caching + fallback |
| AIInsightBlock | `src/components/feature/AIInsightBlock.tsx` | Shared AI insight rendering component |
| ai‑insight | `supabase/functions/ai-insight/index.ts` | Edge Function (Claude Sonnet 4.5) |
| index barrel | `src/lib/ai/index.ts` | Public API exports |

When adding new AI features, register them here. When modifying AI modules, verify all
consumers are updated (Section 19 propagation rules apply).

---

# 28. SYSTEMPROMPT.TS SYNC PROTOCOL

`src/lib/ai/systemPrompt.ts` contains a hardcoded `GOVERNANCE_PROMPT` string that is the
runtime‑optimized version of `CLAUDE_PRODUCT.md`. Because this is a compiled TypeScript
module (not a dynamic loader), the two files can drift.

### Sync Rules

1. When `CLAUDE_PRODUCT.md` is modified, `systemPrompt.ts` GOVERNANCE_PROMPT must be updated
   in the same PR to reflect the change
2. The `GOVERNANCE_VERSION` comment in `systemPrompt.ts` must be updated with the date
3. New prohibited terms added to `CLAUDE_PRODUCT.md` Section 5 must be added to the
   `validateAIResponse()` prohibited terms array
4. New surfaces added to `CLAUDE_PRODUCT.md` Section 7 must have corresponding
   `MODE_INSTRUCTIONS` entries in `systemPrompt.ts`
5. Claude must never modify `GOVERNANCE_PROMPT` without verifying alignment with
   `CLAUDE_PRODUCT.md`

---

# ROLE SEPARATION DIRECTIVE

You must treat this file (CLAUDE.md) as DEVELOPER GOVERNANCE ONLY.

This file governs your behavior exclusively when you are acting as the engineering partner
who helps build, modify, and maintain the codebase. When operating under this file, you must:

- Use engineering tone and reasoning
- Follow architecture rules
- Follow Git hygiene
- Use diff‑first workflows
- Avoid hallucinating files
- Never use product‑facing tone, personalization logic, or environment‑fit reasoning

A separate governance file exists for the product‑facing AI:

    /ai-governance/CLAUDE_PRODUCT.md

That file is the single source of truth for ALL user‑facing behavior, including:
- Learn More popup content
- Environment Fit explanations
- Product detail insights
- Routine builder guidance
- Ingredient explanations
- Reviewer insights
- Community tone and progress sharing
- Retailer trust score explanations
- Pricing display copy
- Nutrition voice and disclaimers
- Marketplace product descriptions
- Safety assessment and warning copy
- Concern alignment language
- Any text that speaks directly to the user
- All personalization, environment, skin, routine, and reviewer‑based reasoning

**Runtime sync:** `src/lib/ai/systemPrompt.ts` contains the runtime‑optimized version of
`CLAUDE_PRODUCT.md`. See Section 28 for the sync protocol. Changes to product governance
require updates to both files.

When a request is product‑facing, user‑facing, or requires personalization, environment‑fit
logic, or plain‑language explanations, you must load and follow the rules in
`CLAUDE_PRODUCT.md`.

When a request is engineering‑facing, code‑related, architectural, or repository‑related,
you must follow THIS file (CLAUDE.md).

You must never mix these two roles.

End of directive.


# End of CLAUDE.md
