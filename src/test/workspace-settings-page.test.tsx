import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { WorkspaceSettingsPage } from '../pages/WorkspaceSettingsPage'

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}))

vi.mock('../lib/api', () => ({
  api: apiMock,
}))

vi.mock('../features/workspace/access', () => ({
  useWorkspaceAccess: () => ({
    activeWorkspace: { id: 1, name: 'Test Workspace', approval_status: 'approved' },
    canMutate: true,
    approvalMessage: null,
  }),
}))

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <WorkspaceSettingsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('WorkspaceSettingsPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders settings page with members list', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        data: [
          { id: 1, name: 'John', surname: 'Doe', email: 'john@example.com', role: 'owner_admin', is_active: true },
          { id: 2, name: 'Jane', surname: 'Smith', email: 'jane@example.com', role: 'trainer', is_active: true },
        ],
      },
    })

    renderPage()

    const johnEmails = await screen.findAllByText('john@example.com')
    expect(johnEmails.length).toBeGreaterThanOrEqual(1)
    const janeEmails = await screen.findAllByText('jane@example.com')
    expect(janeEmails.length).toBeGreaterThanOrEqual(1)
  })

  it('renders workspace name in settings', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        data: [
          { id: 1, name: 'John', surname: 'Doe', email: 'john@example.com', role: 'owner_admin', is_active: true },
        ],
      },
    })

    renderPage()

    expect(await screen.findByText(/Workspace Settings/i)).toBeInTheDocument()
  })
})
