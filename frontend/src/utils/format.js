// Small formatting helpers shared across pages.

export const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export const initialsOf = (nameOrEmail = '?') =>
  String(nameOrEmail)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const truncate = (text, n = 160) =>
  !text ? '' : text.length > n ? `${text.slice(0, n).trimEnd()}…` : text

// Pull a human-readable error message out of an axios error.
export const errorMessage = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data
  if (!data) return err?.message || fallback
  if (typeof data === 'string') return data
  if (data.message) return data.message
  if (data.detail) return data.detail
  // DRF field errors: { field: ["msg"] }
  const first = Object.values(data)[0]
  if (Array.isArray(first)) return first[0]
  if (typeof first === 'string') return first
  return fallback
}
