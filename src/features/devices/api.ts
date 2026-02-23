import { api } from '../../lib/api'
import type { ApiEnvelope } from '../../lib/contracts'
import type { DeviceToken, RegisterDeviceTokenData } from './types'

export async function fetchDeviceTokens(): Promise<DeviceToken[]> {
  const response = await api.get<ApiEnvelope<DeviceToken[]>>('/devices')
  return response.data.data
}

export async function registerDeviceToken(data: RegisterDeviceTokenData): Promise<DeviceToken> {
  const response = await api.post<ApiEnvelope<DeviceToken>>('/devices', data)
  return response.data.data
}

export async function deleteDeviceToken(id: number): Promise<void> {
  await api.delete(`/devices/${id}`)
}
