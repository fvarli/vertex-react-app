import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import { AdminRoute, TrainerRoute, WorkspaceRoute } from '../components/RouteGuards'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  getActiveWorkspaceId: vi.fn(),
}))

vi.mock('../features/auth/auth-context', () => ({
  useAuth: mocks.useAuth,
}))

vi.mock('../lib/storage', () => ({
  getActiveWorkspaceId: mocks.getActiveWorkspaceId,
}))

describe('RouteGuards', () => {
  beforeEach(() => {
    mocks.useAuth.mockReset()
    mocks.getActiveWorkspaceId.mockReset()
  })

  it('redirects non-admin users from admin area to forbidden page', async () => {
    mocks.useAuth.mockReturnValue({ isAdminArea: false })

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<div>Admin page</div>} />
          </Route>
          <Route path="/forbidden" element={<div>Forbidden page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Forbidden page')).toBeInTheDocument()
  })

  it('redirects admin users from trainer area to forbidden page', async () => {
    mocks.useAuth.mockReturnValue({ isAdminArea: true })

    render(
      <MemoryRouter initialEntries={['/trainer/dashboard']}>
        <Routes>
          <Route element={<TrainerRoute />}>
            <Route path="/trainer/dashboard" element={<div>Trainer page</div>} />
          </Route>
          <Route path="/forbidden" element={<div>Forbidden page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Forbidden page')).toBeInTheDocument()
  })

  it('redirects to workspace selector when active workspace is missing', async () => {
    mocks.getActiveWorkspaceId.mockReturnValue(null)

    render(
      <MemoryRouter initialEntries={['/admin/students']}>
        <Routes>
          <Route element={<WorkspaceRoute area="admin" />}>
            <Route path="/admin/students" element={<div>Students page</div>} />
          </Route>
          <Route path="/admin/workspaces" element={<div>Workspace selector</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Workspace selector')).toBeInTheDocument()
  })
})
