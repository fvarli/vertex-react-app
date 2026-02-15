import type { ApiEnvelope } from '../../lib/contracts'

export type Workspace = {
  id: number
  name: string
  owner_user_id: number
  role: 'owner_admin' | 'trainer' | null
}


export type WorkspaceListResponse = ApiEnvelope<Workspace[]>
