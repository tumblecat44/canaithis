#!/usr/bin/env bash
# Google OAuth 2.0 (NextAuth용) — gcloud로 콘솔 열기 + .env.local 반영
set -euo pipefail

PROJECT="${GCP_PROJECT:-dgswlife}"
ENV_FILE="${1:-.env.local}"
REDIRECT_URI="${AUTH_URL:-http://localhost:3000}/api/auth/callback/google"

echo "프로젝트: $PROJECT"
echo "리디렉션 URI: $REDIRECT_URI"
echo ""
echo "브라우저에서 OAuth 클라이언트 ID(웹)를 만든 뒤 Client ID / Secret을 입력하세요."
open "https://console.cloud.google.com/auth/clients/create?project=${PROJECT}" 2>/dev/null || true

read -r -p "GOOGLE_ID: " GOOGLE_ID
read -r -s -p "GOOGLE_SECRET: " GOOGLE_SECRET
echo ""

if [[ -z "$GOOGLE_ID" || -z "$GOOGLE_SECRET" ]]; then
  echo "입력이 비어 있어 .env.local은 변경하지 않았습니다."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "$ENV_FILE 이 없습니다."
  exit 1
fi

python3 - "$ENV_FILE" "$GOOGLE_ID" "$GOOGLE_SECRET" <<'PY'
import re, sys
path, gid, gsec = sys.argv[1:4]
text = open(path).read()
text = re.sub(r'^GOOGLE_ID=.*$', f'GOOGLE_ID="{gid}"', text, flags=re.M)
text = re.sub(r'^GOOGLE_SECRET=.*$', f'GOOGLE_SECRET="{gsec}"', text, flags=re.M)
open(path, "w").write(text)
PY

echo "✓ $ENV_FILE 에 GOOGLE_ID / GOOGLE_SECRET 반영됨"