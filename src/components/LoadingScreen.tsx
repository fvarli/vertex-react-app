import { useTranslation } from 'react-i18next'

export function LoadingScreen() {
  const { t } = useTranslation(['common'])

  return (
    <div className="centered-screen">
      <p>{t('common:loading')}</p>
    </div>
  )
}
