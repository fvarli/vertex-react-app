import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { useAuth } from '../features/auth/auth-context'
import { fetchWorkspaces, switchWorkspace } from '../features/workspace/api'
import { setActiveWorkspaceId } from '../lib/storage'

export function WorkspacePage() {
  const { t } = useTranslation(['pages'])
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
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
      <div className="panel">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{t('pages:workspace.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('pages:workspace.description')}</p>
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
              <Badge variant="muted">#{workspace.id}</Badge>
            </div>
            <Button className="mt-4 w-full" onClick={() => void handleSelect(workspace.id, workspace.role)}>
              Open Workspace
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
