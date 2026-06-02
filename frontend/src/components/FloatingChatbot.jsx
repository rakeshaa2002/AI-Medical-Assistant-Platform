import { useEffect, useRef, useState } from 'react'
import { FiX, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { chatApi } from '../api/services'
import { errorMessage } from '../utils/format'
import Spinner from './ui/Spinner'

// Floating AI assistant launcher + chat panel, available app-wide.
// Styled to mirror the animated login-page look (gradient, aurora, twinkle, float).
export default function FloatingChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [convId, setConvId] = useState(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending, open])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', content: text }])
    setSending(true)
    try {
      const { data } = await chatApi.send({ conversation_id: convId || undefined, message: text })
      setConvId(data.conversation_id)
      setMessages((m) => [...m, data.assistant_message])
    } catch (err) {
      toast.error(errorMessage(err, 'Assistant failed to respond'))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Chat panel — bigger, animated, login-page styled */}
      {open && (
        <div className="fixed bottom-28 right-6 z-50 flex h-[34rem] max-h-[calc(100vh-9rem)] w-[26rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl [animation:fadeUp_0.35s_ease_both] dark:border-slate-700 dark:bg-slate-800/95">
          {/* animated gradient header (same palette as the auth screen) */}
          <div className="auth-gradient relative overflow-hidden px-4 py-4 text-white">
            {/* aurora glow + twinkles to echo the login backdrop */}
            <div className="auth-aurora" />
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="auth-twinkle absolute h-1 w-1 rounded-full bg-white"
                style={{ left: `${(i * 41) % 100}%`, top: `${(i * 67) % 100}%`, animationDelay: `${(i % 4) * 0.5}s` }}
              />
            ))}

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="auth-chip relative flex h-12 w-12 items-center justify-center rounded-2xl text-2xl">
                  <span className="auth-heart" role="img" aria-label="AI assistant">🤖</span>
                  <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-sm ring-1 ring-white/40 backdrop-blur" role="img" aria-label="stethoscope">🩺</span>
                </div>
                <div>
                  <p className="text-base font-bold leading-tight drop-shadow">MedAssist AI</p>
                  <p className="text-[11px] text-primary-100/90">Symptoms · Reports · General health</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-2 transition hover:rotate-90 hover:bg-white/20"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4 dark:bg-slate-900/30">
            {messages.length === 0 && !sending && (
              <div className="auth-fade-up mt-6 flex flex-col items-center px-4 text-center">
                {/* big focal AI element, mirrors the login screen */}
                <div className="auth-chip relative flex h-28 w-28 items-center justify-center rounded-[2rem] shadow-2xl">
                  <span className="auth-heart text-6xl drop-shadow-[0_0_24px_rgba(56,189,248,0.7)]" role="img" aria-label="AI assistant">🤖</span>
                  <span className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-600/90 text-xl text-white ring-2 ring-white/50 backdrop-blur" role="img" aria-label="stethoscope">🩺</span>
                </div>
                <p className="mt-5 text-lg font-bold text-slate-800 dark:text-slate-100">Hi, I'm your AI Health Assistant ✨</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Ask me about symptoms, medications, or your reports — anytime.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {['What could a headache mean?', 'Explain my report', 'Healthy diet tips'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setInput(q)}
                      className="rounded-full bg-gradient-to-br from-primary-600 to-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md ring-1 ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-600/40 hover:brightness-110"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <p className="mt-5 text-[11px] text-slate-400">Not a substitute for professional medical advice.</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex [animation:fadeUp_0.25s_ease_both] ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role !== 'user' && (
                  <span className="mr-2 mt-auto text-lg" role="img" aria-label="assistant">🤖</span>
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-primary-600 to-teal-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <span className="mr-2 mt-auto text-lg" role="img" aria-label="assistant">🤖</span>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                  <Spinner size={14} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <form onSubmit={send} className="flex gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
            <input
              className="input"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-teal-600 px-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-primary-600/40 disabled:opacity-50 disabled:hover:scale-100"
              disabled={sending || !input.trim()}
              aria-label="Send"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Launcher button — bigger, floating, with a pulsing halo */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        className="group fixed bottom-6 right-6 z-50 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-teal-600 text-3xl text-white shadow-2xl ring-4 ring-primary-500/25 transition-all duration-300 hover:scale-110 hover:ring-primary-500/40"
      >
        {/* pulsing halo */}
        {!open && <span className="absolute inset-0 animate-ping rounded-full bg-primary-500/40" />}
        <span className="relative auth-heart drop-shadow-[0_0_14px_rgba(255,255,255,0.5)]">
          {open ? <FiX size={28} /> : '🤖'}
        </span>
      </button>
    </>
  )
}
