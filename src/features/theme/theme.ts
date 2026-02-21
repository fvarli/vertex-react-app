import { getThemeMode, type ThemeMode } from '../../lib/storage'

export type ResolvedTheme = 'light' | 'dark'

const mediaQuery = '(prefers-color-scheme: dark)'

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light' || mode === 'dark') {
    return mode
  }

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia(mediaQuery).matches ? 'dark' : 'light'
}

export function applyThemeToDocument(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return

  document.documentElement.dataset.theme = theme
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
}

export function applyThemeMode(mode: ThemeMode): ResolvedTheme {
  const resolved = resolveTheme(mode)
  applyThemeToDocument(resolved)
  return resolved
}

export function initTheme(): ThemeMode {
  const mode = getThemeMode()
  applyThemeMode(mode)
  return mode
}

export function onSystemThemeChange(callback: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {}
  }

  const query = window.matchMedia(mediaQuery)
  const handler = () => callback()
  query.addEventListener('change', handler)

  return () => {
    query.removeEventListener('change', handler)
  }
}
