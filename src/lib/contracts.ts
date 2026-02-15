export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  request_id?: string
  meta?: Record<string, unknown>
  links?: Record<string, unknown>
}

