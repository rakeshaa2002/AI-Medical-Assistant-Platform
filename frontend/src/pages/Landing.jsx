import { Link, useNavigate } from 'react-router-dom'
import { FiActivity, FiArrowRight, FiCheck, FiGithub } from 'react-icons/fi'

const FEATURES = [
  {
    e: '🤖',
    t: 'AI Health Assistant',
    d: 'Context-aware chat powered by Google Gemini. Symptom guidance with persisted conversation history and medical disclaimers.',
  },
  {
    e: '📄',
    t: 'Report Analysis (OCR + AI)',
    d: 'Upload PDFs or scans → Tesseract / pdfplumber extract the text → Gemini writes a plain-language summary.',
  },
  {
    e: '🧠',
    t: 'RAG over Your Reports',
    d: 'Reports are chunked and embedded into pgvector, so the assistant can ground answers in your own medical history.',
  },
  {
    e: '📅',
    t: 'Doctor Appointments',
    d: 'Search doctors by specialization, pick an open slot, book, and track status, with email notifications.',
  },
  {
    e: '📊',
    t: 'Admin Analytics',
    d: 'Role-based admin console to manage users, doctors, appointments and reports, with live charts.',
  },
  {
    e: '🔐',
    t: 'Secure by Design',
    d: 'JWT access/refresh with auto-refresh, role-based access control and protected routes on API and UI.',
  },
]

const STEPS = [
  { n: '1', t: 'Sign in', d: 'Use a one-click demo account or register as a patient.' },
  { n: '2', t: 'Ask or upload', d: 'Chat with the AI assistant or upload a lab report for an instant summary.' },
  { n: '3', t: 'Get care', d: 'Book the right specialist and track the appointment end-to-end.' },
]

const ROLES = [
  {
    role: 'Patient',
    e: '🧑',
    points: ['AI symptom chat', 'Upload & summarise reports', 'Book & track appointments'],
  },
  {
    role: 'Doctor',
    e: '🩺',
    points: ['See your booked appointments', 'Confirm / complete visits', 'AI assistant for quick lookups'],
  },
  {
    role: 'Admin',
    e: '🛡️',
    points: ['Analytics dashboard', 'Manage users & doctors', 'Oversee reports & bookings'],
  },
]

const TECH = [
  'React 18', 'Vite', 'Tailwind CSS', 'Recharts', 'Django 5', 'Django REST Framework',
  'SimpleJWT', 'PostgreSQL', 'pgvector', 'Google Gemini', 'Tesseract OCR', 'Docker',
  'GitHub Actions CI', 'Render', 'OpenAPI / Swagger',
]

// Fluid page width: content spans the screen, capped only on ultra-wide monitors.
const CONTAINER = 'mx-auto w-full max-w-[1800px] px-6 sm:px-10 lg:px-16'

const STATS = [
  { v: '3', l: 'User roles' },
  { v: '6+', l: 'Core modules' },
  { v: 'RAG', l: 'Grounded AI answers' },
  { v: '100%', l: 'Responsive · Dark mode' },
]

