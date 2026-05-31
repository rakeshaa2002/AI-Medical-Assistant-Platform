import { useEffect, useRef, useState } from 'react'
import { FiX, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { chatApi } from '../api/services'
import { errorMessage } from '../utils/format'
import Spinner from './ui/Spinner'

// Floating AI assistant launcher + chat panel, available app-wide.
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
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl [animation:fadeUp_0.25s_ease_both] dark:border-slate-700 dark:bg-slate-800">
          {/* header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-600 to-teal-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="text-sm font-semibold leading-tight">MedAssist AI</p>
                <p className="text-[11px] text-primary-100">Symptoms & general health</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-white/20">
              <FiX size={18} />
            </button>
          </div>

          {/* messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && !sending && (
              <div className="mt-8 px-4 text-center text-sm text-slate-400">
                <p className="text-4xl">👋</p>
                <p className="mt-3">Hi! I'm your AI health assistant. Ask me about symptoms, medications, or your reports.</p>
                <p className="mt-2 text-xs text-slate-400">Not a substitute for professional medical advice.</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-3 py-2 dark:bg-slate-700">
                  <Spinner size={14} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-2 dark:border-slate-700">
            <input
              className="input"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn-primary px-3" disabled={sending || !input.trim()} aria-label="Send">
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Launcher button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-teal-600 text-2xl text-white shadow-xl ring-4 ring-primary-500/20 transition hover:scale-110"
      >
        {open ? <FiX size={24} /> : '🤖'}
      </button>
    </>
  )
}
