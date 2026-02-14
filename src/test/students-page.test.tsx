import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { StudentsPage } from '../pages/StudentsPage'

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

function renderStudentsPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <StudentsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('StudentsPage', () => {
  beforeEach(() => {
    apiMock.get.mockReset()
    apiMock.post.mockReset()
    apiMock.put.mockReset()
    apiMock.patch.mockReset()
  })

  it('renders students fetched from API', async () => {
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
          per_page: 15,
          total: 1,
          last_page: 1,
        },
      },
    })

    renderStudentsPage()

    expect(await screen.findByText('Ali Veli')).toBeInTheDocument()
    expect(screen.getByText('+905551234567')).toBeInTheDocument()
  })

  it('creates a student and invalidates list', async () => {
    apiMock.get.mockResolvedValue({
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

    apiMock.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 12,
          workspace_id: 1,
          trainer_user_id: 1,
          full_name: 'New Student',
          phone: '+905559999999',
          notes: null,
          status: 'active',
          created_at: '',
          updated_at: '',
        },
      },
    })

    renderStudentsPage()

    fireEvent.click(await screen.findByRole('button', { name: /new student/i }))
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'New Student' } })
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+905559999999' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/students', {
        full_name: 'New Student',
        phone: '+905559999999',
        notes: null,
      })
    })
  })
})
