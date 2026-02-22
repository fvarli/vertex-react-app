/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js')

let isInitialized = false

self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG' && !isInitialized) {
    firebase.initializeApp(event.data.config)
    const messaging = firebase.messaging()

    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title ?? 'New Notification'
      const options = {
        body: payload.notification?.body ?? '',
        icon: '/favicon.ico',
        data: payload.data,
      }

      self.registration.showNotification(title, options)
    })

    isInitialized = true
  }
})
