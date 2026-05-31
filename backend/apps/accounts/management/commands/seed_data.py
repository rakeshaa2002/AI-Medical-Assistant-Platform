"""Seed the database with demo users, doctors and slots.

Usage:  python manage.py seed_data
"""
from datetime import time, timedelta

from django.contrib.auth import get_user_model
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


class Command(BaseCommand):
    help = "Seed demo data (admin, patient, doctors, slots)."

    def handle(self, *args, **options):
        admin, created = User.objects.get_or_create(
            email="admin@medassist.local",
            defaults={"first_name": "Site", "last_name": "Admin", "role": User.Role.ADMIN,
                      "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("Admin@123")
            admin.save()
        self.stdout.write(self.style.SUCCESS("Admin: admin@medassist.local / Admin@123"))

        patient, created = User.objects.get_or_create(
            email="patient@medassist.local",
            defaults={"first_name": "John", "last_name": "Doe", "role": User.Role.PATIENT},
        )
        if created:
            patient.set_password("Patient@123")
            patient.save()
        self.stdout.write(self.style.SUCCESS("Patient: patient@medassist.local / Patient@123"))

        for i, (fn, ln, spec, exp, fee) in enumerate(DOCTORS):
            user, created = User.objects.get_or_create(
                email=f"doctor{i + 1}@medassist.local",
                defaults={"first_name": fn, "last_name": ln, "role": User.Role.DOCTOR},
            )
            if created:
                user.set_password("Doctor@123")
                user.save()
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
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(DOCTORS)} doctors (doctorN@medassist.local / Doctor@123)"))
        self.stdout.write(self.style.SUCCESS("Done."))
