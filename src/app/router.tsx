import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { ProtectedRoute, WorkspaceRoute } from '../components/RouteGuards'
import { AppointmentsPage } from '../pages/AppointmentsPage'
import { CalendarPage } from '../pages/CalendarPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProgramsPage } from '../pages/ProgramsPage'
import { StudentsPage } from '../pages/StudentsPage'
import { WorkspacePage } from '../pages/WorkspacePage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/workspaces', element: <WorkspacePage /> },
          {
            element: <WorkspaceRoute />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/students', element: <StudentsPage /> },
              { path: '/programs', element: <ProgramsPage /> },
              { path: '/appointments', element: <AppointmentsPage /> },
              { path: '/calendar', element: <CalendarPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
