import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ProgramsPage } from '../pages/ProgramsPage'

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
        <ProgramsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('ProgramsPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('loads student programs after student list is fetched', async () => {
    apiMock.get
      .mockResolvedValueOnce({
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
      .mockResolvedValueOnce({
        data: {
          data: {
            data: [
              {
                id: 5,
                workspace_id: 1,
                student_id: 10,
                trainer_user_id: 1,
                title: 'Strength Week',
                goal: null,
                week_start_date: '2026-02-16',
                status: 'draft',
                items: [],
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

    expect(await screen.findByText('Strength Week')).toBeInTheDocument()
  })
})
