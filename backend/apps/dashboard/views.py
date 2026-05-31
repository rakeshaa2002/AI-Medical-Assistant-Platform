from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.models import Appointment, Doctor
from apps.chat.models import Conversation
from apps.common.permissions import IsAdmin
from apps.reports.models import MedicalReport

User = get_user_model()


class AdminStatsView(APIView):
    """Aggregate analytics cards + recent activity for the admin dashboard."""

    permission_classes = [IsAdmin]

    def get(self, request):
        last_30 = timezone.now() - timedelta(days=30)
        appt_by_status = {
            row["status"]: row["count"]
            for row in Appointment.objects.values("status").annotate(count=Count("id"))
        }
        cards = {
            "total_users": User.objects.count(),
            "total_patients": User.objects.filter(role=User.Role.PATIENT).count(),
            "total_doctors": Doctor.objects.count(),
            "total_appointments": Appointment.objects.count(),
            "total_reports": MedicalReport.objects.count(),
            "total_conversations": Conversation.objects.count(),
            "new_users_30d": User.objects.filter(date_joined__gte=last_30).count(),
            "appointments_30d": Appointment.objects.filter(created_at__gte=last_30).count(),
        }
        appointments_by_status = {
            status: appt_by_status.get(status, 0)
            for status, _ in Appointment.Status.choices
        }
        top_specializations = list(
            Doctor.objects.values("specialization")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )
        recent_appointments = list(
            Appointment.objects.select_related("patient", "doctor__user")
            .order_by("-created_at")[:5]
            .values(
                "id",
                "status",
                "created_at",
                "patient__email",
                "doctor__user__first_name",
                "doctor__user__last_name",
            )
        )
        return Response(
            {
                "cards": cards,
                "appointments_by_status": appointments_by_status,
                "top_specializations": top_specializations,
                "recent_appointments": recent_appointments,
            }
        )


class MyStatsView(APIView):
    """Lightweight stats for a patient's or doctor's personal dashboard."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_doctor:
            appts = Appointment.objects.filter(doctor__user=user)
            data = {
                "role": "doctor",
                "total_appointments": appts.count(),
                "upcoming": appts.filter(status=Appointment.Status.CONFIRMED).count(),
                "pending": appts.filter(status=Appointment.Status.PENDING).count(),
                "completed": appts.filter(status=Appointment.Status.COMPLETED).count(),
            }
        else:
            data = {
                "role": "patient",
                "total_appointments": Appointment.objects.filter(patient=user).count(),
                "total_reports": MedicalReport.objects.filter(user=user).count(),
                "total_conversations": Conversation.objects.filter(user=user).count(),
                "upcoming": Appointment.objects.filter(
                    patient=user, status=Appointment.Status.CONFIRMED
                ).count(),
            }
        return Response(data)
