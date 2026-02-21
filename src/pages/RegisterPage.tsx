import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../features/auth/auth-context'
import { registerUser } from '../features/auth/register-api'
import { registerSchema, type RegisterInput } from '../features/auth/register-schema'
import { extractApiMessage, extractValidationErrors } from '../lib/api-errors'
import { setToken } from '../lib/storage'

export function RegisterPage() {
  const { t } = useTranslation(['auth'])
  const { refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
    },
  })

  async function onSubmit(data: RegisterInput) {
    setError(null)

    try {
      const result = await registerUser(data)
      setToken(result.token)
      await refreshProfile()
      navigate('/verify-email', { replace: true })
    } catch (err) {
      setError(extractApiMessage(err, t('auth:register.failed')))

      const fieldErrors = extractValidationErrors(err)
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages[0]) {
          setFieldError(field as keyof RegisterInput, { message: messages[0] })
        }
      }
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

        <form className="panel fade-in space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Access</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{t('auth:register.title')}</h2>
            <p className="mt-1 text-sm text-muted">{t('auth:register.description')}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">{t('auth:register.name')}</span>
              <Input {...register('name')} />
              {errors.name ? <span className="text-xs text-danger">{errors.name.message}</span> : null}
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">{t('auth:register.surname')}</span>
              <Input {...register('surname')} />
              {errors.surname ? <span className="text-xs text-danger">{errors.surname.message}</span> : null}
            </label>
          </div>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t('auth:register.email')}</span>
            <Input type="email" {...register('email')} />
            {errors.email ? <span className="text-xs text-danger">{errors.email.message}</span> : null}
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t('auth:register.phone')}</span>
            <Input type="tel" {...register('phone')} />
            {errors.phone ? <span className="text-xs text-danger">{errors.phone.message}</span> : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">{t('auth:register.password')}</span>
              <Input type="password" {...register('password')} />
              {errors.password ? <span className="text-xs text-danger">{errors.password.message}</span> : null}
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">{t('auth:register.confirmPassword')}</span>
              <Input type="password" {...register('password_confirmation')} />
              {errors.password_confirmation ? (
                <span className="text-xs text-danger">{errors.password_confirmation.message}</span>
              ) : null}
            </label>
          </div>

          {error ? <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p> : null}

          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('auth:register.submitting') : t('auth:register.submit')}
          </Button>

          <p className="text-center text-sm text-muted">
            {t('auth:register.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline">
              {t('auth:register.signInLink')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
