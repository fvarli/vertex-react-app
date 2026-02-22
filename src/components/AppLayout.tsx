import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../features/auth/auth-context'
import { useWorkspaceAccess } from '../features/workspace/access'
import { setActiveWorkspaceId } from '../lib/storage'
import { LanguageToggle } from './LanguageToggle'
import { NotificationBell } from './NotificationBell'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'

type AppLayoutProps = {
  area: 'admin' | 'trainer'
}

export function AppLayout({ area }: AppLayoutProps) {
  const { t } = useTranslation(['layout'])
  const { user, logout, systemRole } = useAuth()
  const { approvalStatus, canMutate, activeWorkspace } = useWorkspaceAccess()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    setActiveWorkspaceId(null)
    navigate('/login', { replace: true })
  }

  const base = area === 'admin' ? '/admin' : '/trainer'

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  const renderNavLinks = (onNavigate?: () => void) => (
    <>
      <NavLink to={`${base}/dashboard`} onClick={onNavigate}>
        {t('layout:menu.dashboard')}
      </NavLink>
      {area === 'admin' ? (
        <NavLink to={`${base}/trainers`} onClick={onNavigate}>
          {t('layout:menu.trainers')}
        </NavLink>
      ) : null}
      <NavLink to={`${base}/students`} onClick={onNavigate}>
        {t('layout:menu.students')}
      </NavLink>
      <NavLink to={`${base}/programs`} onClick={onNavigate}>
        {t('layout:menu.programs')}
      </NavLink>
      <NavLink to={`${base}/appointments`} onClick={onNavigate}>
        {t('layout:menu.appointments')}
      </NavLink>
      <NavLink to={`${base}/reminders`} onClick={onNavigate}>
        {t('layout:menu.reminders')}
      </NavLink>
      <NavLink to={`${base}/calendar`} onClick={onNavigate}>
        {t('layout:menu.calendar')}
      </NavLink>
      <NavLink to={`${base}/workspaces`} onClick={onNavigate}>
        {t('layout:menu.workspaces')}
      </NavLink>
      {area === 'admin' && systemRole === 'platform_admin' ? (
        <NavLink to={`${base}/approval`} onClick={onNavigate}>
          {t('layout:menu.approval')}
        </NavLink>
      ) : null}
      <NavLink to={`${base}/documentation`} onClick={onNavigate}>
        {t('layout:menu.documentation')}
      </NavLink>
      <NavLink to={`${base}/profile`} onClick={onNavigate}>
        {t('layout:menu.profile')}
      </NavLink>
    </>
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-sidebarMuted">Vertex Platform</p>
          <h1>{t('layout:appName')}</h1>
          <p className="mt-1 text-xs text-sidebarMuted">
            {area === 'admin' ? t('layout:area.admin') : t('layout:area.trainer')}
          </p>
        </div>
        <nav>{renderNavLinks()}</nav>

        <Link to={`${base}/profile`} className="mt-auto block rounded-xl border border-sidebarActive/60 bg-sidebarActive/50 p-3 transition-colors hover:bg-sidebarActive/70">
          <p className="text-xs text-sidebarMuted">{t('layout:signedInAs')}</p>
          <p className="text-sm font-semibold text-sidebarForeground">{user?.name}</p>
          <p className="text-xs text-sidebarMuted">{user?.email}</p>
        </Link>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-leading">
            <Button
              className="mobile-nav-toggle"
              variant="outline"
              size="sm"
              aria-label={t('layout:menu.open')}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              {t('layout:menu.open')}
            </Button>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">{area}</p>
            <strong className="text-base">{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <div className="topbar-actions">
            <NotificationBell />
            <div className="topbar-segment">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <Button className="topbar-logout" variant="outline" onClick={handleLogout}>
              {t('layout:logout')}
            </Button>
          </div>
        </header>
        {!canMutate && approvalStatus ? (
          <div className={`workspace-approval-banner ${approvalStatus === 'rejected' ? 'is-rejected' : 'is-pending'}`}>
            <strong>{approvalStatus === 'pending' ? t('layout:approval.pendingTitle') : t('layout:approval.rejectedTitle')}</strong>
            <span>
              {approvalStatus === 'pending'
                ? t('layout:approval.pendingBody', { workspace: activeWorkspace?.name ?? '-' })
                : t('layout:approval.rejectedBody', {
                    workspace: activeWorkspace?.name ?? '-',
                    note: activeWorkspace?.approval_note ?? t('layout:approval.noNote'),
                  })}
            </span>
          </div>
        ) : null}
        <section className="content">
          <Outlet />
        </section>
      </main>
      {isMobileMenuOpen ? (
        <div className="mobile-drawer-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="mobile-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div>
                <p className="mobile-drawer-kicker text-[11px] uppercase tracking-[0.16em] text-sidebarMuted">Vertex Platform</p>
                <h2 className="mobile-drawer-title text-lg font-extrabold text-sidebarForeground">{t('layout:appName')}</h2>
              </div>
              <Button variant="outline" size="sm" aria-label={t('layout:menu.close')} onClick={() => setIsMobileMenuOpen(false)}>
                {t('layout:menu.close')}
              </Button>
            </div>

            <p className="mobile-drawer-area mt-1 text-xs text-sidebarMuted">{area === 'admin' ? t('layout:area.admin') : t('layout:area.trainer')}</p>
            <nav className="mobile-drawer-nav">{renderNavLinks(() => setIsMobileMenuOpen(false))}</nav>
            <div className="mobile-drawer-controls">
              <NotificationBell />
              <LanguageToggle />
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={async () => {
                  await handleLogout()
                  setIsMobileMenuOpen(false)
                }}
              >
                {t('layout:logout')}
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
