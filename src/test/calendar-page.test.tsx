import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { CalendarPage } from '../pages/CalendarPage'

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
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <CalendarPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('CalendarPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders grouped day entries from calendar API', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          from: '2026-02-20 00:00:00',
          to: '2026-02-27 23:59:59',
          appointments: [
            {
              id: 3,
              workspace_id: 1,
              trainer_user_id: 1,
              student_id: 8,
              starts_at: '2026-02-21 10:00:00',
              ends_at: '2026-02-21 11:00:00',
              status: 'planned',
              location: null,
              notes: null,
              created_at: '',
              updated_at: '',
            },
          ],
          days: [
            {
              date: '2026-02-21',
              items: [
                {
                  id: 3,
                  workspace_id: 1,
                  trainer_user_id: 1,
                  student_id: 8,
                  starts_at: '2026-02-21 10:00:00',
                  ends_at: '2026-02-21 11:00:00',
                  status: 'planned',
                  location: null,
                  notes: null,
                  created_at: '',
                  updated_at: '',
                },
              ],
            },
          ],
        },
      },
    })

    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          data: [],
          current_page: 1,
          per_page: 100,
          total: 0,
          last_page: 1,
        },
      },
    })

    renderPage()

    expect(await screen.findByText(/Saturday, 21 Feb 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/Student #8/i)).toBeInTheDocument()
  })
})
