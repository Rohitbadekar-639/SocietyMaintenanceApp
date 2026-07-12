import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brand } from './Brand'
import { NoticeService } from '../api/services'

const publicLinks = [
  { to: '/#features', label: 'Features' },
  { to: '/about', label: 'About us' },
  { to: '/contact', label: 'Contact' },
]

function navClass() {
  return 'rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950'
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [unreadNotices, setUnreadNotices] = useState(0)
  const knownUnread = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      setUnreadNotices(0)
      knownUnread.current = null
      return undefined
    }

    let cancelled = false
    async function refresh() {
      try {
        const res = await NoticeService.unreadCount()
        if (cancelled) return
        const count = Number(res?.count || 0)
        knownUnread.current = count
        setUnreadNotices(count)
      } catch {
        // Keep last known count
      }
    }

    refresh()
    const id = window.setInterval(refresh, 30000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [isAuthenticated, isAdmin, user?.id])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function goToMemberNotices() {
    setOpen(false)
    navigate('/member', { state: { focusNotices: true } })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex">
          {publicLinks.map((l) => (
            <Link key={l.to} to={l.to} className={navClass()}>
              {l.label}
            </Link>
          ))}

          {isAuthenticated && (
            <Link to={isAdmin ? '/admin' : '/member'} className={navClass()}>
              Dashboard
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/reports" className={navClass()}>
              Reports
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <button
                  type="button"
                  onClick={goToMemberNotices}
                  className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                  aria-label={unreadNotices > 0 ? `${unreadNotices} unread notices` : 'Notices'}
                  title="Notices"
                >
                  🔔
                  {unreadNotices > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white">
                      {unreadNotices > 9 ? '9+' : unreadNotices}
                    </span>
                  )}
                </button>
              )}
              <span className="hidden max-w-[220px] truncate text-sm font-medium text-slate-500 lg:inline">
                {user?.societyName ? `${user.societyName} · ${user.fullName}` : user?.fullName}
              </span>
              <button onClick={handleLogout} className="btn-secondary !px-3 !py-2">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-3.5 !py-2">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary !bg-orange-500 !px-3.5 !py-2 hover:!bg-orange-600">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && !isAdmin && (
            <button
              type="button"
              onClick={goToMemberNotices}
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700"
              aria-label={unreadNotices > 0 ? `${unreadNotices} unread notices` : 'Notices'}
            >
              🔔
              {unreadNotices > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white">
                  {unreadNotices > 9 ? '9+' : unreadNotices}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            <span className="text-lg">{open ? '×' : '☰'}</span>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {publicLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                {user?.societyName && (
                  <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">{user.societyName}</p>
                )}
                <Link to={isAdmin ? '/admin' : '/member'} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">My dashboard</Link>
                <Link to="/reports" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Reports</Link>
                <button onClick={handleLogout} className="btn-secondary mt-2">Sign out</button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary">Sign in</Link>
                <Link to="/register-member" onClick={() => setOpen(false)} className="btn-primary !bg-orange-500 hover:!bg-orange-600">Member signup</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
