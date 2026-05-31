import { useEffect, useMemo, useState } from 'react'
import { FiUpload, FiFileText, FiTrash2, FiRefreshCw, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { reportApi } from '../api/services'
import useDebounce from '../hooks/useDebounce'
import { validateReportFile, formatBytes } from '../utils/fileValidation'
import { errorMessage, formatDate, truncate } from '../utils/format'
import { ALLOWED_REPORT_EXTENSIONS, MAX_UPLOAD_BYTES, SEARCH_DEBOUNCE_MS } from '../constants'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import SearchInput from '../components/ui/SearchInput'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { SkeletonCardGrid } from '../components/ui/Skeleton'

const acceptAttr = ALLOWED_REPORT_EXTENSIONS.map((e) => `.${e}`).join(',')

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [removing, setRemoving] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await reportApi.list()
      setReports(data.results || data)
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load reports'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Client-side filtering keeps search instant for a patient's own reports.
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return reports
    return reports.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) || r.ai_summary?.toLowerCase().includes(q)
    )
  }, [reports, debouncedSearch])

  const onFileChange = (e) => {
    const f = e.target.files[0] || null
    setFile(f)
    setFileError(f ? validateReportFile(f) : '')
  }

  const upload = async (e) => {
    e.preventDefault()
    const err = validateReportFile(file)
    if (err) {
      setFileError(err)
      return
    }
    const fd = new FormData()
    fd.append('title', title || file.name)
    fd.append('file', file)
    setUploading(true)
    try {
      await reportApi.upload(fd)
      toast.success('Report uploaded and analysed')
      setTitle('')
      setFile(null)
      setFileError('')
      e.target.reset()
      load()
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  const confirmDelete = async () => {
    setRemoving(true)
    try {
      await reportApi.remove(deleting.id)
      setReports((r) => r.filter((x) => x.id !== deleting.id))
      toast.success('Report deleted')
      setDeleting(null)
    } catch (err) {
      toast.error(errorMessage(err, 'Delete failed'))
    } finally {
      setRemoving(false)
    }
  }

  const reprocess = async (id) => {
    try {
      const { data } = await reportApi.reprocess(id)
      setReports((r) => r.map((x) => (x.id === id ? data : x)))
      toast.success('Reprocessed')
    } catch (err) {
      toast.error(errorMessage(err, 'Reprocess failed'))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Medical Reports</h1>
        <p className="text-sm text-slate-500">
          Upload a PDF or image; we extract the text and generate an AI summary.
        </p>
      </div>

      <form onSubmit={upload} className="card flex flex-col gap-3 sm:flex-row sm:items-start" noValidate>
        <div className="flex-1">
          <label className="label">Report title</label>
          <input
            className="input"
            placeholder="e.g. Blood test — Jan 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="label">File (PDF / image)</label>
          <input
            type="file"
            accept={acceptAttr}
            className={`input ${fileError ? 'border-red-500' : ''}`}
            onChange={onFileChange}
          />
          {fileError ? (
            <p className="mt-1 text-xs text-red-500">{fileError}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              Max {formatBytes(MAX_UPLOAD_BYTES)}. {file ? `Selected: ${formatBytes(file.size)}` : ''}
            </p>
          )}
        </div>
        <button type="submit" className="btn-primary sm:mt-6" disabled={uploading || !!fileError}>
          {uploading ? <Spinner size={18} className="text-white" /> : <><FiUpload size={16} /> Upload</>}
        </button>
      </form>

      {!loading && reports.length > 0 && (
        <SearchInput value={search} onChange={setSearch} placeholder="Search your reports…" className="sm:w-80" />
      )}

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : reports.length === 0 ? (
        <EmptyState icon={FiFileText} title="No reports uploaded yet" subtitle="Upload your first medical report above." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiFileText} title="No matching reports" subtitle="Try a different search term." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <div key={r.id} className="card flex flex-col">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FiFileText className="shrink-0 text-primary-600" />
                  <h3 className="font-semibold">{r.title}</h3>
                </div>
                <Badge status={r.status} />
              </div>
              <p className="mb-3 line-clamp-3 flex-1 text-sm text-slate-500">
                {r.ai_summary ? truncate(r.ai_summary, 160) : 'Processing…'}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{formatDate(r.created_at)}</span>
                <div className="flex gap-1">
                  <button onClick={() => setViewing(r)} className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700" title="View" aria-label="View report">
                    <FiEye size={15} />
                  </button>
                  <button onClick={() => reprocess(r.id)} className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700" title="Reprocess" aria-label="Reprocess report">
                    <FiRefreshCw size={15} />
                  </button>
                  <button onClick={() => setDeleting(r)} className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" title="Delete" aria-label="Delete report">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!viewing} title={viewing?.title} onClose={() => setViewing(null)}>
        {viewing && (
          <div className="space-y-4">
            <div>
              <h4 className="mb-1 font-semibold">AI Summary</h4>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{viewing.ai_summary || '—'}</p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold">Extracted Text</h4>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900">
                {viewing.extracted_text || '—'}
              </pre>
            </div>
            {viewing.file_url && (
              <a href={viewing.file_url} target="_blank" rel="noreferrer" className="btn-outline">
                Open original file
              </a>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete report?"
        message={deleting ? `"${deleting.title}" and its AI analysis will be permanently removed.` : ''}
        confirmLabel="Delete"
        danger
        loading={removing}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
