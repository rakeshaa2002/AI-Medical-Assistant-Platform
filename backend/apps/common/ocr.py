"""Text extraction from uploaded medical reports (PDF & images)."""
import logging
import os

from django.conf import settings

logger = logging.getLogger(__name__)

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"}
PDF_EXTS = {".pdf"}


def _configure_tesseract():
    if settings.TESSERACT_CMD:
        try:
            import pytesseract

            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
        except Exception:  # pragma: no cover
            logger.warning("Could not configure custom tesseract path")


def extract_text(file_path):
    """Extract text from a PDF or image file. Returns a string (may be empty)."""
    ext = os.path.splitext(file_path)[1].lower()
    try:
        if ext in PDF_EXTS:
            return _extract_pdf(file_path)
        if ext in IMAGE_EXTS:
            return _extract_image(file_path)
    except Exception:  # pragma: no cover - OCR is best effort
        logger.exception("Text extraction failed for %s", file_path)
    return ""


def _extract_pdf(file_path):
    import pdfplumber

    chunks = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            chunks.append(page.extract_text() or "")
    text = "\n".join(chunks).strip()
    # If a PDF is scanned (no embedded text) fall back to OCR on page images.
    if not text:
        text = _ocr_pdf(file_path)
    return text


def _ocr_pdf(file_path):
    try:
        import pdfplumber
        import pytesseract

        _configure_tesseract()
        chunks = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                image = page.to_image(resolution=200).original
                chunks.append(pytesseract.image_to_string(image))
        return "\n".join(chunks).strip()
    except Exception:  # pragma: no cover
        logger.exception("PDF OCR fallback failed")
        return ""


def _extract_image(file_path):
    import pytesseract
    from PIL import Image

    _configure_tesseract()
    with Image.open(file_path) as img:
        return pytesseract.image_to_string(img).strip()
