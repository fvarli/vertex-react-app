import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/button'
import { Dialog } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { createWorkspaceSchema, type CreateWorkspaceInput } from '../schemas'

type CreateWorkspaceDialogProps = {
  open: boolean
  submitting: boolean
  onClose: () => void
  onSubmit: (values: CreateWorkspaceInput) => Promise<void>
}

export function CreateWorkspaceDialog({ open, submitting, onClose, onSubmit }: CreateWorkspaceDialogProps) {
  const { t } = useTranslation(['pages', 'common'])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (!open) return
    reset({ name: '' })
  }, [open, reset])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('pages:workspace.createTitle')}
      description={t('pages:workspace.createDescription')}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {t('common:cancel')}
          </Button>
          <Button onClick={handleSubmit((values) => onSubmit(values))} disabled={submitting}>
            {submitting ? t('common:saving') : t('common:save')}
          </Button>
        </>
      }
    >
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          {t('pages:workspace.form.name')}
          <Input {...register('name')} />
          {errors.name ? <span className="text-xs text-danger">{errors.name.message}</span> : null}
        </label>
      </div>
    </Dialog>
  )
}
