import os

from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models
from pgvector.django import HnswIndex, VectorField

from apps.common.ai import EMBED_DIM
from apps.common.models import TimeStampedModel

ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "bmp", "tiff", "webp"]


def report_upload_path(instance, filename):
    return f"reports/{instance.user_id}/{filename}"


class MedicalReport(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports",
    )
    title = models.CharField(max_length=255)
    file = models.FileField(
        upload_to=report_upload_path,
        validators=[FileExtensionValidator(ALLOWED_EXTENSIONS)],
    )
    extracted_text = models.TextField(blank=True)
    ai_summary = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    def __str__(self):
        return f"{self.title} ({self.user.email})"

    @property
    def file_name(self):
        return os.path.basename(self.file.name) if self.file else ""


class ReportChunk(TimeStampedModel):
    """A chunk of a report's extracted text plus its embedding (for RAG).

    ``user`` is denormalised from the report so retrieval can scope to a
    patient's own documents with a single indexed filter.
    """

    report = models.ForeignKey(
        MedicalReport,
        on_delete=models.CASCADE,
        related_name="chunks",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="report_chunks",
    )
    chunk_index = models.PositiveIntegerField(default=0)
    content = models.TextField()
    embedding = VectorField(dimensions=EMBED_DIM)

    class Meta:
        ordering = ["report_id", "chunk_index"]
        indexes = [
            HnswIndex(
                name="reportchunk_embedding_hnsw",
                fields=["embedding"],
                m=16,
                ef_construction=64,
                opclasses=["vector_cosine_ops"],
            ),
        ]

    def __str__(self):
        return f"Chunk<{self.report_id}#{self.chunk_index}>"
