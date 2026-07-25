import { useState } from 'react'
import { SocietyAiService } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../utils/apiError'
import { AiLanguageSelect } from './AiLanguageSelect'

/**
 * AI notice writer — fills title/body/priority into the notice form.
 */
export default function NoticeAiWriter({ onApply, disabled = false }) {
  const { user } = useAuth()
  const toast = useToast()
  const [language, setLanguage] = useState('en')
  const [topic, setTopic] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setError('')
    const brief = topic.trim()
    if (brief.length < 5) {
      setError('Describe the notice in at least a few words.')
      return
    }
    setBusy(true)
    try {
      const res = await SocietyAiService.noticeDraft({
        language,
        societyName: user?.societyName || 'Society',
        topic: brief,
        priorityHint: '',
      })
      onApply?.({
        title: res.title || '',
        body: res.body || '',
        priority: res.priority || 'NORMAL',
      })
      toast.success('Notice draft applied — review and post.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not generate notice draft.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-4 min-w-0 max-w-full rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-3 sm:p-4">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-teal-700">AI notice writer</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">Draft in English / Hindi / Marathi, then edit before posting.</p>
      </div>
      <div className="mt-3 space-y-3">
        <div className="min-w-0">
          <label className="label" htmlFor="notice-ai-topic">What is this notice about?</label>
          <textarea
            id="notice-ai-topic"
            className="input min-h-[4.5rem] w-full max-w-full"
            rows={2}
            maxLength={800}
            disabled={disabled || busy}
            placeholder="e.g. Water tank cleaning on Sunday 10am–1pm, keep buckets ready"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="label" htmlFor="notice-ai-lang">Language</label>
            <AiLanguageSelect id="notice-ai-lang" value={language} onChange={setLanguage} disabled={disabled || busy} />
          </div>
          <button
            type="button"
            className="btn-primary w-full shrink-0 !bg-teal-700 hover:!bg-teal-800 sm:w-auto"
            disabled={disabled || busy}
            onClick={generate}
          >
            {busy ? 'Writing…' : 'Generate draft'}
          </button>
        </div>
        {error && <p className="text-xs font-medium text-red-600 break-words">{error}</p>}
      </div>
    </div>
  )
}
