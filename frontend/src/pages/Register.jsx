import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import useForm from '../hooks/useForm'
import { required, email, phone, password, matches } from '../utils/validators'
import { errorMessage } from '../utils/format'
import AuthShell from '../components/AuthShell'
import Spinner from '../components/ui/Spinner'
import FormField from '../components/ui/FormField'

const initial = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'patient',
  password: '',
  password2: '',
}

const schema = {
  first_name: [required('First name')],
  last_name: [required('Last name')],
  email: [required('Email'), email()],
  phone: [phone()],
  password: [required('Password'), password()],
  password2: [required('Confirmation'), matches('password', 'Passwords')],
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const form = useForm(initial, schema)

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      await register(values)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(errorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const fieldProps = (name) => ({
    name,
    value: form.values[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.errors[name],
    touched: form.touched[name],
  })

  return (
    <AuthShell title="Create account" subtitle="Join MedAssist in a minute">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" {...fieldProps('first_name')} />
          <FormField label="Last name" {...fieldProps('last_name')} />
        </div>
        <FormField label="Email" type="email" autoComplete="email" {...fieldProps('email')} />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phone" {...fieldProps('phone')} />
          <FormField
            label="Register as"
            as="select"
            options={[
              { value: 'patient', label: 'Patient' },
              { value: 'doctor', label: 'Doctor' },
            ]}
            {...fieldProps('role')}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Password" type="password" autoComplete="new-password" {...fieldProps('password')} />
          <FormField label="Confirm" type="password" autoComplete="new-password" {...fieldProps('password2')} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Spinner size={18} className="text-white" /> : 'Create account'}
        </button>
      </form>

    </AuthShell>
  )
}
