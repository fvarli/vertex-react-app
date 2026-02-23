import { AxiosError, isAxiosError } from 'axios'

type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

export function extractApiMessage(error: unknown, fallback: string): string {
  if (!(error instanceof AxiosError)) return fallback
  const data = error.response?.data as ApiErrorPayload | undefined

  if (error.response?.status === 422 && data?.errors) {
    const firstField = Object.keys(data.errors)[0]
    const firstMessage = firstField ? data.errors[firstField]?.[0] : undefined
    if (typeof firstMessage === 'string' && firstMessage.trim() !== '') {
      return firstMessage
    }
  }

  const message = data?.message
  return typeof message === 'string' && message.trim() !== '' ? message : fallback
}

export function isForbidden(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 403
}

export function isWorkspaceApprovalRequired(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false
  if (error.response?.status !== 403) return false

  const message = ((error.response?.data as ApiErrorPayload | undefined)?.message ?? '').toLowerCase()
  return message.includes('approval') && message.includes('workspace')
}

export function isValidationError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 422
}

export function extractValidationErrors(error: unknown): Record<string, string[]> {
  if (!(error instanceof AxiosError)) return {}
  const errors = (error.response?.data as ApiErrorPayload | undefined)?.errors
  if (!errors || typeof errors !== 'object') return {}
  return errors
}

export function extractRequestId(error: unknown): string | undefined {
  if (isAxiosError(error)) {
    return (error as AxiosError & { requestId?: string }).requestId
      ?? error.config?.headers?.['X-Request-Id'] as string | undefined
  }
  return undefined
}
