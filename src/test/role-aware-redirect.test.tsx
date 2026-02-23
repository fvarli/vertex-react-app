import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import { RoleAwareRedirect } from '../components/RoleAwareRedirect'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../features/auth/auth-context', () => ({
  useAuth: mocks.useAuth,
}))

describe('RoleAwareRedirect', () => {
  beforeEach(() => {
    mocks.useAuth.mockReset()
  })

  it('routes admin user to admin path', async () => {
    mocks.useAuth.mockReturnValue({ isReady: true, isAdminArea: true })

    render(
      <MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<RoleAwareRedirect adminPath="/admin/workspaces" trainerPath="/trainer/workspaces" />} />
          <Route path="/admin/workspaces" element={<div>Admin workspace</div>} />
          <Route path="/trainer/workspaces" element={<div>Trainer workspace</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Admin workspace')).toBeInTheDocument()
  })

  it('routes trainer user to trainer path', async () => {
    mocks.useAuth.mockReturnValue({ isReady: true, isAdminArea: false })

    render(
      <MemoryRouter initialEntries={['/dashboard']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/dashboard" element={<RoleAwareRedirect adminPath="/admin/dashboard" trainerPath="/trainer/dashboard" />} />
          <Route path="/admin/dashboard" element={<div>Admin dashboard</div>} />
          <Route path="/trainer/dashboard" element={<div>Trainer dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Trainer dashboard')).toBeInTheDocument()
  })
})

