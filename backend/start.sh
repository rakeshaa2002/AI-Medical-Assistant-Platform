#!/usr/bin/env sh
# Container entrypoint: run migrations (incl. pgvector CREATE EXTENSION),
# then start gunicorn bound to the port Render injects ($PORT).
set -e

python manage.py migrate --noinput

# Seed the one-click demo accounts (SEED_DEMO_DATA=false skips; a failure is
# logged, not fatal), then create/refresh the admin from ADMIN_EMAIL /
# ADMIN_PASSWORD. One process to keep cold starts short; migrate already ran
# the system checks.
python manage.py bootstrap --skip-checks

exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-3}"
