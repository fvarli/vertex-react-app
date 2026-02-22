import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Skeleton } from '../../../components/ui/skeleton'
import { Table, TBody, TD, TH, THead } from '../../../components/ui/table'
import { useAuth } from '../../auth/auth-context'
import { extractApiMessage } from '../../../lib/api-errors'
import {
  createMessageTemplate,
  deleteMessageTemplate,
  fetchMessageTemplates,
  updateMessageTemplate,
} from '../api'
import type { MessageTemplate, MessageTemplateFormData } from '../types'
import { MessageTemplateFormDialog } from './MessageTemplateFormDialog'

export function MessageTemplatesTab() {
  const { t } = useTranslation(['pages', 'common'])
  const { workspaceRole } = useAuth()
  const location = useLocation()
  const isOwnerAdmin = workspaceRole === 'owner_admin'
  const isAdminArea = location.pathname.startsWith('/admin/')
  const canManage = isOwnerAdmin && isAdminArea
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)

  const query = useQuery({
    queryKey: ['message-templates'],
    queryFn: fetchMessageTemplates,
  })

  const createMutation = useMutation({
    mutationFn: createMessageTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['message-templates'] })
      setDialogOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MessageTemplateFormData }) =>
      updateMessageTemplate(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['message-templates'] })
      setDialogOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMessageTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['message-templates'] })
    },
  })

  function handleCreate() {
    setDialogMode('create')
    setEditingTemplate(null)
    setDialogOpen(true)
  }

  function handleEdit(template: MessageTemplate) {
    setDialogMode('edit')
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  async function handleSubmit(values: MessageTemplateFormData) {
    if (dialogMode === 'create') {
      await createMutation.mutateAsync(values)
    } else if (editingTemplate) {
      await updateMutation.mutateAsync({ id: editingTemplate.id, data: values })
    }
  }

  const templates = query.data ?? []
  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      {canManage ? (
        <div className="flex justify-end">
          <Button size="sm" onClick={handleCreate}>
            {t('pages:whatsapp.templates.new')}
          </Button>
        </div>
      ) : null}

      {query.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : query.isError ? (
        <p className="rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">
          {extractApiMessage(query.error, t('common:requestFailed'))}
        </p>
      ) : templates.length === 0 ? (
        <p className="text-center text-sm text-muted">{t('pages:whatsapp.templates.empty')}</p>
      ) : (
        <>
          <div className="table-surface hidden md:block">
            <Table>
              <THead>
                <tr>
                  <TH>{t('pages:whatsapp.templates.name')}</TH>
                  <TH>{t('pages:whatsapp.templates.body')}</TH>
                  <TH>{t('pages:whatsapp.templates.default')}</TH>
                  {canManage ? <TH>{t('pages:whatsapp.templates.actions')}</TH> : null}
                </tr>
              </THead>
              <TBody>
                {templates.map((tmpl) => (
                  <tr key={tmpl.id}>
                    <TD>{tmpl.name}</TD>
                    <TD>
                      <span className="line-clamp-2 max-w-xs text-xs">{tmpl.body}</span>
                    </TD>
                    <TD>
                      {tmpl.is_default ? (
                        <Badge variant="success">{t('pages:whatsapp.templates.defaultBadge')}</Badge>
                      ) : null}
                    </TD>
                    {canManage ? (
                      <TD>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(tmpl)}>
                            {t('common:edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(tmpl.id)}
                          >
                            {t('common:delete')}
                          </Button>
                        </div>
                      </TD>
                    ) : null}
                  </tr>
                ))}
              </TBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="rounded-xl border border-border/70 bg-card/75 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{tmpl.name}</p>
                  {tmpl.is_default ? (
                    <Badge variant="success">{t('pages:whatsapp.templates.defaultBadge')}</Badge>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{tmpl.body}</p>
                {canManage ? (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(tmpl)}>
                      {t('common:edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(tmpl.id)}
                    >
                      {t('common:delete')}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}

      <MessageTemplateFormDialog
        open={dialogOpen}
        mode={dialogMode}
        template={editingTemplate}
        submitting={submitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
