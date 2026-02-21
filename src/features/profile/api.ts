import { api } from '../../lib/api'
import type { ChangePasswordPayload, DeleteAccountPayload, UpdateProfilePayload } from './types'

export async function updateProfile(payload: UpdateProfilePayload): Promise<void> {
  await api.put('/me', payload)
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await api.put('/me/password', payload)
}

export async function uploadAvatar(file: File): Promise<void> {
  const formData = new FormData()
  formData.append('avatar', file)
  await api.post('/me/avatar', formData)
}

export async function deleteAvatar(): Promise<void> {
  await api.delete('/me/avatar')
}

export async function deleteAccount(payload: DeleteAccountPayload): Promise<void> {
  await api.delete('/me', { data: payload })
}
