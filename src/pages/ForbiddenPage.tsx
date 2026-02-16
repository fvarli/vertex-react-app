import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/button'

export function ForbiddenPage() {
  const { t } = useTranslation(['pages'])
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border/70 bg-card/70 p-6 text-center shadow-sm">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:forbidden.label')}</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{t('pages:forbidden.title')}</h1>
      <p className="mt-2 text-sm text-muted">{t('pages:forbidden.description')}</p>
      <div className="mt-5 flex items-center justify-center gap-2">
        <Button onClick={() => navigate('/workspaces', { replace: true })}>{t('pages:forbidden.goWorkspaces')}</Button>
        <Button variant="outline" onClick={() => navigate('/dashboard', { replace: true })}>
          {t('pages:forbidden.goDashboard')}
        </Button>
      </div>
    </div>
  )
}
