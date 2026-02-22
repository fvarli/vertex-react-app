export type DeviceToken = {
  id: number
  user_id: number
  token: string
  platform: string
  created_at: string
  updated_at: string
}

export type RegisterDeviceTokenData = {
  token: string
  platform: string
}
