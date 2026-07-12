/**
 * Shared client-side field validation (mirrors backend Jakarta rules).
 * Prefer showing field errors before submit; API fieldErrors remain the source of truth.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
const MOBILE_RE = /^[6-9]\d{9}$/
const SOCIETY_CODE_RE = /^[A-Za-z0-9][A-Za-z0-9_-]*$/

function trim(value) {
  return String(value ?? '').trim()
}

export function required(value, label = 'This field') {
  if (!trim(value)) return `${label} is required`
  return ''
}

export function email(value, { required: isRequired = true } = {}) {
  const v = trim(value)
  if (!v) return isRequired ? 'Email is required' : ''
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address'
  if (v.length > 120) return 'Email is too long'
  return ''
}

export function mobile(value, { required: isRequired = true } = {}) {
  const v = trim(value).replace(/\s+/g, '')
  if (!v) return isRequired ? 'Mobile number is required' : ''
  if (!MOBILE_RE.test(v)) return 'Enter a valid 10-digit Indian mobile number'
  return ''
}

export function password(value, { required: isRequired = true, label = 'Password' } = {}) {
  const v = String(value ?? '')
  if (!v) return isRequired ? `${label} is required` : ''
  if (v.length < 6) return `${label} must be at least 6 characters`
  if (v.length > 72) return `${label} must be at most 72 characters`
  return ''
}

/** Business-standard password for society / member signup. */
export function signupPassword(value, { label = 'Password' } = {}) {
  const v = String(value ?? '')
  if (!v) return `${label} is required`
  if (v.length < 8) return `${label} must be at least 8 characters`
  if (v.length > 72) return `${label} must be at most 72 characters`
  if (!/[a-z]/.test(v)) return `${label} must include a lowercase letter`
  if (!/[A-Z]/.test(v)) return `${label} must include an uppercase letter`
  if (!/\d/.test(v)) return `${label} must include a number`
  if (!/[^A-Za-z0-9]/.test(v)) return `${label} must include a symbol (e.g. !@#$%)`
  return ''
}

export const SIGNUP_PASSWORD_HINT =
  'At least 8 characters, with uppercase, lowercase, a number, and a symbol.'


export function personName(value, label = 'Full name') {
  const v = trim(value)
  if (!v) return `${label} is required`
  if (v.length < 2) return `${label} must be at least 2 characters`
  if (v.length > 120) return `${label} is too long`
  if (/\d/.test(v)) return `${label} should not contain numbers`
  return ''
}

export function societyCode(value) {
  const v = trim(value)
  if (!v) return 'Society code is required'
  if (v.length < 2 || v.length > 40) return 'Society code must be 2–40 characters'
  if (!SOCIETY_CODE_RE.test(v)) return 'Society code may use letters, numbers, hyphen and underscore'
  return ''
}

export function flatNumber(value) {
  const v = trim(value)
  if (!v) return 'Flat number is required'
  if (v.length > 30) return 'Flat number is too long'
  return ''
}

export function text(value, label, { required: isRequired = true, min = 1, max = 250 } = {}) {
  const v = trim(value)
  if (!v) return isRequired ? `${label} is required` : ''
  if (v.length < min) return `${label} must be at least ${min} characters`
  if (v.length > max) return `${label} is too long`
  return ''
}

/**
 * @param {Record<string, string>} errors
 * @returns {string} first error message or ''
 */
export function firstError(errors) {
  const values = Object.values(errors || {}).filter(Boolean)
  return values[0] || ''
}

/**
 * Run a map of field -> validator result. Returns only fields with errors.
 * @param {Record<string, string>} checks fieldName -> error message ('' if ok)
 */
export function collectErrors(checks) {
  const errors = {}
  for (const [key, message] of Object.entries(checks)) {
    if (message) errors[key] = message
  }
  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors || {}).length > 0
}
