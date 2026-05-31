from django.contrib import admin

from .models import MedicalReport


@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("title", "user__email")
    readonly_fields = ("extracted_text", "ai_summary")
