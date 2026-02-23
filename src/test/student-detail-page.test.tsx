import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import { StudentDetailPage } from '../pages/StudentDetailPage'

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
    <MemoryRouter initialEntries={['/trainer/students/1']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={client}>
        <Routes>
          <Route path="/trainer/students/:id" element={<StudentDetailPage />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

function mockStudentAndPrograms() {
  apiMock.get.mockResolvedValueOnce({
    data: {
      data: {
        id: 1,
        workspace_id: 1,
        trainer_user_id: 1,
        full_name: 'Ali Veli',
        phone: '+905551234567',
        notes: 'Test notes',
        status: 'active',
        created_at: '2026-01-01T00:00:00.000000Z',
        updated_at: '2026-01-01T00:00:00.000000Z',
      },
    },
  })

  apiMock.get.mockResolvedValueOnce({
    data: {
      data: {
        data: [],
        current_page: 1,
        per_page: 50,
        total: 0,
        last_page: 1,
      },
    },
  })
}

describe('StudentDetailPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders student detail with name and tabs', async () => {
    mockStudentAndPrograms()

    renderPage()

    expect(await screen.findByText('Ali Veli')).toBeInTheDocument()
    expect(await screen.findByText(/Overview/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Programs/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Appointments/i)).toBeInTheDocument()
    expect(screen.getByText(/Timeline/i)).toBeInTheDocument()
  })

  it('shows student phone number on overview', async () => {
    mockStudentAndPrograms()

    renderPage()

    expect((await screen.findAllByText('+905551234567')).length).toBeGreaterThan(0)
  })
})
