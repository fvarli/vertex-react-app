import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getThemeMode, setThemeMode as persistThemeMode, type ThemeMode } from '../lib/storage'
import { applyThemeMode, onSystemThemeChange } from '../features/theme/theme'

export function ThemeToggle() {
  const { t } = useTranslation(['layout'])
  const [mode, setMode] = useState<ThemeMode>(() => getThemeMode())

  useEffect(() => {
    persistThemeMode(mode)
    applyThemeMode(mode)

    if (mode !== 'system') {
      return
    }

    return onSystemThemeChange(() => {
      applyThemeMode('system')
    })
  }, [mode])

  return (
    <label className="theme-toggle" aria-label={t('layout:theme.aria')}>
      <span className="theme-toggle-label">{t('layout:theme.label')}</span>
      <select value={mode} onChange={(event) => setMode(event.target.value as ThemeMode)}>
        <option value="system">{t('layout:theme.options.system')}</option>
        <option value="light">{t('layout:theme.options.light')}</option>
        <option value="dark">{t('layout:theme.options.dark')}</option>
      </select>
    </label>
  )
}
