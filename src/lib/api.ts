import axios, { type AxiosRequestConfig } from 'axios'
import { generateRequestId } from './requestId'
import { getToken, setToken } from './storage'

export const AUTH_EXPIRED_EVENT = 'vertex:auth:expired'

function dispatchAuthExpired(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
  }
}

function setAuthHeader(config: { headers?: unknown }, token: string | null): void {
  const headers = config.headers as
    | {
        set?: (name: string, value: string) => void
        Authorization?: string
      }
    | undefined

  if (!headers) {
    return
  }

  if (token) {
    if (typeof headers.set === 'function') {
      headers.set('Authorization', `Bearer ${token}`)
      return
    }

    headers.Authorization = `Bearer ${token}`
    return
  }

  if (typeof headers.set === 'function') {
    headers.set('Authorization', '')
    return
  }

  headers.Authorization = ''
}

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false

  return ['/refresh-token', '/login', '/logout', '/logout-all'].some((path) => url.includes(path))
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1',
  headers: {
    Accept: 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  config.headers.set('X-Request-Id', generateRequestId())

  const token = getToken()
  setAuthHeader(config, token)

  return config
})

refreshClient.interceptors.request.use((config) => {
  config.headers.set('X-Request-Id', generateRequestId())
  setAuthHeader(config, getToken())

  return config
})

let refreshInFlight: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await refreshClient.post('/refresh-token')
        const newToken = response.data?.data?.token as string | undefined

        if (!newToken) {
          setToken(null)
          dispatchAuthExpired()
          return null
        }

        setToken(newToken)
        return newToken
      } catch {
        setToken(null)
        dispatchAuthExpired()
        return null
      } finally {
        refreshInFlight = null
      }
    })()
  }

  return refreshInFlight
}

type RetryConfig = AxiosRequestConfig & { _retry?: boolean }

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestId = error.config?.headers?.['X-Request-Id']
      ?? error.response?.headers?.['x-request-id']
    if (requestId) {
      error.requestId = requestId
    }

    const original = error.config as RetryConfig | undefined

    if (error.response?.status !== 401 || !original || original._retry || isAuthEndpoint(original.url)) {
      if (requestId) {
        console.error(`[API Error] X-Request-Id: ${requestId}`, error.message)
      }
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      original._retry = true
      const token = await refreshToken()

      if (token) {
        setAuthHeader(original, token)
        return api.request(original)
      }
    }

    return Promise.reject(error)
  },
)
