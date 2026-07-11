import { useEffect, useState } from 'react'
import { NoticeService, RuleService } from '../../api/services'
import { Alert, SectionTitle } from '../../components/ui/Feedback'
import { useToast } from '../../context/ToastContext'
import { getApiErrorMessage } from '../../utils/apiError'
import { buildNoticeWhatsAppText, formatNoticeDate, whatsappLink } from '../../utils/share'

export default function NoticeBoard() {
  const toast = useToast()
  const [notices, setNotices] = useState([])
  const [rules, setRules] = useState([])
  const [noticeForm, setNoticeForm] = useState({ title: '', body: '', priority: 'NORMAL' })
  const [ruleForm, setRuleForm] = useState({ category: '', title: '', ruleText: '' })
  const [error, setError] = useState('')

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
    try {
      await NoticeService.create(noticeForm)
      setNoticeForm({ title: '', body: '', priority: 'NORMAL' })
      toast.success('Notice posted.')
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not post notice.'))
    }
  }

  async function postRule(e) {
    e.preventDefault()
    setError('')
    try {
      await RuleService.create(ruleForm)
      setRuleForm({ category: '', title: '', ruleText: '' })
      toast.success('Rule added.')
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not add rule.'))
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
          <form onSubmit={postNotice} className="space-y-3">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input"
                rows="3"
                value={noticeForm.body}
                onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })}
                required
              />
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
          <form onSubmit={postRule} className="space-y-3">
            <div>
              <label className="label">Category</label>
              <input
                className="input"
                value={ruleForm.category}
                onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                required
                placeholder="Parking, Pets, Noise…"
              />
            </div>
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={ruleForm.title}
                onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Rule Text</label>
              <textarea
                className="input"
                rows="3"
                value={ruleForm.ruleText}
                onChange={(e) => setRuleForm({ ...ruleForm, ruleText: e.target.value })}
                required
              />
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
                <div className="mt-3">
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
