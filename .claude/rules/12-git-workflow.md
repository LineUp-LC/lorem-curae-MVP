---
scope: "Commits, branches, PRs, pre-commit checklist, prohibited git operations"
authority: primary
last_synced: "2026-03-14"
related: ["01-workflow.md"]
---

# Git Workflow

---

## Branch Naming

```
feature/<description>      # New features
fix/<description>          # Bug fixes
refactor/<description>     # Code restructuring
docs/<description>         # Documentation changes
```

- Use kebab-case for descriptions: `feature/ai-chat-streaming`
- Current main branch: `master`
- Current working branch: `feature/all-current-work`

## Commit Messages

- Imperative mood: "Add feature" not "Added feature"
- Format: `<type>: <description>`
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `perf`
- Keep first line under 72 characters
- Use body for details when needed (separated by blank line)
- End with: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

## Pre-Commit Checklist

Before committing:
1. `npm run type-check` passes
2. `npm run build` passes
3. No `.env` or credentials staged
4. No `console.log` debug statements
5. Only relevant files are staged (prefer specific `git add <file>` over `git add .`)
6. If any `.claude/rules/`, `.claude/business/`, `CLAUDE.md`, or `ROUTING.md` files were modified: `bash .claude/validate-governance.sh` passes

## PR Requirements

- Title: under 70 characters
- Body: `## Summary` (1-3 bullets) + `## Test plan` (checklist)
- Base branch: `master`
- Push with `-u` flag for new branches

## Prohibited Without Confirmation

- `git push --force` (especially to master)
- `git reset --hard`
- `git checkout .` / `git restore .`
- `git clean -f`
- `git branch -D`
- `git rebase` on shared branches
- Amending published commits

## Commit Scope

- One logical change per commit
- Never batch unrelated changes
- If a pre-commit hook fails, create a NEW commit after fixing — never `--amend`
