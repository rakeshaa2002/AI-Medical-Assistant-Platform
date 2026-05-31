from django.contrib import admin

from .models import Appointment, AvailabilitySlot, Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("user", "specialization", "experience_years", "consultation_fee", "rating", "is_available")
    list_filter = ("specialization", "is_available")
    search_fields = ("user__first_name", "user__last_name", "specialization")


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ("doctor", "date", "start_time", "end_time", "is_booked")
    list_filter = ("date", "is_booked", "doctor")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("patient", "doctor", "status", "created_at")
    list_filter = ("status", "doctor")
    search_fields = ("patient__email", "doctor__user__last_name")
