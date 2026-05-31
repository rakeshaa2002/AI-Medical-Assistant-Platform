import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { appointmentApi } from '../../api/services'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminAppointments() {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Appointments</h1>
        <select className="input w-44" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={32} /></div>
        ) : appointments.length === 0 ? (
          <EmptyState title="No appointments" />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-4 py-3">{a.patient_detail?.full_name || a.patient_detail?.email}</td>
                  <td className="px-4 py-3">{a.doctor_detail?.name}</td>
                  <td className="px-4 py-3">
                    {a.slot_detail ? `${a.slot_detail.date} ${a.slot_detail.start_time?.slice(0, 5)}` : '—'}
                  </td>
                  <td className="px-4 py-3"><Badge status={a.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <select
                      className="input w-36"
                      value={a.status}
                      onChange={(e) => setStatus(a.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
