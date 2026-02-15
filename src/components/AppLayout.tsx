import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../features/auth/auth-context'
import { setActiveWorkspaceId } from '../lib/storage'
import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'

type AppLayoutProps = {
  area: 'admin' | 'trainer'
}

export function AppLayout({ area }: AppLayoutProps) {
  const { t } = useTranslation(['layout'])
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    setActiveWorkspaceId(null)
    navigate('/login', { replace: true })
  }

  const base = area === 'admin' ? '/admin' : '/trainer'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>{t('layout:appName')}</h1>
        <nav>
          <NavLink to={`${base}/dashboard`}>{t('layout:menu.dashboard')}</NavLink>
          <NavLink to={`${base}/students`}>{t('layout:menu.students')}</NavLink>
          <NavLink to={`${base}/programs`}>{t('layout:menu.programs')}</NavLink>
          <NavLink to={`${base}/appointments`}>{t('layout:menu.appointments')}</NavLink>
          <NavLink to={`${base}/calendar`}>{t('layout:menu.calendar')}</NavLink>
          <NavLink to={`${base}/workspaces`}>{t('layout:menu.workspaces')}</NavLink>
          <NavLink to={`${base}/documentation`}>{t('layout:menu.documentation')}</NavLink>
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <div className="topbar-actions">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              {t('layout:logout')}
            </Button>
          </div>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
