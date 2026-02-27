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

# End of CLAUDE.md
