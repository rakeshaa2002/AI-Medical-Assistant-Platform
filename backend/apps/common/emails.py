"""Helper functions for transactional email notifications."""
import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _send(subject, message, recipient):
    if not recipient:
        return
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=True,
        )
    except Exception:  # pragma: no cover
        logger.exception("Failed to send email to %s", recipient)


def send_welcome_email(user):
    _send(
        "Welcome to MedAssist",
        f"Hi {user.get_full_name() or user.email},\n\n"
        "Your MedAssist account has been created successfully. "
        "You can now chat with our AI health assistant, upload medical "
        "reports, and book appointments with doctors.\n\n— The MedAssist Team",
        user.email,
    )


def send_appointment_email(appointment, event="booked"):
    patient = appointment.patient
    doctor = appointment.doctor
    when = f"{appointment.slot.date} at {appointment.slot.start_time}"
    verbs = {
        "booked": "has been booked",
        "confirmed": "has been confirmed",
        "cancelled": "has been cancelled",
        "completed": "has been marked completed",
    }
    verb = verbs.get(event, "was updated")
    _send(
        f"Appointment {event.title()} — MedAssist",
        f"Hi {patient.get_full_name() or patient.email},\n\n"
        f"Your appointment with Dr. {doctor.user.get_full_name()} "
        f"({doctor.specialization}) on {when} {verb}.\n\n— MedAssist",
        patient.email,
    )
