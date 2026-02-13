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

# 4. Trusted Retailer Logic (Critical for Messaging)
When editing copy or UI related to retailers, Claude must follow these definitions:

### **4.1 "Trusted or reputable retailers" means:**
- Community‑reviewed
- Trust‑scored
- Ranked by fulfillment reliability
- Authenticity guarantees
- Return policy quality
- Customer service
- Shipping consistency

### **4.2 It does NOT mean:**
- Paid partnerships
- Sponsored recommendations
- Retailer integrations
- Brand‑driven placement

### **4.3 Rewards Model**
When referencing rewards:
- Users earn points/discounts from a portion of our affiliate commission.
- This is transparent and user‑aligned.

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

---

# 6. Code Architecture Rules

### **6.1 File Structure**
- Pages live in `src/pages/**/page.tsx`
- Shared UI lives in `src/components/feature/`
- Business logic lives in `src/utils/`
- Supabase logic lives in `src/lib/`

### **6.2 Auto‑Imports**
Do not manually import:
- useState
- useNavigate
- useTranslation
- etc.
These are auto‑imported.

### **6.3 Path Alias**
Use `@` for `src/`.

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
- Apply motion-engineering principles (soft, slow, intentional, never bouncy)
- Ensure accessibility (WCAG AA+, reduced-motion, focus-visible)
- Ensure cross-surface consistency (hero, onboarding, survey, dashboard)
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
- Ensure accessibility (WCAG AA+, focus-visible, reduced-motion)
- Ensure the CTA can scale across hero, onboarding, survey, dashboard, and future surfaces

### Premium Visual & Motion Language
- Soft, slow, intentional, never bouncy
- Motion should be "felt, not seen"
- Use multi-keyframe curves for fluidity when appropriate
- Use easing curves consistent with EASING.natural or EASING.gentle
- Respect prefers-reduced-motion with graceful fallbacks
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
- Tone: calm, premium, science-backed, editorial confidence
- Avoid SaaS clichés, marketing fluff, or aggressive CTAs
- Use clarity, precision, and warmth
- Maintain consistent terminology across flows
- Ensure microcopy supports user understanding and reduces cognitive load

### Enforce Cross-Surface Cohesion
- Hero → Onboarding → Survey → Dashboard must feel like one unified product
- Motion, typography, spacing, and component patterns must remain consistent
- Ensure transitions between surfaces feel intentional and premium

---

## 12.4 Motion Systems Layer (Global Motion Governance)

**Applies to:** All motion across the product

### Motion Philosophy
- Soft, slow, intentional
- "Felt, not seen"
- No bounce, no jitter, no aggressive easing
- Motion must support clarity, not decoration

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

### Accessibility
- Minimum contrast ratios (WCAG AA+)
- Avoid motion that affects readability
- Ensure focus-visible states are typographically aligned

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
Components should scale across:
- Hero
- Onboarding
- Survey
- Dashboard
- Future surfaces

---

## 12.7 Stacking Order Reference

1. CLAUDE.md (base rules — Sections 1–11)
2. Premium Product Design & Motion Systems Mindset (12.1)
3. CTA Design System & Premium Motion Layer (12.2)
4. Global Design System Enforcement Layer (12.3)
5. Motion Systems Layer (12.4)
6. Typography & Spacing Philosophy Layer (12.5)
7. Component Architecture Layer (12.6)
8. Intelligent UX Reasoning & Common-Sense Additions Layer (12.8)

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

### Approval Requirement for Intelligent Additions

Before applying any intelligent or inferred additions:
1. **Present the proposed addition to the user.**
2. **Explain why it is necessary or expected.**
3. **Wait for explicit approval before making any changes.**

Do NOT silently add logic or behaviors without approval.

### Implementation Rules for UX Additions

- Use minimal diffs only.
- Do NOT rewrite entire components.
- Only modify the specific lines required to complete the intended behavior.
- Preserve all existing functionality unless fixing a broken or incomplete interaction.
- Ensure all interactions are reversible, intuitive, and consistent with modern UX patterns.

### Output Requirements for UX Proposals

For each proposed improvement:
1. Describe the intelligent addition.
2. Explain why it is needed.
3. Wait for approval.

After approval:
- Provide a diff‑style patch showing ONLY the modified lines.
- Include a short summary of what was changed and why.

### Global UX Reasoning Rule

When implementing any feature, ask:

> "What is the obvious, expected, or natural behavior for this UI element or interaction?"

If the answer is clear:
1. Propose the improvement.
2. Wait for approval.
3. Only then apply the minimal diff.

This includes:
- Toggle states
- Active/inactive states
- Click/un‑click behavior
- Smooth animations
- Reset behavior
- Scroll‑to interactions
- Proper success/error feedback
- State synchronization
- Accessibility‑friendly defaults
- Preventing broken or one‑way interactions

---

# End of CLAUDE.md
