<!-- Maintenance Prompts: Copy-paste templates for ongoing governance -->
<!-- Scope: On-demand — use as needed, not sequentially -->

# Maintenance Prompts

Ready-to-use prompts for ongoing project governance. Copy and paste as needed.

---

## When Claude Makes a Mistake (2+ times)

```
You've made this mistake [N] times: [describe mistake].
Draft a permanent rule that prevents this. Specify which file it belongs in
(.claude/rules/[topic].md or CLAUDE.md).
Show the rule text and the exact insertion point. Apply after I approve.
Update Memory.md with the pattern entry.
```

---

## Weekly Insights Review

```
Review .claude/Memory.md and all .claude/rules/ files.
1. Flag rules that haven't triggered in 30+ days
2. Flag observations in Memory.md that should graduate to rules (2+ occurrences)
3. Flag any file over its line limit
4. Propose additions based on recent work patterns
Present changes as a table. Do not apply until approved.
```

---

## Monthly Prune

```
Audit all .claude/ files:
1. Remove stale rules (no triggers in 60 days, non-security)
2. Archive old Memory.md entries to .claude/archive/
3. Check for redundant rules across files
4. Verify all agent/skill configs still match project reality
5. Update version number in CLAUDE.md
Present removals/changes for approval. Show before/after line counts.
```

---

## Add New Skill

```
I want to build a skill for [X, Y, Z]. Help me format it.

For the skill file, include:
- name, description, tools, trigger condition
- Step-by-step instructions
- Expected output format
- Example invocation
- Which agent (parent/sub) should own it
- Where to store memory (global/local)

Generate the file at .claude/skills/[name].md
```

---

## Add New Sub-Agent

```
I need a sub-agent for [purpose].
Generate .claude/agents/[name].md with:
- name, description, tools, model, max_turns, memory scope
- Behavior rules
- Output format
- Invocation template
- What it returns to the parent agent

Ensure it doesn't duplicate capabilities of existing agents:
[list current agents from .claude/agents/]
```

---

## Add New Rule File

```
I need a new rule for [domain/topic].
1. Check if an existing .claude/rules/ file covers this domain
2. If yes, propose adding to that file (show insertion point)
3. If no, create .claude/rules/[topic].md with:
   - HTML comment header (Rule name, Scope, Priority)
   - Clear sections with actionable constraints
   - Under 500 lines
4. Register it in .claude/CLAUDE.md rules table
Apply after I approve.
```

---

## Emergency: Session Recovery

```
I'm continuing from a previous session that ran out of context.
1. Read .claude/Memory.md for recent observations
2. Read .claude/CLAUDE.md for current project state
3. Run git log --oneline -10 to see recent work
4. Run git status to see uncommitted changes
5. Summarize what you know and ask what to continue
```

---

## Emergency: Rule Conflict Resolution

```
I think these rules conflict: [rule A] and [rule B].
1. Read both source files
2. Identify the exact contradiction
3. Propose a resolution that preserves intent of both
4. Show the diff for each file
Apply after I approve.
```
