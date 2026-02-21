import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { forgotPassword } from '../features/auth/password-reset-api'
import { extractApiMessage } from '../lib/api-errors'

export function ForgotPasswordPage() {
  const { t } = useTranslation(['auth'])

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(extractApiMessage(err, t('auth:forgotPassword.failed', 'Request failed. Please try again.')))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="centered-screen">
      <div className="panel fade-in w-full max-w-md space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Vertex</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{t('auth:forgotPassword.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('auth:forgotPassword.description')}</p>
        </div>

        {success ? (
          <div className="rounded-xl bg-success/15 px-3 py-2 text-sm text-success">
            {t('auth:forgotPassword.success')}
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">{t('auth:email')}</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            {error ? <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p> : null}

            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('auth:forgotPassword.submitting') : t('auth:forgotPassword.submit')}
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-xs text-primary hover:underline">
            {t('auth:forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  )
}
