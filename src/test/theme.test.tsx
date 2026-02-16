import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeToggle } from '../components/ThemeToggle'
import { getThemeMode } from '../lib/storage'
import { applyThemeMode, resolveTheme } from '../features/theme/theme'

type MatchMediaMock = {
  matches: boolean
  addEventListener: (event: string, handler: () => void) => void
  removeEventListener: (event: string, handler: () => void) => void
}

function mockMatchMedia(matches: boolean) {
  const mql: MatchMediaMock = {
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => mql),
  })

  return mql
}

describe('theme utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('resolves system mode from media query', () => {
    mockMatchMedia(true)
    expect(resolveTheme('system')).toBe('dark')

    mockMatchMedia(false)
    expect(resolveTheme('system')).toBe('light')
  })

  it('applies dark class to document root', () => {
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    applyThemeMode('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    applyThemeMode('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockMatchMedia(false)
  })

  it('changes and persists selected mode', () => {
    render(<ThemeToggle />)

    const trigger = screen.getByRole('button', { name: /theme mode selector/i })
    expect(getThemeMode()).toBe('system')

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: /dark/i }))

    expect(getThemeMode()).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
