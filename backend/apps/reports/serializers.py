from rest_framework import serializers

from .models import MedicalReport

# Keep these in sync with the frontend's constants/index.js.
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/bmp",
    "image/tiff",
    "image/webp",
}


class MedicalReportSerializer(serializers.ModelSerializer):
    file_name = serializers.CharField(read_only=True)
    file_url = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()

    class Meta:
        model = MedicalReport
        fields = [
            "id",
            "title",
            "file",
            "file_url",
            "file_name",
            "user",
            "extracted_text",
            "ai_summary",
            "status",
            "created_at",
        ]
        read_only_fields = ["extracted_text", "ai_summary", "status", "created_at"]
        extra_kwargs = {"file": {"write_only": True}}

    def validate_file(self, f):
        """Defence-in-depth: enforce size and content type server-side.

        The model's FileExtensionValidator already restricts the extension;
        this also guards against oversized files and spoofed extensions.
        """
        if f.size == 0:
            raise serializers.ValidationError("The uploaded file is empty.")
        if f.size > MAX_UPLOAD_BYTES:
            mb = MAX_UPLOAD_BYTES // (1024 * 1024)
            raise serializers.ValidationError(f"File too large. Maximum size is {mb} MB.")
        content_type = getattr(f, "content_type", None)
        if content_type and content_type not in ALLOWED_CONTENT_TYPES:
            raise serializers.ValidationError(
                f"Unsupported content type '{content_type}'."
            )
        return f

    def get_user(self, obj):
        return {"id": obj.user_id, "email": obj.user.email, "name": obj.user.get_full_name()}

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
