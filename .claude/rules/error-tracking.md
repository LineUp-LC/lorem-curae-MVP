<!-- Rule: Error Graduation & Self-Updating Rule System -->
<!-- Scope: ALL sessions — mistake tracking, pattern detection, rule promotion -->
<!-- Priority: ALWAYS ACTIVE — checked on every correction -->

# Error Graduation & Self-Updating Rule System

Claude Code must track mistakes, detect patterns, and graduate recurring issues into permanent rules. This creates a self-improving governance system that gets smarter over time.

---

## Graduation Pipeline

### Level 1: Observation (First Occurrence)

**Trigger:** First occurrence of a mistake class.

**Action:**
1. Log to `MEMORY.md` with date, description, and context
2. Do NOT create a rule yet — one instance is not a pattern

**Format:**
```
[YYYY-MM-DD] OBSERVED: [description] — [file:line if applicable]
```

**Example:**
```
[2026-03-14] OBSERVED: Used taupe instead of warm-gray — src/pages/discover/page.tsx:42
```

---

### Level 2: Pattern (2+ Occurrences)

**Trigger:** Same mistake class observed 2+ times (same session or across sessions).

**Action:**
1. Update the observation entry in `MEMORY.md` with occurrence count
2. Draft a candidate rule and present it to the user for approval
3. Do NOT add the rule to any file until approved

**Format:**
```
[YYYY-MM-DD] PATTERN: [description] — seen [N] times — candidate rule: "[rule text]"
```

**Presentation to user:**
```
Recurring pattern detected ([N] occurrences):
  [description]

Candidate rule:
  "[rule text]"

Recommended destination: .claude/rules/[file].md

Approve this rule? (yes/no/modify)
```

---

### Level 3: Permanent Rule (Approved)

**Trigger:** User approves the candidate rule.

**Action:**
1. Add the rule to the appropriate `.claude/rules/` file (match by domain)
2. Remove the observation/pattern entries from `MEMORY.md`
3. Log the promotion: `[YYYY-MM-DD] PROMOTED: "[rule text]" → [destination file]`

**Destination selection:**
- Code pattern mistakes → `code-style.md`
- UI/design mistakes → `frontend.md`
- Security mistakes → `security.md`
- AI behavior mistakes → `ai-governance.md`
- Workflow mistakes → `workflow.md`
- If no file fits → create a new rule file (subject to file-governance.md limits)

---

## Rule Weight System

Each permanent rule has an implicit weight based on impact category:

| Weight | Category | Auto-Prune | Review Cycle |
|--------|----------|------------|--------------|
| **Critical** | Security, data loss, auth, API keys | Never | Never — permanent |
| **High** | Data integrity, state management, guest safety | Never | Annual |
| **Medium** | Workflow, architecture, integration patterns | After 90 days inactive | Quarterly |
| **Low** | Style, formatting, naming conventions | After 60 days inactive | Quarterly |

**Weight assignment:** Claude infers weight from the rule's domain. Security-adjacent rules default to Critical. When uncertain, default to Medium.

---

## Pruning Protocol

### Memory.md Pruning

- **Hard limit:** 200 lines (enforced by global CLAUDE.md)
- **When exceeded:** Archive old observations to `.claude/archive/memory-[YYYY-MM-DD].md`
- **Archive format:** Move Level 1 observations older than 30 days first, then Level 2 patterns older than 14 days
- **Never archive:** Level 3 promotion logs (these stay until the quarterly review)

### Rule Pruning (Quarterly)

Every 90 days (or when the user requests a rule audit):

1. List all Level 3 rules added by this system
2. For each rule, check: has it been relevant (triggered or prevented a mistake) in the last period?
3. Flag inactive rules for removal
4. Present flagged rules to the user: keep, modify, or remove
5. Never auto-remove — always get user approval

**Exempt from pruning:**
- Critical weight rules (security, data loss)
- Rules explicitly marked `<!-- permanent -->` by the user

---

## Detection Behavior

Claude must proactively check for patterns when:

- A correction is received from the user
- A build/type-check/lint error is caused by Claude's own code
- The same file or utility is misused in the same way as a previous session
- A rule from CLAUDE.md or any rule file is violated

**After every correction, Claude must:**
1. Fix the issue immediately
2. State the one-line rule that prevents recurrence
3. Check `MEMORY.md` for prior observations of the same class
4. If match found → escalate to Level 2 (pattern)
5. If no match → log as Level 1 (observation)

---

## Constraints

- Never add rules without user approval
- Never modify existing `.claude/rules/` files without showing the diff first
- Never log sensitive data (API keys, passwords, user data) in observations
- Never create more than 5 candidate rules in a single session — batch and present together
- Archive files in `.claude/archive/` must follow file-governance.md limits (500 lines max)
