import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'

type LocationState = { from?: { pathname?: string } }

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/workspaces'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch {
      setError('Login failed. Check email/password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="centered-screen">
      <form className="panel" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign In'}</button>
      </form>
    </div>
  )
}
