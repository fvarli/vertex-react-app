import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Dialog } from '../components/ui/dialog'
import { Skeleton } from '../components/ui/skeleton'
import { useToast } from '../features/toast/toast-context'
import { fetchPendingWorkspaces, updateWorkspaceApproval } from '../features/workspace/admin-api'
import type { WorkspaceApprovalStatus } from '../features/workspace/types'

type ConfirmState = {
  workspaceId: number
  workspaceName: string
  action: 'approved' | 'rejected'
} | null

export function AdminApprovalPage() {
  const { t } = useTranslation(['pages', 'common'])
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const [note, setNote] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'pending-workspaces', page],
    queryFn: () => fetchPendingWorkspaces(page),
  })

  const mutation = useMutation({
    mutationFn: (payload: { id: number; approval_status: WorkspaceApprovalStatus; approval_note?: string }) =>
      updateWorkspaceApproval(payload.id, {
        approval_status: payload.approval_status,
        approval_note: payload.approval_note,
      }),
    onSuccess: () => {
      setConfirm(null)
      setNote('')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'pending-workspaces'] })
      addToast(t('pages:adminApproval.noticeUpdated'), 'success')
    },
    onError: () => {
      addToast(t('common:requestFailed'), 'error')
    },
  })

  function handleConfirm() {
    if (!confirm) return
    mutation.mutate({
      id: confirm.workspaceId,
      approval_status: confirm.action,
      approval_note: note.trim() || undefined,
    })
  }

  const workspaces = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5 fade-in">
      <div className="panel">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:adminApproval.sectionLabel')}</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{t('pages:adminApproval.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('pages:adminApproval.description')}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{t('common:requestFailed')}</p>
      ) : null}

      {!isLoading && !isError && workspaces.length === 0 ? (
        <p className="rounded-xl bg-border/50 px-4 py-6 text-center text-sm text-muted">{t('pages:adminApproval.empty')}</p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {workspaces.map((ws) => (
          <div key={ws.id} className="kpi-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{ws.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {t('pages:adminApproval.owner')}: #{ws.owner_user_id}
                </p>
                {ws.created_at ? (
                  <p className="mt-0.5 text-xs text-muted">
                    {t('pages:adminApproval.requestedAt')}: {new Date(ws.created_at).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
              <Badge variant="warning">#{ws.id}</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setConfirm({ workspaceId: ws.id, workspaceName: ws.name, action: 'approved' })}
              >
                {t('pages:adminApproval.approve')}
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setConfirm({ workspaceId: ws.id, workspaceName: ws.name, action: 'rejected' })}
              >
                {t('pages:adminApproval.reject')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {meta && meta.last_page > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('common:prev')}
          </Button>
          <span className="text-sm text-muted">
            {t('common:page')} {meta.current_page} / {meta.last_page}
          </span>
          <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
            {t('common:next')}
          </Button>
        </div>
      ) : null}

      <Dialog
        open={confirm !== null}
        onClose={() => {
          setConfirm(null)
          setNote('')
        }}
        title={
          confirm?.action === 'approved'
            ? t('pages:adminApproval.approveTitle')
            : t('pages:adminApproval.rejectTitle')
        }
        description={t('pages:adminApproval.confirmDescription', { name: confirm?.workspaceName ?? '' })}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setConfirm(null)
                setNote('')
              }}
              disabled={mutation.isPending}
            >
              {t('common:cancel')}
            </Button>
            <Button onClick={handleConfirm} disabled={mutation.isPending}>
              {mutation.isPending ? t('common:saving') : t('common:confirm')}
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            {t('pages:adminApproval.noteLabel')}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={t('pages:adminApproval.notePlaceholder')}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
        </div>
      </Dialog>
    </div>
  )
}
