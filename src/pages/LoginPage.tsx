import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../features/auth/auth-context'
import type { ApiUser } from '../features/auth/types'
import { extractApiMessage } from '../lib/api-errors'

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
      setError(extractApiMessage(error, t('auth:failed')))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="centered-screen">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel relative overflow-hidden">
          <div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-primary/20 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-success/20 blur-2xl" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Vertex</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Coach Operations Panel</h1>
            <p className="mt-3 max-w-xl text-sm text-muted">
              Centralize students, weekly programs, appointments, and daily execution from one workspace-aware dashboard.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="kpi-card">
                <p className="text-xs uppercase tracking-[0.08em] text-muted">Students</p>
                <p className="mt-1 text-2xl font-extrabold">50+</p>
              </div>
              <div className="kpi-card">
                <p className="text-xs uppercase tracking-[0.08em] text-muted">Programs</p>
                <p className="mt-1 text-2xl font-extrabold">Weekly</p>
              </div>
              <div className="kpi-card">
                <p className="text-xs uppercase tracking-[0.08em] text-muted">Tracking</p>
                <p className="mt-1 text-2xl font-extrabold">Live</p>
              </div>
            </div>
          </div>
        </section>

        <form className="panel fade-in space-y-4" onSubmit={handleSubmit}>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Access</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{t('auth:signIn')}</h2>
          </div>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t('auth:email')}</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t('auth:password')}</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error ? <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p> : null}

          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('auth:submitting') : t('auth:signIn')}
          </Button>
        </form>
      </div>
    </div>
  )
}
