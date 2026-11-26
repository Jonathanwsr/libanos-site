import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, toast.action ? 5000 : 2200)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      {!toast.action && <CheckCircle2 size={18} className="toast-ok" />}
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
