#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  node ./scripts/migrate.mjs || echo "[entrypoint] migration step failed, continuing"
fi

exec "$@"
