import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { fetchWorkspaces, switchWorkspace } from '../features/workspace/api'
import { setActiveWorkspaceId } from '../lib/storage'

export function WorkspacePage() {
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
      <h2>Workspaces</h2>
      <p>Select active workspace to continue.</p>
      {isLoading ? <p>Loading workspaces...</p> : null}
      {isError ? <p className="error">Could not load workspaces.</p> : null}
      <div className="list">
        {data?.map((workspace) => (
          <button key={workspace.id} onClick={() => void handleSelect(workspace.id, workspace.role)}>
            {workspace.name} ({workspace.role ?? 'member'})
          </button>
        ))}
      </div>
    </div>
  )
}
