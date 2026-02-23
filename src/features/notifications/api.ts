import { api } from '../../lib/api'
import type { AppNotification, NotificationListResponse, UnreadCountResponse } from './types'

export async function listNotifications(params?: { unread_only?: boolean; per_page?: number }): Promise<AppNotification[]> {
  const response = await api.get<NotificationListResponse>('/me/notifications', {
    params: {
      unread_only: params?.unread_only ? 1 : 0,
      per_page: params?.per_page ?? 15,
    },
  })

  return response.data.data.data
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get<UnreadCountResponse>('/me/notifications/unread-count')
  return response.data.data.count
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await api.patch(`/me/notifications/${notificationId}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/me/notifications/read-all')
}
