import { useLocation, useNavigate } from 'react-router-dom'
import { FiActivity } from 'react-icons/fi'

// Emojis scattered across the whole backdrop.
const CHIPS = [
  { e: '🩺', cls: 'left-[5%] top-[10%]', d: '0s' },
  { e: '💊', cls: 'right-[6%] top-[8%]', d: '0.6s' },
  { e: '🧬', cls: 'left-[9%] bottom-[14%]', d: '1.2s' },
  { e: '🏥', cls: 'right-[8%] bottom-[12%]', d: '0.4s' },
  { e: '🧪', cls: 'left-[15%] top-[40%]', d: '1.0s' },
  { e: '🧠', cls: 'right-[14%] top-[44%]', d: '1.6s' },
  { e: '🩻', cls: 'left-[40%] top-[5%]', d: '2.1s' },
  { e: '💉', cls: 'right-[38%] bottom-[6%]', d: '1.4s' },
  { e: '🦷', cls: 'left-[3%] top-[60%]', d: '0.9s' },
  { e: '🫀', cls: 'right-[3%] top-[62%]', d: '1.9s' },
  { e: '🩹', cls: 'left-[22%] bottom-[8%]', d: '2.3s' },
  { e: '🌡️', cls: 'right-[22%] top-[14%]', d: '0.3s' },
  { e: '👩‍⚕️', cls: 'right-[6%] bottom-[30%]', d: '0.8s' },
]

// What the application actually lets you do.
const FEATURES = [
  { e: '🤖', t: 'AI Symptom Chat' },
  { e: '📄', t: 'Report Analysis' },
  { e: '🧬', t: 'RAG Health Q&A' },
  { e: '🩺', t: 'Book Doctors' },
  { e: '📅', t: 'Appointments' },
  { e: '🔐', t: 'Secure & Private' },
]

export default function AuthShell({ subtitle, children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isRegister = pathname === '/register'

  const tabCls = (active) =>
    `flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
      active
        ? 'bg-primary-600 text-white shadow'
        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
    }`

  return (
    // Full-screen animated background; scrolls if content exceeds the viewport.
    <div className="auth-gradient relative min-h-screen w-full overflow-y-auto text-white">
      {/* Optional full-bleed background video — drop public/auth-bg.mp4 to enable. */}
      <video className="fixed inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="auto">
        <source src="/auth-bg.mp4" type="video/mp4" />
      </video>

      <div className="auth-aurora" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary-900/65 via-primary-900/40 to-teal-900/65" />

      {/* drifting blurred blobs */}
      <div className="auth-blob -left-16 -top-10 h-72 w-72 bg-cyan-300" />
      <div className="auth-blob bottom-0 right-0 h-80 w-80 bg-indigo-400" style={{ animationDelay: '4s' }} />

      {/* twinkling stars */}
      {[...Array(20)].map((_, i) => (
        <span
          key={i}
          className="auth-twinkle absolute h-1 w-1 rounded-full bg-white"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 5) * 0.6}s` }}
        />
      ))}

      {/* floating emoji chips filling the screen (hidden on small screens) */}
      {CHIPS.map((c) => (
        <div
          key={c.e}
          className={`auth-chip absolute hidden h-12 w-12 text-xl md:flex ${c.cls}`}
          style={{ animationDelay: c.d }}
          role="img"
          aria-label="medical icon"
        >
          {c.e}
        </div>
      ))}

      {/* big AI health-assistant focal element (left) */}
      <div className="absolute left-[4%] top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center lg:flex">
        <div className="auth-chip relative flex h-44 w-44 items-center justify-center rounded-[2.5rem] shadow-2xl">
          <span className="text-7xl drop-shadow-[0_0_28px_rgba(56,189,248,0.7)]" role="img" aria-label="AI assistant">🤖</span>
          <span className="auth-heart absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl ring-1 ring-white/30 backdrop-blur" role="img" aria-label="stethoscope">🩺</span>
        </div>
        <p className="mt-4 text-center text-base font-semibold text-white/95">AI Health Assistant</p>
        <p className="text-xs text-primary-100/75">Ask · Analyse · Care</p>
      </div>

      {/* ---------- centered content ---------- */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {/* brand */}
        <div className="auth-fade-up mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-xl ring-1 ring-white/30 backdrop-blur">
            <FiActivity size={28} />
          </div>
          <span className="text-2xl font-bold">MedAssist</span>
          <p className="mt-1 text-sm text-primary-100/85">Your AI-powered healthcare companion ✨</p>
        </div>

        {/* auth card with Login / Register tabs */}
        <div
          className="auth-fade-up w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-8 text-slate-800 shadow-2xl backdrop-blur-xl dark:bg-slate-800/90 dark:text-slate-100"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900/60">
            <button type="button" className={tabCls(!isRegister)} onClick={() => navigate('/login')}>
              Login
            </button>
            <button type="button" className={tabCls(isRegister)} onClick={() => navigate('/register')}>
              Register
            </button>
          </div>

          {subtitle && <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          {children}
        </div>

        {/* application features */}
        <div className="auth-fade-up mt-8 w-full max-w-2xl" style={{ animationDelay: '0.25s' }}>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-primary-100/70">
            What you can do
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.t}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm backdrop-blur"
              >
                <span className="text-lg">{f.e}</span>
                <span className="font-medium">{f.t}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-primary-100/70">© {new Date().getFullYear()} MedAssist</p>
      </div>
    </div>
  )
}
