import os
from io import StringIO
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.accounts.demo import DEMO_EMAILS, is_demo_account
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

    def test_rerun_skips_hashing_unchanged_passwords(self):
        # Keeps cold starts fast: hashing costs seconds on a free instance.
        self.seed()
        with mock.patch("apps.accounts.management.commands.seed_data.demo_hash") as demo_hash:
            self.seed()
        demo_hash.assert_not_called()

    def test_exactly_the_seeded_accounts_are_protected(self):
        self.seed()
        self.assertEqual(set(User.objects.values_list("email", flat=True)), DEMO_EMAILS)
        # The email domain itself is not reserved: anyone could register it.
        self.assertFalse(is_demo_account(User(email="someone@medassist.local")))


class DemoAccountGuardTests(TestCase):
    """The demo credentials are public, so one visitor must not lock out the next."""

    @classmethod
    def setUpTestData(cls):
        call_command("seed_data", stdout=StringIO())
        cls.demo_admin = User.objects.get(email="admin@medassist.local")
        cls.patient = User.objects.get(email="patient@medassist.local")
        cls.owner = User.objects.create_superuser("owner@example.com", "Owner@12345")
        cls.regular = User.objects.create_user("someone@example.com", "Someone@12345")

    def client_for(self, user):
        client = APIClient()
        client.force_authenticate(user)
        return client

    def test_demo_account_cannot_change_password(self):
        res = self.client_for(self.patient).post(
            "/api/auth/change-password/", {"old_password": "Patient@123", "new_password": "Brand-new@123"}
        )
        self.assertEqual(res.status_code, 403)
        self.patient.refresh_from_db()
        self.assertTrue(self.patient.check_password("Patient@123"))

    def test_regular_user_can_change_password(self):
        res = self.client_for(self.regular).post(
            "/api/auth/change-password/", {"old_password": "Someone@12345", "new_password": "Brand-new@123"}
        )
        self.assertEqual(res.status_code, 200)

    def test_admin_cannot_deactivate_edit_or_delete_protected_accounts(self):
        client = self.client_for(self.demo_admin)
        for target in (self.patient, self.demo_admin, self.owner):
            url = f"/api/auth/users/{target.pk}/"
            self.assertEqual(client.patch(url, {"is_active": False}, format="json").status_code, 403)
            self.assertEqual(client.put(url, {"email": "taken@example.com"}, format="json").status_code, 403)
            self.assertEqual(client.delete(url).status_code, 403)
            target.refresh_from_db()
            self.assertTrue(target.is_active)
            self.assertNotEqual(target.email, "taken@example.com")

    def test_admin_can_still_manage_regular_users(self):
        url = f"/api/auth/users/{self.regular.pk}/"
        res = self.client_for(self.demo_admin).patch(url, {"is_active": False}, format="json")
        self.assertEqual(res.status_code, 200)
        self.regular.refresh_from_db()
        self.assertFalse(self.regular.is_active)

    def test_owner_can_manage_demo_accounts_but_not_itself(self):
        client = self.client_for(self.owner)
        res = client.patch(f"/api/auth/users/{self.patient.pk}/", {"is_active": False}, format="json")
        self.assertEqual(res.status_code, 200)
        res = client.patch(f"/api/auth/users/{self.owner.pk}/", {"is_active": False}, format="json")
        self.assertEqual(res.status_code, 403)


class BootstrapTests(TestCase):
    ADMIN_ENV = {"ADMIN_EMAIL": "owner@example.com", "ADMIN_PASSWORD": "Owner@12345"}

    def bootstrap(self):
        with mock.patch.dict(os.environ, self.ADMIN_ENV):
            call_command("bootstrap", stdout=StringIO(), stderr=StringIO())

    def test_seeds_demo_accounts_and_env_admin(self):
        self.bootstrap()
        self.assertTrue(User.objects.filter(email="patient@medassist.local").exists())
        self.assertTrue(User.objects.get(email="owner@example.com").is_superuser)

    @override_settings(SEED_DEMO_DATA=False)
    def test_seeding_can_be_turned_off(self):
        self.bootstrap()
        self.assertFalse(User.objects.filter(email="patient@medassist.local").exists())
        self.assertTrue(User.objects.filter(email="owner@example.com").exists())

    def test_seed_failure_does_not_block_the_admin(self):
        with mock.patch("apps.accounts.management.commands.seed_data.Command.handle", side_effect=RuntimeError("boom")):
            self.bootstrap()
        self.assertTrue(User.objects.filter(email="owner@example.com").exists())