export default function Landing() {
  const navigate = useNavigate()
  const tryAs = (role) => navigate('/login', { state: { demo: role } })

  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      {/* ---------- hero (reuses the animated auth backdrop) ---------- */}
      <header className="auth-gradient relative flex min-h-screen flex-col overflow-hidden text-white">
        <div className="auth-aurora" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/65 via-primary-900/40 to-teal-900/65" />
        <div className="auth-blob -left-16 -top-10 h-72 w-72 bg-cyan-300" />
        <div className="auth-blob bottom-0 right-0 h-80 w-80 bg-indigo-400" style={{ animationDelay: '4s' }} />

        <nav className={`relative z-10 flex items-center justify-between py-5 ${CONTAINER}`}>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
              <FiActivity size={22} />
            </span>
            <span className="text-xl font-bold">MedAssist</span>
          </div>
          <div className="hidden items-center gap-6 text-sm text-white/85 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#roles" className="hover:text-white">Roles</a>
            <a href="#tech" className="hover:text-white">Tech stack</a>
          </div>
          <Link
            to="/login"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Sign in
          </Link>
        </nav>

        <div className={`relative z-10 grid flex-1 content-center items-center gap-12 pb-20 pt-10 lg:grid-cols-2 xl:gap-20 ${CONTAINER}`}>
          <div className="auth-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              ✨ Full-stack · AI · RAG · Role-based
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl xl:text-6xl">
              Your AI-powered <br />
              <span className="bg-gradient-to-r from-cyan-200 to-teal-200 bg-clip-text text-transparent">
                healthcare companion
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85 xl:max-w-2xl xl:text-xl">
              Chat with an AI health assistant, turn medical reports into plain-language summaries,
              and book the right doctor, all in one secure platform built with React, Django and Gemini.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => tryAs('Patient')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary-700 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Try the live demo <FiArrowRight />
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Explore features
              </a>
            </div>
            <p className="mt-4 text-sm text-white/70">No sign-up needed. One-click demo logins for every role.</p>
          </div>

          {/* mock chat preview */}
          <div className="auth-fade-up relative w-full max-w-2xl justify-self-center lg:justify-self-end" style={{ animationDelay: '0.15s' }}>
            <div className="rounded-2xl border border-white/20 bg-white/95 p-5 text-slate-800 shadow-2xl dark:bg-slate-800/95 dark:text-slate-100">
              <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-lg">🤖</span>
                <div>
                  <p className="text-sm font-semibold">MedAssist AI</p>
                  <p className="text-xs text-emerald-600">● Online · grounded in your reports</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary-600 px-4 py-2 text-white">
                  My last blood test said HbA1c 6.1%. Should I be worried?
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2 dark:bg-slate-700">
                  From your report dated 12 Aug, an HbA1c of 6.1% is in the <b>pre-diabetes range</b> (5.7–6.4%).
                  It's common and often reversible with diet and exercise. I'd suggest seeing an{' '}
                  <b>endocrinologist</b>. Want me to show available slots?
                </div>
                <div className="flex flex-wrap gap-2">
                  {['📅 Book endocrinologist', '📄 View report summary'].map((s) => (
                    <span key={s} className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:border-slate-600 dark:bg-slate-700 dark:text-primary-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="auth-chip absolute -left-5 -top-5 hidden h-14 w-14 sm:flex">🩺</div>
            <div className="auth-chip absolute -bottom-5 -right-4 hidden h-14 w-14 sm:flex" style={{ animationDelay: '1s' }}>📄</div>
          </div>
        </div>
      </header>

      {/* ---------- stats ---------- */}
      <section className="border-b border-slate-200 dark:border-slate-800">
        <div className={`grid grid-cols-2 gap-6 py-10 md:grid-cols-4 ${CONTAINER}`}>
          {STATS.map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">{s.v}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section id="features" className={`scroll-mt-8 py-20 ${CONTAINER}`}>
        <SectionHeading kicker="Features" title="Everything a modern health platform needs" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.t}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl transition group-hover:scale-110 dark:bg-slate-700">
                {f.e}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section id="how" className="scroll-mt-8 bg-slate-50 py-20 dark:bg-slate-800/40">
        <div className={CONTAINER}>
          <SectionHeading kicker="How it works" title="From question to care in three steps" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-500 font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- roles with one-click demo ---------- */}
      <section id="roles" className={`scroll-mt-8 py-20 ${CONTAINER}`}>
        <SectionHeading kicker="Role-based access" title="Explore it as any user, one click, no sign-up" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ROLES.map((r) => (
            <div
              key={r.role}
              className="flex flex-col rounded-2xl border border-slate-200 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{r.e}</span>
                <h3 className="text-xl font-semibold">{r.role}</h3>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {r.points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <FiCheck className="text-accent-500" /> {p}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => tryAs(r.role)} className="btn-primary mt-6 w-full">
                Log in as {r.role}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- tech stack ---------- */}
      <section id="tech" className="scroll-mt-8 bg-slate-50 py-20 dark:bg-slate-800/40">
        <div className={CONTAINER}>
          <SectionHeading kicker="Under the hood" title="Built with a production-grade stack" />
          <div className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-3">
            {TECH.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- final CTA ---------- */}
      <section className="auth-gradient relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 to-teal-900/60" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">See it in action</h2>
          <p className="mt-3 text-white/85">Jump straight in with a pre-filled demo account.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {ROLES.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => tryAs(r.role)}
                className="rounded-xl bg-white/15 px-5 py-3 font-semibold ring-1 ring-white/30 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-primary-700"
              >
                {r.e} {r.role} demo
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className={`flex flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row ${CONTAINER}`}>
          <p>© {new Date().getFullYear()} MedAssist · AI guidance is informational, not a medical diagnosis.</p>
          <a
            href="https://github.com/rakeshaa2002"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:text-primary-600"
          >
            <FiGithub /> GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

function SectionHeading({ kicker, title }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">{kicker}</p>
      <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
    </div>
  )
}
