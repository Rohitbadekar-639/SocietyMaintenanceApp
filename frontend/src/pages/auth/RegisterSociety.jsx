import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Alert } from '../../components/ui/Feedback'
import AuthShell from '../../components/AuthShell'
import {
  collectErrors,
  email,
  firstError,
  hasErrors,
  mobile,
  personName,
  societyCode,
  text,
  signupPassword,
  SIGNUP_PASSWORD_HINT,
} from '../../utils/validation'

const initial = {
  societyName: '',
  societyCode: '',
  address: '',
  city: '',
  adminName: '',
  adminEmail: '',
  adminMobile: '',
  password: '',
}

export default function RegisterSociety() {
  const { registerSociety, loading } = useAuth()
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
      societyName: text(form.societyName, 'Society name', { min: 2, max: 150 }),
      societyCode: societyCode(form.societyCode),
      address: text(form.address, 'Address', { required: false, max: 250 }),
      city: text(form.city, 'City', { required: false, max: 100 }),
      adminName: personName(form.adminName, 'Full name'),
      adminEmail: email(form.adminEmail),
      adminMobile: mobile(form.adminMobile),
      password: signupPassword(form.password),
    })
    setFieldErrors(errors)
    if (hasErrors(errors)) {
      setError(firstError(errors))
      return
    }
    try {
      await registerSociety({
        ...form,
        societyName: form.societyName.trim(),
        societyCode: form.societyCode.trim(),
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminMobile: form.adminMobile.trim().replace(/\s+/g, ''),
      })
      navigate('/admin')
    } catch (err) {
      if (!err.response) {
        setError('The authentication service is offline. Please try again shortly.')
      } else {
        setError(err.response.data?.message || 'Registration could not be completed. Please review the details and try again.')
      }
    }
  }

  return (
    <AuthShell step="Set up your workspace" title="Create your society account" description="Start with your society details and the first committee administrator. You can add members after setup.">
      <div className="space-y-5">
        <Alert type="error">{error}</Alert>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-sm font-bold text-slate-900">1. Society details</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">Use a short, unique code your committee can recognise.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Society Name</label>
              <input name="societyName" className="input" value={form.societyName} onChange={update} placeholder="e.g. Shree Ganesh Residency" maxLength={150} />
              {fieldErrors.societyName && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.societyName}</p>}
            </div>
            <div>
              <label className="label">Society Code</label>
              <input name="societyCode" className="input" value={form.societyCode} onChange={update} placeholder="SGR-PUNE" maxLength={40} />
              {fieldErrors.societyCode && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.societyCode}</p>}
            </div>
            <div>
              <label className="label">Address</label>
              <input name="address" className="input" value={form.address} onChange={update} maxLength={250} />
              {fieldErrors.address && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.address}</p>}
            </div>
            <div>
              <label className="label">City</label>
              <input name="city" className="input" value={form.city} onChange={update} maxLength={100} />
              {fieldErrors.city && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.city}</p>}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">2. Committee administrator</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">This account will manage members, maintenance, expenses and notices.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full Name</label>
              <input name="adminName" className="input" value={form.adminName} onChange={update} maxLength={120} />
              {fieldErrors.adminName && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.adminName}</p>}
            </div>
            <div>
              <label className="label">Mobile</label>
              <input name="adminMobile" className="input" value={form.adminMobile} onChange={update} inputMode="numeric" placeholder="10-digit mobile" maxLength={10} />
              {fieldErrors.adminMobile && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.adminMobile}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input name="adminEmail" type="email" className="input" value={form.adminEmail} onChange={update} />
              {fieldErrors.adminEmail && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.adminEmail}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" className="input" value={form.password} onChange={update} autoComplete="new-password" placeholder="e.g. Society@123" />
              <p className="mt-1 text-xs text-slate-500">{SIGNUP_PASSWORD_HINT}</p>
              {fieldErrors.password && <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.password}</p>}
            </div>
          </div>

          <button className="btn-primary w-full !bg-orange-500 !py-3 hover:!bg-orange-600" disabled={loading}>
            {loading ? 'Creating workspace…' : 'Create SocietyWale Workspace →'}
          </button>
        </form>

        <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700">
            Sign in to your workspace
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
