import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { queryClient } from '../app/query-client'
import { AuthProvider } from '../features/auth/auth-context'
import { LoginPage } from '../pages/LoginPage'

describe('LoginPage', () => {
  it('renders sign in heading', () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })
})
