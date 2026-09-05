#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="/home/administrator/projects/pinesaas-crm"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/pinesaas-blogs"
BACKEND_URL="https://api-itms.cloudafk.xyz/api/health"
FRONTEND_URL="https://itms.cloudafk.xyz/"

trap 'printf "Deployment failed at line %s: %s\n" "$LINENO" "$BASH_COMMAND" >&2' ERR

die() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

log() {
  printf '\n==> %s\n' "$1"
}

cd "$ROOT_DIR"
git rev-parse --show-toplevel >/dev/null 2>&1 || die "Not a git repository: $ROOT_DIR"

branch="$(git branch --show-current)"
[[ "$branch" == "main" ]] || die "Expected branch main, found $branch"
git diff --quiet || die "Tracked working-tree modifications must be committed before deployment"
git diff --cached --quiet || die "Staged changes must be committed before deployment"

log "Fetching origin/main"
git fetch origin main
git merge --ff-only origin/main

log "Installing backend dependencies"
cd "$BACKEND_DIR"
npm ci
npx prisma generate --schema ../pinesaas-blogs/prisma/schema.prisma
if [[ -d ../pinesaas-blogs/prisma/migrations ]]; then
  if grep -q 'provider = "mongodb"' ../pinesaas-blogs/prisma/schema.prisma; then
    log "Skipping Prisma migrations: MongoDB does not use Prisma SQL migrations"
  else
    npx prisma migrate deploy --schema ../pinesaas-blogs/prisma/schema.prisma
  fi
else
  log "No Prisma migrations directory found; skipping migrations"
fi
npm run build

log "Installing frontend dependencies and building"
cd "$FRONTEND_DIR"
npm ci
export VITE_API_URL="${VITE_API_URL:-https://api-itms.cloudafk.xyz/api}"
npm run build

mkdir -p "$BACKEND_DIR/logs" "$FRONTEND_DIR/logs"

log "Restarting Supervisor-managed services"
supervisorctl status pinesaas-backend >/dev/null 2>&1 \
  || die "Supervisor programs are not configured. Install scripts/supervisor/pinesaas-crm.conf and run supervisorctl reread/update."
supervisorctl restart pinesaas-backend pinesaas-frontend

log "Checking local listeners and health endpoints"
for attempt in 1 2 3 4 5; do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:30001/api/health >/dev/null \
    && curl --fail --silent --show-error --max-time 5 http://127.0.0.1:5174/ >/dev/null; then
    break
  fi
  [[ "$attempt" == 5 ]] && die "Local health checks failed"
  sleep 2
done

curl --fail --silent --show-error --max-time 15 "$BACKEND_URL" >/dev/null
curl --fail --silent --show-error --max-time 15 "$FRONTEND_URL" >/dev/null
supervisorctl status pinesaas-backend pinesaas-frontend

log "Deployment complete"
printf 'Deployed commit: %s\n' "$(git rev-parse --short HEAD)"