import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { setActiveWorkspaceId } from '../lib/storage'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'

type AppLayoutProps = {
  area: 'admin' | 'trainer'
}

export function AppLayout({ area }: AppLayoutProps) {
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
        <h1>Vertex Coach</h1>
        <nav>
          <NavLink to={`${base}/dashboard`}>Dashboard</NavLink>
          <NavLink to={`${base}/students`}>Students</NavLink>
          <NavLink to={`${base}/programs`}>Programs</NavLink>
          <NavLink to={`${base}/appointments`}>Appointments</NavLink>
          <NavLink to={`${base}/calendar`}>Calendar</NavLink>
          <NavLink to={`${base}/workspaces`}>Workspaces</NavLink>
          <NavLink to={`${base}/documentation`}>Documentation</NavLink>
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              Logout
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
