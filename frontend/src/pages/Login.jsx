import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import useForm from '../hooks/useForm'
import { required, email } from '../utils/validators'
import { errorMessage } from '../utils/format'
import AuthShell from '../components/AuthShell'
import Spinner from '../components/ui/Spinner'
import FormField from '../components/ui/FormField'

const schema = {
  email: [required('Email'), email()],
  password: [required('Password')],
}

// Seeded demo accounts (see backend seed_data) — one click fills the form.
const DEMO_ACCOUNTS = [
  { role: 'Admin', icon: '🛡️', email: 'admin@medassist.local', password: 'Admin@123' },
  { role: 'Doctor', icon: '🩺', email: 'doctor1@medassist.local', password: 'Doctor@123' },
  { role: 'Patient', icon: '🧑', email: 'patient@medassist.local', password: 'Patient@123' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const form = useForm({ email: '', password: '' }, schema)

  const fillDemo = (acc) => {
    form.setValue('email', acc.email)
    form.setValue('password', acc.password)
    toast.success(`${acc.role} credentials filled`, { id: 'demo-fill' })
  }

  // Landing page "Log in as <role>" buttons pass the role via router state.
  useEffect(() => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === location.state?.demo)
    if (acc) fillDemo(acc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      toast.success('Welcome back!')
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err, 'Invalid credentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Access your MedAssist account">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.email}
          touched={form.touched.email}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.password}
          touched={form.touched.password}
        />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Spinner size={18} className="text-white" /> : 'Sign in'}
        </button>
      </form>

      <div className="mt-5">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
          Demo accounts — click to autofill
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              title={`${acc.email} / ${acc.password}`}
              onClick={() => fillDemo(acc)}
              className="flex flex-col items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:border-primary-500 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <span className="text-base leading-none">{acc.icon}</span>
              <span className="mt-1">{acc.role}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  )
}
