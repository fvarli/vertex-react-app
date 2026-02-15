import { useTranslation } from 'react-i18next'
import { Button } from './button'

type DialogProps = {
  open: boolean
  title: string
  description?: string
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
}

export function Dialog({ open, title, description, children, onClose, footer }: DialogProps) {
  const { t } = useTranslation(['common'])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <div className="max-h-[88vh] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <div className="p-4 pb-0">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description ? <p className="text-sm text-muted">{description}</p> : null}
          </div>
          <Button className="mr-4 mt-4" variant="outline" size="sm" onClick={onClose}>
            {t('common:close')}
          </Button>
        </div>
        <div className="max-h-[58vh] overflow-y-auto px-4">{children}</div>
        {footer ? <div className="mt-4 flex justify-end gap-2 border-t border-border/70 bg-card px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  )
}
