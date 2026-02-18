import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_EXPIRED_EVENT, api } from '../../lib/api'
import { getToken, setToken } from '../../lib/storage'
import type { ApiUser, LoginPayload, LoginResponse, MeResponse, WorkspaceRole } from './types'

type AuthContextValue = {
  user: ApiUser | null
  token: string | null
  isReady: boolean
  isAuthenticated: boolean
  systemRole: ApiUser['system_role'] | null
  workspaceRole: WorkspaceRole
  isAdminArea: boolean
  login: (payload: LoginPayload) => Promise<ApiUser>
  logout: () => Promise<void>
  refreshProfile: () => Promise<ApiUser | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [token, setTokenState] = useState<string | null>(getToken())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setIsReady(true)
        return
      }

      try {
        const response = await api.get<MeResponse>('/me')
        setUser(response.data.data)
      } catch {
        setToken(null)
        setTokenState(null)
        setUser(null)
      } finally {
        setIsReady(true)
      }
    }

    void bootstrap()
  }, [token])

  useEffect(() => {
    const onAuthExpired = () => {
      setToken(null)
      setTokenState(null)
      setUser(null)
      setIsReady(true)
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired)

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired)
    }
  }, [])

  async function login(payload: LoginPayload): Promise<ApiUser> {
    const response = await api.post<LoginResponse>('/login', payload)
    const nextToken = response.data.data.token
    const nextUser = response.data.data.user

    setToken(nextToken)
    setTokenState(nextToken)
    setUser(nextUser)

    return nextUser
  }

  async function logout(): Promise<void> {
    try {
      await api.post('/logout')
    } finally {
      setToken(null)
      setTokenState(null)
      setUser(null)
    }
  }

  async function refreshProfile(): Promise<ApiUser | null> {
    try {
      const response = await api.get<MeResponse>('/me')
      const nextUser = response.data.data
      setUser(nextUser)
      return nextUser
    } catch {
      setToken(null)
      setTokenState(null)
      setUser(null)
      return null
    }
  }

  const systemRole = user?.system_role ?? null
  const workspaceRole = user?.active_workspace_role ?? null
  const isAdminArea = systemRole === 'platform_admin' || workspaceRole === 'owner_admin'

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(token),
      systemRole,
      workspaceRole,
      isAdminArea,
      login,
      logout,
      refreshProfile,
    }),
    [user, token, isReady, systemRole, workspaceRole, isAdminArea],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
