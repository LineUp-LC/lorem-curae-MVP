<!-- Workflow Monitor: Self-Optimizing Workflow Review System -->
<!-- Scope: All project workflows, pipelines, and agent configurations -->
<!-- Priority: Advisory — never applies changes without explicit approval -->

# Self-Optimizing Workflow Monitor

Continuously evaluate and propose optimizations to all project workflows, pipelines, and agent configurations using critical analysis.

**CRITICAL:** Never apply changes automatically. Always present proposals and wait for explicit approval.

---

## Triggers

Run this review when:

1. **Every 5th task completion** — Claude tracks task count per session and triggers automatically
2. **Explicit request** — User says "review workflows", "optimize pipelines", or similar
3. **New pipeline added** — When a new workflow, pipeline, or agent configuration is created
4. **Session start** — Quick scan (checklist only, no proposals) when resuming from a previous session

---

## Review Checklist

For each pipeline/workflow in the project, evaluate:

### Necessity
- [ ] Is every step necessary? Flag redundant steps.
- [ ] Are there steps that consistently produce no value?
- [ ] Are there steps that duplicate work done elsewhere?

### Efficiency
- [ ] Can any steps be parallelized?
- [ ] Can any steps be automated (hooks, scripts, CI)?
- [ ] Are there bottlenecks (steps that consistently take longest)?
- [ ] Are there manual steps that could be eliminated?

### Currency
- [ ] Do agent configurations still match current project needs?
- [ ] Are there new tools or patterns that could replace existing steps?
- [ ] Have any dependencies changed that invalidate current workflows?
- [ ] Are rule files still accurate and not contradicting each other?

### Context Efficiency
- [ ] Are any memory files consuming excessive context tokens?
- [ ] Can any always-loaded rules be moved to trigger-based loading?
- [ ] Are there duplicate instructions across governance files?

---

## Scope — What to Review

### Pipelines & Workflows

| Pipeline | Key Files | What to Check |
|----------|-----------|---------------|
| Build & validation | `package.json` scripts | type-check → build → lint order, parallelization |
| Git workflow | `.claude/rules/git-workflow.md` | Branch strategy, commit flow, pre-commit checks |
| QA execution | `.claude/rules/testing.md` | Checklist completeness, verification steps |
| AI integration | `src/lib/ai/`, Edge Functions | Context building, caching, fallback chains |
| Personalization | `src/lib/utils/sessionState.ts` | Data flow, fallback hierarchy, guest handling |
| Environment | `src/lib/environment/` | Pipeline stages, inference chain |
| Error graduation | `.claude/rules/error-tracking.md` | Observation → pattern → rule flow |

### Agent Configurations

| Agent | Config File | What to Check |
|-------|-------------|---------------|
| Reviewer | `.claude/agents/reviewer.md` | Scope, tool access, model selection |
| Research | `.claude/agents/research.md` | Source quality, output format |
| QA Testing | `.claude/agents/qa-testing.md` | Coverage, checklist alignment |

### Governance Files

| File | What to Check |
|------|---------------|
| `.claude/CLAUDE.md` | Accuracy, staleness, token cost vs value |
| `.claude/rules/*.md` | Redundancy, contradictions, outdated rules |
| `MEMORY.md` | Line count, relevance, archival needs |
| `.claude/agents/AGENTS.md` | Agent list accuracy, context completeness |

---

## Output Format

When presenting a workflow review, use this structure:

### 1. Summary

```
Workflows reviewed: [N]
Issues found: [N] (High: [N], Medium: [N], Low: [N])
```

### 2. Proposed Changes

| # | Change | File/Pipeline Affected | Reason | Impact |
|---|--------|----------------------|--------|--------|
| 1 | [description] | [file or pipeline] | [why] | High/Med/Low |
| 2 | [description] | [file or pipeline] | [why] | High/Med/Low |

### 3. Before/After (for approved changes)

Only shown after user selects which proposals to implement:

```
BEFORE: [current workflow step or config]
AFTER:  [proposed workflow step or config]
```

### 4. No-Action Items

Items reviewed and found to be optimal — listed for transparency:

```
- [pipeline]: No changes needed. [brief reason]
```

---

## Constraints

- **Never apply changes without explicit user approval**
- Present all proposals as a table first — diffs only after user selects items
- Group related changes together for efficient review
- Prioritize high-impact, low-risk changes first
- Do not propose changes that violate any existing `.claude/rules/` file
- Do not propose adding dependencies without flagging it
- Do not propose changes to Supabase, Stripe, or auth without flagging as sensitive
- Limit to 10 proposals per review — batch overflow into a follow-up review
