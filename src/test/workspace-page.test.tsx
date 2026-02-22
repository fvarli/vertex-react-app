import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { WorkspacePage } from '../pages/WorkspacePage'

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

vi.mock('../features/auth/auth-context', () => ({
  useAuth: () => ({ refreshProfile: vi.fn() }),
}))

vi.mock('../features/toast/toast-context', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}))

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <WorkspacePage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

function mockWorkspaces() {
  apiMock.get.mockResolvedValueOnce({
    data: {
      data: [
        {
          id: 1,
          name: 'My Gym Workspace',
          role: 'owner_admin',
          approval_status: 'approved',
          approval_note: null,
        },
        {
          id: 2,
          name: 'Second Workspace',
          role: 'trainer',
          approval_status: 'pending',
          approval_note: null,
        },
      ],
    },
  })
}

describe('WorkspacePage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders workspace list from API', async () => {
    mockWorkspaces()
    renderPage()

    expect(await screen.findByText('My Gym Workspace')).toBeInTheDocument()
    expect(await screen.findByText('Second Workspace')).toBeInTheDocument()
    expect(await screen.findByText(/Approved/i)).toBeInTheDocument()
    expect(await screen.findByText(/Pending/i)).toBeInTheDocument()
  })

  it('renders create workspace button', async () => {
    mockWorkspaces()
    renderPage()

    expect(await screen.findByRole('button', { name: /Create Workspace/i })).toBeInTheDocument()
  })
})
