import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { resetPassword } from '../features/auth/password-reset-api'
import { resetPasswordSchema, type ResetPasswordInput } from '../features/auth/schemas'
import { extractApiMessage } from '../lib/api-errors'

export function ResetPasswordPage() {
  const { t } = useTranslation(['auth'])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email, password: '', password_confirmation: '' },
  })

  async function onSubmit(data: ResetPasswordInput) {
    setError(null)

    try {
      await resetPassword({ ...data, token })
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      setError(extractApiMessage(err, t('auth:resetPassword.failed')))
    }
  }

  return (
    <div className="centered-screen">
      <div className="panel fade-in w-full max-w-md space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Vertex</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{t('auth:resetPassword.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('auth:resetPassword.description')}</p>
        </div>

        {success ? (
          <div className="rounded-xl bg-success/15 px-3 py-2 text-sm text-success">
            {t('auth:resetPassword.success')}
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">{t('auth:resetPassword.email')}</span>
              <Input type="email" {...register('email')} readOnly className="bg-muted/10" />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">{t('auth:resetPassword.password')}</span>
              <Input type="password" {...register('password')} />
              {errors.password ? (
                <span className="text-xs text-danger">{errors.password.message}</span>
              ) : null}
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">{t('auth:resetPassword.confirmPassword')}</span>
              <Input type="password" {...register('password_confirmation')} />
              {errors.password_confirmation ? (
                <span className="text-xs text-danger">{errors.password_confirmation.message}</span>
              ) : null}
            </label>

            {error ? <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p> : null}

            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('auth:resetPassword.submitting') : t('auth:resetPassword.submit')}
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-xs text-primary hover:underline">
            {t('auth:resetPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  )
}
