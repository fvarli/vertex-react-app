import axios, { type AxiosRequestConfig } from 'axios'
import { generateRequestId } from './requestId'
import { getToken, setToken } from './storage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  config.headers.set('X-Request-Id', generateRequestId())

  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

let refreshInFlight: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await api.post('/refresh-token')
        const newToken = response.data?.data?.token as string | undefined

        if (!newToken) {
          setToken(null)
          return null
        }

        setToken(newToken)
        return newToken
      } catch {
        setToken(null)
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
    const original = error.config as RetryConfig | undefined

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      const token = await refreshToken()

      if (token) {
        return api.request(original)
      }
    }

    return Promise.reject(error)
  },
)
