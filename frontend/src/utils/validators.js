// Lightweight, dependency-free form validation rules.
// Each validator returns an error string, or '' when the value is valid.

export const required = (label = 'This field') => (v) =>
  v == null || String(v).trim() === '' ? `${label} is required` : ''

export const email = () => (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim()) ? '' : 'Enter a valid email address'

export const minLength = (n, label = 'This field') => (v) =>
  String(v || '').length >= n ? '' : `${label} must be at least ${n} characters`

export const phone = () => (v) => {
  const s = String(v || '').trim()
  if (!s) return '' // optional
  return /^[+]?[\d\s-]{7,15}$/.test(s) ? '' : 'Enter a valid phone number'
}

// A reasonably strong password: 8+ chars with at least one letter and number.
export const password = () => (v) => {
  const s = String(v || '')
  if (s.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Za-z]/.test(s) || !/\d/.test(s)) return 'Use both letters and numbers'
  return ''
}

export const matches = (otherKey, label = 'Values') => (v, all) =>
  v === all[otherKey] ? '' : `${label} do not match`

/**
 * Run a schema of { field: [validators] } against a values object.
 * Returns an object of { field: firstErrorMessage } (empty if valid).
 */
export function validate(values, schema) {
  const errors = {}
  for (const [field, rules] of Object.entries(schema)) {
    for (const rule of rules) {
      const msg = rule(values[field], values)
      if (msg) {
        errors[field] = msg
        break
      }
    }
  }
  return errors
}
