// Centralised app constants.

// Secure file-upload limits (kept in sync with the backend validators).
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB
export const ALLOWED_REPORT_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp']
export const ALLOWED_REPORT_MIME = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/bmp',
  'image/tiff',
  'image/webp',
]
export const ALLOWED_AVATAR_MIME = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // 2 MB

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
}

// Debounce delay for search-as-you-type inputs (ms).
export const SEARCH_DEBOUNCE_MS = 350
