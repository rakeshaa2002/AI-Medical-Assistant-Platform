import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

// Text input for passwords with a show/hide toggle.
// Forwards all standard input props (name, value, onChange, required, etc.).
export default function PasswordInput({ className = '', ...props }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={`input pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none dark:hover:text-slate-200"
      >
        {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  )
}
