import { useEffect, useState } from 'react'
import { NoticeService, RuleService } from '../../api/services'
import { Alert, SectionTitle } from '../../components/ui/Feedback'
import { useToast } from '../../context/ToastContext'
import { getApiErrorMessage } from '../../utils/apiError'
import { buildNoticeWhatsAppText, formatNoticeDate, whatsappLink } from '../../utils/share'
import { collectErrors, firstError, hasErrors, text } from '../../utils/validation'

export default function NoticeBoard() {
  const toast = useToast()
  const [notices, setNotices] = useState([])
  const [rules, setRules] = useState([])
  const [noticeForm, setNoticeForm] = useState({ title: '', body: '', priority: 'NORMAL' })
  const [ruleForm, setRuleForm] = useState({ category: '', title: '', ruleText: '' })
  const [noticeFieldErrors, setNoticeFieldErrors] = useState({})
  const [ruleFieldErrors, setRuleFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [notifyBusy, setNotifyBusy] = useState('')

  async function load() {
    try {
      const [n, r] = await Promise.all([NoticeService.list(), RuleService.list()])
      setNotices(n)
      setRules(r)
    } catch {
      setError('Could not load notices/rules.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function postNotice(e) {
    e.preventDefault()
    setError('')
    const errors = collectErrors({
      title: text(noticeForm.title, 'Title', { min: 3, max: 250 }),
      body: text(noticeForm.body, 'Message', { min: 3, max: 4000 }),
    })
    setNoticeFieldErrors(errors)
    if (hasErrors(errors)) {
      setError(firstError(errors))
      return
    }
    try {
      await NoticeService.create({
        title: noticeForm.title.trim(),
        body: noticeForm.body.trim(),
        priority: noticeForm.priority,
      })
      setNoticeForm({ title: '', body: '', priority: 'NORMAL' })
      setNoticeFieldErrors({})
      toast.success('Notice posted. Use Notify members when ready.')
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not post notice.'))
    }
  }

  async function postRule(e) {
    e.preventDefault()
    setError('')
    const errors = collectErrors({
      category: text(ruleForm.category, 'Category', { min: 2, max: 80 }),
      title: text(ruleForm.title, 'Title', { min: 3, max: 250 }),
      ruleText: text(ruleForm.ruleText, 'Rule text', { min: 3, max: 4000 }),
    })
    setRuleFieldErrors(errors)
    if (hasErrors(errors)) {
      setError(firstError(errors))
      return
    }
    try {
      await RuleService.create({
        category: ruleForm.category.trim(),
        title: ruleForm.title.trim(),
        ruleText: ruleForm.ruleText.trim(),
      })
      setRuleForm({ category: '', title: '', ruleText: '' })
      setRuleFieldErrors({})
      toast.success('Rule added.')
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not add rule.'))
    }
  }

  async function notifyMembers(notice) {
    setNotifyBusy(notice.id)
    setError('')
    try {
      await NoticeService.notify(notice.id)
      toast.success('Members notified. They will see a notice badge on their dashboard.')
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not notify members.'))
    } finally {
      setNotifyBusy('')
    }
  }

  function shareNoticeWhatsApp(notice) {
    window.open(whatsappLink(buildNoticeWhatsAppText(notice)), '_blank', 'noopener,noreferrer')
  }

  const priorityColor = {
    URGENT: 'bg-red-100 text-red-700',
    HIGH: 'bg-amber-100 text-amber-700',
    NORMAL: 'bg-sky-50 text-sky-700',
    LOW: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-6">
      <Alert type="error">{error}</Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <SectionTitle title="Post Announcement" subtitle="Broadcast to all members" />
          <form onSubmit={postNotice} className="space-y-3" noValidate>
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                maxLength={250}
              />
              {noticeFieldErrors.title && <p className="mt-1 text-xs font-medium text-red-600">{noticeFieldErrors.title}</p>}
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input"
                rows="3"
                value={noticeForm.body}
                onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })}
                maxLength={4000}
              />
              {noticeFieldErrors.body && <p className="mt-1 text-xs font-medium text-red-600">{noticeFieldErrors.body}</p>}
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={noticeForm.priority}
                onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
              >
                {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary w-full">Post Notice</button>
          </form>
        </div>

        <div className="card">
          <SectionTitle title="Add Rule" subtitle="Society rules & bylaws" />
          <form onSubmit={postRule} className="space-y-3" noValidate>
            <div>
              <label className="label">Category</label>
              <input
                className="input"
                value={ruleForm.category}
                onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                placeholder="Parking, Pets, Noise…"
                maxLength={80}
              />
              {ruleFieldErrors.category && <p className="mt-1 text-xs font-medium text-red-600">{ruleFieldErrors.category}</p>}
            </div>
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={ruleForm.title}
                onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                maxLength={250}
              />
              {ruleFieldErrors.title && <p className="mt-1 text-xs font-medium text-red-600">{ruleFieldErrors.title}</p>}
            </div>
            <div>
              <label className="label">Rule Text</label>
              <textarea
                className="input"
                rows="3"
                value={ruleForm.ruleText}
                onChange={(e) => setRuleForm({ ...ruleForm, ruleText: e.target.value })}
                maxLength={4000}
              />
              {ruleFieldErrors.ruleText && <p className="mt-1 text-xs font-medium text-red-600">{ruleFieldErrors.ruleText}</p>}
            </div>
            <button className="btn-primary w-full">Add Rule</button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <SectionTitle title="Notice Board" subtitle={`${notices.length} notices`} />
          <ul className="space-y-3">
            {notices.map((n) => (
              <li key={n.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-950">{n.title}</h4>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {formatNoticeDate(n.createdAt)}
                      {n.createdByName ? ` · ${n.createdByName}` : ''}
                    </p>
                  </div>
                  <span className={`badge shrink-0 ${priorityColor[n.priority] || ''}`}>{n.priority}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{n.body}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {n.notifiedAt ? (
                    <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                      Members notified
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary !py-1.5 !text-xs"
                      disabled={notifyBusy === n.id}
                      onClick={() => notifyMembers(n)}
                    >
                      {notifyBusy === n.id ? 'Notifying…' : 'Notify members'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-success !py-1.5 !text-xs"
                    onClick={() => shareNoticeWhatsApp(n)}
                  >
                    Share on WhatsApp
                  </button>
                </div>
              </li>
            ))}
            {notices.length === 0 && <p className="text-sm text-gray-400">No notices yet.</p>}
          </ul>
        </div>

        <div className="card">
          <SectionTitle title="Society Rules" subtitle={`${rules.length} rules`} />
          <ul className="space-y-3">
            {rules.map((r) => (
              <li key={r.id} className="rounded-xl border border-slate-100 p-4">
                <span className="badge bg-orange-50 text-orange-700">{r.category}</span>
                <h4 className="mt-2 font-semibold text-slate-950">{r.title}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">{r.ruleText}</p>
              </li>
            ))}
            {rules.length === 0 && <p className="text-sm text-gray-400">No rules yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}
