import { useEffect, useState } from 'react'
import { FiStar, FiClock, FiDollarSign } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { appointmentApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import useDebounce from '../hooks/useDebounce'
import { errorMessage } from '../utils/format'
import { ROLES, SEARCH_DEBOUNCE_MS } from '../constants'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import SearchInput from '../components/ui/SearchInput'
import { SkeletonCardGrid } from '../components/ui/Skeleton'

export default function Doctors() {
  const { user } = useAuth()
  const isPatient = user?.role === ROLES.PATIENT

  const [doctors, setDoctors] = useState([])
  const [specs, setSpecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [spec, setSpec] = useState('')
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  // Booking modal state (patients only)
  const [bookingDoctor, setBookingDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [slotId, setSlotId] = useState('')
  const [reason, setReason] = useState('')
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    appointmentApi.specializations().then((res) => setSpecs(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    const params = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (spec) params.specialization = spec
    appointmentApi
      .doctors(params)
      .then(({ data }) => active && setDoctors(data.results || data))
      .catch((err) => active && toast.error(errorMessage(err, 'Failed to load doctors')))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [debouncedSearch, spec])

  const openBooking = async (doctor) => {
    setBookingDoctor(doctor)
    setSlotId('')
    setReason('')
    try {
      const { data } = await appointmentApi.slots({ doctor: doctor.id, is_booked: false })
      setSlots(data.results || data)
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load slots'))
    }
  }

  const confirmBooking = async () => {
    if (!slotId) return toast.error('Select a time slot')
    setBooking(true)
    try {
      await appointmentApi.book({ doctor: bookingDoctor.id, slot: slotId, reason })
      toast.success('Appointment booked!')
      setBookingDoctor(null)
    } catch (err) {
      toast.error(errorMessage(err, 'Booking failed'))
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isPatient ? 'Find Doctors' : 'Doctors Directory'}</h1>
        <p className="text-sm text-slate-500">
          {isPatient
            ? 'Search by name or filter by specialization, then book an appointment.'
            : 'Browse the registered doctors and their specializations.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search doctors…" className="flex-1" />
        <select className="input sm:w-56" value={spec} onChange={(e) => setSpec(e.target.value)}>
          <option value="">All specializations</option>
          {specs.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : doctors.length === 0 ? (
        <EmptyState title="No doctors found" subtitle="Try a different search or specialization." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((d) => (
            <div key={d.id} className="card flex flex-col">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {d.user.first_name?.[0]}{d.user.last_name?.[0]}
                </div>
                <div>
                  <h3 className="font-semibold">{d.name}</h3>
                  <p className="text-sm text-primary-600">{d.specialization}</p>
                </div>
              </div>
              <p className="mb-3 line-clamp-2 flex-1 text-sm text-slate-500">{d.bio || 'Experienced specialist.'}</p>
              <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><FiStar className="text-amber-500" /> {d.rating}</span>
                <span className="flex items-center gap-1"><FiClock /> {d.experience_years} yrs</span>
                <span className="flex items-center gap-1"><FiDollarSign /> {d.consultation_fee}</span>
              </div>
              {/* Only patients can book; admins/doctors see a read-only directory. */}
              {isPatient ? (
                <button className="btn-primary" onClick={() => openBooking(d)} disabled={!d.is_available}>
                  {d.is_available ? 'Book appointment' : 'Unavailable'}
                </button>
              ) : (
                <span
                  className={`rounded-lg px-3 py-2 text-center text-xs font-medium ${
                    d.is_available
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  {d.is_available ? 'Available for booking' : 'Not accepting bookings'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {isPatient && (
        <Modal
          open={!!bookingDoctor}
          title={`Book with ${bookingDoctor?.name || ''}`}
          onClose={() => setBookingDoctor(null)}
          footer={
            <>
              <button className="btn-outline" onClick={() => setBookingDoctor(null)}>Cancel</button>
              <button className="btn-primary" onClick={confirmBooking} disabled={booking || !slotId}>
                {booking ? <Spinner size={16} className="text-white" /> : 'Confirm booking'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="label">Available slots</label>
              {slots.length === 0 ? (
                <p className="text-sm text-slate-400">No open slots for this doctor.</p>
              ) : (
                <select className="input" value={slotId} onChange={(e) => setSlotId(e.target.value)}>
                  <option value="">Select a slot</option>
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.date} · {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="label">Reason for visit (optional)</label>
              <textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
