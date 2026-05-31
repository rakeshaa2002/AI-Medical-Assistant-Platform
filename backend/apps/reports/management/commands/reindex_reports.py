"""Rebuild RAG embedding chunks for existing reports.

Usage:
    python manage.py reindex_reports          # only reports with no chunks
    python manage.py reindex_reports --all     # re-embed every completed report
"""
from django.core.management.base import BaseCommand

from apps.reports.models import MedicalReport
from apps.reports.rag import index_report


class Command(BaseCommand):
    help = "(Re)build pgvector embedding chunks for medical reports."

    def add_arguments(self, parser):
        parser.add_argument(
            "--all",
            action="store_true",
            help="Re-embed every completed report, not just unindexed ones.",
        )

    def handle(self, *args, **options):
        qs = MedicalReport.objects.filter(status=MedicalReport.Status.COMPLETED)
        if not options["all"]:
            qs = qs.filter(chunks__isnull=True).distinct()

        total = qs.count()
        if not total:
            self.stdout.write(self.style.WARNING("No reports to index."))
            return

        indexed = 0
        for report in qs.iterator():
            n = index_report(report)
            indexed += n
            self.stdout.write(f"  report {report.id} '{report.title}': {n} chunks")
        self.stdout.write(
            self.style.SUCCESS(f"Done. Indexed {indexed} chunks across {total} reports.")
        )
