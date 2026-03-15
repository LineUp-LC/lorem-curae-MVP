#!/usr/bin/env bash
# .claude/validate-governance.sh
# Governance structure validation — run from project root or .claude/
set -euo pipefail

# Resolve .claude/ directory regardless of where script is invoked
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$SCRIPT_DIR"
PROJECT_ROOT="$(dirname "$CLAUDE_DIR")"

RULES_DIR="$CLAUDE_DIR/rules"
BUSINESS_DIR="$CLAUDE_DIR/business"
ROUTING_FILE="$CLAUDE_DIR/ROUTING.md"
CLAUDE_FILE="$CLAUDE_DIR/CLAUDE.md"

PASS=0
FAIL=0
TOTAL=0

pass() { PASS=$((PASS + 1)); TOTAL=$((TOTAL + 1)); echo "  PASS: $1"; }
fail() { FAIL=$((FAIL + 1)); TOTAL=$((TOTAL + 1)); echo "  FAIL: $1"; }

# ──────────────────────────────────────────────
# Check 1: YAML frontmatter fields
# ──────────────────────────────────────────────
echo ""
echo "=== CHECK 1: YAML frontmatter ==="
echo "    Required fields: scope, authority, last_synced"
echo "    Required for rules/: related"
echo ""

REQUIRED_COMMON=("scope" "authority" "last_synced")

for dir in "$RULES_DIR" "$BUSINESS_DIR"; do
  for f in "$dir"/*.md; do
    [ -f "$f" ] || continue
    basename="$(basename "$f")"
    relpath="${f#$CLAUDE_DIR/}"

    # Extract frontmatter (between first two --- lines)
    frontmatter=$(sed -n '/^---$/,/^---$/p' "$f" | head -50)

    if [ -z "$frontmatter" ]; then
      fail "$relpath — no YAML frontmatter block"
      continue
    fi

    file_ok=true
    missing=()

    for field in "${REQUIRED_COMMON[@]}"; do
      if ! echo "$frontmatter" | grep -qE "^${field}:"; then
        missing+=("$field")
        file_ok=false
      fi
    done

    # related is required for rules/ only
    if [[ "$dir" == "$RULES_DIR" ]]; then
      if ! echo "$frontmatter" | grep -qE "^related:"; then
        missing+=("related")
        file_ok=false
      fi
    fi

    if $file_ok; then
      pass "$relpath"
    else
      fail "$relpath — missing: ${missing[*]}"
    fi
  done
done

# ──────────────────────────────────────────────
# Check 2: 500-line limit
# ──────────────────────────────────────────────
echo ""
echo "=== CHECK 2: 500-line limit ==="
echo ""

for dir in "$RULES_DIR" "$BUSINESS_DIR"; do
  for f in "$dir"/*.md; do
    [ -f "$f" ] || continue
    relpath="${f#$CLAUDE_DIR/}"
    lines=$(wc -l < "$f")
    if [ "$lines" -gt 500 ]; then
      fail "$relpath — $lines lines (max 500)"
    else
      pass "$relpath ($lines lines)"
    fi
  done
done

# ──────────────────────────────────────────────
# Check 3: Every file referenced in ROUTING.md exists
# ──────────────────────────────────────────────
echo ""
echo "=== CHECK 3: ROUTING.md references exist ==="
echo ""

if [ ! -f "$ROUTING_FILE" ]; then
  fail "ROUTING.md not found"
else
  # Extract file paths from table cells: `rules/...` or `business/...` or `ai-governance/...`
  targets=$(grep -oE '`(rules/[^`]+|business/[^`]+|ai-governance/[^`]+)`' "$ROUTING_FILE" \
    | tr -d '`' | sort -u)

  while IFS= read -r target; do
    [ -z "$target" ] && continue
    # ai-governance/ is relative to project root, not .claude/
    if [[ "$target" == ai-governance/* ]]; then
      full_path="$PROJECT_ROOT/$target"
    else
      full_path="$CLAUDE_DIR/$target"
    fi
    if [ -f "$full_path" ]; then
      pass "$target"
    else
      fail "$target — referenced in ROUTING.md but file does not exist"
    fi
  done <<< "$targets"
fi

# ──────────────────────────────────────────────
# Check 4: Every file in rules/ and business/ appears in ROUTING.md
# ──────────────────────────────────────────────
echo ""
echo "=== CHECK 4: All governance files appear in ROUTING.md ==="
echo ""

if [ ! -f "$ROUTING_FILE" ]; then
  fail "ROUTING.md not found"
else
  routing_content=$(cat "$ROUTING_FILE")

  for dir_label in rules business; do
    dir_path="$CLAUDE_DIR/$dir_label"
    for f in "$dir_path"/*.md; do
      [ -f "$f" ] || continue
      basename="$(basename "$f")"
      # _index.md is a routing file itself, not a target
      [ "$basename" = "_index.md" ] && continue
      search_path="$dir_label/$basename"
      if echo "$routing_content" | grep -qF "$search_path"; then
        pass "$search_path"
      else
        fail "$search_path — not referenced in ROUTING.md"
      fi
    done
  done
fi

# ──────────────────────────────────────────────
# Check 5: CLAUDE.md has no inline rules
# ──────────────────────────────────────────────
echo ""
echo "=== CHECK 5: CLAUDE.md contains no inline rules ==="
echo "    Patterns: '- NEVER', '- ALWAYS', '- MUST', '- DO NOT'"
echo ""

if [ ! -f "$CLAUDE_FILE" ]; then
  fail "CLAUDE.md not found"
else
  violations=$(grep -nE '^- (NEVER|ALWAYS|MUST|DO NOT) ' "$CLAUDE_FILE" 2>/dev/null || true)
  if [ -z "$violations" ]; then
    pass "No inline rule patterns found"
  else
    while IFS= read -r line; do
      fail "CLAUDE.md line $line"
    done <<< "$violations"
  fi
fi

# ──────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo "  TOTAL: $TOTAL checks"
echo "  PASS:  $PASS"
echo "  FAIL:  $FAIL"
if [ "$FAIL" -eq 0 ]; then
  echo "  STATUS: ALL CHECKS PASSED"
else
  echo "  STATUS: $FAIL FAILURE(S) — see above"
fi
echo "════════════════════════════════════════"
echo ""

exit "$FAIL"
