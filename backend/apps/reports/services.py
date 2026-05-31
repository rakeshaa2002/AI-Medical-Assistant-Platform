"""Processing pipeline for an uploaded medical report.

Runs synchronously here for simplicity. In production this would be handed
to a background worker (Celery/RQ); the function is written so it can be
moved behind a task queue without changes to the call site.
"""
import logging

from apps.common.ai import summarize_report
from apps.common.ocr import extract_text

from .models import MedicalReport
from .rag import index_report

logger = logging.getLogger(__name__)


def process_report(report: MedicalReport) -> MedicalReport:
    report.status = MedicalReport.Status.PROCESSING
    report.save(update_fields=["status"])
    try:
        text = extract_text(report.file.path)
        report.extracted_text = text
        report.ai_summary = summarize_report(text)
        report.status = MedicalReport.Status.COMPLETED
    except Exception:  # pragma: no cover - defensive
        logger.exception("Report processing failed for report %s", report.id)
        report.status = MedicalReport.Status.FAILED
    report.save(update_fields=["extracted_text", "ai_summary", "status", "updated_at"])

    # Build the RAG index from the extracted text (best-effort; never blocks
    # the upload from succeeding).
    if report.status == MedicalReport.Status.COMPLETED:
        try:
            count = index_report(report)
            logger.info("Indexed %s chunks for report %s", count, report.id)
        except Exception:  # pragma: no cover - defensive
            logger.exception("Failed to index report %s for RAG", report.id)
    return report
