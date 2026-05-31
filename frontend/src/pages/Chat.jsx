import { useEffect, useRef, useState } from 'react'
import { FiSend, FiPlus, FiTrash2, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { chatApi } from '../api/services'
import { errorMessage } from '../utils/format'
import Spinner from '../components/ui/Spinner'

export default function Chat() {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [disclaimer, setDisclaimer] = useState('')
  const bottomRef = useRef(null)
  const scrollRef = useRef(null)
  // Whether new content should auto-scroll. Stays true while the user is at
  // the bottom; turns off if they scroll up to read earlier messages.
  const stickToBottom = useRef(true)

  useEffect(() => {
    loadConversations()
    chatApi.disclaimer().then((res) => setDisclaimer(res.data.disclaimer)).catch(() => {})
  }, [])

  useEffect(() => {
    if (stickToBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, sending])

  const onMessagesScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottom.current = distanceFromBottom < 120
  }

  const loadConversations = async () => {
    try {
      const { data } = await chatApi.conversations()
      setConversations(data.results || data)
    } catch {
      toast.error('Failed to load conversations')
    }
  }

  const openConversation = async (id) => {
    setActiveId(id)
    try {
      const { data } = await chatApi.conversation(id)
      setMessages(data.messages)
    } catch {
      toast.error('Failed to open conversation')
    }
  }

  const newChat = () => {
    setActiveId(null)
    setMessages([])
  }

  const removeConversation = async (id, e) => {
    e.stopPropagation()
    try {
      await chatApi.remove(id)
      setConversations((c) => c.filter((x) => x.id !== id))
      if (activeId === id) newChat()
      toast.success('Conversation deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    stickToBottom.current = true // always follow the user's own new message
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: 'user', content: text }])
    setSending(true)
    try {
      const { data } = await chatApi.send({ conversation_id: activeId || undefined, message: text })
      setMessages((m) => [...m, data.assistant_message])
      if (!activeId) {
        setActiveId(data.conversation_id)
        loadConversations()
      }
    } catch (err) {
      toast.error(errorMessage(err, 'AI assistant failed to respond'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Conversation list */}
      <div className="hidden w-64 flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 md:flex">
        <button onClick={newChat} className="btn-primary m-3">
          <FiPlus size={16} /> New chat
        </button>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {conversations.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-slate-400">No conversations yet</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`group mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                activeId === c.id ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <FiMessageSquare size={14} />
                <span className="truncate">{c.title}</span>
              </span>
              <FiTrash2
                size={14}
                className="opacity-0 transition group-hover:opacity-100 hover:text-red-500"
                onClick={(e) => removeConversation(c.id, e)}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
          <FiAlertTriangle className="mt-0.5 shrink-0" />
          <span>{disclaimer || 'AI-generated information — not a substitute for professional medical advice.'}</span>
        </div>

        <div ref={scrollRef} onScroll={onMessagesScroll} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && !sending && (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <FiMessageSquare size={40} className="mb-3" />
              <p className="font-medium">Ask about symptoms, medications or general health.</p>
              <p className="text-sm">e.g. "I have a headache and mild fever for 2 days."</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
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
              <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-700">
                <Spinner size={16} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
          <input
            className="input"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={sending || !input.trim()}>
            <FiSend size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
