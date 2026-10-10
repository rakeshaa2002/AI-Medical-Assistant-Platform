"""The public one-click demo accounts created by `seed_data`.

Their credentials are on the login page for anyone to use, so the API refuses
changes that would lock the next visitor out. seed_data also restores them on
every start, but a busy free-tier instance can run for a long time between starts.
Only these exact accounts are protected, not their email domain, which anyone
could register.
"""

DEMO_ADMIN_EMAIL = "admin@medassist.local"
DEMO_PATIENT_EMAIL = "patient@medassist.local"
DEMO_DOCTOR_EMAILS = [f"doctor{n}@medassist.local" for n in range(1, 6)]
DEMO_EMAILS = frozenset([DEMO_ADMIN_EMAIL, DEMO_PATIENT_EMAIL, *DEMO_DOCTOR_EMAILS])


def is_demo_account(user):
    return user.email in DEMO_EMAILS
