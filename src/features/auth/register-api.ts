import { api } from '../../lib/api'
import type { LoginResponse } from './types'

type RegisterPayload = {
  name: string
  surname?: string
  email: string
  phone?: string
  password: string
  password_confirmation: string
}

export async function registerUser(payload: RegisterPayload): Promise<LoginResponse['data']> {
  const response = await api.post<LoginResponse>('/register', payload)
  return response.data.data
}

export async function resendVerificationEmail(): Promise<void> {
  await api.post('/email/resend')
}
