import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Smooth-scroll to hash targets (e.g. /#features) on every route change. */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    const id = hash.replace('#', '')
    const frame = window.requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}
