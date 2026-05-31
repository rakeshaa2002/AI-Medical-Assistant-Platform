import { useEffect, useState } from 'react'
import { FiPlus, FiStar, FiRefreshCw, FiCopy } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { appointmentApi, authApi } from '../../api/services'
import { errorMessage } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import PasswordInput from '../../components/ui/PasswordInput'
import { SkeletonCardGrid } from '../../components/ui/Skeleton'

const emptyProfile = {
  specialization: '',
  qualifications: '',
  experience_years: 0,
  consultation_fee: 0,
  bio: '',
}
const emptyExisting = { user_id: '' }
const emptyAccount = { first_name: '', last_name: '', email: '', phone: '', password: '' }

// Generate a readable temporary password to hand to the new doctor.
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let p = ''
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)]
  return `${p}@1`
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('new') // 'new' | 'existing'
  const [doctorUsers, setDoctorUsers] = useState([])
  const [profile, setProfile] = useState(emptyProfile)
  const [existing, setExisting] = useState(emptyExisting)
  const [account, setAccount] = useState(emptyAccount)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await appointmentApi.doctors()
      setDoctors(data.results || data)
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load doctors'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openModal = async () => {
    setMode('new')
    setProfile(emptyProfile)
    setExisting(emptyExisting)
    setAccount({ ...emptyAccount, password: generatePassword() })
    try {
      const { data } = await authApi.users({ role: 'doctor' })
      setDoctorUsers(data.results || data)
    } catch {
      /* ignore — admin can still create a new account */
    }
    setOpen(true)
  }

  const setP = (e) => setProfile({ ...profile, [e.target.name]: e.target.value })
  const setA = (e) => setAccount({ ...account, [e.target.name]: e.target.value })

  const copyCredentials = () => {
    navigator.clipboard
      ?.writeText(`Email: ${account.email}\nPassword: ${account.password}`)
      .then(() => toast.success('Credentials copied'))
      .catch(() => {})
  }

  const save = async () => {
    if (!profile.specialization) return toast.error('Specialization is required')
    setSaving(true)
    try {
      if (mode === 'existing') {
        if (!existing.user_id) {
          setSaving(false)
          return toast.error('Select a doctor user account')
        }
        await appointmentApi.createDoctor({ ...profile, user_id: existing.user_id })
        toast.success('Doctor profile created')
      } else {
        if (!account.first_name || !account.last_name || !account.email || !account.password) {
          setSaving(false)
          return toast.error('Name, email and password are required')
        }
        await appointmentApi.createDoctorAccount({ ...profile, ...account })
        toast.success(`Doctor account created for ${account.email}`)
      }
      setOpen(false)
      load()
    } catch (err) {
      toast.error(errorMessage(err, 'Create failed'))
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailable = async (d) => {
    try {
      await appointmentApi.updateDoctor(d.id, { is_available: !d.is_available })
      setDoctors((list) => list.map((x) => (x.id === d.id ? { ...x, is_available: !x.is_available } : x)))
    } catch (err) {
      toast.error(errorMessage(err, 'Update failed'))
    }
  }

  const tabClass = (active) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
      active
        ? 'bg-primary-600 text-white'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
    }`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Doctors</h1>
        <button className="btn-primary" onClick={openModal}>
          <FiPlus size={16} /> Add doctor
        </button>
      </div>

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((d) => (
            <div key={d.id} className="card">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">{d.name}</h3>
                <span className="flex items-center gap-1 text-sm text-amber-500"><FiStar /> {d.rating}</span>
              </div>
              <p className="text-sm text-primary-600">{d.specialization}</p>
              <p className="mt-1 text-xs text-slate-400">{d.qualifications} · {d.experience_years} yrs · ₹{d.consultation_fee}</p>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={d.is_available} onChange={() => toggleAvailable(d)} />
                Available for booking
              </label>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title="Add doctor"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? <Spinner size={16} className="text-white" /> : 'Create'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2 rounded-lg bg-slate-50 p-1 dark:bg-slate-900/50">
            <button type="button" className={tabClass(mode === 'new')} onClick={() => setMode('new')}>
              Create new account
            </button>
            <button type="button" className={tabClass(mode === 'existing')} onClick={() => setMode('existing')}>
              Assign existing user
            </button>
          </div>

          {mode === 'new' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First name</label>
                  <input name="first_name" className="input" value={account.first_name} onChange={setA} />
                </div>
                <div>
                  <label className="label">Last name</label>
                  <input name="last_name" className="input" value={account.last_name} onChange={setA} />
                </div>
              </div>
              <div>
                <label className="label">Email (login)</label>
                <input name="email" type="email" className="input" value={account.email} onChange={setA} />
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input name="phone" className="input" value={account.phone} onChange={setA} />
              </div>
              <div>
                <label className="label">Temporary password</label>
                <div className="flex gap-2">
                  <PasswordInput name="password" className="flex-1" value={account.password} onChange={setA} />
                  <button
                    type="button"
                    className="btn-outline shrink-0"
                    title="Generate a new password"
                    onClick={() => setAccount((a) => ({ ...a, password: generatePassword() }))}
                  >
                    <FiRefreshCw size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-outline shrink-0"
                    title="Copy email + password"
                    onClick={copyCredentials}
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Share these credentials with the doctor; they can change the password after first login.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="label">Doctor user account</label>
              <select
                className="input"
                value={existing.user_id}
                onChange={(e) => setExisting({ user_id: e.target.value })}
              >
                <option value="">Select a user (role: doctor)</option>
                {doctorUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name || u.email} — {u.email}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-400">
                Lists users who registered as "doctor" but don't have a profile yet.
              </p>
            </div>
          )}

          {/* Shared profile fields */}
          <hr className="border-slate-200 dark:border-slate-700" />
          <div>
            <label className="label">Specialization</label>
            <input name="specialization" className="input" value={profile.specialization} onChange={setP} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Experience (years)</label>
              <input name="experience_years" type="number" min="0" className="input" value={profile.experience_years} onChange={setP} />
            </div>
            <div>
              <label className="label">Consultation fee</label>
              <input name="consultation_fee" type="number" min="0" className="input" value={profile.consultation_fee} onChange={setP} />
            </div>
          </div>
          <div>
            <label className="label">Qualifications</label>
            <input name="qualifications" className="input" value={profile.qualifications} onChange={setP} />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea name="bio" rows={2} className="input" value={profile.bio} onChange={setP} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
