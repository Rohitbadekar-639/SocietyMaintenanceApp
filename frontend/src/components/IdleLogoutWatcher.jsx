import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { IDLE_LOGOUT_MS } from '../utils/share'

/**
 * Logs out idle authenticated users after IDLE_LOGOUT_MS (30 minutes).
 */
export default function IdleLogoutWatcher() {
  const { isAuthenticated, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const timerRef = useRef(null)

  const expire = useCallback(() => {
    logout()
    toast.info('Signed out due to inactivity. Please sign in again.')
    navigate('/login', { replace: true })
  }, [logout, toast, navigate])

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      return undefined
    }

    const bump = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(expire, IDLE_LOGOUT_MS)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((event) => window.addEventListener(event, bump, { passive: true }))
    bump()

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      events.forEach((event) => window.removeEventListener(event, bump))
    }
  }, [isAuthenticated, expire])

  return null
}
