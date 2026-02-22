import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  registration.active?.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig })

  navigator.serviceWorker.ready.then((reg) => {
    reg.active?.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig })
  })

  return registration
}

export async function requestNotificationPermission(): Promise<string | null> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return null
  }

  const swRegistration = await registerServiceWorker()

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swRegistration,
  })

  return token
}

export function onMessageListener(callback: (payload: MessagePayload) => void): () => void {
  return onMessage(messaging, callback)
}
