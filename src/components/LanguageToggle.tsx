import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useAnchoredDropdown } from './useAnchoredDropdown'

export function LanguageToggle() {
  const { i18n, t } = useTranslation(['layout'])
  const language = i18n.resolvedLanguage === 'tr' ? 'tr' : 'en'
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuStyle = useAnchoredDropdown(open, rootRef)

  useEffect(() => {
    if (!open) return

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedTrigger = rootRef.current?.contains(target)
      const clickedMenu = menuRef.current?.contains(target)
      if (!clickedTrigger && !clickedMenu) {
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

  return (
    <div className="topbar-control-wrap" ref={rootRef}>
      <button
        type="button"
        className="topbar-icon-button"
        aria-label={t('layout:language.aria')}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20m6.92 9h-3.01a15.7 15.7 0 0 0-1.2-5a8.02 8.02 0 0 1 4.2 5m-6.92-7c.86 0 2.2 2.09 2.92 5H9.08C9.8 6.09 11.14 4 12 4M4.08 13h3.01c.14 1.78.56 3.52 1.2 5a8.02 8.02 0 0 1-4.2-5M7.09 11H4.08a8.02 8.02 0 0 1 4.2-5c-.64 1.48-1.06 3.22-1.2 5m1.99 0c.13-1.74.59-3.45 1.34-5h3.18c.75 1.55 1.21 3.26 1.34 5zm0 2h5.84c-.13 1.74-.59 3.45-1.34 5h-3.18c-.75-1.55-1.21-3.26-1.34-5m2.92 7c-.86 0-2.2-2.09-2.92-5h5.84c-.72 2.91-2.06 5-2.92 5m2.71-2c.64-1.48 1.06-3.22 1.2-5h3.01a8.02 8.02 0 0 1-4.2 5"
          />
        </svg>
        <span className="topbar-icon-value">{language.toUpperCase()}</span>
      </button>

      {open
        ? createPortal(
            <div className="topbar-dropdown topbar-dropdown-portal" role="menu" ref={menuRef} style={menuStyle}>
              <button
                type="button"
                className={`topbar-dropdown-item ${language === 'tr' ? 'is-active' : ''}`}
                onClick={() => {
                  void i18n.changeLanguage('tr')
                  setOpen(false)
                }}
              >
                {t('layout:language.options.tr')}
              </button>
              <button
                type="button"
                className={`topbar-dropdown-item ${language === 'en' ? 'is-active' : ''}`}
                onClick={() => {
                  void i18n.changeLanguage('en')
                  setOpen(false)
                }}
              >
                {t('layout:language.options.en')}
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
