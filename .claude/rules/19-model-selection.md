---
scope: "Model + effort level selection for Claude Code: cost optimization, switching commands, task-type matrix"
authority: primary
last_synced: "2026-03-24"
related: ["01-workflow.md"]
---

# Model Selection & Token Optimization

> Trigger: read this file when choosing which Claude model and effort level to use for a task

---

## Model + Effort Level Matrix

| Task Type | Model | Effort | Cost | Examples from This Project |
|-----------|-------|--------|------|---------------------------|
| New feature spanning 5+ files | Opus | High | $$$ | "Build Serper web search pipeline", "Create Where to Buy feature", "Redesign scan results with tabbed CTAs" |
| System design / architecture | Opus | High | $$$ | "Design gamification points economy", "Plan AI pipeline architecture" |
| Mysterious debugging (no clear error) | Opus | High | $$$ | "Auth hydration re-fires on every navigation — why?" |
| New governance rules / business logic | Opus | High | $$$ | "Write camera scan governance rule" |
| Feature with clear spec, multi-file | Opus | Medium | $$ | "Wire web search into PostScanDiscovery", "Add WHERE_TO_BUY gamification action" |
| Wiring existing patterns together | Opus | Medium | $$ | "Add retailer_review_summary AI mode", "Wire RoutinePickerModal into 3 surfaces" |
| New component with clear spec | Opus | Medium | $$ | "Build RetailerCard component per this design" |
| Single-file fix with clear instructions | Opus | Low | $ | "Add category field to ParsedIngredient", "Rename PRODUCT_SCAN label" |
| Type/interface updates | Opus | Low | $ | "Extend ScanHistoryEntry with imageBase64 field" |
| Config changes | Opus | Low | $ | "Update MAX_TOKENS from 512 to 8192" |
| Code review / audit (read-only) | Sonnet | High | $ | "Audit governance updates needed", "Review scan pipeline for issues" |
| Debugging with clear error + stack trace | Sonnet | High | $ | "Debug: reviews not showing (console log attached)" |
| Documentation updates | Sonnet | High | $ | "Update 17-camera-scan.md with new tab behavior" |
| Bug fix with clear repro + console output | Sonnet | Medium | ¢ | "Fix WhereToBuySheet crash — move useEffect below listings" |
| CSS/styling changes | Sonnet | Medium | ¢ | "Change SafetyBadge colors to app palette" |
| Copy/text changes | Sonnet | Medium | ¢ | "Update empty state message on Compatible tab" |
| Edge Function deployment | Sonnet | Medium | ¢ | "Deploy ai-insight and product-search" |
| Git operations | Sonnet | Medium | ¢ | "Merge features to master", "Create PR" |
| Supabase migrations (SQL) | Sonnet | Medium | ¢ | "Create web_search_cache table migration" |
| Adding debug console.logs | Sonnet | Medium | ¢ | "Add timing logs to product-search Edge Function" |
| File rename/move | Sonnet | Low | ¢ | "Rename PointsDisplay.tsx to PointsEarnedToast.tsx" |
| Adding imports | Sonnet | Low | ¢ | "Add searchRetailerReviews import to productSearch.ts" |
| Typo fixes | Sonnet | Low | ¢ | "Fix typo in button label" |
| Simple find-and-replace | Sonnet | Low | ¢ | "Change ntfy topic to line_alerts_biz_3" |
| Running CLI commands | Sonnet | Low | ¢ | "Run npm run build and report output" |

---

## Decision Flowchart

```
Is it a NEW feature or system design?
  → Opus + High

Is it implementing a feature with clear specs?
  → Opus + Medium

Is it a 1-file fix with clear instructions?
  → Opus + Low  OR  Sonnet + High

Is it debugging WITH error output / stack trace?
  → Sonnet + High

Is it a routine fix, deploy, or config change?
  → Sonnet + Medium

Is it trivial (rename, typo, CLI command)?
  → Sonnet + Low
```

**Quick rule of thumb:** If you can describe the EXACT change in your prompt (file, line, what to change), use Sonnet. If you need Claude to figure out the approach, use Opus.

---

## How to Switch in Claude Code

| Action | Command |
|--------|---------|
| See current model | `/model` |
| Switch to Opus | `/model opus` |
| Switch to Sonnet | `/model sonnet` |
| Change effort level | Shift+Tab to cycle: low → medium → high |
| Settings file | `~/.claude/settings.json` → `"model"`, `"effortLevel"` |

---

## Token Cost Estimates

| Configuration | Per Prompt (approx) | 30-Prompt Session |
|--------------|--------------------:|------------------:|
| Opus + High | $0.15 – $0.50 | $6 – $15 |
| Opus + Medium | $0.08 – $0.25 | $3 – $8 |
| Opus + Low | $0.05 – $0.15 | $2 – $5 |
| Sonnet + High | $0.03 – $0.10 | $1 – $3 |
| Sonnet + Medium | $0.02 – $0.05 | $0.60 – $1.50 |
| Sonnet + Low | $0.01 – $0.03 | $0.30 – $0.90 |

**Savings example:** A typical session of 30 prompts on Opus + High costs $6–15. The same session with smart model selection (only 5 prompts on Opus + High, rest on Sonnet) costs $2–4. That's ~60% savings.

---

## Lorem Curae-Specific Rules

| Task | Model + Effort | Reason |
|------|----------------|--------|
| New Edge Function | Opus + High | System design, Deno patterns, CORS, auth |
| New AI mode (surfaceContext + systemPrompt) | Opus + Medium | Wiring existing patterns, but multi-file |
| New page/component | Opus + Medium | Clear spec, multiple files, state management |
| Edge Function deployment | Sonnet + Medium | CLI command: `supabase functions deploy <name>` |
| Governance rule creation | Sonnet + High | Needs context understanding, writes prose not code |
| Console.log debugging | Sonnet + Medium | Parse error, identify location, add logs |
| Gamification trigger wiring | Sonnet + Medium | Single `onAction()` call, clear pattern |
| Git operations | Sonnet + Low | Commands only |
| Supabase SQL migrations | Sonnet + Medium | SQL is straightforward, schema is documented |
| Build/type-check/lint runs | Sonnet + Low | Execute and report |
| Prompt generation (for pasting elsewhere) | Sonnet + High | Context understanding, no code output |
| MEMORY.md updates | Sonnet + Medium | Append structured text |
| Multi-surface refactor (shared component change) | Opus + High | Must trace all consumers, verify no regressions |
| Post-implementation QA | Sonnet + High | Read-heavy, checklist-driven |

---

## When to Override

**Always escalate to Opus + High when:**
- Sonnet produced incorrect or incomplete output on the same task
- The task requires understanding 10+ files simultaneously
- You're planning before building (Step 1 architecture audit)
- Output quality directly affects user experience or data integrity
- The bug has no clear error message and requires reasoning across the codebase

**Always stay on Sonnet when:**
- The prompt contains the exact file path, line number, and change to make
- It's a deployment, git operation, or CLI command
- You're updating documentation or governance files
- The error message tells you exactly what's wrong and where
