#!/usr/bin/env bash
# CanAIThis autopilot — 프로세스가 죽기 전까지 무한 루프 (nohup으로 띄울 것)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROD_URL="${CANAITHIS_PROD_URL:-https://canaithis.vercel.app}"
INTERVAL="${AUTOPILOT_INTERVAL_SEC:-120}"
LOG="${ROOT}/.autopilot.log"

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"
}

smoke() {
  local ok=0
  local code

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko" || echo "000")
  log "smoke /ko → ${code}"
  [[ "$code" == "200" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/feed.xml" || echo "000")
  log "smoke /feed.xml → ${code}"
  [[ "$code" == "200" ]] || ok=1

  if curl -sL "${PROD_URL}/feed.xml" | head -1 | grep -q "<?xml"; then
    log "smoke feed.xml body → RSS OK"
  else
    log "smoke feed.xml body → NOT RSS"
    ok=1
  fi

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/users/not-a-valid-user" || echo "000")
  log "smoke /ko/users/invalid → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/challenges/invalid" || echo "000")
  log "smoke /ko/challenges/invalid → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/challenges/invalid/edit" || echo "000")
  log "smoke /ko/challenges/invalid/edit → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/challenges/invalid/solutions/invalid/edit" || echo "000")
  log "smoke /ko/challenges/invalid/solutions/invalid/edit → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/sitemap.xml" || echo "000")
  log "smoke /sitemap.xml → ${code}"
  [[ "$code" == "200" ]] || ok=1
  if curl -sL "${PROD_URL}/sitemap.xml" | grep -q "/users/"; then
    log "smoke sitemap → users OK"
  else
    log "smoke sitemap → no /users/ URLs"
    ok=1
  fi

  return $ok
}

log "autopilot start pid=$$ interval=${INTERVAL}s prod=${PROD_URL}"

while true; do
  if smoke; then
    log "smoke PASS"
  else
    log "smoke FAIL — check Vercel / DB / middleware"
  fi

  if git diff --quiet && git diff --cached --quiet; then
    log "git clean"
  else
    log "git dirty (uncommitted changes present)"
  fi

  sleep "$INTERVAL"
done