import { useRef } from 'react'
import { FiActivity } from 'react-icons/fi'

// Floating medical emoji chips — scattered with depth + staggered timing.
const CHIPS = [
  { e: '🩺', cls: 'left-[6%] top-[12%] h-16 w-16 text-3xl', d: '0s', z: '80px' },
  { e: '💊', cls: 'right-[10%] top-[8%] h-14 w-14', d: '0.7s', z: '30px' },
  { e: '🧬', cls: 'left-[14%] bottom-[20%] h-14 w-14', d: '1.3s', z: '55px' },
  { e: '🏥', cls: 'right-[6%] bottom-[14%] h-16 w-16 text-3xl', d: '0.4s', z: '90px' },
  { e: '🧪', cls: 'left-[40%] top-[2%] h-12 w-12 text-xl', d: '1.0s', z: '15px' },
  { e: '🩻', cls: 'right-[32%] bottom-[4%] h-12 w-12 text-xl', d: '1.7s', z: '40px' },
  { e: '💉', cls: 'left-[2%] top-[52%] h-12 w-12 text-xl', d: '2.1s', z: '25px' },
  { e: '🧠', cls: 'right-[2%] top-[44%] h-12 w-12 text-xl', d: '1.5s', z: '65px' },
]

export default function AuthShell({ title, subtitle, children }) {
  const stageRef = useRef(null)

  // Interactive 3D tilt: rotate the whole scene toward the cursor.
  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    if (stageRef.current) {
      stageRef.current.style.transform = `rotateY(${x * 20}deg) rotateX(${-y * 20}deg)`
    }
  }
  const handleLeave = () => {
    if (stageRef.current) stageRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)'
  }

  return (
    <div className="flex min-h-screen">
      {/* ---------- Animated 3D brand panel ---------- */}
      <div
        className="auth-gradient relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {/* Full-bleed background video (optional). Drop a file at
            public/auth-bg.mp4 — until then the animated gradient shows. */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/auth-bg.mp4" type="video/mp4" />
        </video>

        {/* Tint overlay so text + scene stay readable over any video */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/55 via-primary-800/30 to-teal-900/55" />

        {/* drifting blurred blobs */}
        <div className="auth-blob -left-16 -top-10 h-72 w-72 bg-cyan-300" />
        <div className="auth-blob bottom-0 right-0 h-80 w-80 bg-indigo-400" style={{ animationDelay: '4s' }} />

        {/* twinkling stars */}
        {[...Array(16)].map((_, i) => (
          <span
            key={i}
            className="auth-twinkle absolute h-1 w-1 rounded-full bg-white"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 5) * 0.6}s` }}
          />
        ))}

        {/* logo */}
        <div className="relative z-10 flex items-center gap-2">
          <FiActivity size={28} />
          <span className="text-2xl font-bold">MedAssist</span>
        </div>

        {/* ---------- interactive 3D scene ---------- */}
        <div className="auth-stage relative z-10 flex flex-1 items-center justify-center">
          <div
            ref={stageRef}
            className="relative h-72 w-72 transition-transform duration-300 ease-out"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* tilted orbiting rings */}
            <div className="auth-ring absolute inset-0" />
            <div className="auth-ring auth-ring--inner absolute inset-8" />

            {/* center glass card: pulsing heart + ECG */}
            <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl border border-white/30 bg-white/15 shadow-2xl backdrop-blur-md ring-1 ring-white/20">
              <span className="auth-heart text-6xl drop-shadow-[0_0_18px_rgba(255,80,120,0.6)]" role="img" aria-label="heartbeat">❤️</span>
              <svg viewBox="0 0 120 40" className="mt-2 h-7 w-28 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]">
                <polyline
                  className="auth-ecg"
                  points="0,20 28,20 36,20 42,6 50,34 58,20 70,20 78,12 86,28 94,20 120,20"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* floating emoji chips */}
            {CHIPS.map((c) => (
              <div
                key={c.e}
                className={`auth-chip absolute ${c.cls}`}
                style={{ animationDelay: c.d, '--z': c.z }}
                role="img"
                aria-label="medical icon"
              >
                {c.e}
              </div>
            ))}
          </div>
        </div>

        {/* headline */}
        <div className="auth-fade-up relative z-10" style={{ animationDelay: '0.15s' }}>
          <h1 className="text-4xl font-bold leading-tight drop-shadow-lg">
            Your AI-powered healthcare companion. ✨
          </h1>
          <p className="mt-4 max-w-md text-primary-50/90">
            Chat with an AI health assistant 🤖, analyse your medical reports 🧪, and
            book appointments with trusted doctors 🩺 — all in one place.
          </p>
        </div>

        <p className="relative z-10 text-sm text-primary-100/80">
          © {new Date().getFullYear()} MedAssist
        </p>
      </div>

      {/* ---------- Form panel ---------- */}
      <div className="relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50 p-6 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 lg:w-1/2">
        {/* soft decorative glow blobs */}
        <div className="auth-blob -right-20 -top-10 h-72 w-72 bg-primary-300/40 dark:bg-primary-500/20" />
        <div className="auth-blob -bottom-20 -left-12 h-72 w-72 bg-teal-300/40 dark:bg-teal-500/20" style={{ animationDelay: '5s' }} />

        {/* glass form card */}
        <div className="auth-fade-up relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-800/60">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <FiActivity size={24} className="text-primary-600" />
            <span className="text-xl font-bold">MedAssist</span>
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
