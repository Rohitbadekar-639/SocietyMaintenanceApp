import { useEffect, useState } from 'react'
import { PaymentClaimService } from '../../api/services'
import { Alert, SectionTitle, StatusBadge } from '../../components/ui/Feedback'
import { useToast } from '../../context/ToastContext'
import { getApiErrorMessage } from '../../utils/apiError'
import { whatsappLink } from '../../utils/share'

export default function PaymentClaims() {
  const toast = useToast()
  const [claims, setClaims] = useState([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('SUBMITTED')

  async function load() {
    try {
      setClaims(await PaymentClaimService.list(filter || undefined))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load payment claims.'))
    }
  }

  useEffect(() => { load() }, [filter])

  async function review(id, decision) {
    try {
      await PaymentClaimService.review(id, { decision, paymentMode: 'BANK_TRANSFER' })
      toast.success(decision === 'APPROVED' ? 'Marked paid after verification.' : 'Claim rejected.')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not review claim.'))
    }
  }

  function shareWhatsApp(claim) {
    const text = [
      `Payment verification request`,
      `Member: ${claim.memberName}`,
      `Flat: ${claim.flatNumber}`,
      `Amount: ₹${Number(claim.amount).toLocaleString('en-IN')}`,
      `Mode: ${claim.paymentMode || '—'}`,
      `Reference: ${claim.referenceNumber || '—'}`,
      `Notes: ${claim.notes || '—'}`,
    ].join('\n')
    window.open(whatsappLink(text), '_blank')
  }

  return (
    <div className="card">
      <SectionTitle
        title="Payment claims"
        subtitle="Members notify after paying. Verify in bank, then approve."
        action={
          <select className="input w-40" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="">All</option>
          </select>
        }
      />
      <Alert type="error">{error}</Alert>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Member</th>
              <th className="py-2 pr-4">Flat</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Reference</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-2 pr-4">{c.memberName}</td>
                <td className="py-2 pr-4">{c.flatNumber}</td>
                <td className="py-2 pr-4">₹{Number(c.amount).toLocaleString('en-IN')}</td>
                <td className="py-2 pr-4">{c.referenceNumber || '—'}<div className="text-xs text-slate-400">{c.paymentMode}</div></td>
                <td className="py-2 pr-4"><StatusBadge status={c.status} /></td>
                <td className="py-2 pr-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary !py-1.5 !text-xs" onClick={() => shareWhatsApp(c)}>WhatsApp</button>
                    {c.status === 'SUBMITTED' && (
                      <>
                        <button type="button" className="btn-success !py-1.5 !text-xs" onClick={() => review(c.id, 'APPROVED')}>Approve</button>
                        <button type="button" className="btn-warning !py-1.5 !text-xs" onClick={() => review(c.id, 'REJECTED')}>Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr><td colSpan="6" className="py-6 text-center text-gray-400">No claims in this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
