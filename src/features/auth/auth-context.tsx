import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { getToken, setToken } from '../../lib/storage'
import type { ApiUser, LoginPayload, LoginResponse, MeResponse } from './types'

type AuthContextValue = {
  user: ApiUser | null
  token: string | null
  isReady: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
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

  async function login(payload: LoginPayload): Promise<void> {
    const response = await api.post<LoginResponse>('/login', payload)
    const nextToken = response.data.data.token

    setToken(nextToken)
    setTokenState(nextToken)
    setUser(response.data.data.user)
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

  async function refreshProfile(): Promise<void> {
    const response = await api.get<MeResponse>('/me')
    setUser(response.data.data)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshProfile,
    }),
    [user, token, isReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
