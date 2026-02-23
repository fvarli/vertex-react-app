import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { LoadingScreen } from '../components/LoadingScreen'
import { RoleAwareRedirect } from '../components/RoleAwareRedirect'
import { AdminRoute, ProtectedRoute, TrainerRoute, WorkspaceRoute } from '../components/RouteGuards'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { VerifyEmailPage } from '../pages/VerifyEmailPage'

// Lazy-loaded pages (authenticated area — reduces initial bundle size)
const AdminApprovalPage = lazy(() => import('../pages/AdminApprovalPage').then(m => ({ default: m.AdminApprovalPage })))
const AppointmentsPage = lazy(() => import('../pages/AppointmentsPage').then(m => ({ default: m.AppointmentsPage })))
const CalendarPage = lazy(() => import('../pages/CalendarPage').then(m => ({ default: m.CalendarPage })))
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const DocumentationPage = lazy(() => import('../pages/DocumentationPage').then(m => ({ default: m.DocumentationPage })))
const ProfilePage = lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const ProgramsPage = lazy(() => import('../pages/ProgramsPage').then(m => ({ default: m.ProgramsPage })))
const RemindersPage = lazy(() => import('../pages/RemindersPage').then(m => ({ default: m.RemindersPage })))
const ReportsPage = lazy(() => import('../pages/ReportsPage').then(m => ({ default: m.ReportsPage })))
const StudentDetailPage = lazy(() => import('../pages/StudentDetailPage').then(m => ({ default: m.StudentDetailPage })))
const StudentsPage = lazy(() => import('../pages/StudentsPage').then(m => ({ default: m.StudentsPage })))
const TrainersPage = lazy(() => import('../pages/TrainersPage').then(m => ({ default: m.TrainersPage })))
const WhatsAppPage = lazy(() => import('../pages/WhatsAppPage').then(m => ({ default: m.WhatsAppPage })))
const WorkspacePage = lazy(() => import('../pages/WorkspacePage').then(m => ({ default: m.WorkspacePage })))
const WorkspaceSettingsPage = lazy(() => import('../pages/WorkspaceSettingsPage').then(m => ({ default: m.WorkspaceSettingsPage })))

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
}

const adminChildren = [
  { path: '/admin/profile', element: <SuspensePage><ProfilePage /></SuspensePage> },
  { path: '/admin/workspaces', element: <SuspensePage><WorkspacePage /></SuspensePage> },
  { path: '/admin/approval', element: <SuspensePage><AdminApprovalPage /></SuspensePage> },
  { path: '/admin/documentation', element: <SuspensePage><DocumentationPage area="admin" /></SuspensePage> },
  {
    element: <WorkspaceRoute area="admin" />,
    children: [
      { path: '/admin/dashboard', element: <SuspensePage><DashboardPage /></SuspensePage> },
      { path: '/admin/trainers', element: <SuspensePage><TrainersPage /></SuspensePage> },
      { path: '/admin/students', element: <SuspensePage><StudentsPage /></SuspensePage> },
      { path: '/admin/students/:id', element: <SuspensePage><StudentDetailPage /></SuspensePage> },
      { path: '/admin/programs', element: <SuspensePage><ProgramsPage /></SuspensePage> },
      { path: '/admin/appointments', element: <SuspensePage><AppointmentsPage /></SuspensePage> },
      { path: '/admin/reminders', element: <SuspensePage><RemindersPage /></SuspensePage> },
      { path: '/admin/calendar', element: <SuspensePage><CalendarPage /></SuspensePage> },
      { path: '/admin/whatsapp', element: <SuspensePage><WhatsAppPage /></SuspensePage> },
      { path: '/admin/reports', element: <SuspensePage><ReportsPage /></SuspensePage> },
      { path: '/admin/workspace-settings', element: <SuspensePage><WorkspaceSettingsPage /></SuspensePage> },
    ],
  },
]

const trainerChildren = [
  { path: '/trainer/profile', element: <SuspensePage><ProfilePage /></SuspensePage> },
  { path: '/trainer/workspaces', element: <SuspensePage><WorkspacePage /></SuspensePage> },
  { path: '/trainer/documentation', element: <SuspensePage><DocumentationPage area="trainer" /></SuspensePage> },
  {
    element: <WorkspaceRoute area="trainer" />,
    children: [
      { path: '/trainer/dashboard', element: <SuspensePage><DashboardPage /></SuspensePage> },
      { path: '/trainer/students', element: <SuspensePage><StudentsPage /></SuspensePage> },
      { path: '/trainer/students/:id', element: <SuspensePage><StudentDetailPage /></SuspensePage> },
      { path: '/trainer/programs', element: <SuspensePage><ProgramsPage /></SuspensePage> },
      { path: '/trainer/appointments', element: <SuspensePage><AppointmentsPage /></SuspensePage> },
      { path: '/trainer/reminders', element: <SuspensePage><RemindersPage /></SuspensePage> },
      { path: '/trainer/calendar', element: <SuspensePage><CalendarPage /></SuspensePage> },
      { path: '/trainer/whatsapp', element: <SuspensePage><WhatsAppPage /></SuspensePage> },
      { path: '/trainer/reports', element: <SuspensePage><ReportsPage /></SuspensePage> },
    ],
  },
]

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AppLayout area="admin" />,
            children: adminChildren,
          },
        ],
      },
      {
        element: <TrainerRoute />,
        children: [
          {
            element: <AppLayout area="trainer" />,
            children: trainerChildren,
          },
        ],
      },
      { path: '/', element: <RoleAwareRedirect adminPath="/admin/workspaces" trainerPath="/trainer/workspaces" /> },
      { path: '/dashboard', element: <RoleAwareRedirect adminPath="/admin/dashboard" trainerPath="/trainer/dashboard" /> },
      { path: '/workspaces', element: <RoleAwareRedirect adminPath="/admin/workspaces" trainerPath="/trainer/workspaces" /> },
      { path: '/students', element: <RoleAwareRedirect adminPath="/admin/students" trainerPath="/trainer/students" /> },
      { path: '/trainers', element: <RoleAwareRedirect adminPath="/admin/trainers" trainerPath="/trainer/dashboard" /> },
      { path: '/programs', element: <RoleAwareRedirect adminPath="/admin/programs" trainerPath="/trainer/programs" /> },
      { path: '/appointments', element: <RoleAwareRedirect adminPath="/admin/appointments" trainerPath="/trainer/appointments" /> },
      { path: '/calendar', element: <RoleAwareRedirect adminPath="/admin/calendar" trainerPath="/trainer/calendar" /> },
      { path: '/reminders', element: <RoleAwareRedirect adminPath="/admin/reminders" trainerPath="/trainer/reminders" /> },
      { path: '/reports', element: <RoleAwareRedirect adminPath="/admin/reports" trainerPath="/trainer/reports" /> },
      { path: '/whatsapp', element: <RoleAwareRedirect adminPath="/admin/whatsapp" trainerPath="/trainer/whatsapp" /> },
      { path: '/documentation', element: <RoleAwareRedirect adminPath="/admin/documentation" trainerPath="/trainer/documentation" /> },
      { path: '/profile', element: <RoleAwareRedirect adminPath="/admin/profile" trainerPath="/trainer/profile" /> },
      { path: '/forbidden', element: <ForbiddenPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
], {
  future: {
    v7_relativeSplatPath: true,
  },
})
