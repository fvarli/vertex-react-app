import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useToast } from '../toast/toast-context'
import { requestNotificationPermission, onMessageListener } from '../../lib/firebase'
import { registerDeviceToken } from './api'

export function usePushNotifications() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    requestNotificationPermission()
      .then((token) => {
        if (token) {
          return registerDeviceToken({ token, platform: 'web' })
        }
      })
      .catch(() => {
        // Notification permission denied or Firebase not configured — ignore
      })
  }, [])

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      const title = payload.notification?.title ?? ''
      const body = payload.notification?.body ?? ''
      const message = body ? `${title}: ${body}` : title

      if (message) {
        addToast(message, 'info')
      }

      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })

    return unsubscribe
  }, [addToast, queryClient])
}
