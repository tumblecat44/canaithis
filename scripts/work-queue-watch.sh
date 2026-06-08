#!/usr/bin/env bash
# work-queue 감시 — pending이 있으면 .agent-wake 갱신 (에이전트/사람이 다음 작업 확인용)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

QUEUE="${ROOT}/scripts/work-queue.json"
WAKE="${ROOT}/.agent-wake"
LOG="${ROOT}/.work-queue.log"
INTERVAL="${WORK_QUEUE_INTERVAL_SEC:-300}"

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"
}

log "work-queue-watch start pid=$$ interval=${INTERVAL}s"

while true; do
  if [[ -f "$QUEUE" ]]; then
    pending_count=$(node -e "
      const q = require('./scripts/work-queue.json');
      const n = (q.pending || []).filter(i => i.status === 'pending').length;
      process.stdout.write(String(n));
    ")
    if [[ "$pending_count" -gt 0 ]]; then
      next_task=$(node -e "
        const q = require('./scripts/work-queue.json');
        const item = (q.pending || []).find(i => i.status === 'pending');
        process.stdout.write(item ? item.task : '');
      ")
      log "pending=${pending_count} next=\"${next_task}\""
      date -u +%Y-%m-%dT%H:%M:%SZ > "$WAKE"
    else
      log "pending=0 (queue empty)"
    fi
  else
    log "missing work-queue.json"
  fi
  sleep "$INTERVAL"
done