import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { AdminRoute, ProtectedRoute, TrainerRoute, WorkspaceRoute } from '../components/RouteGuards'
import { AppointmentsPage } from '../pages/AppointmentsPage'
import { CalendarPage } from '../pages/CalendarPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DocumentationPage } from '../pages/DocumentationPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProgramsPage } from '../pages/ProgramsPage'
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
      { path: '/', element: <Navigate to="/trainer/workspaces" replace /> },
      { path: '/dashboard', element: <Navigate to="/trainer/dashboard" replace /> },
      { path: '/workspaces', element: <Navigate to="/trainer/workspaces" replace /> },
      { path: '/students', element: <Navigate to="/trainer/students" replace /> },
      { path: '/programs', element: <Navigate to="/trainer/programs" replace /> },
      { path: '/appointments', element: <Navigate to="/trainer/appointments" replace /> },
      { path: '/calendar', element: <Navigate to="/trainer/calendar" replace /> },
      { path: '/documentation', element: <Navigate to="/trainer/documentation" replace /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
