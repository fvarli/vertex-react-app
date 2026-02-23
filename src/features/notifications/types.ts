import type { ApiEnvelope } from '../../lib/contracts'

export type AppNotification = {
  id: string
  type: string
  title: string
  body: string
  action_url: string | null
  read_at: string | null
  created_at: string
  data: Record<string, unknown>
}

export type NotificationListResponse = ApiEnvelope<{ data: AppNotification[] }>

export type UnreadCountResponse = ApiEnvelope<{
  count: number
}>
