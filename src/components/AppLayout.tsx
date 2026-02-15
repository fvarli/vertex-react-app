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
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-sidebarMuted">Vertex Platform</p>
          <h1>{t('layout:appName')}</h1>
          <p className="mt-1 text-xs text-sidebarMuted">{area === 'admin' ? 'Owner Admin Area' : 'Trainer Area'}</p>
        </div>
        <nav>
          <NavLink to={`${base}/dashboard`}>{t('layout:menu.dashboard')}</NavLink>
          <NavLink to={`${base}/students`}>{t('layout:menu.students')}</NavLink>
          <NavLink to={`${base}/programs`}>{t('layout:menu.programs')}</NavLink>
          <NavLink to={`${base}/appointments`}>{t('layout:menu.appointments')}</NavLink>
          <NavLink to={`${base}/calendar`}>{t('layout:menu.calendar')}</NavLink>
          <NavLink to={`${base}/workspaces`}>{t('layout:menu.workspaces')}</NavLink>
          <NavLink to={`${base}/documentation`}>{t('layout:menu.documentation')}</NavLink>
        </nav>

        <div className="mt-auto rounded-xl border border-sidebarActive/60 bg-sidebarActive/50 p-3">
          <p className="text-xs text-sidebarMuted">Signed in as</p>
          <p className="text-sm font-semibold text-sidebarForeground">{user?.name}</p>
          <p className="text-xs text-sidebarMuted">{user?.email}</p>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">{area}</p>
            <strong className="text-base">{user?.name}</strong>
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
