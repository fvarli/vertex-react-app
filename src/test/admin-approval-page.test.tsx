import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AdminApprovalPage } from '../pages/AdminApprovalPage'

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

vi.mock('../features/toast/toast-context', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}))

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={client}>
        <AdminApprovalPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('AdminApprovalPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders pending workspace approvals', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          data: [
            {
              id: 5,
              name: 'New Gym',
              owner_user_id: 10,
              approval_status: 'pending',
              approval_note: null,
              created_at: '2026-02-20T10:00:00.000000Z',
              owner: { id: 10, name: 'Mehmet', surname: 'Kara', email: 'mehmet@test.com' },
            },
          ],
          current_page: 1,
          per_page: 15,
          total: 1,
          last_page: 1,
        },
      },
    })

    renderPage()

    expect(await screen.findByText('New Gym')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
  })

  it('renders empty state when no pending workspaces', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          data: [],
          current_page: 1,
          per_page: 15,
          total: 0,
          last_page: 1,
        },
      },
    })

    renderPage()

    expect(await screen.findByText(/no pending/i)).toBeInTheDocument()
  })
})
