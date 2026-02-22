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

export async function createWorkspace(payload: { name: string }): Promise<Workspace> {
  const response = await api.post<WorkspaceListResponse>('/workspaces', payload)
  return response.data.data as unknown as Workspace
}

export async function updateWorkspace(workspaceId: number, payload: { name: string }): Promise<Workspace> {
  const response = await api.put<WorkspaceListResponse>(`/workspaces/${workspaceId}`, payload)
  return response.data.data as unknown as Workspace
}

export type WorkspaceMember = {
  id: number
  name: string
  surname: string
  email: string
  role: string
  is_active: boolean
}

export async function fetchWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
  const response = await api.get<{ success: boolean; data: WorkspaceMember[] }>(`/workspaces/${workspaceId}/members`)
  return response.data.data
}

export async function switchWorkspace(workspaceId: number): Promise<void> {
  await api.post(`/workspaces/${workspaceId}/switch`)
}
