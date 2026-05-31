import { useEffect, useState } from 'react'
import { FiEye, FiFileText } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { reportApi } from '../../api/services'
import useDebounce from '../../hooks/useDebounce'
import { errorMessage, formatDate } from '../../utils/format'
import { SEARCH_DEBOUNCE_MS } from '../../constants'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import SearchInput from '../../components/ui/SearchInput'
import { SkeletonTable } from '../../components/ui/Skeleton'

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    let active = true
    setLoading(true)
    const params = debouncedSearch ? { search: debouncedSearch } : {}
    reportApi
      .list(params)
      .then(({ data }) => {
        if (active) setReports(data.results || data)
      })
      .catch((err) => active && toast.error(errorMessage(err, 'Failed to load reports')))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [debouncedSearch])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Reports</h1>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by title…" className="sm:w-80" />

      {loading ? (
        <SkeletonTable rows={8} cols={5} />
      ) : reports.length === 0 ? (
        <EmptyState icon={FiFileText} title="No reports" subtitle="No reports match your search." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Uploaded by</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3">{r.user?.email || '—'}</td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setViewing(r)}
                      className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                      aria-label="View report"
                    >
                      <FiEye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!viewing} title={viewing?.title} onClose={() => setViewing(null)}>
        {viewing && (
          <div className="space-y-4">
            <div>
              <h4 className="mb-1 font-semibold">AI Summary</h4>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{viewing.ai_summary || '—'}</p>
            </div>
            {viewing.file_url && (
              <a href={viewing.file_url} target="_blank" rel="noreferrer" className="btn-outline">Open original file</a>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
