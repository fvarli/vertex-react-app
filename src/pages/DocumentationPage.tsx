import { useMemo } from 'react'
import { useAuth } from '../features/auth/auth-context'
import { getActiveWorkspaceId } from '../lib/storage'

type DocumentationPageProps = {
  area: 'admin' | 'trainer'
}

type GuideStep = {
  title: string
  detail: string
}

const adminSteps: GuideStep[] = [
  {
    title: 'Select active workspace',
    detail: 'Go to Workspaces and pick the workspace you want to manage for this session.',
  },
  {
    title: 'Manage students',
    detail: 'Create and update students, set active/passive status, and use WhatsApp shortcut links.',
  },
  {
    title: 'Plan weekly programs',
    detail: 'Assign programs per student and keep week-by-week updates in a single place.',
  },
  {
    title: 'Control appointments and calendar',
    detail: 'Track reservations and review trainer schedule blocks directly in Calendar.',
  },
]

const trainerSteps: GuideStep[] = [
  {
    title: 'Select active workspace',
    detail: 'Start from Workspaces and continue with your active workspace context.',
  },
  {
    title: 'Add your students',
    detail: 'Register students and keep status current so active lists stay clean.',
  },
  {
    title: 'Publish weekly programs',
    detail: 'Create program rows by day, sets, reps, and notes for each student.',
  },
  {
    title: 'Run your booking flow',
    detail: 'Create appointments and monitor the day/week plan from Calendar.',
  },
]

export function DocumentationPage({ area }: DocumentationPageProps) {
  const { user, systemRole, workspaceRole } = useAuth()
  const activeWorkspaceId = getActiveWorkspaceId()

  const steps = useMemo(() => (area === 'admin' ? adminSteps : trainerSteps), [area])

  return (
    <div className="panel page space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Documentation</h2>
        <p className="text-sm text-muted">
          Role-based usage guide for the {area} workspace experience in Vertex Coach.
        </p>
      </div>

      <div className="grid gap-2 text-sm">
        <p>
          <strong>User:</strong> {user?.name} ({user?.email})
        </p>
        <p>
          <strong>System Role:</strong> {systemRole ?? '-'}
        </p>
        <p>
          <strong>Workspace Role:</strong> {workspaceRole ?? '-'}
        </p>
        <p>
          <strong>Active Workspace ID:</strong> {activeWorkspaceId ?? 'Not selected'}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">How to use the application</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm">
          {steps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}:</strong> {step.detail}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
