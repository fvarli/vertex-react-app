import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { getActiveWorkspaceId } from '../lib/storage'
import { LoadingScreen } from './LoadingScreen'

export function ProtectedRoute() {
  const { isReady, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isReady) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}

export function WorkspaceRoute() {
  const workspaceId = getActiveWorkspaceId()

  if (!workspaceId) {
    return <Navigate to="/workspaces" replace />
  }

  return <Outlet />
}
