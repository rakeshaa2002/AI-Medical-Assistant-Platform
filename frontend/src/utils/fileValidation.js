import {
  ALLOWED_REPORT_EXTENSIONS,
  ALLOWED_REPORT_MIME,
  MAX_UPLOAD_BYTES,
} from '../constants'

const extOf = (name) => (name.includes('.') ? name.split('.').pop().toLowerCase() : '')

export const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`
}

/**
 * Validate a report upload client-side before sending it.
 * Checks extension, MIME type and size. Returns an error string or ''.
 */
export function validateReportFile(file) {
  if (!file) return 'Please choose a file'
  const ext = extOf(file.name)
  if (!ALLOWED_REPORT_EXTENSIONS.includes(ext)) {
    return `Unsupported file type ".${ext}". Allowed: ${ALLOWED_REPORT_EXTENSIONS.join(', ')}`
  }
  // Some browsers leave type blank for less-common formats; only reject when present and wrong.
  if (file.type && !ALLOWED_REPORT_MIME.includes(file.type)) {
    return 'File content type does not match an allowed format'
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File is too large (${formatBytes(file.size)}). Max ${formatBytes(MAX_UPLOAD_BYTES)}`
  }
  if (file.size === 0) return 'File appears to be empty'
  return ''
}
