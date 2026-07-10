import { useState } from 'react'
import { ReportService } from '../../api/services'
import { Alert, SectionTitle } from '../../components/ui/Feedback'
import { useToast } from '../../context/ToastContext'
import { getApiErrorMessage } from '../../utils/apiError'
import {
  inr,
  monthName,
  whatsappLink,
  buildMonthlyReportText,
  buildAnnualReportText,
  downloadTextFile,
  downloadReportAsPdf,
} from '../../utils/share'

const now = new Date()

export default function FinancialReports() {
  const toast = useToast()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [openingBalance, setOpeningBalance] = useState(0)
  const [monthly, setMonthly] = useState(null)
  const [annual, setAnnual] = useState(null)
  const [error, setError] = useState('')

  async function loadMonthly() {
    setError('')
    try {
      setMonthly(await ReportService.monthly(year, month))
      toast.success('Monthly report generated.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load monthly report.'))
    }
  }

  async function loadAnnual() {
    setError('')
    try {
      setAnnual(await ReportService.annual(year, openingBalance))
      toast.success('Annual report generated.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load annual report.'))
    }
  }

  function shareMonthly() {
    window.open(whatsappLink(buildMonthlyReportText('SocietyWale Society', monthly)), '_blank')
  }

  function shareAnnual() {
    window.open(whatsappLink(buildAnnualReportText('SocietyWale Society', annual)), '_blank')
  }

  function downloadMonthly() {
    const text = buildMonthlyReportText('SocietyWale Society', monthly)
    downloadTextFile(`monthly-report-${monthly.year}-${monthly.month}.txt`, text)
    downloadReportAsPdf(
      `Monthly Report — ${monthName(monthly.month)} ${monthly.year}`,
      `<table>
        <tr><td>Collected</td><td class="right">${inr(monthly.maintenanceCollected)}</td></tr>
        <tr><td>Pending</td><td class="right">${inr(monthly.maintenancePending)}</td></tr>
        <tr><td>Expenses</td><td class="right">${inr(monthly.totalExpenses)}</td></tr>
        <tr><td>Net</td><td class="right">${inr(monthly.netSurplusDeficit)}</td></tr>
      </table>`,
    )
    toast.success('Download started. Use Print → Save as PDF if needed.')
  }

  function downloadAnnual() {
    const text = buildAnnualReportText('SocietyWale Society', annual)
    downloadTextFile(`annual-report-${annual.year}.txt`, text)
    const rows = (annual.monthlyLines || [])
      .map((l) => `<tr><td>${monthName(l.month)}</td><td class="right">${inr(l.income)}</td><td class="right">${inr(l.expenses)}</td><td class="right">${inr(l.net)}</td></tr>`)
      .join('')
    downloadReportAsPdf(
      `Annual Balance Sheet — ${annual.year}`,
      `<table>
        <tr><td>Opening</td><td class="right">${inr(annual.openingBalance)}</td></tr>
        <tr><td>Income</td><td class="right">${inr(annual.totalIncome)}</td></tr>
        <tr><td>Expenses</td><td class="right">${inr(annual.totalExpenses)}</td></tr>
        <tr><td>Closing</td><td class="right">${inr(annual.closingBalance)}</td></tr>
      </table>
      <table><thead><tr><th>Month</th><th class="right">Income</th><th class="right">Expenses</th><th class="right">Net</th></tr></thead><tbody>${rows}</tbody></table>`,
    )
    toast.success('Download started. Use Print → Save as PDF if needed.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <p className="text-sm text-gray-500">Download reports or share on WhatsApp. Members can view; admins manage source data.</p>
      </div>

      <Alert type="error">{error}</Alert>

      <div className="card">
        <SectionTitle title="Report Filters" />
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Year</label>
            <input type="number" className="input w-28" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Month</label>
            <select className="input w-40" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{monthName(m)}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={loadMonthly}>Generate Monthly</button>
          <div>
            <label className="label">Opening Balance (₹)</label>
            <input type="number" className="input w-40" value={openingBalance} onChange={(e) => setOpeningBalance(Number(e.target.value))} />
          </div>
          <button className="btn-secondary" onClick={loadAnnual}>Generate Annual</button>
        </div>
      </div>

      {monthly && (
        <div className="card">
          <SectionTitle
            title={`Monthly Income-Expense — ${monthName(monthly.month)} ${monthly.year}`}
            action={
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary" onClick={downloadMonthly}>Download</button>
                <button className="btn-success" onClick={shareMonthly}>Share on WhatsApp</button>
              </div>
            }
          />
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Collected" value={inr(monthly.maintenanceCollected)} tone="text-emerald-600" />
            <Stat label="Pending" value={inr(monthly.maintenancePending)} tone="text-amber-600" />
            <Stat label="Expenses" value={inr(monthly.totalExpenses)} tone="text-red-600" />
            <Stat label="Net" value={inr(monthly.netSurplusDeficit)} tone={monthly.netSurplusDeficit >= 0 ? 'text-emerald-600' : 'text-red-600'} />
          </div>
          {monthly.expenseBreakdown?.length > 0 && (
            <>
              <h3 className="mb-2 mt-6 text-sm font-semibold text-gray-700">Expense Breakdown</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2">Category</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.expenseBreakdown.map((c) => (
                    <tr key={c.category} className="border-b last:border-0">
                      <td className="py-2">{c.category}</td>
                      <td className="py-2 text-right">{inr(c.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {annual && (
        <div className="card">
          <SectionTitle
            title={`Annual Balance Sheet — ${annual.year}`}
            action={
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary" onClick={downloadAnnual}>Download</button>
                <button className="btn-success" onClick={shareAnnual}>Share on WhatsApp</button>
              </div>
            }
          />
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Opening" value={inr(annual.openingBalance)} />
            <Stat label="Income" value={inr(annual.totalIncome)} tone="text-emerald-600" />
            <Stat label="Expenses" value={inr(annual.totalExpenses)} tone="text-red-600" />
            <Stat label="Closing" value={inr(annual.closingBalance)} tone={annual.closingBalance >= 0 ? 'text-emerald-600' : 'text-red-600'} />
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-4">Month</th>
                  <th className="py-2 pr-4 text-right">Income</th>
                  <th className="py-2 pr-4 text-right">Expenses</th>
                  <th className="py-2 pr-4 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {annual.monthlyLines.map((l) => (
                  <tr key={l.month} className="border-b last:border-0">
                    <td className="py-2 pr-4">{monthName(l.month)}</td>
                    <td className="py-2 pr-4 text-right text-emerald-600">{inr(l.income)}</td>
                    <td className="py-2 pr-4 text-right text-red-600">{inr(l.expenses)}</td>
                    <td className="py-2 pr-4 text-right font-medium">{inr(l.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone = 'text-gray-900' }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${tone}`}>{value}</p>
    </div>
  )
}
