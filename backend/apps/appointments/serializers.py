from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer

from .models import Appointment, AvailabilitySlot, Doctor

User = get_user_model()


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.DOCTOR),
        source="user",
        write_only=True,
    )
    name = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            "id",
            "user",
            "user_id",
            "name",
            "specialization",
            "qualifications",
            "bio",
            "experience_years",
            "consultation_fee",
            "rating",
            "is_available",
        ]

    def get_name(self, obj):
        return f"Dr. {obj.user.get_full_name()}"

    def validate_user_id(self, user):
        if Doctor.objects.filter(user=user).exclude(pk=getattr(self.instance, "pk", None)).exists():
            raise serializers.ValidationError("This user already has a doctor profile.")
        return user


class DoctorWithAccountSerializer(serializers.Serializer):
    """Create a brand-new doctor login *and* their profile in one step (admin)."""

    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    specialization = serializers.CharField(max_length=120)
    qualifications = serializers.CharField(max_length=255, required=False, allow_blank=True)
    experience_years = serializers.IntegerField(min_value=0, default=0)
    consultation_fee = serializers.DecimalField(max_digits=8, decimal_places=2, default=0)
    bio = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data["email"],
                password=validated_data["password"],
                role=User.Role.DOCTOR,
                first_name=validated_data["first_name"],
                last_name=validated_data["last_name"],
                phone=validated_data.get("phone", ""),
            )
            doctor = Doctor.objects.create(
                user=user,
                specialization=validated_data["specialization"],
                qualifications=validated_data.get("qualifications", ""),
                experience_years=validated_data.get("experience_years", 0),
                consultation_fee=validated_data.get("consultation_fee", 0),
                bio=validated_data.get("bio", ""),
            )
        return doctor


class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ["id", "doctor", "date", "start_time", "end_time", "is_booked"]
        read_only_fields = ["is_booked"]

    def validate(self, attrs):
        if attrs["start_time"] >= attrs["end_time"]:
            raise serializers.ValidationError("start_time must be before end_time.")
        return attrs


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_detail = DoctorSerializer(source="doctor", read_only=True)
    patient_detail = UserSerializer(source="patient", read_only=True)
    slot_detail = SlotSerializer(source="slot", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_detail",
            "doctor",
            "doctor_detail",
            "slot",
            "slot_detail",
            "reason",
            "status",
            "notes",
            "created_at",
        ]
        read_only_fields = ["patient", "status", "notes", "created_at"]

    def validate_slot(self, slot):
        if slot.is_booked:
            raise serializers.ValidationError("This slot is already booked.")
        return slot

    def validate(self, attrs):
        slot = attrs.get("slot")
        doctor = attrs.get("doctor")
        if slot and doctor and slot.doctor_id != doctor.id:
            raise serializers.ValidationError("Slot does not belong to the selected doctor.")
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        slot = validated_data["slot"]
        # Lock the slot row to prevent a double-booking race.
        slot = AvailabilitySlot.objects.select_for_update().get(pk=slot.pk)
        if slot.is_booked:
            raise serializers.ValidationError({"slot": "This slot was just booked."})
        slot.is_booked = True
        slot.save(update_fields=["is_booked"])
        validated_data["patient"] = self.context["request"].user
        return super().create(validated_data)
