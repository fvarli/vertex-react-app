import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../features/notifications/api'

function formatRelative(value: string): string {
  return dayjs(value).format('DD.MM.YYYY HH:mm')
}

export function NotificationBell() {
  const { t } = useTranslation(['layout'])
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  })

  const listQuery = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => listNotifications({ per_page: 12 }),
    enabled: open,
  })

  const markOneMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  useEffect(() => {
    if (!open) return

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocumentClick)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('mousedown', onDocumentClick)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  const unread = unreadQuery.data ?? 0
  const notifications = listQuery.data ?? []

  return (
    <div className="notification-wrap" ref={rootRef}>
      <button
        type="button"
        className="topbar-icon-button notification-trigger"
        aria-label={t('layout:notifications.aria')}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a5 5 0 0 1 5 5v2.28c0 .67.2 1.32.58 1.88l1.06 1.6c.83 1.26-.07 2.92-1.58 2.92H6.94c-1.51 0-2.4-1.66-1.58-2.92l1.06-1.6A3.4 3.4 0 0 0 7 9.28V7a5 5 0 0 1 5-5m-2 15a2 2 0 1 0 4 0z"
          />
        </svg>
        <span className="topbar-icon-value">{t('layout:notifications.label')}</span>
        {unread > 0 ? <span className="notification-badge">{unread > 99 ? '99+' : unread}</span> : null}
      </button>

      {open ? (
        <div className="notification-dropdown" role="menu">
          <div className="notification-head">
            <strong>{t('layout:notifications.title')}</strong>
            <button
              type="button"
              className="topbar-dropdown-item"
              disabled={markAllMutation.isPending || unread === 0}
              onClick={() => void markAllMutation.mutateAsync()}
            >
              {t('layout:notifications.markAll')}
            </button>
          </div>

          <div className="notification-list">
            {listQuery.isLoading ? <p className="text-xs text-muted">{t('layout:notifications.loading')}</p> : null}
            {!listQuery.isLoading && notifications.length === 0 ? (
              <p className="text-xs text-muted">{t('layout:notifications.empty')}</p>
            ) : null}

            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`notification-item ${notification.read_at ? '' : 'is-unread'}`}
                onClick={() => {
                  if (!notification.read_at) {
                    void markOneMutation.mutateAsync(notification.id)
                  }
                  setOpen(false)
                }}
              >
                <div className="notification-title">{notification.title}</div>
                <div className="notification-body">{notification.body}</div>
                <div className="notification-time">{formatRelative(notification.created_at)}</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
