#!/usr/bin/env bash
# 5분마다 grok headless 하위 세션 생성 — 턴이 끝나도 에이전트가 돈다
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

INTERVAL="${GROK_LOOP_INTERVAL_SEC:-300}"
LOG="${ROOT}/.grok-loop.log"
TICK="${ROOT}/scripts/grok-tick.sh"

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"
}

log "grok-loop start pid=$$ interval=${INTERVAL}s"

while true; do
  if bash "$TICK"; then
    log "loop tick OK"
  else
    log "loop tick FAIL (see .grok-tick.log)"
  fi
  sleep "$INTERVAL"
done