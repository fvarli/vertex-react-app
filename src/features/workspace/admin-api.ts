import { api } from '../../lib/api'
import type { Workspace, WorkspaceApprovalStatus } from './types'

type PaginationMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type PendingWorkspacesResponse = {
  data: {
    data: Workspace[]
    meta: PaginationMeta
  }
  meta?: Record<string, unknown>
}

export async function fetchPendingWorkspaces(page = 1): Promise<{ data: Workspace[]; meta: PaginationMeta }> {
  const response = await api.get<PendingWorkspacesResponse>('/platform/workspaces/pending', {
    params: { page },
  })
  return response.data.data
}

export async function updateWorkspaceApproval(
  id: number,
  payload: { approval_status: WorkspaceApprovalStatus; approval_note?: string },
): Promise<void> {
  await api.patch(`/platform/workspaces/${id}/approval`, payload)
}
