# Consistency & Propagation Rules

> Trigger: Read this file when updating shared components, detecting duplicates, or running site-wide audits.

---

## Duplicate-Detection & Canonical Alignment

### Core Rule

When Claude detects similar or duplicate text, logic, UI patterns, or behaviors across multiple pages or components, it must:

1. **Identify the canonical version** — the most correct, complete, or recently approved implementation
2. **Automatically align** the current work with that canonical version
3. **Notify the user** when a discrepancy exists and propose alignment
4. **Never require the user to repeat** instructions that already exist elsewhere

### Detection Triggers

Proactively check for duplicates when:
- Modifying UI patterns that exist on multiple pages (badges, cards, banners, modals, review layouts)
- Changing colors, styles, or interaction behaviors in more than one file
- Updating copy or text repeated across pages
- Implementing functionality (helpful buttons, report flows, filters) that already exists elsewhere
- Editing shared data structures, mock data, or state patterns

### Alignment Behavior

- When updating a feature on one page, check if the same feature exists on other pages
- If it does, propose aligning all instances with the canonical version in a single pass
- If the user changes a style or behavior, apply the same change to all matching instances unless told otherwise
- Always reference the source file and line when reporting a discrepancy

### Enforcement

- Never implement a feature differently on two pages without explicit justification
- Never leave a known inconsistency unaddressed — at minimum, notify the user
- When in doubt about which version is canonical, ask once, then remember for the session

---

## Global Shared Component Propagation

### Definition of "Shared Component"

Any component in:
- `src/components/shared/**`
- `src/components/feature/**`
- Any component imported by multiple pages or used across multiple flows

### Propagation Rule

When updating a shared component:

1. Automatically update every page, feature, or function that imports it
2. Ensure the update does not break: layout, spacing, motion, typography, props, state, data flow, responsiveness
3. Run a full cross-surface audit to ensure consistency
4. Do NOT apply changes until user says **"apply"**

### Prop & API Consistency

If a shared component's props or API change:
- Update all consuming components
- Update all pages that use it
- Update all utilities that depend on it
- Update all types/interfaces
- Update all storybook/demo/test files (if present)

Never leave any consumer in a broken state. Never introduce partial migrations.

---

## Full-Site Audit (On-Demand)

When the user requests an audit, systematically verify:

| Area | What to Verify |
|------|---------------|
| UI Components | Consistent styling, proper states (loading, empty, error), responsive behavior |
| Buttons & Interactions | All click handlers work, toggles reverse, CTAs navigate correctly |
| Database Queries | Supabase calls match schemas, RLS policies exist, error handling present |
| Personalization Logic | Survey data flows correctly, sessionState reads consistent, fallbacks work |
| State Management | localStorage persistence, cross-page sync, guest vs. auth behavior |
| Routing | All links resolve, no dead routes, breadcrumbs correct |
| Error & Empty States | Every page handles zero-data gracefully, network failures degrade silently |
| Asset Loading | All images load, avatars have fallbacks, icons render |
| Cross-Page Consistency | Duplicate patterns match their canonical versions |

### Audit Output

1. Categorized list of findings (broken, inconsistent, missing, improvable)
2. Severity for each finding (critical, moderate, minor)
3. Proposed fixes as diffs
4. Summary of what is working correctly

### Audit Rules

- Diff-first workflow — no changes without "apply"
- Prioritize critical issues over minor inconsistencies
- Do not introduce new features during an audit
- Do not modify unrelated code while fixing findings
