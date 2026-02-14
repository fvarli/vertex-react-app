export type ApiUser = {
  id: number
  name: string
  surname?: string | null
  email: string
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
