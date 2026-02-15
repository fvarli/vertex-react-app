import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../features/auth/auth-context'
import { getActiveWorkspaceId } from '../lib/storage'

type DocumentationPageProps = {
  area: 'admin' | 'trainer'
}

type GuideStep = {
  title: string
  detail: string
}

type GuideLink = {
  label: string
  path: string
}

export function DocumentationPage({ area }: DocumentationPageProps) {
  const { t } = useTranslation(['pages'])
  const { user, systemRole, workspaceRole } = useAuth()
  const activeWorkspaceId = getActiveWorkspaceId()
  const areaBase = area === 'admin' ? '/admin' : '/trainer'

  const steps = useMemo<GuideStep[]>(
    () => [
      {
        title: t(`pages:documentation.${area}.step1Title`),
        detail: t(`pages:documentation.${area}.step1Detail`),
      },
      {
        title: t(`pages:documentation.${area}.step2Title`),
        detail: t(`pages:documentation.${area}.step2Detail`),
      },
      {
        title: t(`pages:documentation.${area}.step3Title`),
        detail: t(`pages:documentation.${area}.step3Detail`),
      },
      {
        title: t(`pages:documentation.${area}.step4Title`),
        detail: t(`pages:documentation.${area}.step4Detail`),
      },
    ],
    [area, t],
  )

  const links = useMemo<GuideLink[]>(
    () => [
      { label: t('pages:documentation.links.workspaces'), path: `${areaBase}/workspaces` },
      { label: t('pages:documentation.links.students'), path: `${areaBase}/students` },
      { label: t('pages:documentation.links.programs'), path: `${areaBase}/programs` },
      { label: t('pages:documentation.links.appointments'), path: `${areaBase}/appointments` },
      { label: t('pages:documentation.links.calendar'), path: `${areaBase}/calendar` },
    ],
    [areaBase, t],
  )

  return (
    <div className="panel page space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{t('pages:documentation.title')}</h2>
        <p className="text-sm text-muted">{t('pages:documentation.description', { area })}</p>
      </div>

      <div className="grid gap-2 text-sm">
        <p>
          <strong>{t('pages:documentation.user')}:</strong> {user?.name} ({user?.email})
        </p>
        <p>
          <strong>{t('pages:documentation.systemRole')}:</strong> {systemRole ?? '-'}
        </p>
        <p>
          <strong>{t('pages:documentation.workspaceRole')}:</strong> {workspaceRole ?? '-'}
        </p>
        <p>
          <strong>{t('pages:documentation.activeWorkspaceId')}:</strong> {activeWorkspaceId ?? t('pages:documentation.notSelected')}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('pages:documentation.howToUse')}</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm">
          {steps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}:</strong> {step.detail}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-2 text-sm">
        <h3 className="text-lg font-semibold">{t('pages:documentation.quickLinks')}</h3>
        <ul className="list-inside list-disc space-y-1">
          {links.map((link) => (
            <li key={link.path}>
              <strong>{link.label}:</strong> <code>{link.path}</code>
            </li>
          ))}
        </ul>
      </div>

      <p className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted">
        <strong>{t('pages:documentation.helpTitle')}:</strong> {t('pages:documentation.helpBody')}
      </p>
    </div>
  )
}
