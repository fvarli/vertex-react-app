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
  request_id?: string
  meta?: Record<string, unknown>
  links?: Record<string, unknown>
}

export type WorkspaceListResponse = ApiEnvelope<Workspace[]>
