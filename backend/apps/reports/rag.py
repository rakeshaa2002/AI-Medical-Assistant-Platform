"""Retrieval-Augmented Generation helpers for medical reports.

Indexing: a report's extracted text is split into chunks, each embedded with
Gemini and stored in pgvector. Retrieval: a user's query is embedded and the
nearest chunks *belonging to that same user* are returned to ground the chat.
"""
import logging

from pgvector.django import CosineDistance

from apps.common.ai import chunk_text, embed_document, embed_query

from .models import MedicalReport, ReportChunk

logger = logging.getLogger(__name__)

# Cosine distance ranges 0 (identical) .. 2 (opposite). Anything beyond this is
# treated as irrelevant so unrelated questions don't pull in noisy context.
# Calibrated empirically: relevant medical queries score ~0.2-0.35 against
# report chunks, clearly unrelated ones ~0.48+.
MAX_DISTANCE = 0.45


def index_report(report: MedicalReport) -> int:
    """(Re)build the embedding chunks for a single report.

    Returns the number of chunks stored. Safe to call repeatedly; existing
    chunks for the report are replaced.
    """
    report.chunks.all().delete()
    chunks = chunk_text(report.extracted_text)
    if not chunks:
        return 0

    objects = []
    for idx, content in enumerate(chunks):
        vector = embed_document(content)
        if vector is None:
            # No API key / transient failure: skip indexing rather than crash
            # the upload. The report itself is still saved.
            logger.warning("Skipping chunk %s of report %s (no embedding)", idx, report.id)
            continue
        objects.append(
            ReportChunk(
                report=report,
                user_id=report.user_id,
                chunk_index=idx,
                content=content,
                embedding=vector,
            )
        )
    if objects:
        ReportChunk.objects.bulk_create(objects)
    return len(objects)


def retrieve_for_user(user, query, k=4):
    """Return up to ``k`` of the user's report chunks most relevant to ``query``.

    Returns a list of ReportChunk instances (possibly empty).
    """
    vector = embed_query(query)
    if vector is None:
        return []
    qs = (
        ReportChunk.objects.filter(user=user)
        .annotate(distance=CosineDistance("embedding", vector))
        .filter(distance__lt=MAX_DISTANCE)
        .order_by("distance")[:k]
    )
    return list(qs)


def build_context(chunks) -> str:
    """Format retrieved chunks into a grounding block for the prompt."""
    parts = []
    for c in chunks:
        parts.append(f"[From report: {c.report.title}]\n{c.content}")
    return "\n\n".join(parts)
