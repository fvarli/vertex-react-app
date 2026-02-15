import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function NotFoundPage() {
  const { t } = useTranslation(['pages'])

  return (
    <div className="centered-screen">
      <div className="panel">
        <h2>{t('pages:notFound.title')}</h2>
        <Link to="/dashboard">{t('pages:notFound.goDashboard')}</Link>
      </div>
    </div>
  )
}
