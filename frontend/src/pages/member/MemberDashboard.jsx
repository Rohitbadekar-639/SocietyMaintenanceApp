import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  AuditDocumentService,
  BankAccountService,
  CommitteeService,
  MaintenanceService,
  NoticeService,
  PaymentClaimService,
  RuleService,
} from '../../api/services'
import { Alert, SectionTitle, StatusBadge } from '../../components/ui/Feedback'
import { getApiErrorMessage } from '../../utils/apiError'
import { monthName, whatsappLink } from '../../utils/share'
import { Link } from 'react-router-dom'

export default function MemberDashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [charges, setCharges] = useState([])
  const [notices, setNotices] = useState([])
  const [rules, setRules] = useState([])
  const [accounts, setAccounts] = useState([])
  const [committee, setCommittee] = useState([])
  const [docs, setDocs] = useState([])
  const [claims, setClaims] = useState([])
  const [claimForm, setClaimForm] = useState({ chargeId: '', paymentMode: 'BANK_TRANSFER', referenceNumber: '', notes: '' })
  const [error, setError] = useState('')

  async function load() {
    try {
      const [c, n, r, a, com, d, cl] = await Promise.all([
        MaintenanceService.list(),
        NoticeService.list(),
        RuleService.list(),
        BankAccountService.list(),
        CommitteeService.list(),
        AuditDocumentService.list(),
        PaymentClaimService.list(),
      ])
      setCharges(c.filter((x) => x.flatNumber === user?.flatNumber))
      setNotices(n)
      setRules(r)
      setAccounts(a)
      setCommittee(com)
      setDocs(d)
      setClaims(cl)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load member workspace.'))
    }
  }

  useEffect(() => { if (user) load() }, [user])

  const pending = charges.filter((c) => c.status === 'PENDING')

  async function submitClaim(e) {
    e.preventDefault()
    try {
      await PaymentClaimService.submit(claimForm)
      setClaimForm({ chargeId: '', paymentMode: 'BANK_TRANSFER', referenceNumber: '', notes: '' })
      toast.success('Payment claim sent to committee for verification.')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not submit payment claim.'))
    }
  }

  function notifyAdminWhatsApp(charge) {
    const text = [
      `Hello Committee,`,
      `I have paid maintenance for flat ${user?.flatNumber}.`,
      `Period: ${charge.billingMonth}/${charge.billingYear}`,
      `Amount: ₹${Number(charge.amount).toLocaleString('en-IN')}`,
      `Please verify and mark as paid.`,
      `- ${user?.fullName}`,
    ].join('\n')
    window.open(whatsappLink(text), '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Member Dashboard</h1>
        <p className="text-sm text-gray-500">{user?.fullName} · Flat {user?.flatNumber} · view-only access</p>
      </div>

      <Alert type="error">{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-sm text-gray-500">Pending Dues</p><p className="mt-1 text-2xl font-bold text-amber-600">{pending.length}</p></div>
        <div className="card"><p className="text-sm text-gray-500">My Records</p><p className="mt-1 text-2xl font-bold">{charges.length}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Notices</p><p className="mt-1 text-2xl font-bold text-orange-600">{notices.length}</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <SectionTitle title="My Maintenance" subtitle="Notify committee after you pay" />
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 pr-4">Period</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{c.billingMonth}/{c.billingYear}</td>
                  <td className="py-2 pr-4">₹{Number(c.amount).toLocaleString('en-IN')}</td>
                  <td className="py-2 pr-4"><StatusBadge status={c.status} /></td>
                  <td className="py-2 pr-4">
                    {c.status === 'PENDING' && (
                      <button type="button" className="btn-secondary !py-1.5 !text-xs" onClick={() => notifyAdminWhatsApp(c)}>WhatsApp admin</button>
                    )}
                  </td>
                </tr>
              ))}
              {charges.length === 0 && <tr><td colSpan="4" className="py-6 text-center text-gray-400">No maintenance records.</td></tr>}
            </tbody>
          </table>

          {pending.length > 0 && (
            <form onSubmit={submitClaim} className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">I have paid — notify committee</p>
              <select className="input" value={claimForm.chargeId} onChange={(e) => setClaimForm({ ...claimForm, chargeId: e.target.value })} required>
                <option value="">Select pending charge</option>
                {pending.map((c) => (
                  <option key={c.id} value={c.id}>{c.billingMonth}/{c.billingYear} · ₹{Number(c.amount).toLocaleString('en-IN')}</option>
                ))}
              </select>
              <input className="input" placeholder="UTR / reference number" value={claimForm.referenceNumber} onChange={(e) => setClaimForm({ ...claimForm, referenceNumber: e.target.value })} />
              <input className="input" placeholder="Notes (optional)" value={claimForm.notes} onChange={(e) => setClaimForm({ ...claimForm, notes: e.target.value })} />
              <button className="btn-primary w-full">Submit payment claim</button>
            </form>
          )}
        </div>

        <div className="card">
          <SectionTitle title="Society bank accounts" subtitle="Pay here — online payment coming later" />
          <div className="space-y-3">
            {accounts.map((a) => (
              <article key={a.id} className="rounded-xl border border-slate-100 p-4">
                <p className="font-bold">{a.accountName}{a.primaryAccount ? ' · Primary' : ''}</p>
                <p className="mt-1 text-sm text-slate-600">{a.bankName}</p>
                <p className="mt-2 text-sm">A/C {a.accountNumber}</p>
                <p className="text-sm">IFSC {a.ifscCode}</p>
                {a.upiId && <p className="text-sm">UPI {a.upiId}</p>}
              </article>
            ))}
            {accounts.length === 0 && <p className="text-sm text-gray-400">Committee has not published bank details yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <SectionTitle title="Committee contacts" />
          <ul className="space-y-3">
            {committee.map((m) => (
              <li key={m.id} className="rounded-xl border border-slate-100 p-3">
                <p className="font-semibold">{m.fullName}</p>
                <p className="text-xs uppercase tracking-wide text-orange-600">{m.title.replaceAll('_', ' ')}</p>
                <p className="mt-1 text-sm text-slate-600">{m.mobile || '—'}{m.email ? ` · ${m.email}` : ''}</p>
              </li>
            ))}
            {committee.length === 0 && <p className="text-sm text-gray-400">No committee contacts published.</p>}
          </ul>
        </div>

        <div className="card">
          <SectionTitle title="Audit reports" subtitle="View / download only" action={<Link to="/reports" className="text-sm font-bold text-orange-600">Financial reports →</Link>} />
          <ul className="space-y-3">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3">
                <div>
                  <p className="font-semibold">{doc.title}</p>
                  <p className="text-xs text-slate-500">{doc.periodType} · {doc.periodMonth ? `${monthName(doc.periodMonth)} ` : ''}{doc.periodYear}</p>
                </div>
                <a className="btn-secondary !py-1.5 !text-xs" href={doc.documentUrl} target="_blank" rel="noreferrer">Download</a>
              </li>
            ))}
            {docs.length === 0 && <p className="text-sm text-gray-400">No audit files yet.</p>}
          </ul>
        </div>
      </div>

      <div className="card">
        <SectionTitle title="My payment claims" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Reference</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-2 pr-4">₹{Number(c.amount).toLocaleString('en-IN')}</td>
                <td className="py-2 pr-4">{c.referenceNumber || '—'}</td>
                <td className="py-2 pr-4"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
            {claims.length === 0 && <tr><td colSpan="3" className="py-6 text-center text-gray-400">No claims yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <SectionTitle title="Latest Notices" />
          <ul className="space-y-3">
            {notices.slice(0, 5).map((n) => (
              <li key={n.id} className="rounded-lg border border-gray-100 p-3">
                <h4 className="font-semibold">{n.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{n.body}</p>
              </li>
            ))}
            {notices.length === 0 && <p className="text-sm text-gray-400">No notices yet.</p>}
          </ul>
        </div>
        <div className="card">
          <SectionTitle title="Society Rules" />
          <ul className="grid gap-3">
            {rules.map((r) => (
              <li key={r.id} className="rounded-lg border border-gray-100 p-3">
                <span className="badge bg-orange-50 text-orange-700">{r.category}</span>
                <h4 className="mt-1 font-semibold">{r.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{r.ruleText}</p>
              </li>
            ))}
            {rules.length === 0 && <p className="text-sm text-gray-400">No rules yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}
