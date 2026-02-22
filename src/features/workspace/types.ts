import type { ApiEnvelope } from '../../lib/contracts'

export type WorkspaceApprovalStatus = 'pending' | 'approved' | 'rejected'

export type Workspace = {
  id: number
  name: string
  owner_user_id: number
  approval_status: WorkspaceApprovalStatus
  approval_requested_at: string | null
  approved_at: string | null
  approved_by_user_id: number | null
  approval_note: string | null
  role: 'owner_admin' | 'trainer' | null
  created_at?: string
  updated_at?: string
}

export type WorkspaceListResponse = ApiEnvelope<Workspace[]>
