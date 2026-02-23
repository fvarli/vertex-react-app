import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { DashboardPage } from '../pages/DashboardPage'

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

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={client}>
        <DashboardPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders summary cards and today timeline', async () => {
    apiMock.get
      .mockResolvedValueOnce({
        data: {
          data: {
            date: '2026-02-16',
            students: { active: 10, passive: 2, total: 12 },
            appointments: { today_total: 3, today_done: 1, today_planned: 2, today_cancelled: 0, upcoming_7d: 8 },
            programs: { active_this_week: 6, draft_this_week: 2 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            data: [
              {
                id: 77,
                workspace_id: 1,
                trainer_user_id: 1,
                student_id: 10,
                starts_at: '2026-02-16 10:00:00',
                ends_at: '2026-02-16 11:00:00',
                status: 'planned',
                location: null,
                notes: null,
                created_at: '',
                updated_at: '',
              },
            ],
            current_page: 1,
            per_page: 50,
            total: 1,
            last_page: 1,
          },
        },
      })

    renderPage()

    expect(await screen.findByText('10')).toBeInTheDocument()
    expect(screen.getByText(/Today Timeline/i)).toBeInTheDocument()
    expect(screen.getByText(/#10/i)).toBeInTheDocument()
  })
})

