export type Workspace = {
  id: number
  name: string
  owner_user_id: number
  role: 'owner_admin' | 'trainer' | null
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type WorkspaceListResponse = ApiEnvelope<Workspace[]>
