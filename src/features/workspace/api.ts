import { api } from '../../lib/api'
import type { WorkspaceListResponse } from './types'

export async function fetchWorkspaces() {
  const response = await api.get<WorkspaceListResponse>('/me/workspaces')
  return response.data.data
}

export async function switchWorkspace(workspaceId: number): Promise<void> {
  await api.post(`/workspaces/${workspaceId}/switch`)
}
