#!/usr/bin/env bash
# Creates canaithis-submission.zip (excludes node_modules, .next, secrets)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/canaithis-submission.zip"
NAME="canaithis-submission"

cd "$ROOT"

rm -f "$OUT"

zip -r "$OUT" . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x "*.zip" \
  -x ".env.local" \
  -x ".env" \
  -x ".env.production.local" \
  -x ".vercel/*" \
  -x "supabase/.temp/*" \
  -x ".DS_Store" \
  -x "**/.DS_Store"

echo "Created: $OUT"
echo "Size: $(du -h "$OUT" | cut -f1)"