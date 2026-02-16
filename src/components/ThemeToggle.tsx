import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getThemeMode, setThemeMode as persistThemeMode, type ThemeMode } from '../lib/storage'
import { applyThemeMode, onSystemThemeChange } from '../features/theme/theme'

export function ThemeToggle() {
  const { t } = useTranslation(['layout'])
  const [mode, setMode] = useState<ThemeMode>(() => getThemeMode())
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    if (!open) return

    const onDocumentClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocumentClick)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onDocumentClick)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  const modeLabel =
    mode === 'system'
      ? t('layout:theme.options.system')
      : mode === 'light'
        ? t('layout:theme.options.light')
        : t('layout:theme.options.dark')

  return (
    <div className="topbar-control-wrap" ref={rootRef}>
      <button
        type="button"
        className="topbar-icon-button"
        aria-label={t('layout:theme.aria')}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        {mode === 'dark' ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 3a9 9 0 1 0 9 9a1 1 0 0 1-1.57.82A7 7 0 0 1 11.18 4.57A1 1 0 0 1 12 3"
            />
          </svg>
        ) : mode === 'light' ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 17a5 5 0 1 1 0-10a5 5 0 0 1 0 10m0-14a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1m0 15a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1m9-7a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2zM6 12a1 1 0 1 1 0 2H4a1 1 0 1 1 0-2zm11.07-6.07a1 1 0 0 1 1.42 1.42l-1.41 1.41a1 1 0 0 1-1.42-1.42zM8.34 14.66a1 1 0 0 1 1.42 1.42l-1.42 1.41a1 1 0 1 1-1.41-1.41zm9.73 2.82a1 1 0 0 1-1.41 1.41l-1.42-1.41a1 1 0 1 1 1.42-1.42zM8.34 9.34L6.93 7.93a1 1 0 1 1 1.41-1.42l1.42 1.42a1 1 0 0 1-1.42 1.41"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-4v2h2a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h2v-2H6a2 2 0 0 1-2-2zm2 0v9h12V5z"
            />
          </svg>
        )}
        <span className="topbar-icon-value">{modeLabel}</span>
      </button>

      {open ? (
        <div className="topbar-dropdown" role="menu">
          <button
            type="button"
            className={`topbar-dropdown-item ${mode === 'system' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('system')
              setOpen(false)
            }}
          >
            {t('layout:theme.options.system')}
          </button>
          <button
            type="button"
            className={`topbar-dropdown-item ${mode === 'light' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('light')
              setOpen(false)
            }}
          >
            {t('layout:theme.options.light')}
          </button>
          <button
            type="button"
            className={`topbar-dropdown-item ${mode === 'dark' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('dark')
              setOpen(false)
            }}
          >
            {t('layout:theme.options.dark')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
