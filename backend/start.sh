#!/usr/bin/env sh
# Container entrypoint: run migrations (incl. pgvector CREATE EXTENSION),
# then start gunicorn bound to the port Render injects ($PORT).
set -e

python manage.py migrate --noinput

# Demo users/doctors/slots behind the login page's one-click demo buttons
# (idempotent; restores demo accounts visitors changed). Set SEED_DEMO_DATA=false
# to skip. A seeding failure must not keep the API down.
if [ "${SEED_DEMO_DATA:-true}" = "true" ]; then
  python manage.py seed_data || echo "seed_data failed; continuing without demo data"
fi

# Create/refresh the admin login from ADMIN_EMAIL / ADMIN_PASSWORD (no-op if unset).
# Runs after seeding so this private admin wins even if it reuses a demo email.
python manage.py ensure_admin

exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-3}"
