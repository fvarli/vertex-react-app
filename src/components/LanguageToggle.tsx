import { useTranslation } from 'react-i18next'

export function LanguageToggle() {
  const { i18n, t } = useTranslation(['layout'])
  const language = i18n.resolvedLanguage === 'tr' ? 'tr' : 'en'

  return (
    <label className="topbar-control" aria-label={t('layout:language.aria')}>
      <span className="topbar-control-label">{t('layout:language.label')}</span>
      <select className="topbar-control-select" value={language} onChange={(event) => void i18n.changeLanguage(event.target.value)}>
        <option value="tr">{t('layout:language.options.tr')}</option>
        <option value="en">{t('layout:language.options.en')}</option>
      </select>
    </label>
  )
}
