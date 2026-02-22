import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { RemindersPage } from '../pages/RemindersPage'

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
  useWorkspaceAccess: () => ({ canMutate: true, approvalMessage: null }),
}))

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <RemindersPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('RemindersPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders reminders fetched from API', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          data: [
            {
              id: 1,
              workspace_id: 1,
              appointment_id: 10,
              channel: 'whatsapp',
              scheduled_for: '2026-02-22 09:00:00',
              status: 'pending',
              attempt_count: 0,
              last_attempted_at: null,
              next_retry_at: null,
              escalated_at: null,
              failure_reason: null,
              opened_at: null,
              marked_sent_at: null,
              marked_sent_by_user_id: null,
              appointment: {
                id: 10,
                student_id: 1,
                trainer_user_id: 1,
                starts_at: '2026-02-22 10:00:00',
                ends_at: '2026-02-22 11:00:00',
                status: 'planned',
              },
            },
          ],
          current_page: 1,
          per_page: 15,
          total: 1,
          last_page: 1,
        },
      },
    })

    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          data: [
            {
              id: 1,
              workspace_id: 1,
              trainer_user_id: 1,
              full_name: 'Ali Veli',
              phone: '+905551234567',
              notes: null,
              status: 'active',
              created_at: '',
              updated_at: '',
            },
          ],
          current_page: 1,
          per_page: 200,
          total: 1,
          last_page: 1,
        },
      },
    })

    renderPage()

    expect((await screen.findAllByText('Ali Veli')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0)
  })

  it('renders page title', async () => {
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

    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          data: [],
          current_page: 1,
          per_page: 200,
          total: 0,
          last_page: 1,
        },
      },
    })

    renderPage()

    expect(await screen.findByText(/Reminders/i)).toBeInTheDocument()
  })
})
