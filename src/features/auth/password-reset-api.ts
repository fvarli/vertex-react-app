import { api } from '../../lib/api'

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/forgot-password', { email })
}

type ResetPasswordPayload = {
  email: string
  password: string
  password_confirmation: string
  token: string
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await api.post('/reset-password', payload)
}
