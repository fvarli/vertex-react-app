import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
    <div className="panel page">
      <h2>{t('pages:workspace.title')}</h2>
      <p>{t('pages:workspace.description')}</p>
      {isLoading ? <p>{t('pages:workspace.loading')}</p> : null}
      {isError ? <p className="error">{t('pages:workspace.error')}</p> : null}
      <div className="list">
        {data?.map((workspace) => (
          <button key={workspace.id} onClick={() => void handleSelect(workspace.id, workspace.role)}>
            {workspace.name} ({workspace.role ?? t('pages:workspace.member')})
          </button>
        ))}
      </div>
    </div>
  )
}
