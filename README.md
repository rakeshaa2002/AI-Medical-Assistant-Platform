# 🏥 MedAssist — AI Healthcare Support & Appointment Platform

A production-ready, full-stack healthcare platform featuring an **AI health
assistant**, **medical report analysis (OCR + AI summaries)**, **doctor
appointment booking**, and a **role-based admin dashboard**.

| Layer      | Tech |
|------------|------|
| Backend    | Django 5, Django REST Framework, SimpleJWT |
| Frontend   | React 18 (Vite), Tailwind CSS, React Router, Recharts |
| Database   | PostgreSQL |
| AI         | Google **Gemini** API |
| OCR        | Tesseract (`pytesseract`) + `pdfplumber` |
| Auth       | JWT (access/refresh) with role-based access control |

---

## ✨ Features

- **Authentication** — register/login, JWT with auto-refresh, roles: **Patient / Doctor / Admin**.
- **AI Healthcare Chat** — context-aware conversations, symptom guidance, persisted chat history, medical disclaimer.
- **Medical Reports** — upload PDF/images → OCR text extraction → AI-generated summary, stored & searchable.
- **Appointments** — browse/search doctors by specialization, view open slots, book, track status, email notifications.
- **Admin Dashboard** — manage users/doctors/appointments/reports, analytics cards & charts.
- **UX** — responsive design, sidebar navigation, dark/light mode, toast notifications, loading states, protected routes.
- **API** — clean serializers, pagination, search/filter/ordering, consistent error envelope, OpenAPI docs (Swagger/Redoc).

---

## 📁 Project Structure

```
AI Medical Assistant Platform/
├── backend/                  # Django + DRF API
│   ├── config/               # settings, urls, wsgi/asgi
│   ├── apps/
│   │   ├── common/           # base models, permissions, AI, OCR, email helpers
│   │   ├── accounts/         # custom User, roles, JWT auth, profiles
│   │   ├── appointments/     # doctors, slots, appointments
│   │   ├── chat/             # AI conversations & messages
│   │   ├── reports/          # medical report upload + processing
│   │   └── dashboard/        # analytics endpoints
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/              # axios client + service modules
│   │   ├── context/          # Auth & Theme providers
│   │   ├── components/        # layout + reusable UI
│   │   └── pages/            # route pages (incl. admin/)
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
└── docker-compose.yml        # one-command full stack
```

---

## 🚀 Quick Start (Docker — recommended)

```bash
cp backend/.env.example backend/.env      # then add your GEMINI_API_KEY
docker compose up --build
```

- Frontend → http://localhost:5173
- Backend API → http://localhost:8000/api
- API docs → http://localhost:8000/api/docs
- Demo data is seeded automatically (see credentials below).

---

## 🛠️ Manual Setup

### 1. Prerequisites
- Python 3.11+, Node 18+, PostgreSQL 14+
- **Tesseract OCR** (for image/scanned-PDF text extraction)
  - Windows: install from https://github.com/UB-Mannheim/tesseract/wiki, then set `TESSERACT_CMD` in `.env`
  - macOS: `brew install tesseract`
  - Ubuntu: `sudo apt install tesseract-ocr`

### 2. Database
```sql
CREATE DATABASE medassist;
```

### 3. Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                 # edit DB creds + GEMINI_API_KEY
python manage.py migrate
python manage.py seed_data           # demo users, doctors, slots
python manage.py createsuperuser     # optional: your own admin
python manage.py runserver
```
API runs at `http://localhost:8000`.

### 4. Frontend
```bash
cd frontend
npm install
cp .env.example .env                 # VITE_API_BASE_URL=http://localhost:8000/api
npm run dev
```
App runs at `http://localhost:5173`.

---

## 🔑 Demo Accounts (after `seed_data`)

| Role    | Email                       | Password    |
|---------|-----------------------------|-------------|
| Admin   | admin@medassist.local       | Admin@123   |
| Patient | patient@medassist.local     | Patient@123 |
| Doctor  | doctor1@medassist.local …   | Doctor@123  |

