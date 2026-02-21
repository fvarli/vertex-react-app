import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getActiveWorkspaceId } from '../../lib/storage'
import { fetchWorkspaces } from './api'
import type { Workspace, WorkspaceApprovalStatus } from './types'

export type WorkspaceAccessState = {
  activeWorkspace: Workspace | null
  approvalStatus: WorkspaceApprovalStatus | null
  canMutate: boolean
  approvalMessage: string | null
}

export function useWorkspaceAccess(): WorkspaceAccessState {
  const { data } = useQuery({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
  })

  return useMemo(() => {
    const activeId = getActiveWorkspaceId()
    const activeWorkspace = activeId ? data?.find((workspace) => workspace.id === activeId) ?? null : null
    const approvalStatus = activeWorkspace?.approval_status ?? null

    if (!activeWorkspace) {
      return {
        activeWorkspace: null,
        approvalStatus: null,
        canMutate: true,
        approvalMessage: null,
      }
    }

    if (approvalStatus === 'approved') {
      return {
        activeWorkspace,
        approvalStatus,
        canMutate: true,
        approvalMessage: null,
      }
    }

    if (approvalStatus === 'pending') {
      return {
        activeWorkspace,
        approvalStatus,
        canMutate: false,
        approvalMessage: 'Workspace approval is pending. Editing actions are temporarily disabled.',
      }
    }

    return {
      activeWorkspace,
      approvalStatus,
      canMutate: false,
      approvalMessage: activeWorkspace.approval_note?.trim()
        ? `Workspace approval was rejected: ${activeWorkspace.approval_note.trim()}`
        : 'Workspace approval was rejected. Contact platform admin.',
    }
  }, [data])
}
