#!/usr/bin/env bash
# Builds Supabase connection strings for CanAIThis production.
# Default: CanAIThis Supabase project (wdhxsbuhwneuzyqaenfe) when CANAITHIS_SUPABASE_REF is unset.
set -euo pipefail

REF="${SUPABASE_PROJECT_REF:-}"
REGION_HOST="${SUPABASE_POOLER_HOST:-aws-1-ap-northeast-2.pooler.supabase.com}"

if [[ -f "${CANAITHIS_ENV:-}" ]]; then
  # shellcheck disable=SC1090
  source "$CANAITHIS_ENV"
elif [[ -f "${MALGUN_ENV:-$HOME/malgun-res/.env.supabase.local}" ]]; then
  # shellcheck disable=SC1090
  source "${MALGUN_ENV:-$HOME/malgun-res/.env.supabase.local}"
fi

REF="${CANAITHIS_SUPABASE_REF:-${SUPABASE_PROJECT_REF:-wdhxsbuhwneuzyqaenfe}}"

: "${SUPABASE_DB_PASSWORD:?Set SUPABASE_DB_PASSWORD}"

# Pooler: encode the dot in postgres.{ref} so Node URL + pg get the right user (lib/prisma.ts decodes it).
POOLER_USER="postgres%2E${REF}"
export DIRECT_URL="postgresql://${POOLER_USER}:${SUPABASE_DB_PASSWORD}@${REGION_HOST}:5432/postgres"
export DATABASE_URL="postgresql://${POOLER_USER}:${SUPABASE_DB_PASSWORD}@${REGION_HOST}:6543/postgres?pgbouncer=true"
