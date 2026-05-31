# Deploying to Render

This repo ships a **Render Blueprint** ([`render.yaml`](render.yaml)) that provisions three things:

| Service | Type | Notes |
|---|---|---|
| `medassist-db` | PostgreSQL | pgvector enabled automatically by the migration |
| `medassist-backend` | Docker web service | Django + Gunicorn (tesseract OCR baked into the image) |
| `medassist-frontend` | Static site | Vite build served by Render's CDN |

## 1. Push the repo (already done)
Make sure your latest code is on GitHub: `https://github.com/rakeshaa2002/AI-Medical-Assistant-Platform`.

## 2. Create the Blueprint
1. Go to **https://dashboard.render.com** → **New** → **Blueprint**.
2. Connect the GitHub repo. Render detects `render.yaml` and lists the 3 services.
3. Click **Apply**. The database and backend build immediately; the frontend builds too (it will work once you set its API URL in step 4).

## 3. Set the backend secrets
On the **medassist-backend** service → **Environment**, fill the `sync: false` vars:

| Key | Value |
|---|---|
| `GEMINI_API_KEY` | your Google Gemini API key (**rotate the old one** — it was shared in chat) |
| `CORS_ALLOWED_ORIGINS` | the frontend URL, e.g. `https://medassist-frontend.onrender.com` |
| `FRONTEND_URL` | same frontend URL |

`SECRET_KEY` is auto-generated, `DATABASE_URL` is wired automatically, and `ALLOWED_HOSTS` is detected from Render's hostname — no action needed.

## 4. Point the frontend at the backend
On **medassist-frontend** → **Environment**:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://medassist-backend.onrender.com/api` (your backend URL + `/api`) |

Then **Manual Deploy → Clear build cache & deploy** (Vite bakes this in at build time, so it must rebuild).

> Tip: the exact URLs appear at the top of each service once created. Use those, then redeploy frontend and backend so CORS + API URL line up.

## 5. Create your admin user
We intentionally do **not** seed demo accounts in production. Open **medassist-backend → Shell** and run:
```bash
python manage.py createsuperuser
```
Log in at `https://medassist-backend.onrender.com/admin/`.

## Done
- App: the frontend URL
- API docs: `https://medassist-backend.onrender.com/api/docs/`

---

## Important caveats
- **Free Postgres** is deleted after ~30 days. For anything real, set the DB `plan` to `starter` in `render.yaml`.
- **Free web services sleep** after inactivity (first request is slow to wake).
- **Uploaded report files are ephemeral on the free plan** (no persistent disk). The AI summary, extracted text and RAG embeddings live in the database and survive, but the *original* uploaded file is lost on redeploy. To keep files:
  - upgrade the backend to a paid plan and add a **Disk** mounted at `/app/media`, **or**
  - configure S3-compatible object storage via `django-storages` (ask me to wire this up).
- pgvector: the `0002_reportchunk` migration runs `CREATE EXTENSION vector`, which Render's Postgres permits — no manual step needed.
