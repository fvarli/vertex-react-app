import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './features/auth/auth-context'
import { ToastProvider } from './features/toast/toast-context'
import { ToastContainer } from './components/ToastContainer'
import { ErrorBoundary } from './components/ErrorBoundary'
import { queryClient } from './app/query-client'
import { router } from './app/router'
import { initTheme } from './features/theme/theme'
import './i18n'
import './index.css'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <RouterProvider router={router} />
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
