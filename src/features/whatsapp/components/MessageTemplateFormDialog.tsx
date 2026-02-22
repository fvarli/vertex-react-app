import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/button'
import { Dialog } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { messageTemplateSchema, type MessageTemplateSchemaValues } from '../schemas'
import type { MessageTemplate, MessageTemplateFormData } from '../types'
import { TemplatePlaceholderHelp } from './TemplatePlaceholderHelp'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  template: MessageTemplate | null
  submitting: boolean
  onClose: () => void
  onSubmit: (values: MessageTemplateFormData) => Promise<void>
}

export function MessageTemplateFormDialog({ open, mode, template, submitting, onClose, onSubmit }: Props) {
  const { t } = useTranslation(['pages', 'common'])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageTemplateSchemaValues>({
    resolver: zodResolver(messageTemplateSchema),
    defaultValues: {
      name: '',
      body: '',
      is_default: false,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: template?.name ?? '',
      body: template?.body ?? '',
      is_default: template?.is_default ?? false,
    })
  }, [open, template, reset])

  function handleFormSubmit(values: MessageTemplateSchemaValues) {
    return onSubmit({
      ...values,
      channel: 'whatsapp',
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === 'create' ? t('pages:whatsapp.templates.createTitle') : t('pages:whatsapp.templates.editTitle')}
      description={t('pages:whatsapp.templates.formDescription')}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {t('common:cancel')}
          </Button>
          <Button onClick={handleSubmit(handleFormSubmit)} disabled={submitting}>
            {submitting ? t('common:saving') : t('common:save')}
          </Button>
        </>
      }
    >
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          {t('pages:whatsapp.templates.name')}
          <Input {...register('name')} />
          {errors.name ? <span className="text-xs text-danger">{errors.name.message}</span> : null}
        </label>

        <label className="grid gap-1 text-sm">
          {t('pages:whatsapp.templates.body')}
          <textarea
            {...register('body')}
            rows={5}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          {errors.body ? <span className="text-xs text-danger">{errors.body.message}</span> : null}
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('is_default')} className="rounded border-border" />
          {t('pages:whatsapp.templates.isDefault')}
        </label>

        <TemplatePlaceholderHelp />
      </div>
    </Dialog>
  )
}
