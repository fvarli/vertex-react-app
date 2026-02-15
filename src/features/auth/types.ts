export type SystemRole = 'platform_admin' | 'workspace_user'
export type WorkspaceRole = 'owner_admin' | 'trainer' | null

export type ApiUser = {
  id: number
  name: string
  surname?: string | null
  email: string
  system_role: SystemRole
  active_workspace_role: WorkspaceRole
  permissions: string[]
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = ApiEnvelope<{
  user: ApiUser
  token: string
}>

export type MeResponse = ApiEnvelope<ApiUser>
