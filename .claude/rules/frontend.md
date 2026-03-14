# Frontend Rules

> Trigger: Read this file when editing React components, Tailwind classes, animations, layout, design system, or UX copy.

---

## Design System

### Colors (Tailwind tokens only)
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#C4704D` | Buttons, accents, hovers |
| `cream` | `#FDF8F5` | Page/section backgrounds |
| `deep` | `#2D2A26` | Headings, titles |
| `sage` | `#7A8B7A` | Secondary accents, secondary buttons |
| `warm-gray` | `#6B635A` | Body text, descriptions |
| `blush` | `#E8D4CC` | Borders, dividers, card outlines |
| `light` | `#E8A888` | Gradients, soft highlights |
| `dark` | `#8B4D35` | Hover/pressed states |

- `taupe` is used in 90+ files but NOT in Tailwind config — use `warm-gray` instead
- Never introduce new colors without approval

### Typography
- Headings: `font-serif` (Cormorant Garamond)
- Body: `font-sans` (DM Sans — mapped to Inter in config)
- Hierarchy: H1 → H6, body, caption with consistent letter-spacing, line-height, weight
- Never introduce new font families
- Spacing scale: 4/8/12/16/24/32/48
- Scale gracefully from mobile → desktop

### Motion
- Philosophy: soft, slow, premium
- No bounce, spring, or playful animation
- Use Tailwind animation tokens: `enter-fade`, `enter-up`, `enter-scale`, etc.
- Framer Motion for complex sequences
- Use EASING.natural or EASING.gentle unless justified
- Always provide `prefers-reduced-motion` fallbacks
- GPU-friendly: prefer `transform` and `opacity` over layout properties
- Target 60fps on all browsers (Chrome, Firefox, Safari, iOS Safari, Android Chrome)
- No hydration mismatch

### Motion Token Reference
| Token | Duration | Easing |
|-------|----------|--------|
| `enter-fade` | 200ms | ease-out |
| `enter-up` | 250ms | ease-out |
| `enter-scale` | 200ms | ease-out |
| `exit-fade` | 150ms | ease-in |
| `loading-spin` | 1s | linear |
| `loading-pulse` | 2s | ease-in-out |

---

## Premium Design Mindset

When working on UI, UX, motion, or visual design:
- Think like a senior product designer + senior frontend/motion engineer
- Apply brand-aligned principles: calm, premium, science-backed clarity
- Use design-systems thinking (tokens, tiers, variants, scalability)
- Evaluate cognitive load, perceptual contrast, and longevity
- Provide conceptual exploration before code
- Provide tradeoff analysis before choosing a direction
- Consider future extraction into reusable components

### CTA Design System
- Think in CTA tiers (Primary, Secondary, Tertiary)
- Consider semantic usage rules for each tier
- Evaluate longevity, cognitive load, brand alignment
- Visual techniques: gradient sheen, micro-lift elevation, soft shadows, subtle opacity breathing, touch ergonomics, GPU-friendly transforms
- Avoid gimmicks, harsh shadows, SaaS cliches

---

## Copywriting Rules

- Tone: calm, premium, educational. Clarity > cleverness.
- No hype language, no exclamation marks unless explicitly requested
- Ingredient science: always evidence-based, never miracle claims
- Community copy: supportive, empathetic, non-judgmental. Avoid clinical coldness.
- Avoid SaaS cliches, marketing fluff, aggressive CTAs
- Maintain consistent terminology across flows

> For user-facing emotional intelligence templates, diagnostic-adjacent safety framing, and price-conscious UX copy → `CLAUDE_PRODUCT.md` Sections 3, 5, 11.

---

## Component Rules

- Follow existing component patterns — never invent new layout systems
- All shared components live in `src/components/feature/`
- Handle all states: loading, empty, populated, error, success, disabled
- Ensure mobile-first responsive design
- Never introduce overflow or broken wrapping
- Personalization highlight style: `bg-light/30 text-primary-700 border-primary-300` with `ri-check-line`
- Components must be reusable, composable, and future-proof
- Prefer extraction into shared components when patterns repeat

### Component Structure
For each component consider: Props, Variants, States (hover, active, focus, disabled, loading), Motion presets, Accessibility hooks, Naming consistency

---

## Cross-Surface Consistency

- Hero → Onboarding → Survey → Dashboard must feel like one unified product
- Motion, typography, spacing, and component patterns must remain consistent
- Transitions between surfaces must feel intentional and premium
- Use tokens and variables instead of hardcoded values

### AI + UI Coexistence
When AI text appears alongside platform UI:
- Platform UI holds primary visual hierarchy — AI text is supplementary
- AI content uses same typography tokens (DM Sans body, consistent sizing)
- AI responses never visually overpower surrounding UI
- AI areas subtly distinguished (soft background tint or slim left border)
- All AI text highlighting via `highlightRelevantKeywords()` utility
- Three highlight tiers: default (primary), positive sentiment (sage), negative sentiment (yellow)

---

## Tailwind Conventions

- Use token classes — never arbitrary values like `text-[#C4704D]`
- Responsive: `xs:` (375px), `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Dark mode: not yet implemented — do not add dark mode classes
- Container widths and grid: follow existing patterns per page
- Use modular spacing scale, maintain vertical rhythm
- Avoid arbitrary spacing values, cramped or overly loose layouts

---

## Accessibility

- WCAG AA+ contrast requirements
- Keyboard navigation on all interactive elements
- ARIA labels on AI-generated content areas
- Screen reader distinction between AI and platform content
- Never auto-trigger browser geolocation — require explicit user action
- AI content meets same WCAG AA+ contrast as platform UI
- AI response areas must be keyboard-navigable
