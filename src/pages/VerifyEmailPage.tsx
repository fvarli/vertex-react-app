import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/button'
import { resendVerificationEmail } from '../features/auth/register-api'
import { extractApiMessage } from '../lib/api-errors'

export function VerifyEmailPage() {
  const { t } = useTranslation(['auth'])

  const [resent, setResent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setError(null)
    setIsSubmitting(true)

    try {
      await resendVerificationEmail()
      setResent(true)
    } catch (err) {
      setError(extractApiMessage(err, t('common:requestFailed')))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="centered-screen">
      <div className="panel fade-in w-full max-w-md space-y-4 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Vertex</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{t('auth:verifyEmail.title')}</h2>
          <p className="mt-3 text-sm text-muted">{t('auth:verifyEmail.description')}</p>
        </div>

        {resent ? (
          <div className="rounded-xl bg-success/15 px-3 py-2 text-sm text-success">
            {t('auth:verifyEmail.resent')}
          </div>
        ) : null}

        {error ? <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p> : null}

        <Button className="w-full" variant="outline" disabled={isSubmitting} onClick={handleResend}>
          {isSubmitting ? t('auth:verifyEmail.resending') : t('auth:verifyEmail.resend')}
        </Button>

        <Link to="/login" className="inline-block text-xs text-primary hover:underline">
          {t('auth:verifyEmail.backToLogin')}
        </Link>
      </div>
    </div>
  )
}
