from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.emails import send_appointment_email
from apps.common.permissions import IsAdmin, IsAdminOrReadOnly, IsPatient

from .models import Appointment, AvailabilitySlot, Doctor
from .serializers import (
    AppointmentSerializer,
    DoctorSerializer,
    DoctorWithAccountSerializer,
    SlotSerializer,
)


class DoctorViewSet(viewsets.ModelViewSet):
    """List doctors (any authenticated user); manage them (admin only)."""

    queryset = Doctor.objects.select_related("user").all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["specialization", "is_available"]
    search_fields = ["specialization", "user__first_name", "user__last_name", "qualifications"]
    ordering_fields = ["rating", "experience_years", "consultation_fee"]

    @action(detail=False, methods=["get"])
    def specializations(self, request):
        values = (
            Doctor.objects.order_by("specialization")
            .values_list("specialization", flat=True)
            .distinct()
        )
        return Response(sorted(set(values)))

    @action(detail=False, methods=["post"], permission_classes=[IsAdmin])
    def create_account(self, request):
        """Admin onboarding: create the doctor's login + profile together."""
        serializer = DoctorWithAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        doctor = serializer.save()
        return Response(
            DoctorSerializer(doctor, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class SlotViewSet(viewsets.ModelViewSet):
    queryset = AvailabilitySlot.objects.select_related("doctor", "doctor__user").all()
    serializer_class = SlotSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["doctor", "date", "is_booked"]
    ordering_fields = ["date", "start_time"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        # By default only show open slots unless explicitly filtering.
        if self.action == "list" and "is_booked" not in self.request.query_params:
            qs = qs.filter(is_booked=False)
        return qs


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "doctor"]
    ordering_fields = ["created_at"]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_permissions(self):
        # Only patients may book a new appointment; everyone authenticated can
        # read their scoped list, and status/cancel are guarded in their actions.
        if self.action == "create":
            return [IsPatient()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.select_related(
            "patient", "doctor", "doctor__user", "slot"
        )
        if user.is_admin:
            return qs
        if user.is_doctor:
            return qs.filter(doctor__user=user)
        return qs.filter(patient=user)

    def perform_create(self, serializer):
        appointment = serializer.save()
        send_appointment_email(appointment, event="booked")

    @action(detail=True, methods=["patch"])
    def status(self, request, pk=None):
        """Update appointment status (doctor/admin) with side effects."""
        appointment = self.get_object()
        new_status = request.data.get("status")
        valid = dict(Appointment.Status.choices)
        if new_status not in valid:
            return Response(
                {"success": False, "message": "Invalid status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = request.user
        if not (user.is_admin or (user.is_doctor and appointment.doctor.user_id == user.id)):
            return Response(
                {"success": False, "message": "Not allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )
        appointment.status = new_status
        if "notes" in request.data:
            appointment.notes = request.data["notes"]
        appointment.save()
        # Free the slot if cancelled.
        if new_status == Appointment.Status.CANCELLED and appointment.slot:
            appointment.slot.is_booked = False
            appointment.slot.save(update_fields=["is_booked"])
        send_appointment_email(appointment, event=new_status)
        return Response(AppointmentSerializer(appointment).data)

    def destroy(self, request, *args, **kwargs):
        appointment = self.get_object()
        user = request.user
        if not (user.is_admin or appointment.patient_id == user.id):
            return Response(
                {"success": False, "message": "Not allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if appointment.slot:
            appointment.slot.is_booked = False
            appointment.slot.save(update_fields=["is_booked"])
        appointment.status = Appointment.Status.CANCELLED
        appointment.save(update_fields=["status"])
        send_appointment_email(appointment, event="cancelled")
        return Response(
            {"success": True, "message": "Appointment cancelled."},
            status=status.HTTP_200_OK,
        )
