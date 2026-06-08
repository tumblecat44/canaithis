#!/usr/bin/env bash
# smoke(autopilot) + work-queue 감시를 한 번에 띄움 — 턴이 끝나도 프로세스는 계속 돈다
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LOG="${ROOT}/.continuous.log"

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"
}

start_if_missing() {
  local pattern="$1"
  local script="$2"
  if pgrep -f "$pattern" >/dev/null 2>&1; then
    log "already running: $script"
  else
    nohup bash "$script" >> "$LOG" 2>&1 &
    log "started: $script pid=$!"
  fi
}

log "continuous start"
start_if_missing "scripts/autopilot.sh" "${ROOT}/scripts/autopilot.sh"
start_if_missing "scripts/work-queue-watch.sh" "${ROOT}/scripts/work-queue-watch.sh"
log "continuous ready — tail .continuous.log .autopilot.log .work-queue.log"