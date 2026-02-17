#!/usr/bin/env bash
set -euo pipefail

SEMGREP_CONFIG="${SEMGREP_CONFIG:-p/security-audit}"
SEMGREP_SEVERITY="${SEMGREP_SEVERITY:-ERROR}"
SEMGREP_BASELINE_COMMIT="${SEMGREP_BASELINE_COMMIT:-}"
SEMGREP_BASELINE_REF="${SEMGREP_BASELINE_REF:-}"

baseline=""
if [[ -n "$SEMGREP_BASELINE_COMMIT" ]]; then
  baseline="$SEMGREP_BASELINE_COMMIT"
elif [[ -n "$SEMGREP_BASELINE_REF" ]]; then
  if [[ "$SEMGREP_BASELINE_REF" == origin/* ]]; then
    baseline_branch="${SEMGREP_BASELINE_REF#origin/}"
    baseline="origin/$baseline_branch"
  else
    baseline_branch="$SEMGREP_BASELINE_REF"
    baseline="origin/$baseline_branch"
  fi
fi

if [[ -n "${baseline_branch:-}" ]] && ! git rev-parse --verify "$baseline" >/dev/null 2>&1; then
  git fetch --no-tags --depth=1 origin "${baseline_branch:-}" >/dev/null 2>&1 || true
fi

args=(
  scan
  --config "$SEMGREP_CONFIG"
  --severity "$SEMGREP_SEVERITY"
  --error
  --metrics=off
  --exclude node_modules
  --exclude .next
  --exclude dist
)

if [[ -n "$baseline" ]] && git rev-parse --verify "$baseline" >/dev/null 2>&1; then
  echo "Running Semgrep with baseline: $baseline"
  args+=(--baseline-commit "$baseline")
else
  echo "Running Semgrep without baseline."
fi

args+=(.)
semgrep "${args[@]}"
