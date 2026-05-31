"""Create (or update) an admin user from environment variables.

Runs on every deploy via start.sh. This is the free-tier-friendly way to get an
admin login without shell/SSH access (which Render charges for).

Set ADMIN_EMAIL and ADMIN_PASSWORD on the service; if either is missing this is
a no-op. The password is (re)set to ADMIN_PASSWORD on each run, so that env var
is the source of truth for the admin login.
"""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Ensure an admin user exists, from ADMIN_EMAIL / ADMIN_PASSWORD env vars."

    def handle(self, *args, **options):
        email = os.getenv("ADMIN_EMAIL")
        password = os.getenv("ADMIN_PASSWORD")
        if not email or not password:
            self.stdout.write("ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin bootstrap.")
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email.lower(),
            defaults={
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "first_name": "Site",
                "last_name": "Admin",
            },
        )
        # Keep it an admin and sync the password to the env var.
        user.role = User.Role.ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()
        self.stdout.write(
            self.style.SUCCESS(f"Admin {'created' if created else 'updated'}: {email}")
        )
