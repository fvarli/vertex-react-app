import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { setActiveWorkspaceId } from '../lib/storage'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    setActiveWorkspaceId(null)
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Vertex Coach</h1>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/students">Students</NavLink>
          <NavLink to="/programs">Programs</NavLink>
          <NavLink to="/appointments">Appointments</NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/workspaces">Workspaces</NavLink>
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
