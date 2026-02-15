import { useTranslation } from 'react-i18next'

export function DashboardPage() {
  const { t } = useTranslation(['pages'])

  return (
    <div className="panel page">
      <h2>{t('pages:dashboard.title')}</h2>
      <p>{t('pages:dashboard.description')}</p>
    </div>
  )
}
