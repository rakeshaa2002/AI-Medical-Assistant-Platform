"""Startup tasks that run after `migrate` on every start (see start.sh).

One process instead of one per command: each Django boot costs about ten
seconds on Render's 0.1-CPU free tier, and the visitor who woke the instance is
waiting for it.
"""
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connections


class Command(BaseCommand):
    help = "Seed the demo accounts (if SEED_DEMO_DATA), then ensure the ADMIN_EMAIL admin."

    def handle(self, *args, **options):
        if settings.SEED_DEMO_DATA:
            try:
                call_command("seed_data", stdout=self.stdout, stderr=self.stderr)
            except Exception as exc:  # demo data is optional; never keep the API down
                self.stderr.write(f"seed_data failed; continuing without demo data: {exc}")
                # If the failure dropped the DB connection, let ensure_admin reconnect.
                for conn in connections.all(initialized_only=True):
                    if conn.connection is not None and not conn.is_usable():
                        conn.close()

        # After seeding, so this private admin wins even if it reuses a demo email.
        call_command("ensure_admin", stdout=self.stdout, stderr=self.stderr)
