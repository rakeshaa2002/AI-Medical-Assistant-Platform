FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System deps for OCR (tesseract) and image/PDF handling.
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# start.sh runs migrations then launches gunicorn bound to $PORT.
CMD ["sh", "./start.sh"]
