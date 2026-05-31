import { FiActivity } from 'react-icons/fi'

// Floating medical emoji chips scattered across the full-screen backdrop.
const CHIPS = [
  { e: '🩺', cls: 'left-[6%] top-[12%]', d: '0s' },
  { e: '💊', cls: 'right-[8%] top-[16%]', d: '0.7s' },
  { e: '🧬', cls: 'left-[12%] bottom-[18%]', d: '1.3s' },
  { e: '🏥', cls: 'right-[10%] bottom-[14%]', d: '0.4s' },
  { e: '🧪', cls: 'left-[18%] top-[42%]', d: '1.0s' },
  { e: '🧠', cls: 'right-[16%] top-[46%]', d: '1.7s' },
  { e: '🩻', cls: 'left-[44%] top-[8%]', d: '2.1s' },
  { e: '💉', cls: 'right-[40%] bottom-[8%]', d: '1.5s' },
]

export default function AuthShell({ title, subtitle, children }) {
  return (
    // Full-screen animated background; scrolls if content is taller than the viewport.
    <div className="auth-gradient relative min-h-screen w-full overflow-y-auto text-white">
      {/* Optional full-bleed background video — drop public/auth-bg.mp4 to enable. */}
      <video className="fixed inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="auto">
        <source src="/auth-bg.mp4" type="video/mp4" />
      </video>

      {/* Animated aurora + readability tint */}
      <div className="auth-aurora" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary-900/65 via-primary-900/40 to-teal-900/65" />

      {/* drifting blurred blobs */}
      <div className="auth-blob -left-16 -top-10 h-72 w-72 bg-cyan-300" />
      <div className="auth-blob bottom-0 right-0 h-80 w-80 bg-indigo-400" style={{ animationDelay: '4s' }} />

      {/* twinkling stars */}
      {[...Array(18)].map((_, i) => (
        <span
          key={i}
          className="auth-twinkle absolute h-1 w-1 rounded-full bg-white"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 5) * 0.6}s` }}
        />
      ))}

      {/* floating emoji chips (decorative, hidden on small screens) */}
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

      {/* ---------- centered auth card ---------- */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {/* brand */}
        <div className="auth-fade-up mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-xl ring-1 ring-white/30 backdrop-blur">
            <FiActivity size={28} />
          </div>
          <span className="text-2xl font-bold">MedAssist</span>
          <p className="mt-1 text-sm text-primary-100/85">Your AI-powered healthcare companion ✨</p>
        </div>

        {/* glass auth card */}
        <div
          className="auth-fade-up w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-8 text-slate-800 shadow-2xl backdrop-blur-xl dark:bg-slate-800/90 dark:text-slate-100"
          style={{ animationDelay: '0.1s' }}
        >
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-xs text-primary-100/70">© {new Date().getFullYear()} MedAssist</p>
      </div>
    </div>
  )
}