---

## 🔌 Key API Endpoints

Base path: `/api`

| Area | Method & Path | Description |
|------|---------------|-------------|
| Auth | `POST /auth/register/` | Register (patient/doctor) |
| Auth | `POST /auth/login/` | Login → access/refresh + user |
| Auth | `POST /auth/refresh/` | Refresh access token |
| Auth | `GET/PATCH /auth/me/` | Current user + profile |
| Auth | `POST /auth/change-password/` | Change password |
| Auth | `GET /auth/users/` | (Admin) list/search users |
| Chat | `POST /chat/conversations/send/` | Send message to AI |
| Chat | `GET /chat/conversations/` | List conversations |
| Chat | `GET /chat/conversations/{id}/` | Conversation + messages |
| Reports | `POST /reports/` | Upload report (multipart) |
| Reports | `GET /reports/` | List/search reports |
| Reports | `POST /reports/{id}/reprocess/` | Re-run OCR + AI |
| Doctors | `GET /appointments/doctors/` | List/search/filter doctors |
| Doctors | `GET /appointments/doctors/specializations/` | Distinct specializations |
| Slots | `GET /appointments/slots/?doctor=` | Available slots |
| Appts | `POST /appointments/` | Book an appointment |
| Appts | `PATCH /appointments/{id}/status/` | Update status (doctor/admin) |
| Appts | `DELETE /appointments/{id}/` | Cancel appointment |
| Dash | `GET /dashboard/admin-stats/` | (Admin) analytics |
| Dash | `GET /dashboard/my-stats/` | Personal stats |

Interactive docs: **`/api/docs`** (Swagger) and **`/api/redoc`**.

---

## 🤖 AI & OCR Notes

- Set `GEMINI_API_KEY` in `backend/.env`. Get one at https://aistudio.google.com/app/apikey.
- Without a key, the app **still runs**: chat and report summaries return a safe placeholder so you can develop offline.
- The default model is `gemini-1.5-flash` (override with `GEMINI_MODEL`).
- Report processing runs synchronously after upload. For high volume, move
  `apps.reports.services.process_report` behind Celery/RQ — the function is
  written to be queue-friendly.

---

## ☁️ Deployment

### Containers
Both `backend/` and `frontend/` ship with Dockerfiles; `docker-compose.yml`
wires Postgres + API + static frontend together.

### Backend (e.g. Render / Railway / Fly.io)
1. Provision a PostgreSQL instance; set `DATABASE_URL` (or `DB_*` vars).
2. Set env vars: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `GEMINI_API_KEY`, `CORS_ALLOWED_ORIGINS`, email vars.
3. The included `Procfile` runs migrations on release and serves via Gunicorn.
4. Static files are served by WhiteNoise (`collectstatic` runs in the Docker build).

### Frontend (e.g. Vercel / Netlify / Nginx)
1. Set build-time `VITE_API_BASE_URL` to your deployed API URL.
2. `npm run build` → deploy the `dist/` folder (SPA fallback to `index.html`).
   The provided `nginx.conf` handles client-side routing.

### Production checklist
- [ ] `DEBUG=False` and a strong, unique `SECRET_KEY`
- [ ] Correct `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
- [ ] Real SMTP credentials (console backend is used only when `DEBUG=True`)
- [ ] Persistent storage / object store for `media/` uploads
- [ ] HTTPS termination at the proxy/load balancer

---

## 🧪 Useful Commands

```bash
# Backend
python manage.py check
python manage.py makemigrations && python manage.py migrate
python manage.py seed_data

# Frontend
npm run dev        # dev server
npm run build      # production build
npm run preview    # preview the build
```

---

## ⚠️ Disclaimer

MedAssist provides AI-generated information for **educational purposes only**.
It is **not** a substitute for professional medical advice, diagnosis, or
treatment. Always consult a qualified healthcare provider.
