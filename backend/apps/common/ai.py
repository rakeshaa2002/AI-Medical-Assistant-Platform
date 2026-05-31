"""Thin wrapper around the Google Gemini API.

Gracefully degrades when no API key is configured so the rest of the
platform stays usable in local/dev environments.
"""
import logging

from django.conf import settings

logger = logging.getLogger(__name__)

# Embedding model used for RAG. gemini-embedding-001 supports configurable
# output dimensionality; 768 keeps storage small and within pgvector's
# indexable limit while remaining high quality.
EMBED_MODEL = getattr(settings, "GEMINI_EMBED_MODEL", "models/gemini-embedding-001")
EMBED_DIM = 768

MEDICAL_DISCLAIMER = (
    "This information is AI-generated and for educational purposes only. "
    "It is not a substitute for professional medical advice, diagnosis, or "
    "treatment. Always consult a qualified healthcare provider."
)

SYSTEM_PROMPT = (
    "You are MedAssist, a careful and empathetic AI healthcare assistant. "
    "You help users understand symptoms, general health information, and "
    "their medical reports in plain language. You DO NOT provide definitive "
    "diagnoses or prescriptions. Encourage users to seek professional care, "
    "and flag any emergency ('red flag') symptoms that require immediate "
    "attention. Keep answers concise, structured, and easy to understand."
)


def _get_model():
    if not settings.GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai

        # Use the REST transport (requests + certifi) instead of the default
        # gRPC transport, which on Windows often cannot locate the system CA
        # root certificates and fails with CERTIFICATE_VERIFY_FAILED.
        genai.configure(api_key=settings.GEMINI_API_KEY, transport="rest")
        return genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT,
        )
    except Exception:  # pragma: no cover - defensive
        logger.exception("Failed to initialise Gemini model")
        return None


def chat_reply(history, message, context=None):
    """Return an AI reply given prior history and a new user message.

    ``history`` is a list of {"role": "user"|"assistant", "content": str}.
    ``context`` is optional retrieved text (RAG) from the user's own reports;
    when provided it is used to ground the answer.
    """
    model = _get_model()
    if model is None:
        return (
            "AI service is not configured. Please set GEMINI_API_KEY. "
            "Meanwhile, for any concerning symptoms, consult a doctor.\n\n"
            + MEDICAL_DISCLAIMER
        )
    try:
        gemini_history = [
            {
                "role": "model" if m["role"] == "assistant" else "user",
                "parts": [m["content"]],
            }
            for m in history
        ]
        prompt = message
        if context:
            prompt = (
                "Use the following excerpts from the patient's OWN uploaded "
                "medical reports to answer their question. Ground your answer in "
                "these excerpts and cite the values you reference. If the answer "
                "is not contained in them, say so plainly and do not invent "
                "values.\n\n"
                "----- PATIENT REPORT EXCERPTS -----\n"
                f"{context}\n"
                "----- END EXCERPTS -----\n\n"
                f"Question: {message}"
            )
        chat = model.start_chat(history=gemini_history)
        response = chat.send_message(prompt)
        return response.text.strip()
    except Exception:  # pragma: no cover - network/runtime errors
        logger.exception("Gemini chat request failed")
        return (
            "Sorry, the AI assistant is temporarily unavailable. "
            "Please try again later.\n\n" + MEDICAL_DISCLAIMER
        )


def _embed(text, task_type):
    """Return a single L2-normalised embedding vector, or None on failure."""
    if not settings.GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
        import numpy as np

        genai.configure(api_key=settings.GEMINI_API_KEY, transport="rest")
        result = genai.embed_content(
            model=EMBED_MODEL,
            content=text,
            task_type=task_type,
            output_dimensionality=EMBED_DIM,
        )
        vec = np.asarray(result["embedding"], dtype="float32")
        # Google recommends normalising when output_dimensionality < 3072.
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()
    except Exception:  # pragma: no cover - network/runtime errors
        logger.exception("Gemini embedding request failed")
        return None


def embed_document(text):
    """Embed a passage that will be stored/retrieved (indexing time)."""
    return _embed(text, task_type="retrieval_document")


def embed_query(text):
    """Embed a user query (search time)."""
    return _embed(text, task_type="retrieval_query")


def chunk_text(text, chunk_size=1000, overlap=150):
    """Split text into overlapping character windows on paragraph boundaries.

    Simple and dependency-free; good enough for medical reports which are
    typically a few pages of extracted text.
    """
    text = (text or "").strip()
    if not text:
        return []
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    chunks = []
    buf = ""
    for para in paragraphs:
        if len(buf) + len(para) + 1 <= chunk_size:
            buf = f"{buf}\n{para}" if buf else para
        else:
            if buf:
                chunks.append(buf)
            if len(para) <= chunk_size:
                buf = para
            else:
                # Hard-split an oversized paragraph with overlap.
                start = 0
                while start < len(para):
                    chunks.append(para[start : start + chunk_size])
                    start += chunk_size - overlap
                buf = ""
    if buf:
        chunks.append(buf)
    return chunks


def summarize_report(text):
    """Summarise extracted medical report text into a structured summary."""
    model = _get_model()
    snippet = (text or "").strip()
    if not snippet:
        return "No readable text was found in the uploaded report."
    if model is None:
        return (
            "AI summary unavailable (GEMINI_API_KEY not set). "
            "Extracted text preview:\n\n" + snippet[:1500]
        )
    prompt = (
        "Summarise the following medical report for a patient. Provide:\n"
        "1. Key findings (bullet points)\n"
        "2. Notable values that are out of normal range (if any)\n"
        "3. Plain-language explanation\n"
        "4. Suggested next steps / questions for their doctor\n\n"
        "Do NOT invent values not present in the text. Report text:\n\n"
        f"{snippet[:12000]}"
    )
    try:
        response = model.generate_content(prompt)
        return response.text.strip() + "\n\n" + MEDICAL_DISCLAIMER
    except Exception:  # pragma: no cover
        logger.exception("Gemini summary request failed")
        return "AI summary could not be generated. Extracted text:\n\n" + snippet[:1500]
