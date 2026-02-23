import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { TrainersPage } from '../pages/TrainersPage'

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
    <MemoryRouter initialEntries={['/admin/trainers']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={client}>
        <TrainersPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('TrainersPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders trainer metrics and list rows', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        data: {
          summary: {
            total_trainers: 2,
            active_trainers: 2,
            total_students: 18,
            today_appointments: 7,
            upcoming_7d_appointments: 21,
            avg_students_per_trainer: 9,
          },
          trainers: [
            {
              id: 5,
              name: 'Ayse',
              surname: 'Kaya',
              email: 'ayse.kaya@vertex.local',
              phone: '+905551234567',
              is_active: true,
              membership_is_active: true,
              student_count: 9,
              today_appointments: 4,
              upcoming_7d_appointments: 11,
              created_at: '',
              updated_at: '',
            },
          ],
        },
      },
    })

    renderPage()

    expect(await screen.findByText('Ayse Kaya')).toBeInTheDocument()
    expect(screen.getByText('ayse.kaya@vertex.local')).toBeInTheDocument()
    expect(screen.getByText('Total Trainers')).toBeInTheDocument()
  })
})
