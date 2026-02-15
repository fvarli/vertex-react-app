import { useEffect, useState } from 'react'
import { getThemeMode, setThemeMode as persistThemeMode, type ThemeMode } from '../lib/storage'
import { applyThemeMode, onSystemThemeChange } from '../features/theme/theme'

export function ThemeToggle() {
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
    <label className="theme-toggle" aria-label="Theme mode selector">
      <span className="theme-toggle-label">Theme</span>
      <select value={mode} onChange={(event) => setMode(event.target.value as ThemeMode)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  )
}
