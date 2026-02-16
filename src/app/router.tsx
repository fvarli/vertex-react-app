import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { RoleAwareRedirect } from '../components/RoleAwareRedirect'
import { AdminRoute, ProtectedRoute, TrainerRoute, WorkspaceRoute } from '../components/RouteGuards'
import { AppointmentsPage } from '../pages/AppointmentsPage'
import { CalendarPage } from '../pages/CalendarPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DocumentationPage } from '../pages/DocumentationPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProgramsPage } from '../pages/ProgramsPage'
import { RemindersPage } from '../pages/RemindersPage'
import { StudentsPage } from '../pages/StudentsPage'
import { WorkspacePage } from '../pages/WorkspacePage'

const adminChildren = [
  { path: '/admin/workspaces', element: <WorkspacePage /> },
  { path: '/admin/documentation', element: <DocumentationPage area="admin" /> },
  {
    element: <WorkspaceRoute area="admin" />,
    children: [
      { path: '/admin/dashboard', element: <DashboardPage /> },
      { path: '/admin/students', element: <StudentsPage /> },
      { path: '/admin/programs', element: <ProgramsPage /> },
      { path: '/admin/appointments', element: <AppointmentsPage /> },
      { path: '/admin/reminders', element: <RemindersPage /> },
      { path: '/admin/calendar', element: <CalendarPage /> },
    ],
  },
]

const trainerChildren = [
  { path: '/trainer/workspaces', element: <WorkspacePage /> },
  { path: '/trainer/documentation', element: <DocumentationPage area="trainer" /> },
  {
    element: <WorkspaceRoute area="trainer" />,
    children: [
      { path: '/trainer/dashboard', element: <DashboardPage /> },
      { path: '/trainer/students', element: <StudentsPage /> },
      { path: '/trainer/programs', element: <ProgramsPage /> },
      { path: '/trainer/appointments', element: <AppointmentsPage /> },
      { path: '/trainer/reminders', element: <RemindersPage /> },
      { path: '/trainer/calendar', element: <CalendarPage /> },
    ],
  },
]

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
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
      { path: '/programs', element: <RoleAwareRedirect adminPath="/admin/programs" trainerPath="/trainer/programs" /> },
      { path: '/appointments', element: <RoleAwareRedirect adminPath="/admin/appointments" trainerPath="/trainer/appointments" /> },
      { path: '/calendar', element: <RoleAwareRedirect adminPath="/admin/calendar" trainerPath="/trainer/calendar" /> },
      { path: '/reminders', element: <RoleAwareRedirect adminPath="/admin/reminders" trainerPath="/trainer/reminders" /> },
      { path: '/documentation', element: <RoleAwareRedirect adminPath="/admin/documentation" trainerPath="/trainer/documentation" /> },
      { path: '/forbidden', element: <ForbiddenPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
