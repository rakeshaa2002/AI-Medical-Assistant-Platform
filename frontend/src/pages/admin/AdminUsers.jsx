import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/services'
import useDebounce from '../../hooks/useDebounce'
import { errorMessage, formatDate } from '../../utils/format'
import { SEARCH_DEBOUNCE_MS } from '../../constants'
import Badge from '../../components/ui/Badge'
import SearchInput from '../../components/ui/SearchInput'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/Skeleton'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    let active = true
    setLoading(true)
    const params = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (role) params.role = role
    authApi
      .users(params)
      .then(({ data }) => {
        if (active) setUsers(data.results || data)
      })
      .catch((err) => active && toast.error(errorMessage(err, 'Failed to load users')))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [debouncedSearch, role])

  const toggleActive = async (u) => {
    try {
      await authApi.updateUser(u.id, { is_active: !u.is_active })
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, is_active: !x.is_active } : x)))
      toast.success(u.is_active ? 'User deactivated' : 'User activated')
    } catch (err) {
      toast.error(errorMessage(err, 'Update failed'))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
          className="flex-1"
        />
        <select className="input sm:w-44" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={6} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" subtitle="Try adjusting your search or filter." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-4 py-3 font-medium">{u.full_name || '—'}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <Badge status={u.is_active ? 'completed' : 'cancelled'}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{formatDate(u.date_joined)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`rounded px-3 py-1 text-xs font-medium ${
                        u.is_active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
