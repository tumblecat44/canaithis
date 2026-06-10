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

  local rss_link
  rss_link=$(echo "$home_html" | grep -oE '<link[^>]*application/rss\+xml[^>]*>' || true)
  if [[ -n "$rss_link" ]] && echo "$rss_link" | grep -q 'rel="alternate"' \
    && echo "$rss_link" | grep -qE 'href="[^"]*/feed\.xml"'; then
    log "smoke /ko head → RSS alternate link OK"
  else
    log "smoke /ko head → missing RSS alternate link"
    ok=1
  fi

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/en" || echo "000")
  log "smoke /en → ${code}"
  [[ "$code" == "200" ]] || ok=1

  local en_html
  en_html=$(curl -sL "${PROD_URL}/en" || true)

  local en_rss_link
  en_rss_link=$(echo "$en_html" | grep -oE '<link[^>]*application/rss\+xml[^>]*>' || true)
  if [[ -n "$en_rss_link" ]] && echo "$en_rss_link" | grep -q 'rel="alternate"' \
    && echo "$en_rss_link" | grep -qE 'href="[^"]*/feed\.xml"'; then
    log "smoke /en head → RSS alternate link OK"
  else
    log "smoke /en head → missing RSS alternate link"
    ok=1
  fi

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

  local en_home_challenge_id
  en_home_challenge_id=$(
    echo "$en_html" \
      | grep -oE 'challenges/[a-f0-9]{24}' \
      | grep -v '/new' \
      | head -1 \
      | sed 's|challenges/||' \
      || true
  )
  if [[ -z "$en_home_challenge_id" ]]; then
    log "smoke /en challenge card → none (DB feed empty?)"
    ok=1
  else
    log "smoke /en challenge card → challenges/${en_home_challenge_id}"
    code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/en/challenges/${en_home_challenge_id}" || echo "000")
    log "smoke /en/challenges/${en_home_challenge_id} → ${code}"
    [[ "$code" == "200" ]] || ok=1
  fi

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/login" || echo "000")
  log "smoke /ko/login → ${code}"
  [[ "$code" == "200" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/en/login" || echo "000")
  log "smoke /en/login → ${code}"
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
  code=$(curl -s -o /dev/null -D "$hdr" -w "%{http_code}" "${PROD_URL}/en/profile" || echo "000")
  location=$(grep -i "^location:" "$hdr" | tr -d '\r' || true)
  rm -f "$hdr"
  log "smoke /en/profile → ${code} ${location:-}"
  [[ "$code" == "307" ]] || ok=1
  if echo "$location" | grep -qi "/login"; then
    log "smoke /en/profile redirect → login OK"
  else
    log "smoke /en/profile redirect → not /login"
    ok=1
  fi
  if echo "$location" | grep -qi "callbackUrl"; then
    log "smoke /en/profile redirect → callbackUrl OK"
  else
    log "smoke /en/profile redirect → no callbackUrl"
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

  hdr=$(mktemp)
  code=$(curl -s -o /dev/null -D "$hdr" -w "%{http_code}" "${PROD_URL}/en/challenges/new" || echo "000")
  location=$(grep -i "^location:" "$hdr" | tr -d '\r' || true)
  rm -f "$hdr"
  log "smoke /en/challenges/new → ${code} ${location:-}"
  [[ "$code" == "307" ]] || ok=1
  if echo "$location" | grep -qi "/login"; then
    log "smoke /en/challenges/new redirect → login OK"
  else
    log "smoke /en/challenges/new redirect → not /login"
    ok=1
  fi
  if echo "$location" | grep -qi "callbackUrl"; then
    log "smoke /en/challenges/new redirect → callbackUrl OK"
  else
    log "smoke /en/challenges/new redirect → no callbackUrl"
    ok=1
  fi

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/feed.xml" || echo "000")
  log "smoke /feed.xml → ${code}"
  [[ "$code" == "200" ]] || ok=1

  local feed_body
  feed_body=$(curl -sL "${PROD_URL}/feed.xml" || true)
  if echo "$feed_body" | head -1 | grep -q "<?xml"; then
    log "smoke feed.xml body → RSS OK"
  else
    log "smoke feed.xml body → NOT RSS"
    ok=1
  fi
  local channel_block
  channel_block=$(echo "$feed_body" | sed -n '/<channel>/,/<item>/p' | head -10 || true)
  if echo "$channel_block" | grep -qE '<title>CanAIThis</title>'; then
    log "smoke feed.xml channel → title OK"
  else
    log "smoke feed.xml channel → invalid title"
    ok=1
  fi
  if echo "$channel_block" | grep -qE '<link>https?://[^<]+</link>'; then
    log "smoke feed.xml channel → link OK"
  else
    log "smoke feed.xml channel → invalid link"
    ok=1
  fi
  if echo "$channel_block" | grep -qE '<description>AI challenges and solutions community</description>'; then
    log "smoke feed.xml channel → description OK"
  else
    log "smoke feed.xml channel → invalid description"
    ok=1
  fi
  if echo "$channel_block" | grep -qE '<language>ko</language>'; then
    log "smoke feed.xml channel → language OK"
  else
    log "smoke feed.xml channel → invalid language"
    ok=1
  fi
  local feed_item_count
  feed_item_count=$(echo "$feed_body" | grep -c '<item>' || true)
  if [[ "$feed_item_count" -ge 1 ]]; then
    log "smoke feed.xml → ${feed_item_count} RSS item(s) OK"
  else
    log "smoke feed.xml → no RSS <item> elements"
    ok=1
  fi

  local first_item
  first_item=$(echo "$feed_body" | sed -n '/<item>/,/<\/item>/p' | head -20 || true)
  if echo "$first_item" | grep -qE '<title>[^<]{2,}</title>'; then
    log "smoke feed.xml item → title OK"
  else
    log "smoke feed.xml item → missing or empty title"
    ok=1
  fi
  if echo "$first_item" | grep -qE '<link>https?://[^<]+/challenges/[a-f0-9]{24}</link>'; then
    log "smoke feed.xml item → link OK"
  else
    log "smoke feed.xml item → invalid link"
    ok=1
  fi
  if echo "$first_item" | grep -qE '<guid[^>]*>https?://[^<]+/challenges/[a-f0-9]{24}</guid>'; then
    log "smoke feed.xml item → guid OK"
  else
    log "smoke feed.xml item → invalid guid"
    ok=1
  fi
  if echo "$first_item" | grep -qE '<pubDate>[A-Za-z]{3}, [0-9]{2} [A-Za-z]{3} [0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2} GMT</pubDate>'; then
    log "smoke feed.xml item → pubDate OK"
  else
    log "smoke feed.xml item → invalid pubDate"
    ok=1
  fi
  if echo "$first_item" | grep -qE '<description>[^<]{2,}</description>'; then
    log "smoke feed.xml item → description OK"
  else
    log "smoke feed.xml item → missing or empty description"
    ok=1
  fi

  local challenge_id
  challenge_id=$(
    echo "$feed_body" \
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

    hdr=$(mktemp)
    code=$(curl -s -o /dev/null -D "$hdr" -w "%{http_code}" "${PROD_URL}/en/challenges/${challenge_id}/solutions/new" || echo "000")
    location=$(grep -i "^location:" "$hdr" | tr -d '\r' || true)
    rm -f "$hdr"
    log "smoke /en/challenges/${challenge_id}/solutions/new → ${code} ${location:-}"
    [[ "$code" == "307" ]] || ok=1
    if echo "$location" | grep -qi "/login"; then
      log "smoke en solution-new redirect → login OK"
    else
      log "smoke en solution-new redirect → not /login"
      ok=1
    fi
    if echo "$location" | grep -qi "callbackUrl"; then
      log "smoke en solution-new redirect → callbackUrl OK"
    else
      log "smoke en solution-new redirect → no callbackUrl"
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

  if [[ -z "$en_home_challenge_id" ]]; then
    log "smoke en challenge-edit redirect → skipped (no challenge id from /en)"
    ok=1
  else
    hdr=$(mktemp)
    code=$(curl -s -o /dev/null -D "$hdr" -w "%{http_code}" "${PROD_URL}/en/challenges/${en_home_challenge_id}/edit" || echo "000")
    location=$(grep -i "^location:" "$hdr" | tr -d '\r' || true)
    rm -f "$hdr"
    log "smoke /en/challenges/${en_home_challenge_id}/edit → ${code} ${location:-}"
    [[ "$code" == "307" ]] || ok=1
    if echo "$location" | grep -qi "/login"; then
      log "smoke en challenge-edit redirect → login OK"
    else
      log "smoke en challenge-edit redirect → not /login"
      ok=1
    fi
    if echo "$location" | grep -qi "callbackUrl"; then
      log "smoke en challenge-edit redirect → callbackUrl OK"
    else
      log "smoke en challenge-edit redirect → no callbackUrl"
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

  local en_solution_id
  en_solution_id=$(
    echo "$en_html" \
      | grep -oE 'ACTION_ID_[a-f0-9]{24}' \
      | head -1 \
      | sed 's|ACTION_ID_||' \
      || true
  )
  if [[ -z "$en_solution_id" ]]; then
    log "smoke en solution-edit redirect → no solution id from /en"
    ok=1
  else
    local en_edit_challenge_id en_edit_found=0
    while read -r en_edit_challenge_id; do
      [[ -n "$en_edit_challenge_id" ]] || continue
      hdr=$(mktemp)
      code=$(curl -s -o /dev/null -D "$hdr" -w "%{http_code}" "${PROD_URL}/en/challenges/${en_edit_challenge_id}/solutions/${en_solution_id}/edit" || echo "000")
      location=$(grep -i "^location:" "$hdr" | tr -d '\r' || true)
      rm -f "$hdr"
      if [[ "$code" == "307" ]] && echo "$location" | grep -qi "/login"; then
        log "smoke /en/challenges/${en_edit_challenge_id}/solutions/${en_solution_id}/edit → ${code} ${location:-}"
        log "smoke en solution-edit redirect → login OK"
        if echo "$location" | grep -qi "callbackUrl"; then
          log "smoke en solution-edit redirect → callbackUrl OK"
        else
          log "smoke en solution-edit redirect → no callbackUrl"
          ok=1
        fi
        en_edit_found=1
        break
      fi
    done < <(
      echo "$en_html" \
        | grep -oE 'challenges/[a-f0-9]{24}' \
        | grep -v '/new' \
        | sed 's|challenges/||' \
        | awk '!seen[$0]++'
    )
    if [[ "$en_edit_found" -eq 0 ]]; then
      log "smoke en solution-edit redirect → no challenge matched solution ${en_solution_id}"
      ok=1
    fi
  fi

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/users/not-a-valid-user" || echo "000")
  log "smoke /ko/users/invalid → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/en/users/not-a-valid-user" || echo "000")
  log "smoke /en/users/invalid → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx" || echo "000")
  log "smoke /xx (invalid locale) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?sort=views" || echo "000")
  log "smoke /xx?sort=views (invalid locale home + query) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?sort=popular" || echo "000")
  log "smoke /xx?sort=popular (invalid locale home + query) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?sort=latest" || echo "000")
  log "smoke /xx?sort=latest (invalid locale home + query) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test" || echo "000")
  log "smoke /xx?q=test (invalid locale home + search) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=design" || echo "000")
  log "smoke /xx?q=test&category=design (invalid locale home + search + category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=design&sort=latest" || echo "000")
  log "smoke /xx?q=test&category=design&sort=latest (invalid locale home + search + category + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=design&sort=popular" || echo "000")
  log "smoke /xx?q=test&category=design&sort=popular (invalid locale home + search + category + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=design&sort=views" || echo "000")
  log "smoke /xx?q=test&category=design&sort=views (invalid locale home + search + category + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&sort=latest" || echo "000")
  log "smoke /xx?q=test&sort=latest (invalid locale home + search + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&sort=popular" || echo "000")
  log "smoke /xx?q=test&sort=popular (invalid locale home + search + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&sort=views" || echo "000")
  log "smoke /xx?q=test&sort=views (invalid locale home + search + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=design" || echo "000")
  log "smoke /xx?category=design (invalid locale home + category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=coding" || echo "000")
  log "smoke /xx?category=coding (invalid locale home + coding category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=coding&sort=latest" || echo "000")
  log "smoke /xx?category=coding&sort=latest (invalid locale home + coding category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=coding&sort=popular" || echo "000")
  log "smoke /xx?category=coding&sort=popular (invalid locale home + coding category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=coding&sort=views" || echo "000")
  log "smoke /xx?category=coding&sort=views (invalid locale home + coding category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=coding" || echo "000")
  log "smoke /xx?q=test&category=coding (invalid locale home + search + coding category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=coding" || echo "000")
  log "smoke /xx/challenges?q=test&category=coding (invalid locale nested + search + coding category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=coding&sort=latest" || echo "000")
  log "smoke /xx/challenges?q=test&category=coding&sort=latest (invalid locale nested + search + coding category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=coding&sort=views" || echo "000")
  log "smoke /xx/challenges?q=test&category=coding&sort=views (invalid locale nested + search + coding category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=coding&sort=latest" || echo "000")
  log "smoke /xx?q=test&category=coding&sort=latest (invalid locale home + search + coding category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=coding&sort=popular" || echo "000")
  log "smoke /xx?q=test&category=coding&sort=popular (invalid locale home + search + coding category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=coding&sort=views" || echo "000")
  log "smoke /xx?q=test&category=coding&sort=views (invalid locale home + search + coding category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=coding" || echo "000")
  log "smoke /xx?page=2&category=coding (invalid locale home + pagination + coding category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=coding&sort=latest" || echo "000")
  log "smoke /xx?page=2&category=coding&sort=latest (invalid locale home + pagination + coding category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=coding&sort=popular" || echo "000")
  log "smoke /xx?page=2&category=coding&sort=popular (invalid locale home + pagination + coding category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=coding&sort=views" || echo "000")
  log "smoke /xx?page=2&category=coding&sort=views (invalid locale home + pagination + coding category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=coding" || echo "000")
  log "smoke /xx?page=2&q=test&category=coding (invalid locale home + pagination + search + coding category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=coding&sort=popular" || echo "000")
  log "smoke /xx?page=2&q=test&category=coding&sort=popular (invalid locale home + pagination + search + coding category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=coding&sort=views" || echo "000")
  log "smoke /xx?page=2&q=test&category=coding&sort=views (invalid locale home + pagination + search + coding category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=coding&sort=latest" || echo "000")
  log "smoke /xx?page=2&q=test&category=coding&sort=latest (invalid locale home + pagination + search + coding category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=editing" || echo "000")
  log "smoke /xx?category=editing (invalid locale home + editing category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=editing&sort=latest" || echo "000")
  log "smoke /xx?category=editing&sort=latest (invalid locale home + editing category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=editing&sort=popular" || echo "000")
  log "smoke /xx?category=editing&sort=popular (invalid locale home + editing category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=editing&sort=views" || echo "000")
  log "smoke /xx?category=editing&sort=views (invalid locale home + editing category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=editing" || echo "000")
  log "smoke /xx?page=2&category=editing (invalid locale home + pagination + editing category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=editing&sort=latest" || echo "000")
  log "smoke /xx?page=2&category=editing&sort=latest (invalid locale home + pagination + editing category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=editing&sort=popular" || echo "000")
  log "smoke /xx?page=2&category=editing&sort=popular (invalid locale home + pagination + editing category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=editing&sort=views" || echo "000")
  log "smoke /xx?page=2&category=editing&sort=views (invalid locale home + pagination + editing category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=editing" || echo "000")
  log "smoke /xx?page=2&q=test&category=editing (invalid locale home + pagination + search + editing category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=editing&sort=latest" || echo "000")
  log "smoke /xx?page=2&q=test&category=editing&sort=latest (invalid locale home + pagination + search + editing category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=editing&sort=popular" || echo "000")
  log "smoke /xx?page=2&q=test&category=editing&sort=popular (invalid locale home + pagination + search + editing category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=editing&sort=views" || echo "000")
  log "smoke /xx?page=2&q=test&category=editing&sort=views (invalid locale home + pagination + search + editing category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=editing" || echo "000")
  log "smoke /xx?q=test&category=editing (invalid locale home + search + editing category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=editing&sort=latest" || echo "000")
  log "smoke /xx?q=test&category=editing&sort=latest (invalid locale home + search + editing category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=editing&sort=popular" || echo "000")
  log "smoke /xx?q=test&category=editing&sort=popular (invalid locale home + search + editing category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?q=test&category=editing&sort=views" || echo "000")
  log "smoke /xx?q=test&category=editing&sort=views (invalid locale home + search + editing category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=automation" || echo "000")
  log "smoke /xx?category=automation (invalid locale home + automation category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=automation&sort=latest" || echo "000")
  log "smoke /xx?category=automation&sort=latest (invalid locale home + automation category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=design&sort=latest" || echo "000")
  log "smoke /xx?category=design&sort=latest (invalid locale home + category + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=design&sort=popular" || echo "000")
  log "smoke /xx?category=design&sort=popular (invalid locale home + category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?category=design&sort=views" || echo "000")
  log "smoke /xx?category=design&sort=views (invalid locale home + category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2" || echo "000")
  log "smoke /xx?page=2 (invalid locale home + pagination) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&sort=latest" || echo "000")
  log "smoke /xx?page=2&sort=latest (invalid locale home + pagination + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&sort=popular" || echo "000")
  log "smoke /xx?page=2&sort=popular (invalid locale home + pagination + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&sort=views" || echo "000")
  log "smoke /xx?page=2&sort=views (invalid locale home + pagination + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test" || echo "000")
  log "smoke /xx?page=2&q=test (invalid locale home + pagination + search) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&sort=latest" || echo "000")
  log "smoke /xx?page=2&q=test&sort=latest (invalid locale home + pagination + search + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&sort=popular" || echo "000")
  log "smoke /xx?page=2&q=test&sort=popular (invalid locale home + pagination + search + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&sort=views" || echo "000")
  log "smoke /xx?page=2&q=test&sort=views (invalid locale home + pagination + search + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=design" || echo "000")
  log "smoke /xx?page=2&q=test&category=design (invalid locale home + pagination + search + category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=design&sort=latest" || echo "000")
  log "smoke /xx?page=2&q=test&category=design&sort=latest (invalid locale home + pagination + search + category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=design&sort=popular" || echo "000")
  log "smoke /xx?page=2&q=test&category=design&sort=popular (invalid locale home + pagination + search + category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&q=test&category=design&sort=views" || echo "000")
  log "smoke /xx?page=2&q=test&category=design&sort=views (invalid locale home + pagination + search + category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=design" || echo "000")
  log "smoke /xx?page=2&category=design (invalid locale home + pagination + category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=design&sort=latest" || echo "000")
  log "smoke /xx?page=2&category=design&sort=latest (invalid locale home + pagination + category + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=design&sort=popular" || echo "000")
  log "smoke /xx?page=2&category=design&sort=popular (invalid locale home + pagination + category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx?page=2&category=design&sort=views" || echo "000")
  log "smoke /xx?page=2&category=design&sort=views (invalid locale home + pagination + category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=design" || echo "000")
  log "smoke /xx/challenges?category=design (invalid locale nested + category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=design&sort=latest" || echo "000")
  log "smoke /xx/challenges?category=design&sort=latest (invalid locale nested + category + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=design&sort=popular" || echo "000")
  log "smoke /xx/challenges?category=design&sort=popular (invalid locale nested + category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=design&sort=views" || echo "000")
  log "smoke /xx/challenges?category=design&sort=views (invalid locale nested + category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=coding" || echo "000")
  log "smoke /xx/challenges?category=coding (invalid locale nested + coding category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=coding&sort=latest" || echo "000")
  log "smoke /xx/challenges?category=coding&sort=latest (invalid locale nested + coding category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=coding&sort=popular" || echo "000")
  log "smoke /xx/challenges?category=coding&sort=popular (invalid locale nested + coding category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=coding&sort=views" || echo "000")
  log "smoke /xx/challenges?category=coding&sort=views (invalid locale nested + coding category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=editing" || echo "000")
  log "smoke /xx/challenges?category=editing (invalid locale nested + editing category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=editing&sort=latest" || echo "000")
  log "smoke /xx/challenges?category=editing&sort=latest (invalid locale nested + editing category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=editing&sort=popular" || echo "000")
  log "smoke /xx/challenges?category=editing&sort=popular (invalid locale nested + editing category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?category=editing&sort=views" || echo "000")
  log "smoke /xx/challenges?category=editing&sort=views (invalid locale nested + editing category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=editing" || echo "000")
  log "smoke /xx/challenges?q=test&category=editing (invalid locale nested + search + editing category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=editing&sort=latest" || echo "000")
  log "smoke /xx/challenges?q=test&category=editing&sort=latest (invalid locale nested + search + editing category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=editing&sort=popular" || echo "000")
  log "smoke /xx/challenges?q=test&category=editing&sort=popular (invalid locale nested + search + editing category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=editing&sort=views" || echo "000")
  log "smoke /xx/challenges?q=test&category=editing&sort=views (invalid locale nested + search + editing category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=editing" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=editing (invalid locale nested + pagination + search + editing category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=editing&sort=latest" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=editing&sort=latest (invalid locale nested + pagination + search + editing category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=editing&sort=popular" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=editing&sort=popular (invalid locale nested + pagination + search + editing category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=editing&sort=views" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=editing&sort=views (invalid locale nested + pagination + search + editing category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges" || echo "000")
  log "smoke /xx/challenges (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2" || echo "000")
  log "smoke /xx/challenges?page=2 (invalid locale nested + pagination) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&sort=latest" || echo "000")
  log "smoke /xx/challenges?page=2&sort=latest (invalid locale nested + pagination + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&sort=popular" || echo "000")
  log "smoke /xx/challenges?page=2&sort=popular (invalid locale nested + pagination + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&sort=views" || echo "000")
  log "smoke /xx/challenges?page=2&sort=views (invalid locale nested + pagination + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test" || echo "000")
  log "smoke /xx/challenges?page=2&q=test (invalid locale nested + pagination + search) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&sort=latest" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&sort=latest (invalid locale nested + pagination + search + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&sort=popular" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&sort=popular (invalid locale nested + pagination + search + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&sort=views" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&sort=views (invalid locale nested + pagination + search + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=design" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=design (invalid locale nested + pagination + search + category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=design&sort=latest" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=design&sort=latest (invalid locale nested + pagination + search + category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=design&sort=popular" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=design&sort=popular (invalid locale nested + pagination + search + category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=design&sort=views" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=design&sort=views (invalid locale nested + pagination + search + category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=design" || echo "000")
  log "smoke /xx/challenges?page=2&category=design (invalid locale nested + pagination + category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=design&sort=latest" || echo "000")
  log "smoke /xx/challenges?page=2&category=design&sort=latest (invalid locale nested + pagination + category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=design&sort=popular" || echo "000")
  log "smoke /xx/challenges?page=2&category=design&sort=popular (invalid locale nested + pagination + category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=design&sort=views" || echo "000")
  log "smoke /xx/challenges?page=2&category=design&sort=views (invalid locale nested + pagination + category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=coding" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=coding (invalid locale nested + pagination + search + coding category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=coding&sort=latest" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=coding&sort=latest (invalid locale nested + pagination + search + coding category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=coding&sort=popular" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=coding&sort=popular (invalid locale nested + pagination + search + coding category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&q=test&category=coding&sort=views" || echo "000")
  log "smoke /xx/challenges?page=2&q=test&category=coding&sort=views (invalid locale nested + pagination + search + coding category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=coding" || echo "000")
  log "smoke /xx/challenges?page=2&category=coding (invalid locale nested + pagination + coding category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=coding&sort=latest" || echo "000")
  log "smoke /xx/challenges?page=2&category=coding&sort=latest (invalid locale nested + pagination + coding category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=coding&sort=popular" || echo "000")
  log "smoke /xx/challenges?page=2&category=coding&sort=popular (invalid locale nested + pagination + coding category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=coding&sort=views" || echo "000")
  log "smoke /xx/challenges?page=2&category=coding&sort=views (invalid locale nested + pagination + coding category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=editing" || echo "000")
  log "smoke /xx/challenges?page=2&category=editing (invalid locale nested + pagination + editing category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=editing&sort=latest" || echo "000")
  log "smoke /xx/challenges?page=2&category=editing&sort=latest (invalid locale nested + pagination + editing category + latest sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=editing&sort=popular" || echo "000")
  log "smoke /xx/challenges?page=2&category=editing&sort=popular (invalid locale nested + pagination + editing category + popular sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?page=2&category=editing&sort=views" || echo "000")
  log "smoke /xx/challenges?page=2&category=editing&sort=views (invalid locale nested + pagination + editing category + views sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/login" || echo "000")
  log "smoke /xx/login (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/profile" || echo "000")
  log "smoke /xx/profile (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges/new" || echo "000")
  log "smoke /xx/challenges/new (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges/invalid" || echo "000")
  log "smoke /xx/challenges/invalid (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges/invalid/edit" || echo "000")
  log "smoke /xx/challenges/invalid/edit (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges/invalid/solutions/new" || echo "000")
  log "smoke /xx/challenges/invalid/solutions/new (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges/invalid/solutions/invalid/edit" || echo "000")
  log "smoke /xx/challenges/invalid/solutions/invalid/edit (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/users/not-a-valid-user" || echo "000")
  log "smoke /xx/users/not-a-valid-user (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/feed.xml" || echo "000")
  log "smoke /xx/feed.xml (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/sitemap.xml" || echo "000")
  log "smoke /xx/sitemap.xml (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/robots.txt" || echo "000")
  log "smoke /xx/robots.txt (invalid locale nested) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?sort=views" || echo "000")
  log "smoke /xx/challenges?sort=views (invalid locale nested + query) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?sort=popular" || echo "000")
  log "smoke /xx/challenges?sort=popular (invalid locale nested + query) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?sort=latest" || echo "000")
  log "smoke /xx/challenges?sort=latest (invalid locale nested + query) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test" || echo "000")
  log "smoke /xx/challenges?q=test (invalid locale nested + search) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&sort=latest" || echo "000")
  log "smoke /xx/challenges?q=test&sort=latest (invalid locale nested + search + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&sort=popular" || echo "000")
  log "smoke /xx/challenges?q=test&sort=popular (invalid locale nested + search + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&sort=views" || echo "000")
  log "smoke /xx/challenges?q=test&sort=views (invalid locale nested + search + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=design" || echo "000")
  log "smoke /xx/challenges?q=test&category=design (invalid locale nested + search + category) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=design&sort=latest" || echo "000")
  log "smoke /xx/challenges?q=test&category=design&sort=latest (invalid locale nested + search + category + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=design&sort=popular" || echo "000")
  log "smoke /xx/challenges?q=test&category=design&sort=popular (invalid locale nested + search + category + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/xx/challenges?q=test&category=design&sort=views" || echo "000")
  log "smoke /xx/challenges?q=test&category=design&sort=views (invalid locale nested + search + category + sort) → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/challenges/invalid" || echo "000")
  log "smoke /ko/challenges/invalid → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/en/challenges/invalid" || echo "000")
  log "smoke /en/challenges/invalid → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/challenges/invalid/edit" || echo "000")
  log "smoke /ko/challenges/invalid/edit → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/en/challenges/invalid/edit" || echo "000")
  log "smoke /en/challenges/invalid/edit → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/challenges/invalid/solutions/new" || echo "000")
  log "smoke /ko/challenges/invalid/solutions/new → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/en/challenges/invalid/solutions/new" || echo "000")
  log "smoke /en/challenges/invalid/solutions/new → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/ko/challenges/invalid/solutions/invalid/edit" || echo "000")
  log "smoke /ko/challenges/invalid/solutions/invalid/edit → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/en/challenges/invalid/solutions/invalid/edit" || echo "000")
  log "smoke /en/challenges/invalid/solutions/invalid/edit → ${code}"
  [[ "$code" == "404" ]] || ok=1

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/robots.txt" || echo "000")
  log "smoke /robots.txt → ${code}"
  [[ "$code" == "200" ]] || ok=1
  local robots_body
  robots_body=$(curl -sL "${PROD_URL}/robots.txt" || true)
  if echo "$robots_body" | grep -qi "Sitemap:"; then
    log "smoke robots.txt → Sitemap directive OK"
  else
    log "smoke robots.txt → no Sitemap directive"
    ok=1
  fi
  if echo "$robots_body" | grep -qE 'Sitemap:\s*https?://[^[:space:]]+/sitemap\.xml'; then
    log "smoke robots.txt → sitemap.xml URL OK"
  else
    log "smoke robots.txt → invalid sitemap URL"
    ok=1
  fi

  code=$(curl -sL -o /dev/null -w "%{http_code}" "${PROD_URL}/sitemap.xml" || echo "000")
  log "smoke /sitemap.xml → ${code}"
  [[ "$code" == "200" ]] || ok=1
  local sitemap_body
  sitemap_body=$(curl -sL "${PROD_URL}/sitemap.xml" || true)
  if echo "$sitemap_body" | grep -q "/users/"; then
    log "smoke sitemap → users OK"
  else
    log "smoke sitemap → no /users/ URLs"
    ok=1
  fi
  if echo "$sitemap_body" | grep -qE '/challenges/[a-f0-9]{24}'; then
    log "smoke sitemap → challenges OK"
  else
    log "smoke sitemap → no /challenges/ detail URLs"
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