import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { useToast } from '../features/toast/toast-context'
import { createWorkspace, fetchWorkspaces, switchWorkspace } from '../features/workspace/api'
import { CreateWorkspaceDialog } from '../features/workspace/components/CreateWorkspaceDialog'
import type { CreateWorkspaceInput } from '../features/workspace/schemas'
import type { WorkspaceApprovalStatus } from '../features/workspace/types'
import { setActiveWorkspaceId } from '../lib/storage'

const statusBadgeVariant: Record<WorkspaceApprovalStatus, 'success' | 'warning' | 'danger'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
}

export function WorkspacePage() {
  const { t } = useTranslation(['pages'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const { refreshProfile } = useAuth()
  const isAdminArea = location.pathname.startsWith('/admin/')
  const { addToast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
  })

  const createMutation = useMutation({
    mutationFn: (values: CreateWorkspaceInput) => createWorkspace(values),
    onSuccess: async (workspace) => {
      setDialogOpen(false)
      await switchWorkspace(workspace.id)
      setActiveWorkspaceId(workspace.id)
      await refreshProfile()
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      navigate('/dashboard', { replace: true })
      addToast(t('pages:workspace.noticeCreated'), 'success')
    },
    onError: () => {
      addToast(t('pages:workspace.error'), 'error')
    },
  })

  async function handleSelect(workspaceId: number, role: string | null) {
    await switchWorkspace(workspaceId)
    setActiveWorkspaceId(workspaceId)
    await refreshProfile()

    if (role === 'owner_admin') {
      navigate('/admin/dashboard', { replace: true })
      return
    }

    navigate('/trainer/dashboard', { replace: true })
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="panel flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Workspace</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{t('pages:workspace.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('pages:workspace.description')}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>{t('pages:workspace.create')}</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : null}

      {isError ? <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{t('pages:workspace.error')}</p> : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {data?.map((workspace) => (
          <div key={workspace.id} className="kpi-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{workspace.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {workspace.role ?? t('pages:workspace.member')}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={statusBadgeVariant[workspace.approval_status]}>
                  {t(`pages:workspace.status.${workspace.approval_status}`)}
                </Badge>
                <Badge variant="muted">#{workspace.id}</Badge>
              </div>
            </div>

            {workspace.approval_status === 'rejected' && workspace.approval_note ? (
              <p className="mt-2 rounded-lg bg-danger/10 px-2.5 py-1.5 text-xs text-danger">
                {t('pages:workspace.rejectedNote')}: {workspace.approval_note}
              </p>
            ) : null}

            {workspace.approval_status === 'pending' ? (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                {t('pages:workspace.pendingHint')}
              </p>
            ) : null}

            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={() => void handleSelect(workspace.id, workspace.role)}>
                {t('pages:workspace.openWorkspace')}
              </Button>
              {isAdminArea && workspace.role === 'owner_admin' ? (
                <Button variant="outline" onClick={() => {
                  void handleSelect(workspace.id, workspace.role).then(() => navigate('/admin/workspace-settings'))
                }}>
                  {t('pages:workspaceSettings.sectionLabel')}
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <CreateWorkspaceDialog
        open={dialogOpen}
        submitting={createMutation.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (values) => { await createMutation.mutateAsync(values) }}
      />
    </div>
  )
}
