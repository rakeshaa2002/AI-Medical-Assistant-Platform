import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/services'
import Spinner from '../components/ui/Spinner'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '',
    profile: {
      gender: user?.profile?.gender || '',
      blood_group: user?.profile?.blood_group || '',
      address: user?.profile?.address || '',
      emergency_contact: user?.profile?.emergency_contact || '',
      allergies: user?.profile?.allergies || '',
      medical_history: user?.profile?.medical_history || '',
    },
  })
  const [saving, setSaving] = useState(false)
  const [pwd, setPwd] = useState({ old_password: '', new_password: '' })
  const [changingPwd, setChangingPwd] = useState(false)

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const setProfile = (e) => setForm({ ...form, profile: { ...form.profile, [e.target.name]: e.target.value } })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.date_of_birth) delete payload.date_of_birth
      await authApi.updateMe(payload)
      await refreshUser()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setChangingPwd(true)
    try {
      await authApi.changePassword(pwd)
      toast.success('Password changed')
      setPwd({ old_password: '', new_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Change failed')
    } finally {
      setChangingPwd(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <form onSubmit={save} className="card space-y-4">
        <h3 className="font-semibold">Personal information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">First name</label>
            <input name="first_name" className="input" value={form.first_name} onChange={set} />
          </div>
          <div>
            <label className="label">Last name</label>
            <input name="last_name" className="input" value={form.last_name} onChange={set} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" className="input" value={form.phone} onChange={set} />
          </div>
          <div>
            <label className="label">Date of birth</label>
            <input name="date_of_birth" type="date" className="input" value={form.date_of_birth} onChange={set} />
          </div>
          <div>
            <label className="label">Gender</label>
            <select name="gender" className="input" value={form.profile.gender} onChange={setProfile}>
              <option value="">—</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="label">Blood group</label>
            <select name="blood_group" className="input" value={form.profile.blood_group} onChange={setProfile}>
              <option value="">—</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Emergency contact</label>
            <input name="emergency_contact" className="input" value={form.profile.emergency_contact} onChange={setProfile} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input name="address" className="input" value={form.profile.address} onChange={setProfile} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Allergies</label>
            <textarea name="allergies" rows={2} className="input" value={form.profile.allergies} onChange={setProfile} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Medical history</label>
            <textarea name="medical_history" rows={3} className="input" value={form.profile.medical_history} onChange={setProfile} />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Spinner size={18} className="text-white" /> : 'Save changes'}
        </button>
      </form>

      <form onSubmit={changePassword} className="card space-y-4">
        <h3 className="font-semibold">Change password</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              value={pwd.old_password}
              onChange={(e) => setPwd({ ...pwd, old_password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              value={pwd.new_password}
              onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn-outline" disabled={changingPwd}>
          {changingPwd ? <Spinner size={18} /> : 'Update password'}
        </button>
      </form>
    </div>
  )
}
