from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MedicalReport
from .serializers import MedicalReportSerializer
from .services import process_report


class MedicalReportViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalReportSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]
    search_fields = ["title"]
    ordering_fields = ["created_at", "title"]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        qs = MedicalReport.objects.select_related("user")
        # Admins (and doctors) may review all reports; patients see only their own.
        if user.is_admin or user.is_doctor:
            return qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        report = serializer.save()
        # Extract text + generate the AI summary right after upload.
        process_report(report)

    @action(detail=True, methods=["post"])
    def reprocess(self, request, pk=None):
        report = self.get_object()
        process_report(report)
        return Response(MedicalReportSerializer(report, context={"request": request}).data)
