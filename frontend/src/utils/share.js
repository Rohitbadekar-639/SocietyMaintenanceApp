const monthNames = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function monthName(m) {
  return monthNames[m] || m
}

export function inr(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

/**
 * Build a WhatsApp deep link. Passing no phone number opens WhatsApp's
 * contact chooser, so the sender never has to save a contact number.
 * Optionally pass a phone (with country code, digits only) to target a chat.
 */
export function whatsappLink(text, phone) {
  const encoded = encodeURIComponent(text)
  return phone
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`
}

export function buildMonthlyReportText(society, report) {
  const lines = [
    `*${society || 'Society'} — Monthly Report*`,
    `Period: ${monthName(report.month)} ${report.year}`,
    '',
    `Maintenance Collected: ${inr(report.maintenanceCollected)}`,
    `Maintenance Pending: ${inr(report.maintenancePending)}`,
    `Total Expenses: ${inr(report.totalExpenses)}`,
    `Net (Surplus/Deficit): ${inr(report.netSurplusDeficit)}`,
  ]
  if (report.expenseBreakdown?.length) {
    lines.push('', '*Expense Breakdown:*')
    report.expenseBreakdown.forEach((c) => lines.push(`- ${c.category}: ${inr(c.amount)}`))
  }
  lines.push('', 'Shared via SocietyWale')
  return lines.join('\n')
}

export function buildAnnualReportText(society, sheet) {
  return [
    `*${society || 'Society'} — Annual Balance Sheet ${sheet.year}*`,
    '',
    `Opening Balance: ${inr(sheet.openingBalance)}`,
    `Total Income: ${inr(sheet.totalIncome)}`,
    `Total Expenses: ${inr(sheet.totalExpenses)}`,
    `Closing Balance: ${inr(sheet.closingBalance)}`,
    `Outstanding Dues: ${inr(sheet.pendingDues)}`,
    '',
    'Shared via SocietyWale',
  ].join('\n')
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadReportAsPdf(title, bodyHtml) {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!win) return
  win.document.write(`<!doctype html><html><head><title>${title}</title>
    <style>
      body{font-family:Segoe UI,Arial,sans-serif;padding:32px;color:#0f172a}
      h1{font-size:22px;margin:0 0 8px} p{color:#64748b}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border-bottom:1px solid #e2e8f0;padding:8px;text-align:left}
      .right{text-align:right}
    </style></head><body>
    <h1>${title}</h1>
    <p>SocietyWale financial report · ${new Date().toLocaleString()}</p>
    ${bodyHtml}
    <script>window.onload=()=>{window.print()}</script>
    </body></html>`)
  win.document.close()
}
