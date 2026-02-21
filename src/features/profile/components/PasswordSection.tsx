import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { useToast } from '../../toast/toast-context'
import { changePassword } from '../api'
import { changePasswordSchema, type ChangePasswordInput } from '../schemas'
import { extractApiMessage } from '../../../lib/api-errors'

export function PasswordSection() {
  const { t } = useTranslation(['pages', 'common'])
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  })

  async function onSubmit(data: ChangePasswordInput) {
    try {
      await changePassword(data)
      reset()
      addToast(t('pages:profile.password.changed'), 'success')
    } catch (err) {
      addToast(extractApiMessage(err, t('common:requestFailed')), 'error')
    }
  }

  return (
    <div className="panel space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t('pages:profile.password.title')}</h3>
        <p className="text-sm text-muted">{t('pages:profile.password.description')}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">{t('pages:profile.password.currentPassword')}</span>
          <Input type="password" {...register('current_password')} />
          {errors.current_password ? (
            <span className="text-xs text-danger">{errors.current_password.message}</span>
          ) : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t('pages:profile.password.newPassword')}</span>
            <Input type="password" {...register('password')} />
            {errors.password ? <span className="text-xs text-danger">{errors.password.message}</span> : null}
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t('pages:profile.password.confirmPassword')}</span>
            <Input type="password" {...register('password_confirmation')} />
            {errors.password_confirmation ? (
              <span className="text-xs text-danger">{errors.password_confirmation.message}</span>
            ) : null}
          </label>
        </div>

        <div className="flex justify-end">
          <Button disabled={isSubmitting}>
            {isSubmitting ? t('common:saving') : t('common:save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
