import { NavLink } from 'react-router-dom'
import {
  FiGrid,
  FiMessageSquare,
  FiFileText,
  FiUsers,
  FiCalendar,
  FiUser,
  FiActivity,
  FiClipboard,
  FiUserCheck,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../constants'

const dashboardLink = { to: '/', label: 'Dashboard', icon: FiGrid, end: true }
const profileLink = { to: '/profile', label: 'Profile', icon: FiUser }

// Role-scoped navigation: each role only sees the features that apply to it.
const patientLinks = [
  { to: '/chat', label: 'AI Assistant', icon: FiMessageSquare },
  { to: '/reports', label: 'My Reports', icon: FiFileText },
  { to: '/doctors', label: 'Find Doctors', icon: FiUsers },
  { to: '/appointments', label: 'Appointments', icon: FiCalendar },
]

const doctorLinks = [
  { to: '/chat', label: 'AI Assistant', icon: FiMessageSquare },
  { to: '/appointments', label: 'Appointments', icon: FiCalendar },
]

const adminLinks = [
  { to: '/admin/users', label: 'Manage Users', icon: FiUserCheck },
  { to: '/admin/doctors', label: 'Manage Doctors', icon: FiActivity },
  { to: '/admin/appointments', label: 'All Appointments', icon: FiCalendar },
  { to: '/admin/reports', label: 'All Reports', icon: FiClipboard },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const role = user?.role

  const mainLinks =
    role === ROLES.ADMIN ? [] : role === ROLES.DOCTOR ? doctorLinks : patientLinks

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-primary-600 text-white shadow'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
    }`

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white p-4 transition-transform dark:border-slate-700 dark:bg-slate-800 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <FiActivity size={20} />
          </div>
          <span className="text-lg font-bold">MedAssist</span>
        </div>

        <nav className="space-y-1">
          <NavLink to={dashboardLink.to} end={dashboardLink.end} className={linkClass} onClick={onClose}>
            <dashboardLink.icon size={18} />
            {dashboardLink.label}
          </NavLink>

          {mainLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={onClose}>
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}

          {role === ROLES.ADMIN && (
            <>
              <p className="px-3 pb-1 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Administration
              </p>
              {adminLinks.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass} onClick={onClose}>
                  <l.icon size={18} />
                  {l.label}
                </NavLink>
              ))}
            </>
          )}

          <NavLink to={profileLink.to} className={linkClass} onClick={onClose}>
            <profileLink.icon size={18} />
            {profileLink.label}
          </NavLink>
        </nav>
      </aside>
    </>
  )
}
