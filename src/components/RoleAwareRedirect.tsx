import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { LoadingScreen } from './LoadingScreen'

type RoleAwareRedirectProps = {
  adminPath: string
  trainerPath: string
}

export function RoleAwareRedirect({ adminPath, trainerPath }: RoleAwareRedirectProps) {
  const { isReady, isAdminArea } = useAuth()

  if (!isReady) return <LoadingScreen />

  return <Navigate to={isAdminArea ? adminPath : trainerPath} replace />
}

