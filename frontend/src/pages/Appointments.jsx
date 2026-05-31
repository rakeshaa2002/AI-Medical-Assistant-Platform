import { useEffect, useState } from 'react'
import { FiCalendar, FiX, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { appointmentApi } from '../api/services'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

export default function Appointments() {
  const { user } = useAuth()
  const isDoctor = user?.role === 'doctor'
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = filter ? { status: filter } : {}
      const { data } = await appointmentApi.list(params)
      setAppointments(data.results || data)
    } catch {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await appointmentApi.cancel(id)
      toast.success('Appointment cancelled')
      load()
    } catch {
      toast.error('Cancel failed')
    }
  }

  const setStatus = async (id, status) => {
    try {
      await appointmentApi.setStatus(id, { status })
      toast.success(`Marked ${status}`)
      load()
    } catch {
      toast.error('Update failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-sm text-slate-500">
            {isDoctor ? 'Appointments booked with you' : 'Your booked appointments'}
          </p>
        </div>
        <select className="input w-44" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : appointments.length === 0 ? (
        <EmptyState icon={FiCalendar} title="No appointments" subtitle={isDoctor ? '' : 'Book one from the Find Doctors page.'} />
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                  <FiCalendar size={20} />
                </div>
                <div>
                  <p className="font-semibold">
                    {isDoctor
                      ? a.patient_detail?.full_name || a.patient_detail?.email
                      : a.doctor_detail?.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {!isDoctor && a.doctor_detail?.specialization}
                    {a.slot_detail && (
                      <> · {a.slot_detail.date} at {a.slot_detail.start_time?.slice(0, 5)}</>
                    )}
                  </p>
                  {a.reason && <p className="mt-1 text-xs text-slate-400">Reason: {a.reason}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge status={a.status} />
                {(isDoctor || user?.role === 'admin') && a.status === 'pending' && (
                  <button onClick={() => setStatus(a.id, 'confirmed')} className="btn-outline px-2 py-1 text-xs" title="Confirm">
                    <FiCheck size={14} /> Confirm
                  </button>
                )}
                {(isDoctor || user?.role === 'admin') && a.status === 'confirmed' && (
                  <button onClick={() => setStatus(a.id, 'completed')} className="btn-outline px-2 py-1 text-xs" title="Complete">
                    <FiCheck size={14} /> Complete
                  </button>
                )}
                {['pending', 'confirmed'].includes(a.status) && (
                  <button onClick={() => cancel(a.id)} className="btn-danger px-2 py-1 text-xs">
                    <FiX size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
