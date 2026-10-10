"""Seed the database with demo users, doctors and slots.

Usage:  python manage.py seed_data

Idempotent. It also runs on every production start (start.sh) to back the
one-click demo logins on the login page, so each run restores the demo accounts
(re-activates them and resets their passwords) in case a visitor changed them.
"""
from datetime import time, timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.utils import timezone

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


class Command(BaseCommand):
    help = "Seed demo data (admin, patient, doctors, slots)."

    def handle(self, *args, **options):
        # Hash each shared password once: hashing is deliberately slow and this
        # runs on every production start.
        hashes = {pw: make_password(pw) for pw in {ADMIN_PASSWORD, PATIENT_PASSWORD, DOCTOR_PASSWORD}}

        # These credentials are public (login page), so the demo admin gets the
        # app's admin role only: no Django staff/superuser access to /admin/.
        self.demo_user(
            "admin@medassist.local", hashes[ADMIN_PASSWORD],
            first_name="Site", last_name="Admin", role=User.Role.ADMIN, is_staff=False, is_superuser=False,
        )
        self.stdout.write(self.style.SUCCESS(f"Admin: admin@medassist.local / {ADMIN_PASSWORD}"))

        self.demo_user(
            "patient@medassist.local", hashes[PATIENT_PASSWORD],
            first_name="John", last_name="Doe", role=User.Role.PATIENT,
        )
        self.stdout.write(self.style.SUCCESS(f"Patient: patient@medassist.local / {PATIENT_PASSWORD}"))

        for i, (fn, ln, spec, exp, fee) in enumerate(DOCTORS):
            user = self.demo_user(
                f"doctor{i + 1}@medassist.local", hashes[DOCTOR_PASSWORD],
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

    def demo_user(self, email, password_hash, **fields):
        """Create a demo account, or restore it if a visitor changed or disabled it."""
        user, _ = User.objects.get_or_create(email=email, defaults=fields)
        for name, value in fields.items():
            setattr(user, name, value)
        user.is_active = True
        user.password = password_hash
        user.save()
        return user
