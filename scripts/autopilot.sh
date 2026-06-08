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
  local location

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko" || echo "000")
  log "smoke /ko → ${code}"
  [[ "$code" == "200" ]] || ok=1

  local home_html
  home_html=$(curl -sL "${PROD_URL}/ko" || true)

  local home_challenge_id
  home_challenge_id=$(
    echo "$home_html" \
      | grep -oE 'challenges/[a-f0-9]{24}' \
      | grep -v '/new' \
      | head -1 \
      | sed 's|challenges/||' \
      || true
  )
  if [[ -z "$home_challenge_id" ]]; then
    log "smoke /ko challenge card → none (DB feed empty?)"
    ok=1
  else
    log "smoke /ko challenge card → challenges/${home_challenge_id}"
    code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/challenges/${home_challenge_id}" || echo "000")
    log "smoke /ko/challenges/${home_challenge_id} → ${code}"
    [[ "$code" == "200" ]] || ok=1
  fi

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/login" || echo "000")
  log "smoke /ko/login → ${code}"
  [[ "$code" == "200" ]] || ok=1

  local hdr
  hdr=$(mktemp)
  code=$(curl -s -o /dev/null -D "$hdr" -w "%{http_code}" "${PROD_URL}/ko/profile" || echo "000")
  location=$(grep -i "^location:" "$hdr" | tr -d '\r' || true)
  rm -f "$hdr"
  log "smoke /ko/profile → ${code} ${location:-}"
  [[ "$code" == "307" ]] || ok=1
  if echo "$location" | grep -qi "/login"; then
    log "smoke /ko/profile redirect → login OK"
  else
    log "smoke /ko/profile redirect → not /login"
    ok=1
  fi
  if echo "$location" | grep -qi "callbackUrl"; then
    log "smoke /ko/profile redirect → callbackUrl OK"
  else
    log "smoke /ko/profile redirect → no callbackUrl"
    ok=1
  fi

  hdr=$(mktemp)
  code=$(curl -s -o /dev/null -D "$hdr" -w "%{http_code}" "${PROD_URL}/ko/challenges/new" || echo "000")
  location=$(grep -i "^location:" "$hdr" | tr -d '\r' || true)
  rm -f "$hdr"
  log "smoke /ko/challenges/new → ${code} ${location:-}"
  [[ "$code" == "307" ]] || ok=1
  if echo "$location" | grep -qi "/login"; then
    log "smoke /ko/challenges/new redirect → login OK"
  else
    log "smoke /ko/challenges/new redirect → not /login"
    ok=1
  fi
  if echo "$location" | grep -qi "callbackUrl"; then
    log "smoke /ko/challenges/new redirect → callbackUrl OK"
  else
    log "smoke /ko/challenges/new redirect → no callbackUrl"
    ok=1
  fi

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/feed.xml" || echo "000")
  log "smoke /feed.xml → ${code}"
  [[ "$code" == "200" ]] || ok=1

  if curl -sL "${PROD_URL}/feed.xml" | head -1 | grep -q "<?xml"; then
    log "smoke feed.xml body → RSS OK"
  else
    log "smoke feed.xml body → NOT RSS"
    ok=1
  fi

  local challenge_id
  challenge_id=$(
    curl -sL "${PROD_URL}/feed.xml" \
      | grep -oE 'challenges/[a-f0-9]{24}' \
      | head -1 \
      | sed 's|challenges/||' \
      || true
  )
  if [[ -z "$challenge_id" ]]; then
    log "smoke solution-new redirect → no challenge id from feed.xml"
    ok=1
  else
    hdr=$(mktemp)
    code=$(curl -s -o /dev/null -D "$hdr" -w "%{http_code}" "${PROD_URL}/ko/challenges/${challenge_id}/solutions/new" || echo "000")
    location=$(grep -i "^location:" "$hdr" | tr -d '\r' || true)
    rm -f "$hdr"
    log "smoke /ko/challenges/${challenge_id}/solutions/new → ${code} ${location:-}"
    [[ "$code" == "307" ]] || ok=1
    if echo "$location" | grep -qi "/login"; then
      log "smoke solution-new redirect → login OK"
    else
      log "smoke solution-new redirect → not /login"
      ok=1
    fi
    if echo "$location" | grep -qi "callbackUrl"; then
      log "smoke solution-new redirect → callbackUrl OK"
    else
      log "smoke solution-new redirect → no callbackUrl"
      ok=1
    fi
  fi

  if [[ -z "$home_challenge_id" ]]; then
    log "smoke challenge-edit redirect → skipped (no challenge id from /ko)"
    ok=1
  else
    hdr=$(mktemp)
    code=$(curl -s -o /dev/null -D "$hdr" -w "%{http_code}" "${PROD_URL}/ko/challenges/${home_challenge_id}/edit" || echo "000")
    location=$(grep -i "^location:" "$hdr" | tr -d '\r' || true)
    rm -f "$hdr"
    log "smoke /ko/challenges/${home_challenge_id}/edit → ${code} ${location:-}"
    [[ "$code" == "307" ]] || ok=1
    if echo "$location" | grep -qi "/login"; then
      log "smoke challenge-edit redirect → login OK"
    else
      log "smoke challenge-edit redirect → not /login"
      ok=1
    fi
    if echo "$location" | grep -qi "callbackUrl"; then
      log "smoke challenge-edit redirect → callbackUrl OK"
    else
      log "smoke challenge-edit redirect → no callbackUrl"
      ok=1
    fi
  fi

  local solution_id
  solution_id=$(
    echo "$home_html" \
      | grep -oE 'ACTION_ID_[a-f0-9]{24}' \
      | head -1 \
      | sed 's|ACTION_ID_||' \
      || true
  )
  if [[ -z "$solution_id" ]]; then
    log "smoke solution-edit redirect → no solution id from /ko"
    ok=1
  else
    local edit_challenge_id edit_found=0
    while read -r edit_challenge_id; do
      [[ -n "$edit_challenge_id" ]] || continue
      hdr=$(mktemp)
      code=$(curl -s -o /dev/null -D "$hdr" -w "%{http_code}" "${PROD_URL}/ko/challenges/${edit_challenge_id}/solutions/${solution_id}/edit" || echo "000")
      location=$(grep -i "^location:" "$hdr" | tr -d '\r' || true)
      rm -f "$hdr"
      if [[ "$code" == "307" ]] && echo "$location" | grep -qi "/login"; then
        log "smoke /ko/challenges/${edit_challenge_id}/solutions/${solution_id}/edit → ${code} ${location:-}"
        log "smoke solution-edit redirect → login OK"
        if echo "$location" | grep -qi "callbackUrl"; then
          log "smoke solution-edit redirect → callbackUrl OK"
        else
          log "smoke solution-edit redirect → no callbackUrl"
          ok=1
        fi
        edit_found=1
        break
      fi
    done < <(
      echo "$home_html" \
        | grep -oE 'challenges/[a-f0-9]{24}' \
        | grep -v '/new' \
        | sed 's|challenges/||' \
        | awk '!seen[$0]++'
    )
    if [[ "$edit_found" -eq 0 ]]; then
      log "smoke solution-edit redirect → no challenge matched solution ${solution_id}"
      ok=1
    fi
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

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/challenges/invalid/solutions/new" || echo "000")
  log "smoke /ko/challenges/invalid/solutions/new → ${code}"
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