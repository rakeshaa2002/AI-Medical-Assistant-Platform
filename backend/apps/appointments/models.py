from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.common.models import TimeStampedModel


class Doctor(TimeStampedModel):
    """A doctor profile linked to a user account with the ``doctor`` role."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="doctor_profile",
    )
    specialization = models.CharField(max_length=120)
    qualifications = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ["-rating", "user__first_name"]

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} — {self.specialization}"


class AvailabilitySlot(TimeStampedModel):
    """A bookable time slot for a doctor."""

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="slots")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        ordering = ["date", "start_time"]
        unique_together = ("doctor", "date", "start_time")

    def __str__(self):
        return f"{self.doctor} | {self.date} {self.start_time}-{self.end_time}"


class Appointment(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="appointments")
    slot = models.OneToOneField(
        AvailabilitySlot,
        on_delete=models.SET_NULL,
        null=True,
        related_name="appointment",
    )
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True, help_text="Doctor's notes after consultation")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.patient.email} → {self.doctor} ({self.status})"
