import { useEffect, useState } from 'react'
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiFileText,
  FiMessageSquare,
  FiActivity,
} from 'react-icons/fi'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { dashboardApi } from '../api/services'
import StatCard from '../components/ui/StatCard'
import Spinner from '../components/ui/Spinner'

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
}

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = isAdmin ? dashboardApi.adminStats : dashboardApi.myStats
    fetch()
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={36} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-sm text-slate-500">
          {isAdmin ? 'Platform overview and analytics' : "Here's your health summary"}
        </p>
      </div>

      {isAdmin ? <AdminDashboard stats={stats} /> : <UserDashboard stats={stats} />}
    </div>
  )
}

function AdminDashboard({ stats }) {
  const c = stats.cards
  const statusData = Object.entries(stats.appointments_by_status).map(([name, value]) => ({
    name,
    value,
  }))
  const specData = stats.top_specializations.map((s) => ({
    name: s.specialization,
    count: s.count,
  }))

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FiUsers} label="Total Users" value={c.total_users} color="primary" />
        <StatCard icon={FiUserCheck} label="Doctors" value={c.total_doctors} color="teal" />
        <StatCard icon={FiCalendar} label="Appointments" value={c.total_appointments} color="amber" />
        <StatCard icon={FiFileText} label="Reports" value={c.total_reports} color="rose" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold">Appointments by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold">Top Specializations</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={specData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 font-semibold">Recent Appointments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="pb-2">Patient</th>
                <th className="pb-2">Doctor</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_appointments.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="py-2">{a.patient__email}</td>
                  <td className="py-2">
                    Dr. {a.doctor__user__first_name} {a.doctor__user__last_name}
                  </td>
                  <td className="py-2 capitalize">{a.status}</td>
                  <td className="py-2">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function UserDashboard({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={FiCalendar} label="Appointments" value={stats.total_appointments} color="primary" />
      <StatCard icon={FiActivity} label="Upcoming" value={stats.upcoming} color="teal" />
      {stats.role === 'patient' && (
        <>
          <StatCard icon={FiFileText} label="Reports" value={stats.total_reports} color="rose" />
          <StatCard icon={FiMessageSquare} label="Chats" value={stats.total_conversations} color="indigo" />
        </>
      )}
      {stats.role === 'doctor' && (
        <>
          <StatCard icon={FiActivity} label="Pending" value={stats.pending} color="amber" />
          <StatCard icon={FiFileText} label="Completed" value={stats.completed} color="indigo" />
        </>
      )}
    </div>
  )
}
