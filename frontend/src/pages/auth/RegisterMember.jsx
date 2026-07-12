import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Alert } from '../../components/ui/Feedback'
import AuthShell from '../../components/AuthShell'
import { getApiErrorMessage } from '../../utils/apiError'
import {
  collectErrors,
  email,
  firstError,
  flatNumber,
  hasErrors,
  mobile,
  personName,
  societyCode,
  signupPassword,
  SIGNUP_PASSWORD_HINT,
} from '../../utils/validation'

const initial = {
  societyCode: '',
  fullName: '',
  email: '',
  mobile: '',
  flatNumber: '',
  password: '',
}

export default function RegisterMember() {
  const { registerMember, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const errors = collectErrors({
      societyCode: societyCode(form.societyCode),
      fullName: personName(form.fullName),
      email: email(form.email),
      mobile: mobile(form.mobile),
      flatNumber: flatNumber(form.flatNumber),
      password: signupPassword(form.password),
    })
    setFieldErrors(errors)
    if (hasErrors(errors)) {
      setError(firstError(errors))
      return
    }
    try {
      await registerMember({
        societyCode: form.societyCode.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim().replace(/\s+/g, ''),
        flatNumber: form.flatNumber.trim(),
        password: form.password,
      })
      navigate('/member')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create member account.'))
    }
  }

  return (
    <AuthShell
      step="Join your society"
      title="Member signup"
      description="Use your society code from the committee. Members can view records and notify payments — only admins can change data."
    >
      <div className="space-y-5">
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label">Society code</label>
            <input name="societyCode" className="input" value={form.societyCode} onChange={update} placeholder="e.g. SGR-MUMBAI" maxLength={40} />
            {fieldErrors.societyCode && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.societyCode}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input name="fullName" className="input" value={form.fullName} onChange={update} maxLength={120} />
              {fieldErrors.fullName && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.fullName}</p>}
            </div>
            <div>
              <label className="label">Flat number</label>
              <input name="flatNumber" className="input" value={form.flatNumber} onChange={update} maxLength={30} />
              {fieldErrors.flatNumber && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.flatNumber}</p>}
            </div>
            <div>
              <label className="label">Mobile</label>
              <input name="mobile" className="input" value={form.mobile} onChange={update} inputMode="numeric" placeholder="10-digit mobile" maxLength={10} />
              {fieldErrors.mobile && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.mobile}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" value={form.email} onChange={update} />
              {fieldErrors.email && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.email}</p>}
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" className="input" value={form.password} onChange={update} autoComplete="new-password" placeholder="e.g. Member@123" />
            <p className="mt-1 text-xs text-slate-500">{SIGNUP_PASSWORD_HINT}</p>
            {fieldErrors.password && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.password}</p>}
          </div>
          <button className="btn-primary w-full !bg-orange-500 !py-3 hover:!bg-orange-600" disabled={loading}>
            {loading ? 'Creating account…' : 'Create member account'}
          </button>
        </form>
        <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700">Sign in</Link>
          {' · '}
          <Link to="/forgot-password" className="font-bold text-orange-600 hover:text-orange-700">Forgot password</Link>
          <br />
          Committee admin?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700">Register a society</Link>
        </p>
      </div>
    </AuthShell>
  )
}
