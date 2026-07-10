import { useEffect, useMemo, useState } from 'react'
import { MaintenanceService } from '../../api/services'
import { Alert, SectionTitle, StatusBadge } from '../../components/ui/Feedback'
import { useToast } from '../../context/ToastContext'
import { getApiErrorMessage } from '../../utils/apiError'

const now = new Date()
const emptyForm = {
  flatNumber: '',
  billingYear: now.getFullYear(),
  billingMonth: now.getMonth() + 1,
  amount: '',
  notes: '',
}

export default function MaintenanceTracker() {
  const toast = useToast()
  const [charges, setCharges] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [flatFilter, setFlatFilter] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    try {
      setCharges(await MaintenanceService.list())
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load maintenance records.'))
    }
  }

  useEffect(() => { load() }, [])

  const flats = useMemo(
    () => [...new Set(charges.map((c) => c.flatNumber))].sort(),
    [charges],
  )

  const filtered = useMemo(
    () => (flatFilter ? charges.filter((c) => c.flatNumber === flatFilter) : charges),
    [charges, flatFilter],
  )

  const byFlat = useMemo(() => {
    const map = {}
    for (const c of filtered) {
      map[c.flatNumber] = map[c.flatNumber] || { pending: 0, paid: 0, count: 0 }
      map[c.flatNumber].count += 1
      if (c.status === 'PENDING') map[c.flatNumber].pending += Number(c.amount)
      else map[c.flatNumber].paid += Number(c.amount)
    }
    return Object.entries(map)
  }, [filtered])

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function payload() {
    return {
      flatNumber: form.flatNumber,
      billingYear: Number(form.billingYear),
      billingMonth: Number(form.billingMonth),
      amount: Number(form.amount),
      notes: form.notes,
    }
  }

  async function submit(action) {
    setError('')
    setBusy(true)
    try {
      if (action === 'PAID') await MaintenanceService.collect(payload())
      else await MaintenanceService.markPending(payload())
      setForm(emptyForm)
      toast.success(action === 'PAID' ? 'Maintenance marked paid.' : 'Maintenance marked pending.')
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Operation failed.'))
    } finally {
      setBusy(false)
    }
  }

  async function togglePaid(charge) {
    try {
      if (charge.status === 'PENDING') {
        await MaintenanceService.markPaid(charge.id)
        toast.success(`Flat ${charge.flatNumber} marked paid.`)
      } else {
        await MaintenanceService.markPending({
          flatNumber: charge.flatNumber,
          billingYear: charge.billingYear,
          billingMonth: charge.billingMonth,
          amount: charge.amount,
          notes: charge.notes,
        })
        toast.info(`Flat ${charge.flatNumber} marked pending.`)
      }
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update status.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="card">
            <SectionTitle title="Record Maintenance" subtitle="Collect or flag dues" />
            <Alert type="error">{error}</Alert>
            <form className="mt-3 space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="label">Flat Number</label>
                <input name="flatNumber" className="input" value={form.flatNumber} onChange={update} required placeholder="A-101" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Year</label>
                  <input name="billingYear" type="number" className="input" value={form.billingYear} onChange={update} />
                </div>
                <div>
                  <label className="label">Month</label>
                  <input name="billingMonth" type="number" min="1" max="12" className="input" value={form.billingMonth} onChange={update} />
                </div>
              </div>
              <div>
                <label className="label">Amount (₹)</label>
                <input name="amount" type="number" className="input" value={form.amount} onChange={update} required />
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <input name="notes" className="input" value={form.notes} onChange={update} />
              </div>
              <div className="flex gap-2">
                <button className="btn-success flex-1" disabled={busy} onClick={() => submit('PAID')}>Mark Paid</button>
                <button className="btn-warning flex-1" disabled={busy} onClick={() => submit('PENDING')}>Mark Pending</button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <SectionTitle
              title="Member-wise summary"
              subtitle="Pending vs paid by flat"
              action={
                <select className="input w-40" value={flatFilter} onChange={(e) => setFlatFilter(e.target.value)}>
                  <option value="">All flats</option>
                  {flats.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {byFlat.map(([flat, stats]) => (
                <button
                  key={flat}
                  type="button"
                  onClick={() => setFlatFilter(flat)}
                  className="rounded-xl border border-slate-100 p-4 text-left hover:border-orange-200"
                >
                  <p className="font-bold text-slate-950">Flat {flat}</p>
                  <p className="mt-2 text-sm text-emerald-700">Paid ₹{stats.paid.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-amber-700">Pending ₹{stats.pending.toLocaleString('en-IN')}</p>
                  <p className="mt-1 text-xs text-slate-400">{stats.count} records</p>
                </button>
              ))}
              {byFlat.length === 0 && <p className="text-sm text-gray-400">No records yet.</p>}
            </div>
          </div>

          <div className="card">
            <SectionTitle title="Maintenance Tracker" subtitle={`${filtered.length} records`} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 pr-4">Flat</th>
                    <th className="py-2 pr-4">Period</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{c.flatNumber}</td>
                      <td className="py-2 pr-4">{c.billingMonth}/{c.billingYear}</td>
                      <td className="py-2 pr-4">₹{Number(c.amount).toLocaleString('en-IN')}</td>
                      <td className="py-2 pr-4"><StatusBadge status={c.status} /></td>
                      <td className="py-2 pr-4">
                        <button onClick={() => togglePaid(c)} className={c.status === 'PENDING' ? 'btn-success' : 'btn-secondary'}>
                          {c.status === 'PENDING' ? 'Mark Paid' : 'Mark Pending'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="5" className="py-6 text-center text-gray-400">No maintenance records yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
