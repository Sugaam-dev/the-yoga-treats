import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useDemoStore, type ToastItem } from '@/store/useDemoStore'
import { cn } from '@/lib/utils'

function Toast({ toast }: { toast: ToastItem }) {
  const removeToast = useDemoStore((s) => s.removeToast)

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,
    info: <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />,
  }

  const borderAccents = {
    success: 'border-l-4 border-l-emerald-600',
    info: 'border-l-4 border-l-primary',
    warning: 'border-l-4 border-l-amber-500',
    error: 'border-l-4 border-l-rose-500',
  }

  const type = toast.type || 'info'

  return (
    <div
      className={cn(
        'group pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-5',
        borderAccents[type]
      )}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 space-y-1">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {type}
        </h5>
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="rounded-md p-1 text-muted-foreground opacity-60 hover:opacity-100 hover:bg-secondary transition-opacity"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useDemoStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
