import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { useAuth } from '../../auth/auth-context'
import { useToast } from '../../toast/toast-context'
import { updateProfile } from '../api'
import { updateProfileSchema, type UpdateProfileInput } from '../schemas'
import { extractApiMessage } from '../../../lib/api-errors'

export function ProfileInfoSection() {
  const { t } = useTranslation(['pages', 'common'])
  const { user, refreshProfile } = useAuth()
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      surname: user?.surname ?? '',
      phone: user?.phone ?? '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        surname: user.surname ?? '',
        phone: user.phone ?? '',
      })
    }
  }, [user, reset])

  async function onSubmit(data: UpdateProfileInput) {
    try {
      await updateProfile(data)
      await refreshProfile()
      addToast(t('pages:profile.info.updated'), 'success')
    } catch (err) {
      addToast(extractApiMessage(err, t('common:requestFailed')), 'error')
    }
  }

  return (
    <div className="panel space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t('pages:profile.info.title')}</h3>
        <p className="text-sm text-muted">{t('pages:profile.info.description')}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t('pages:profile.info.name')}</span>
            <Input {...register('name')} />
            {errors.name ? <span className="text-xs text-danger">{errors.name.message}</span> : null}
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{t('pages:profile.info.surname')}</span>
            <Input {...register('surname')} />
            {errors.surname ? <span className="text-xs text-danger">{errors.surname.message}</span> : null}
          </label>
        </div>

        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">{t('pages:profile.info.email')}</span>
          <Input type="email" value={user?.email ?? ''} readOnly className="bg-muted/10" />
          <span className="text-xs text-muted">{t('pages:profile.info.emailReadonly')}</span>
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">{t('pages:profile.info.phone')}</span>
          <Input type="tel" {...register('phone')} />
          {errors.phone ? <span className="text-xs text-danger">{errors.phone.message}</span> : null}
        </label>

        <div className="flex justify-end">
          <Button disabled={isSubmitting}>
            {isSubmitting ? t('common:saving') : t('common:save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
