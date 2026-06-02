#!/usr/bin/env bash
# Builds Supabase connection strings for CanAIThis production.
# Default: malgun-staging-20260601 (cbuwyfyhiibobgygpkxv) — reserved project slot.
set -euo pipefail

REF="${SUPABASE_PROJECT_REF:-cbuwyfyhiibobgygpkxv}"
REGION_HOST="${SUPABASE_POOLER_HOST:-aws-1-ap-northeast-2.pooler.supabase.com}"

if [[ -f "${CANAITHIS_ENV:-}" ]]; then
  # shellcheck disable=SC1090
  source "$CANAITHIS_ENV"
elif [[ -f "${MALGUN_ENV:-$HOME/malgun-res/.env.supabase.local}" ]]; then
  # shellcheck disable=SC1090
  source "${MALGUN_ENV:-$HOME/malgun-res/.env.supabase.local}"
  REF="${CANAITHIS_SUPABASE_REF:-cbuwyfyhiibobgygpkxv}"
fi

: "${SUPABASE_DB_PASSWORD:?Set SUPABASE_DB_PASSWORD}"

# Direct host (reliable on Vercel). Pooler auth on this project ref was failing (P1000).
export DIRECT_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${REF}.supabase.co:5432/postgres?sslmode=require"
export DATABASE_URL="${DIRECT_URL}"

# Optional: transaction pooler (use only if pooler password works in your dashboard)
# POOLER_USER="postgres%2E${REF}"
# export DATABASE_URL="postgresql://${POOLER_USER}:${SUPABASE_DB_PASSWORD}@${REGION_HOST}:6543/postgres?pgbouncer=true"