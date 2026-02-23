import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
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
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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

  it('renders modern tabs and list entries from calendar API', async () => {
    apiMock.get.mockImplementation(async (url: string) => {
      if (url === '/calendar') {
        return {
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
                  whatsapp_status: 'not_sent',
                  whatsapp_marked_at: null,
                  whatsapp_marked_by_user_id: null,
                  location: 'Room 1',
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
                      whatsapp_status: 'not_sent',
                      whatsapp_marked_at: null,
                      whatsapp_marked_by_user_id: null,
                      location: 'Room 1',
                      notes: null,
                      created_at: '',
                      updated_at: '',
                    },
                  ],
                },
              ],
            },
          },
        }
      }

      if (url === '/students') {
        return {
          data: {
            data: {
              data: [],
              current_page: 1,
              per_page: 100,
              total: 0,
              last_page: 1,
            },
          },
        }
      }

      throw new Error(`Unexpected api.get call: ${url}`)
    })

    renderPage()

    expect(await screen.findByRole('button', { name: /^Month$/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^List$/i }))

    expect(await screen.findByText('21.02.2026')).toBeInTheDocument()
    expect(screen.getByText(/Student #8/i)).toBeInTheDocument()
  })
})
