/**
 * Shared maintenance period math — keep Analytics and Maintenance Tracker in sync.
 * Pass **active** members only. Pending includes flats with no charge row yet
 * ("Not recorded yet"), same as the tracker UI. Inactive members are excluded by callers.
 */

export function normalizeFlat(value) {
  return String(value || '').trim().toLowerCase()
}

export function periodKey(year, month) {
  return Number(year) * 100 + Number(month)
}

/** Latest society rate whose effective-from is on or before the target period. */
export function effectiveAmountFor(rates, year, month) {
  const target = periodKey(year, month)
  const applicable = (rates || [])
    .filter((r) => periodKey(r.effectiveFromYear, r.effectiveFromMonth) <= target)
    .sort(
      (a, b) =>
        periodKey(b.effectiveFromYear, b.effectiveFromMonth)
        - periodKey(a.effectiveFromYear, a.effectiveFromMonth),
    )
  return applicable[0] || null
}

export function effectiveMemberAmount(defaults, member, year, month) {
  const target = periodKey(year, month)
  const memberId = member?.id
  const flatKey = normalizeFlat(member?.flatNumber)
  const applicable = (defaults || [])
    .filter((d) => {
      const matchesMember = memberId && d.memberId === memberId
      const matchesFlat = flatKey && normalizeFlat(d.flatNumber) === flatKey
      if (!matchesMember && !matchesFlat) return false
      return periodKey(d.effectiveFromYear, d.effectiveFromMonth) <= target
    })
    .sort(
      (a, b) =>
        periodKey(b.effectiveFromYear, b.effectiveFromMonth)
        - periodKey(a.effectiveFromYear, a.effectiveFromMonth),
    )
  const hit = applicable[0]
  return hit && Number(hit.amount) > 0 ? Number(hit.amount) : 0
}

/**
 * One row per member for a billing period — mirrors Maintenance Tracker periodRows.
 */
export function buildPeriodRows({
  members = [],
  charges = [],
  rates = [],
  memberDefaults = [],
  billingMode = 'SAME',
  year,
  month,
}) {
  const y = Number(year)
  const m = Number(month)
  const isVariable = String(billingMode).toUpperCase() === 'VARIABLE'
  const periodRate = effectiveAmountFor(rates, y, m)
  const scheduledAmount = periodRate ? Number(periodRate.amount) : 0

  return (members || [])
    .slice()
    .sort(
      (a, b) =>
        String(a.flatNumber || '').localeCompare(String(b.flatNumber || ''))
        || String(a.fullName || '').localeCompare(String(b.fullName || '')),
    )
    .map((member) => {
      const charge = (charges || []).find(
        (c) =>
          Number(c.billingYear) === y
          && Number(c.billingMonth) === m
          && (
            (c.memberId && c.memberId === member.id)
            || normalizeFlat(c.flatNumber) === normalizeFlat(member.flatNumber)
          ),
      )

      const defaultAmount = isVariable
        ? effectiveMemberAmount(memberDefaults, member, y, m)
        : scheduledAmount

      return {
        key: member.id,
        memberId: member.id,
        memberName: member.fullName,
        flatNumber: member.flatNumber,
        billingYear: y,
        billingMonth: m,
        chargeId: charge?.id || null,
        amount: charge ? Number(charge.amount) : Number(defaultAmount || 0),
        status: charge?.status || 'PENDING',
        isVirtual: !charge,
      }
    })
}

/** Aggregate paid/pending counts and amounts for a period (tracker-aligned). */
export function summarizePeriodRows(rows = []) {
  let paidFlats = 0
  let pendingFlats = 0
  let collectedAmt = 0
  let pendingAmt = 0

  for (const row of rows) {
    const amount = Number(row.amount || 0)
    if (String(row.status).toUpperCase() === 'PAID') {
      paidFlats += 1
      collectedAmt += amount
    } else {
      pendingFlats += 1
      pendingAmt += amount
    }
  }

  return {
    paidFlats,
    pendingFlats,
    totalMembers: rows.length,
    collectedAmt,
    pendingAmt,
    expectedCollection: collectedAmt + pendingAmt,
  }
}

/**
 * Tracker-aligned summary for one calendar month.
 */
export function summarizeMaintenancePeriod(opts) {
  return summarizePeriodRows(buildPeriodRows(opts))
}

/**
 * Sum tracker-aligned month summaries across a year (member-months + amounts).
 */
export function summarizeMaintenanceYear({
  members,
  charges,
  rates,
  memberDefaults,
  billingMode,
  year,
}) {
  let paidFlats = 0
  let pendingFlats = 0
  let collectedAmt = 0
  let pendingAmt = 0
  const monthly = []

  for (let month = 1; month <= 12; month += 1) {
    const s = summarizeMaintenancePeriod({
      members,
      charges,
      rates,
      memberDefaults,
      billingMode,
      year,
      month,
    })
    paidFlats += s.paidFlats
    pendingFlats += s.pendingFlats
    collectedAmt += s.collectedAmt
    pendingAmt += s.pendingAmt
    monthly.push({ month, ...s })
  }

  return {
    paidFlats,
    pendingFlats,
    collectedAmt,
    pendingAmt,
    expectedCollection: collectedAmt + pendingAmt,
    monthly,
  }
}
