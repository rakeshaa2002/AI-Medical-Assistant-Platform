"""Seed the database with demo users, doctors and slots.

Usage:  python manage.py seed_data

Idempotent. It also runs on every production start (start.sh) to back the
one-click demo logins on the login page, so each run restores the demo accounts
(re-activates them and resets their passwords) in case a visitor changed them.
"""
import hashlib
from datetime import time, timedelta
from functools import lru_cache

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import identify_hasher, make_password
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.demo import DEMO_ADMIN_EMAIL, DEMO_DOCTOR_EMAILS, DEMO_PATIENT_EMAIL
from apps.appointments.models import AvailabilitySlot, Doctor

User = get_user_model()

DOCTORS = [
    ("Asha", "Verma", "Cardiology", 12, 800),
    ("Rahul", "Mehta", "Dermatology", 8, 600),
    ("Priya", "Nair", "Pediatrics", 10, 500),
    ("Sanjay", "Gupta", "Neurology", 15, 1200),
    ("Neha", "Iyer", "General Medicine", 6, 400),
]

ADMIN_PASSWORD = "Admin@123"
PATIENT_PASSWORD = "Patient@123"
DOCTOR_PASSWORD = "Doctor@123"


# Hashing is deliberately slow (seconds each on a 0.1-CPU free instance) and this
# runs on every start. Demo hashes use a salt derived from the *public* demo
# password, so a later run can tell without re-hashing whether a stored hash is
# still the one set here. Never do this for real passwords.
def demo_salt(password):
    return "demo" + hashlib.sha256(password.encode()).hexdigest()[:28]


@lru_cache(maxsize=None)
def demo_hash(password):
    return make_password(password, salt=demo_salt(password))


def is_demo_hash(encoded, password):
    """True if `encoded` is the current demo hash for `password` (no hashing)."""
    try:
        hasher = identify_hasher(encoded)
        return hasher.decode(encoded)["salt"] == demo_salt(password) and not hasher.must_update(encoded)
    except (ValueError, KeyError, NotImplementedError):
        return False


class Command(BaseCommand):
    help = "Seed demo data (admin, patient, doctors, slots)."

    def handle(self, *args, **options):
        # These credentials are public (login page), so the demo admin gets the
        # app's admin role only: no Django staff/superuser access to /admin/.
        self.demo_user(
            DEMO_ADMIN_EMAIL, ADMIN_PASSWORD,
            first_name="Site", last_name="Admin", role=User.Role.ADMIN, is_staff=False, is_superuser=False,
        )
        self.stdout.write(self.style.SUCCESS(f"Admin: {DEMO_ADMIN_EMAIL} / {ADMIN_PASSWORD}"))

        self.demo_user(
            DEMO_PATIENT_EMAIL, PATIENT_PASSWORD,
            first_name="John", last_name="Doe", role=User.Role.PATIENT,
        )
        self.stdout.write(self.style.SUCCESS(f"Patient: {DEMO_PATIENT_EMAIL} / {PATIENT_PASSWORD}"))

        for email, (fn, ln, spec, exp, fee) in zip(DEMO_DOCTOR_EMAILS, DOCTORS, strict=True):
            user = self.demo_user(
                email, DOCTOR_PASSWORD,
                first_name=fn, last_name=ln, role=User.Role.DOCTOR,
            )
            doctor, _ = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    "specialization": spec,
                    "experience_years": exp,
                    "consultation_fee": fee,
                    "qualifications": "MBBS, MD",
                    "rating": 4.5,
                    "bio": f"Experienced {spec} specialist.",
                },
            )
            # Create open slots for the next 5 days.
            today = timezone.localdate()
            for d in range(1, 6):
                date = today + timedelta(days=d)
                for hour in (9, 11, 14, 16):
                    AvailabilitySlot.objects.get_or_create(
                        doctor=doctor,
                        date=date,
                        start_time=time(hour, 0),
                        defaults={"end_time": time(hour, 30)},
                    )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(DOCTORS)} doctors (doctorN@medassist.local / {DOCTOR_PASSWORD})"))
        self.stdout.write(self.style.SUCCESS("Done."))

    def demo_user(self, email, password, **fields):
        """Create a demo account, or restore it if a visitor changed or disabled it."""
        user, _ = User.objects.get_or_create(email=email, defaults=fields)
        for name, value in fields.items():
            setattr(user, name, value)
        user.is_active = True
        if not is_demo_hash(user.password, password):
            user.password = demo_hash(password)
        user.save()
        return user
