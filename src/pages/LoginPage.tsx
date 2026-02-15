import { useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../features/auth/auth-context'
import type { ApiUser } from '../features/auth/types'

type LocationState = { from?: { pathname?: string } }

function defaultRouteForUser(user: ApiUser): string {
  if (user.system_role === 'platform_admin' || user.active_workspace_role === 'owner_admin') {
    return '/admin/workspaces'
  }

  return '/trainer/workspaces'
}

export function LoginPage() {
  const { t } = useTranslation(['auth'])
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from?.pathname

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const user = await login({ email, password })
      navigate(from ?? defaultRouteForUser(user), { replace: true })
    } catch (error) {
      const apiMessage = axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined
      setError(apiMessage ?? t('auth:failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="centered-screen">
      <form className="panel" onSubmit={handleSubmit}>
        <h2>{t('auth:signIn')}</h2>
        <label>
          {t('auth:email')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t('auth:password')}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button disabled={isSubmitting}>{isSubmitting ? t('auth:submitting') : t('auth:signIn')}</button>
      </form>
    </div>
  )
}
