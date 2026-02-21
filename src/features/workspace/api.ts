import { api } from '../../lib/api'
import { getActiveWorkspaceId } from '../../lib/storage'
import type { Workspace, WorkspaceListResponse } from './types'

export async function fetchWorkspaces(): Promise<Workspace[]> {
  const response = await api.get<WorkspaceListResponse>('/me/workspaces')
  return response.data.data
}

export async function fetchActiveWorkspace(): Promise<Workspace | null> {
  const workspaces = await fetchWorkspaces()
  const activeId = getActiveWorkspaceId()

  if (!activeId) {
    return null
  }

  return workspaces.find((workspace) => workspace.id === activeId) ?? null
}

export async function switchWorkspace(workspaceId: number): Promise<void> {
  await api.post(`/workspaces/${workspaceId}/switch`)
}
