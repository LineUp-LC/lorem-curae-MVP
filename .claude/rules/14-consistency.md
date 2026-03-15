---
scope: "Duplicate detection, shared component propagation, audits, error graduation, file governance"
authority: primary
last_synced: "2026-03-14"
related: ["02-code-standards.md", "03-frontend.md", "10-data-layer.md"]
---

# Consistency, Error Tracking & File Governance

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
- Edge Function additions or removals must update both `rules/10-data-layer.md` § Edge Functions and `business/tech.md` § Supabase Edge Functions

### Governance File Validation

After any modification to files in `.claude/rules/`, `.claude/business/`, `CLAUDE.md`, or `ROUTING.md`:
1. Run `bash .claude/validate-governance.sh`
2. Fix any failures before committing

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
- Never leave any consumer in a broken state. Never introduce partial migrations.

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

### Audit Rules

- Diff-first workflow — no changes without "apply"
- Prioritize critical issues over minor inconsistencies
- Do not introduce new features during an audit
- Do not modify unrelated code while fixing findings

---

## Error Graduation & Self-Updating Rules

Claude must track mistakes, detect patterns, and graduate recurring issues into permanent rules.

### Level 1: Observation (First Occurrence)

**Trigger:** First occurrence of a mistake class.
**Action:** Log to `MEMORY.md` with date, description, and context. Do NOT create a rule yet.

**Format:** `[YYYY-MM-DD] OBSERVED: [description] — [file:line if applicable]`

### Level 2: Pattern (2+ Occurrences)

**Trigger:** Same mistake class observed 2+ times.
**Action:** Update the observation, draft a candidate rule, present to user for approval.

**Format:** `[YYYY-MM-DD] PATTERN: [description] — seen [N] times — candidate rule: "[rule text]"`

### Level 3: Permanent Rule (Approved)

**Trigger:** User approves the candidate rule.
**Action:** Add to the appropriate `.claude/rules/` file. Remove observation entries from `MEMORY.md`.

**Destination selection:**
- Code pattern → `02-code-standards.md`
- UI/design → `03-frontend.md`
- Security → `09-security.md`
- AI behavior → `05-ai-pipeline.md`
- Workflow → `01-workflow.md`

### Detection Behavior

After every correction, Claude must:
1. Fix the issue immediately
2. State the one-line rule that prevents recurrence
3. Check `MEMORY.md` for prior observations of the same class
4. If match found → escalate to Level 2
5. If no match → log as Level 1

### Rule Weight System

| Weight | Category | Auto-Prune |
|--------|----------|------------|
| **Critical** | Security, data loss, auth, API keys | Never |
| **High** | Data integrity, state management, guest safety | Never |
| **Medium** | Workflow, architecture, integration patterns | After 90 days inactive |
| **Low** | Style, formatting, naming conventions | After 60 days inactive |

### Constraints

- Never add rules without user approval
- Never modify `.claude/rules/` files without showing the diff first
- Never log sensitive data in observations
- Never create more than 5 candidate rules in a single session

---

## File Governance

### Hard Limits

**No `.md` file anywhere in the project may exceed 500 lines.**

Before writing or modifying any `.md` file:
1. Estimate the line count BEFORE writing
2. If it will exceed 500 lines, split into multiple files
3. Each resulting file must independently stay under 500 lines

**No single folder inside `.claude/rules/` may contain more than 100 `.md` files.**

Before creating new rule files:
1. Count existing `.md` files in the target folder
2. If adding would exceed 100, consolidate or use a new subfolder

**Target range:** 80–300 lines per file is ideal. 500 is the hard ceiling.

### Splitting Strategy

When a file needs to be split:
1. Identify logical sections
2. Use numbered prefixes for ordering: `00-`, `01-`, etc.
3. Each file must be self-contained
4. Create an `_index.md` listing all files
5. Keep the original as backup until split is verified
