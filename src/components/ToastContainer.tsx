import { useToast, type ToastVariant } from '../features/toast/toast-context'

const variantClasses: Record<ToastVariant, string> = {
  success: 'border-success/40 text-success',
  error: 'border-danger/40 text-danger',
  info: 'border-primary/40 text-primary',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 top-4 z-[200] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-in flex items-start justify-between gap-2 rounded-xl border bg-card px-4 py-3 shadow-lg ${variantClasses[toast.variant]}`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            type="button"
            className="shrink-0 text-muted hover:text-foreground"
            onClick={() => removeToast(toast.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
