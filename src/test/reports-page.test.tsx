import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ReportsPage } from '../pages/ReportsPage'

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
  useAuth: () => ({ workspaceRole: 'trainer' }),
}))

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <MemoryRouter initialEntries={['/trainer/reports']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={client}>
        <ReportsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('ReportsPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders report page with tabs and appointment data', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          totals: { total: 5, planned: 2, done: 2, cancelled: 1, no_show: 0 },
          buckets: [
            { bucket: '2026-02-20', total: 5, planned: 2, done: 2, cancelled: 1, no_show: 0 },
          ],
          filters: { date_from: '2026-01-23', date_to: '2026-02-22', group_by: 'day', trainer_id: null },
        },
      },
    })

    renderPage()

    const totalElements = await screen.findAllByText('5')
    expect(totalElements.length).toBeGreaterThan(0)
    expect(await screen.findByText(/Appointments/i)).toBeInTheDocument()
  })

  it('renders page title', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          totals: { total: 0, planned: 0, done: 0, cancelled: 0, no_show: 0 },
          buckets: [],
          filters: { date_from: '2026-01-23', date_to: '2026-02-22', group_by: 'day', trainer_id: null },
        },
      },
    })

    renderPage()

    expect(await screen.findByText(/Reports/i)).toBeInTheDocument()
  })
})
