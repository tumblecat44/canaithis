#!/usr/bin/env bash
# grok headless 세션 1회 — work-queue 소비용
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${HOME}/.grok/bin:${PATH:-/usr/bin:/bin}"
GROK="${GROK_BIN:-$(command -v grok 2>/dev/null || echo "${HOME}/.grok/bin/grok")}"
LOG="${ROOT}/.grok-tick.log"
LOCK="${ROOT}/.grok-tick.lock"
PROMPT_TMPL="${ROOT}/scripts/grok-tick-prompt.md"
MAX_TURNS="${GROK_MAX_TURNS:-25}"
MODEL="${GROK_MODEL:-}"

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"
}

pick_next_task() {
  node -e "
    const fs = require('fs');
    const q = JSON.parse(fs.readFileSync('scripts/work-queue.json', 'utf8'));
    const item = (q.pending || []).find((i) => i.status === 'pending');
    process.stdout.write(item ? item.task : '(queue empty — pick a small prod improvement)');
  "
}

build_prompt() {
  local tick_id="$1"
  local next_task="$2"
  local body
  body="$(<"$PROMPT_TMPL")"
  body="${body//\{\{TICK_ID\}\}/$tick_id}"
  body="${body//\{\{NEXT_TASK\}\}/$next_task}"
  printf '%s' "$body"
}

run_tick() {
  local tick_id next_task prompt
  tick_id="$(date -u +%Y%m%dT%H%M%SZ)-$$"
  next_task="$(pick_next_task)"
  prompt="$(build_prompt "$tick_id" "$next_task")"

  log "tick start id=${tick_id} next=\"${next_task}\" max_turns=${MAX_TURNS}"

  if [[ ! -x "$GROK" ]] && ! command -v "$GROK" >/dev/null 2>&1; then
    log "tick FAIL — grok not found (${GROK})"
    return 1
  fi

  local -a grok_args=(
    -p "$prompt"
    --cwd "$ROOT"
    --max-turns "$MAX_TURNS"
    --permission-mode bypassPermissions
    --output-format plain
    --allow "Bash"
    --allow "Edit"
    --allow "Write"
  )
  if [[ -n "$MODEL" ]]; then
    grok_args+=(--model "$MODEL")
  fi

  if "$GROK" "${grok_args[@]}" >>"$LOG" 2>&1; then
    log "tick done id=${tick_id}"
  else
    local code=$?
    log "tick exit code=${code} id=${tick_id}"
    return "$code"
  fi
}

main() {
  exec 9>"$LOCK"
  if ! flock -n 9; then
    log "tick skip — previous session still running"
    exit 0
  fi
  run_tick
}

main "$@"