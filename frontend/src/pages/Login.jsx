import { useState } from 'react'
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

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const form = useForm({ email: '', password: '' }, schema)

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

      <div className="mt-6 rounded-lg bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-800">
        <p className="font-semibold">Demo accounts (after seeding):</p>
        <p>admin@medassist.local / Admin@123</p>
        <p>patient@medassist.local / Patient@123</p>
      </div>
    </AuthShell>
  )
}
