from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase

from apps.appointments.models import AvailabilitySlot, Doctor

User = get_user_model()

DEMO_LOGINS = [
    ("admin@medassist.local", "Admin@123"),
    ("patient@medassist.local", "Patient@123"),
    ("doctor1@medassist.local", "Doctor@123"),
]


class SeedDataTests(TestCase):
    """seed_data backs the public one-click demo logins on the login page."""

    def seed(self):
        call_command("seed_data", stdout=StringIO())

    def test_demo_logins_work_and_admin_is_not_superuser(self):
        self.seed()
        for email, password in DEMO_LOGINS:
            self.assertTrue(User.objects.get(email=email).check_password(password), email)

        admin = User.objects.get(email="admin@medassist.local")
        self.assertTrue(admin.is_admin)
        self.assertFalse(admin.is_staff or admin.is_superuser)

    def test_rerun_is_idempotent_and_restores_changed_accounts(self):
        self.seed()
        patient = User.objects.get(email="patient@medassist.local")
        patient.set_password("changed-by-a-visitor")
        patient.is_active = False
        patient.save()
        counts = (User.objects.count(), Doctor.objects.count(), AvailabilitySlot.objects.count())

        self.seed()

        patient.refresh_from_db()
        self.assertTrue(patient.is_active)
        self.assertTrue(patient.check_password("Patient@123"))
        self.assertEqual(counts, (User.objects.count(), Doctor.objects.count(), AvailabilitySlot.objects.count()))
