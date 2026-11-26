import { useEffect } from 'react'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, toast.action ? 5000 : 2200)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <span>{toast.msg}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action.fn()
            onClose()
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  )
}
