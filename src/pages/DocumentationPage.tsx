import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../components/ui/badge'
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
    <div className="space-y-5 fade-in">
      <div className="panel">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:documentation.sectionLabel')}</p>
        <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:documentation.title')}</h2>
        <p className="text-sm text-muted">{t('pages:documentation.description', { area })}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:documentation.user')}</p>
          <p className="mt-1 font-semibold">{user?.name ?? '-'}</p>
          <p className="text-xs text-muted">{user?.email ?? '-'}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:documentation.activeWorkspaceId')}</p>
          <p className="mt-1 text-lg font-semibold">{activeWorkspaceId ?? t('pages:documentation.notSelected')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="muted">{systemRole ?? '-'}</Badge>
            <Badge variant="muted">{workspaceRole ?? '-'}</Badge>
          </div>
        </div>
      </div>

      <div className="panel space-y-3">
        <h3 className="text-lg font-semibold">{t('pages:documentation.howToUse')}</h3>
        <div className="grid gap-2">
          {steps.map((step, index) => (
            <div key={step.title} className="timeline-card text-sm">
              <p className="font-semibold">
                {index + 1}. {step.title}
              </p>
              <p className="mt-1 text-muted">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="panel space-y-2 text-sm">
        <h3 className="text-lg font-semibold">{t('pages:documentation.quickLinks')}</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {links.map((link) => (
            <div key={link.path} className="rounded-xl border border-border/70 bg-background/55 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.08em] text-muted">{link.label}</p>
              <code className="text-xs">{link.path}</code>
            </div>
          ))}
        </div>
      </div>

      <p className="rounded-xl bg-muted/25 px-3 py-2 text-sm text-muted">
        <strong>{t('pages:documentation.helpTitle')}:</strong> {t('pages:documentation.helpBody')}
      </p>
    </div>
  )
}
