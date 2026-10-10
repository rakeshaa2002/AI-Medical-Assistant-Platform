import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiActivity,
  FiArrowUpRight,
  FiBarChart2,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiFileText,
  FiGithub,
  FiLayers,
  FiMenu,
  FiMessageSquare,
  FiNavigation,
  FiShield,
  FiUser,
  FiUserCheck,
  FiX,
} from 'react-icons/fi'
import {
  SiDjango,
  SiDocker,
  SiGithubactions,
  SiGooglegemini,
  SiPostgresql,
  SiReact,
  SiRender,
  SiTailwindcss,
  SiVite,
} from 'react-icons/si'

const REPO_URL = 'https://github.com/rakeshaa2002/AI-Medical-Assistant-Platform'
const API_DOCS_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/docs/`

// Page width: content spans the screen, capped only on ultra-wide monitors.
const CONTAINER = 'mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12'

const FEATURES = [
  {
    slug: 'assistant',
    icon: FiMessageSquare,
    title: 'AI Health Assistant',
    short: 'Symptom guidance on Gemini',
    text: 'Context-aware chat on Google Gemini with symptom guidance, saved conversation history and clear medical disclaimers.',
  },
  {
    slug: 'reports',
    icon: FiFileText,
    title: 'Report Analysis',
    short: 'OCR + plain-language summaries',
    text: 'Upload a PDF or a scan. Tesseract and pdfplumber extract the text, and Gemini writes a summary anyone can read.',
  },
  {
    slug: 'rag',
    icon: FiLayers,
    title: 'RAG over Reports',
    short: 'Answers grounded in your history',
    text: 'Reports are chunked and embedded into pgvector, so the assistant answers from the patient’s own medical history.',
  },
  {
    slug: 'appointments',
    icon: FiCalendar,
    title: 'Doctor Appointments',
    short: 'Search, book and track',
    text: 'Search doctors by specialization, pick an open slot, book it, and follow every status change, with email updates.',
  },
  {
    slug: 'analytics',
    icon: FiBarChart2,
    title: 'Admin Analytics',
    short: 'One console for the whole clinic',
    text: 'Manage users, doctors, appointments and reports from a role-protected console with live charts.',
  },
  {
    slug: 'security',
    icon: FiShield,
    title: 'Secure by Design',
    short: 'JWT + role-based access',
    text: 'JWT access and refresh tokens, role-based permissions on every endpoint, and protected routes in the UI.',
  },
]

// Floating "cursor" labels around the hero (desktop only).
// They hug the edges so they never cover the centred copy.
const HERO_TAGS = [
  { label: 'AI Symptom Chat', pos: 'left-[5%] top-[13%]', side: 'left' },
  { label: 'Report OCR + Summary', pos: 'right-[5%] top-[15%]', side: 'right' },
  { label: 'Doctor Booking', pos: 'left-[3%] top-[48%]', side: 'left' },
  { label: 'RAG over Reports', pos: 'right-[3%] top-[45%]', side: 'right' },
  { label: 'Admin Analytics', pos: 'left-[6%] bottom-[11%]', side: 'left' },
  { label: 'JWT + Role Access', pos: 'right-[6%] bottom-[18%]', side: 'right' },
]

const STEPS = [
  { title: 'Sign in', text: 'Pick a one-click demo role or register as a patient. Nothing to install.' },
  { title: 'Ask or upload', text: 'Describe symptoms to the AI assistant, or upload a lab report for an instant summary.' },
  { title: 'Get care', text: 'Book the right specialist, then follow the appointment from request to completion.' },
]

const ROLES = [
  {
    role: 'Patient',
    icon: FiUser,
    points: ['AI symptom chat', 'Upload and summarise reports', 'Book and track appointments'],
    highlight: true,
  },
  {
    role: 'Doctor',
    icon: FiUserCheck,
    points: ['See your booked appointments', 'Confirm or complete visits', 'AI assistant for quick lookups'],
  },
  {
    role: 'Admin',
    icon: FiShield,
    points: ['Analytics dashboard', 'Manage users and doctors', 'Oversee reports and bookings'],
  },
]

const STACK = [
  { icon: SiReact, name: 'React' },
  { icon: SiVite, name: 'Vite' },
  { icon: SiTailwindcss, name: 'Tailwind CSS' },
  { icon: SiDjango, name: 'Django REST' },
  { icon: SiPostgresql, name: 'PostgreSQL + pgvector' },
  { icon: SiGooglegemini, name: 'Google Gemini' },
  { icon: SiDocker, name: 'Docker' },
  { icon: SiGithubactions, name: 'GitHub Actions' },
  { icon: SiRender, name: 'Render' },
]

const NAV_LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#roles', label: 'Roles' },
  { href: '#stack', label: 'Tech stack' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const tryAs = (role) => navigate('/login', { state: { demo: role } })

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* ---------- navbar ---------- */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav className={`flex h-[76px] items-center justify-between ${CONTAINER}`}>
          <Link to="/" className="flex items-center gap-2.5" aria-label="MedAssist home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <FiActivity size={22} />
            </span>
            <span className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
              Med<span className="text-blue-600">Assist</span>
            </span>
          </Link>

          <div className="hidden items-center gap-9 text-[15px] font-medium text-slate-700 xl:flex">
            {/* Features dropdown (hover or keyboard focus) */}
            <div className="group relative">
              <a href="#features" className="inline-flex items-center gap-1.5 py-6 hover:text-blue-600">
                Features <FiChevronDown className="transition-transform group-hover:rotate-180" />
              </a>
              <div className="invisible absolute left-1/2 top-full w-[580px] -translate-x-1/2 opacity-0 transition duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
                  {FEATURES.map((f) => (
                    <a key={f.slug} href={`#feature-${f.slug}`} className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <f.icon size={18} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">{f.title}</span>
                        <span className="block text-xs text-slate-500">{f.short}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-blue-600">{l.label}</a>
            ))}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-blue-600">
              GitHub <FiArrowUpRight />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-[15px] font-semibold text-slate-700 hover:text-blue-600 sm:block">
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => tryAs('Patient')}
              className="hidden rounded-full bg-blue-600 px-7 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:block"
            >
              Try live demo
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 xl:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white xl:hidden">
            <div className={`flex flex-col gap-1 py-4 ${CONTAINER}`}>
              {[{ href: '#features', label: 'Features' }, ...NAV_LINKS].map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
                  {l.label}
                </a>
              ))}
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
                GitHub
              </a>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" className="rounded-full border border-slate-300 py-3 text-center text-sm font-semibold text-slate-700">
                  Sign in
                </Link>
                <button type="button" onClick={() => tryAs('Patient')} className="rounded-full bg-blue-600 py-3 text-sm font-bold uppercase tracking-wider text-white">
                  Try live demo
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden bg-[#050914] text-white">
        <div className="landing-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-[38%] h-[520px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/25 blur-[130px]" />
        {/* concentric arcs rising from the bottom edge */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 translate-y-[80%] rounded-full border border-blue-300/15" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[1500px] w-[1500px] -translate-x-1/2 translate-y-[82%] rounded-full border border-blue-300/10" />

        {HERO_TAGS.map((t, i) => (
          <div
            key={t.label}
            aria-hidden="true"
            className={`landing-float pointer-events-none absolute hidden xl:block ${t.pos}`}
            style={{ animationDelay: `${i * 0.9}s` }}
          >
            <FiNavigation
              className={`absolute -top-4 h-4 w-4 fill-blue-500 text-blue-500 ${t.side === 'left' ? '-left-3 -rotate-90' : '-right-3'}`}
            />
            <span className="block rounded-full border border-slate-600/50 bg-slate-900/50 px-5 py-2.5 text-sm text-slate-400 backdrop-blur-sm">
              {t.label}
            </span>
          </div>
        ))}

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-76px)] max-w-5xl flex-col items-center justify-center px-5 py-20 text-center">
          <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-300 sm:px-5 sm:text-xs sm:tracking-[0.22em]">
            MedAssist · AI Healthcare Platform
          </span>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.45em] text-blue-300/90 sm:text-lg">
            Ask · Analyse · Care
          </p>
          <h1 className="mt-4 font-display text-[2.5rem] font-extrabold uppercase leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block bg-gradient-to-r from-blue-500 via-blue-400 to-sky-300 bg-clip-text text-transparent">
              AI Healthcare
            </span>
            <span className="block">Assistant Platform</span>
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            MedAssist is a full-stack healthcare app. <strong className="font-semibold text-white">Chat with an AI health assistant</strong>,
            turn <strong className="font-semibold text-white">medical reports</strong> into plain-language summaries with{' '}
            <strong className="font-semibold text-white">OCR + RAG</strong>, and <strong className="font-semibold text-white">book the right doctor</strong>,
            with separate dashboards for patients, doctors and admins.
          </p>
          <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => tryAs('Patient')}
              className="landing-cta-angle inline-flex items-center justify-center gap-2 rounded-r-xl bg-blue-600 py-4 pl-9 pr-7 font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500"
            >
              Try the Live Demo <FiArrowUpRight size={18} />
            </button>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-4 font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              <FiGithub size={18} /> View on GitHub <FiArrowUpRight size={18} />
            </a>
          </div>
          <p className="mt-7 text-sm text-slate-400">
            No sign-up needed · One-click demo logins for every role ·{' '}
            <span className="font-semibold text-slate-200">React + Django + Gemini</span>
          </p>
        </div>
      </section>

      {/* ---------- built-with strip ---------- */}
      <section id="stack" className="scroll-mt-24 border-b border-slate-200 bg-white">
        <div className={`py-10 ${CONTAINER}`}>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Built with a production-grade stack
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {STACK.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
                <s.icon size={20} /> {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section id="features" className="scroll-mt-24 bg-slate-50 py-24">
        <div className={CONTAINER}>
          <div className="grid items-end gap-6 lg:grid-cols-2">
            <div>
              <Kicker>What MedAssist does</Kicker>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Everything a modern health platform needs
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-relaxed text-slate-500 lg:justify-self-end">
              Six modules that work together, from the first symptom question to the doctor’s follow-up, behind
              role-based access control.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <article
                key={f.slug}
                id={`feature-${f.slug}`}
                className="group relative scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-600/10"
              >
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-blue-600 transition-transform duration-300 group-hover:scale-x-100" />
                <div className="flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <f.icon size={26} />
                  </span>
                  <span className="font-display text-4xl font-extrabold text-slate-100 transition group-hover:text-blue-100">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-slate-900">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-500">{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section id="how" className="relative scroll-mt-24 overflow-hidden bg-[#050914] py-24 text-white">
        <div className="landing-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className={`relative ${CONTAINER}`}>
          <div className="text-center">
            <Kicker dark>How it works</Kicker>
            <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              From first question to the right doctor in three steps
            </h2>
          </div>
          <div className="relative mt-16 grid gap-10 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-10 hidden border-t border-dashed border-blue-400/30 md:block" />
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <span className="landing-outline-number relative inline-block bg-[#050914] px-4 font-display text-7xl font-extrabold leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 font-display text-xl font-bold">{s.title}</h3>
                <p className="mx-auto mt-3 max-w-xs leading-relaxed text-slate-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- roles ---------- */}
      <section id="roles" className="scroll-mt-24 bg-white py-24">
        <div className={CONTAINER}>
          <div className="text-center">
            <Kicker>Role-based access</Kicker>
            <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Explore it as any user, no sign-up
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              Each role has its own dashboard and permissions. Pick one and you’re signed in with demo data.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {ROLES.map((r) => (
              <div
                key={r.role}
                className={`relative flex flex-col rounded-2xl border p-8 transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                  r.highlight ? 'border-blue-600 shadow-xl shadow-blue-600/10' : 'border-slate-200'
                }`}
              >
                {r.highlight && (
                  <span className="absolute -top-3 left-8 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Start here
                  </span>
                )}
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <r.icon size={26} />
                </span>
                <h3 className="mt-6 font-display text-2xl font-bold text-slate-900">{r.role}</h3>
                <ul className="mt-5 flex-1 space-y-3 text-slate-600">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                        <FiCheck size={12} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => tryAs(r.role)}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold uppercase tracking-[0.1em] transition ${
                    r.highlight
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700'
                      : 'border border-slate-300 text-slate-800 hover:border-blue-600 hover:text-blue-600'
                  }`}
                >
                  Log in as {r.role} <FiArrowUpRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- closing call to action ---------- */}
      <section className="relative overflow-hidden bg-[#050914] py-24 text-center text-white">
        <div className="landing-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/25 blur-[120px]" />
        <div className={`relative ${CONTAINER}`}>
          <Kicker dark>Live demo</Kicker>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
            See MedAssist <span className="text-blue-400">in action</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
            Every role is one click away. Explore the API too: it’s documented with OpenAPI.
          </p>
          <div className="mx-auto mt-10 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => tryAs('Patient')}
              className="landing-cta-angle inline-flex items-center justify-center gap-2 rounded-r-xl bg-blue-600 py-4 pl-9 pr-7 font-semibold shadow-xl shadow-blue-600/30 transition hover:bg-blue-500"
            >
              Try the Live Demo <FiArrowUpRight size={18} />
            </button>
            <a
              href={API_DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-4 font-semibold transition hover:border-white/40 hover:bg-white/10"
            >
              Browse the API docs <FiArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="bg-[#03060d] text-slate-400">
        <div className={`grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 ${CONTAINER}`}>
          <div>
            <span className="font-display text-2xl font-extrabold text-white">
              Med<span className="text-blue-500">Assist</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              A full-stack AI healthcare platform: symptom chat, report analysis with RAG, and doctor booking.
            </p>
          </div>
          <FooterColumn title="Explore">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#roles" className="hover:text-white">Roles</a>
            <a href="#stack" className="hover:text-white">Tech stack</a>
          </FooterColumn>
          <FooterColumn title="Live demo">
            {ROLES.map((r) => (
              <button key={r.role} type="button" onClick={() => tryAs(r.role)} className="text-left hover:text-white">
                Log in as {r.role}
              </button>
            ))}
          </FooterColumn>
          <FooterColumn title="Project">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
              <FiGithub /> Source on GitHub
            </a>
            <a href={API_DOCS_URL} target="_blank" rel="noreferrer" className="hover:text-white">API docs (Swagger)</a>
            <Link to="/register" className="hover:text-white">Create an account</Link>
          </FooterColumn>
        </div>
        <div className="border-t border-white/10">
          <p className={`py-6 text-center text-xs ${CONTAINER}`}>
            © {new Date().getFullYear()} MedAssist. AI guidance is informational and is not a medical diagnosis.
          </p>
        </div>
      </footer>

      {/* floating shortcut to the assistant, like a support chat button */}
      <button
        type="button"
        onClick={() => tryAs('Patient')}
        className="fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full bg-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-2xl shadow-blue-600/40 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:inline-flex"
      >
        <FiMessageSquare size={20} /> Try the AI assistant
      </button>
    </div>
  )
}

function Kicker({ children, dark = false }) {
  return (
    <p className={`inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] ${dark ? 'text-blue-300' : 'text-blue-600'}`}>
      <span className={`h-px w-8 ${dark ? 'bg-blue-300' : 'bg-blue-600'}`} />
      {children}
    </p>
  )
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">{title}</p>
      <div className="mt-5 flex flex-col items-start gap-3 text-sm">{children}</div>
    </div>
  )
}
