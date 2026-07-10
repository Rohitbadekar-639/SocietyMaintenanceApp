import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id))
  }, [])

  const show = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts((items) => [...items, { id, message, type }])
    window.setTimeout(() => dismiss(id), 4500)
    return id
  }, [dismiss])

  const value = useMemo(() => ({
    success: (message) => show(message, 'success'),
    error: (message) => show(message, 'error'),
    info: (message) => show(message, 'info'),
  }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-col gap-2 sm:left-auto sm:right-5 sm:mx-0">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismiss(toast.id)}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 text-left text-sm font-semibold shadow-xl shadow-slate-900/10 ${
              toast.type === 'error'
                ? 'border-red-100 bg-red-50 text-red-800'
                : toast.type === 'info'
                  ? 'border-sky-100 bg-sky-50 text-sky-800'
                  : 'border-emerald-100 bg-emerald-50 text-emerald-800'
            }`}
          >
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
