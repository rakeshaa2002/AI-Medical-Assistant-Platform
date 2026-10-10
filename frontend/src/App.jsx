import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import Spinner from './components/ui/Spinner'
import WakingServerHint from './components/ui/WakingServerHint'

// Route-based code splitting keeps the initial bundle small; heavy pages
// (e.g. the charts on the Dashboard) load only when first visited.
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Chat = lazy(() => import('./pages/Chat'))
const Reports = lazy(() => import('./pages/Reports'))
const Doctors = lazy(() => import('./pages/Doctors'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminDoctors = lazy(() => import('./pages/admin/AdminDoctors'))
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size={36} />
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Spinner size={40} />
        {/* returning visitors wait here for the saved session to be checked */}
        <WakingServerHint active />
      </div>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Public landing page for visitors; signed-in users get the Dashboard at "/". */}
        {!user && <Route path="/" element={<Landing />} />}

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {user && <Route path="/" element={<Dashboard />} />}
          <Route path="/chat" element={<Chat />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin-only */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDoctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
