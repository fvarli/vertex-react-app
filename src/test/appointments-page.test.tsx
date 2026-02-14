import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AppointmentsPage } from '../pages/AppointmentsPage'

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
        <AppointmentsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('AppointmentsPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders appointments fetched from API', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          data: [
            {
              id: 7,
              workspace_id: 1,
              trainer_user_id: 1,
              student_id: 10,
              starts_at: '2026-02-20 10:00:00',
              ends_at: '2026-02-20 11:00:00',
              status: 'planned',
              location: null,
              notes: null,
              created_at: '',
              updated_at: '',
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
              id: 10,
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
          per_page: 100,
          total: 1,
          last_page: 1,
        },
      },
    })

    renderPage()

    expect(await screen.findByText('#7')).toBeInTheDocument()
    expect(screen.getAllByText('Ali Veli').length).toBeGreaterThan(0)
  })
})
