import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getValidToken } from '../../auth/token'
import MemberDirectory from './MemberDirectory'
import MaintenanceTracker from './MaintenanceTracker'
import ExpenseLogger from './ExpenseLogger'
import NoticeBoard from './NoticeBoard'
import CommitteeDirectory from './CommitteeDirectory'
import SocietyAccounts from './SocietyAccounts'
import AuditDocuments from './AuditDocuments'
import PaymentClaims from './PaymentClaims'

const tabs = [
  { id: 'overview', label: 'Overview', icon: '⌂', component: Overview },
  { id: 'members', label: 'Members', icon: '♙', component: MemberDirectory },
  { id: 'committee', label: 'Committee', icon: '★', component: CommitteeDirectory },
  { id: 'maintenance', label: 'Maintenance', icon: '₹', component: MaintenanceTracker },
  { id: 'claims', label: 'Payment claims', icon: '✓', component: PaymentClaims },
  { id: 'accounts', label: 'Bank accounts', icon: '🏦', component: SocietyAccounts },
  { id: 'audit', label: 'Audit reports', icon: '▤', component: AuditDocuments },
  { id: 'expenses', label: 'Expenses', icon: '▣', component: ExpenseLogger },
  { id: 'notices', label: 'Notices & rules', icon: '◉', component: NoticeBoard },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [active, setActive] = useState('overview')

  if (!getValidToken()) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/member" replace />

  const ActiveComponent = tabs.find((t) => t.id === active).component

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/[.03] lg:min-h-[calc(100vh-150px)]">
        <div className="border-b border-slate-100 px-3 pb-4 pt-2">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Committee workspace</p>
          <p className="mt-2 truncate text-sm font-bold text-slate-900">{user?.fullName}</p>
          <p className="mt-0.5 text-xs text-slate-500">Admin · Secretary / Chairman</p>
        </div>
        <nav className="mt-3 grid gap-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActive(tab.id)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active === tab.id ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-base shadow-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-orange-600">SocietyWale admin</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{tabs.find((tab) => tab.id === active).label}</h1>
          </div>
          <p className="text-sm text-slate-500">Members can view. Only admins can create or change records.</p>
        </div>
        <ActiveComponent onNavigate={setActive} />
      </section>
    </div>
  )
}

function Overview({ onNavigate }) {
  const steps = [
    ['1', 'Publish committee', 'Add chairman, secretary and treasurer contacts.', 'committee'],
    ['2', 'Add bank account', 'Members need account details to pay maintenance.', 'accounts'],
    ['3', 'Track maintenance', 'Record dues and approve member payment claims.', 'maintenance'],
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[linear-gradient(135deg,#102A43_0%,#173e62_55%,#0f766e_150%)] p-7 text-white sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-orange-300">Committee control</p>
        <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">Admins manage. Members view, download and notify payments.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(([number, title, copy, target]) => (
          <article key={number} className="card">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-sm font-extrabold text-orange-600">{number}</span>
            <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            <button onClick={() => onNavigate(target)} className="mt-5 text-sm font-bold text-orange-600 hover:text-orange-700">Open →</button>
          </article>
        ))}
      </div>
    </div>
  )
}
