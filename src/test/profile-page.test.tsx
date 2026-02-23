import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ProfilePage } from '../pages/ProfilePage'

vi.mock('../features/profile/components/AvatarSection', () => ({
  AvatarSection: () => <div data-testid="avatar-section">Avatar</div>,
}))

vi.mock('../features/profile/components/ProfileInfoSection', () => ({
  ProfileInfoSection: () => <div data-testid="profile-info-section">Personal Information</div>,
}))

vi.mock('../features/profile/components/PasswordSection', () => ({
  PasswordSection: () => <div data-testid="password-section">Change Password</div>,
}))

vi.mock('../features/profile/components/DeleteAccountSection', () => ({
  DeleteAccountSection: () => <div data-testid="delete-section">Delete Account</div>,
}))

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={client}>
        <ProfilePage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  it('renders profile page with section titles', async () => {
    renderPage()

    expect(await screen.findByText(/Profile/i)).toBeInTheDocument()
    expect(screen.getByTestId('avatar-section')).toBeInTheDocument()
    expect(screen.getByTestId('profile-info-section')).toBeInTheDocument()
    expect(screen.getByTestId('password-section')).toBeInTheDocument()
    expect(screen.getByTestId('delete-section')).toBeInTheDocument()
  })

  it('renders all four profile sections', () => {
    renderPage()

    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    expect(screen.getByText('Delete Account')).toBeInTheDocument()
  })
})
