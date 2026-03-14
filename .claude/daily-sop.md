<!-- Daily SOP: Standard Operating Procedure for Project Owner -->
<!-- Scope: Daily and weekly routines for managing Claude Code governance -->

# Daily SOP

## Daily Routine

### Morning Check (5 min)

1. **Git status** — `git status` + `git log --oneline -5` 👤
2. **Memory scan** — Open `MEMORY.md`, check for stale observations or patterns needing graduation 👤
3. **Build health** — `npm run type-check && npm run build` 🔄 _Can be a pre-session hook_
4. **Context check** — Run `/context` to verify token usage is reasonable 👤

### Active Development Session

1. **Start each task** — State the goal clearly; Claude reads relevant rule files automatically ✅
2. **One thing at a time** — Don't batch unrelated changes in one prompt ✅
3. **Review diffs before applying** — Claude presents diffs first per workflow rules ✅
4. **After corrections** — Claude logs observations per `error-tracking.md`; review if pattern is flagged 👤
5. **Every 5th task** — Workflow monitor triggers automatically; review proposals 🔄 _Tracked by workflow-monitor.md_
6. **Validate after changes** — `npm run type-check && npm run build && npm run lint` 🔄 _Can be a post-edit hook_

### End of Session (5 min)

1. **Commit work** — Stage specific files, meaningful commit message 👤
2. **Check Memory.md** — Remove anything resolved; verify under 200 lines 👤
3. **Quick rule scan** — Any candidate rules pending approval? Approve or dismiss 👤
4. **Push** — `git push` to the appropriate branch 👤

---

## Weekly Routine (30 min)

### Pipeline Review

1. Run workflow monitor: tell Claude "review workflows" 🔄
2. Review the proposals table — approve, modify, or dismiss each item 👤
3. Check build times: is `type-check` or `build` noticeably slower? 👤
4. Review `.claude/rules/` file count: `ls .claude/rules/*.md | wc -l` (max 100) 🔄

### Rule Pruning

1. **Memory.md** — Archive Level 1 observations older than 30 days 👤
2. **Graduated rules** — List all rules added via error-tracking; check relevance 👤
3. **Rule contradictions** — Ask Claude: "scan rules for contradictions" 🔄
4. **Token audit** — Run `/context`; flag any memory file over 2k tokens for review 👤

### Agent Tuning

1. Review agent usage from the past week — which agents were used, which weren't 👤
2. Check if agent model selections still make sense (haiku vs sonnet vs opus) 👤
3. Update `.claude/agents/AGENTS.md` if agent scopes have shifted 👤
4. Retire unused agents; propose new ones if gaps appeared 👤

---

## Automation Opportunities Summary

| Step | Status | Notes |
|------|--------|-------|
| Build health check | 🔄 | Add as pre-session hook or `npm run validate` script |
| Post-edit validation | 🔄 | Add as post-tool hook: `npm run type-check` |
| Error graduation logging | ✅ | Handled by `error-tracking.md` rules |
| Workflow monitor triggers | 🔄 | Tracked per `workflow-monitor.md`; manual trigger for now |
| Diff-first workflow | ✅ | Enforced by `workflow.md` rules |
| Rule file count check | 🔄 | Add to weekly script or hook |
| Memory.md line count | 🔄 | Add to end-of-session script |
| Commit message format | ✅ | Enforced by `git-workflow.md` rules |
| Context token monitoring | 👤 | Requires human judgment on what to trim |
| Agent tuning | 👤 | Requires human judgment on effectiveness |

**Legend:** ✅ Already automated | 🔄 Can be automated | 👤 Requires human judgment
