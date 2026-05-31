#!/usr/bin/env sh
# Container entrypoint: run migrations (incl. pgvector CREATE EXTENSION),
# then start gunicorn bound to the port Render injects ($PORT).
set -e

python manage.py migrate --noinput

# Create/refresh the admin login from ADMIN_EMAIL / ADMIN_PASSWORD (no-op if unset).
python manage.py ensure_admin

exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-3}"
