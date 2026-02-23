import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../features/auth/auth-context'
import { getActiveWorkspaceId } from '../lib/storage'

type RoleAccess = 'all' | 'admin_only' | 'platform_admin_only'

type SectionDef = {
  id: string
  titleKey: string
  descriptionKey: string
  roleAccess: RoleAccess
  detailKeys: string[]
  tipKey?: string
}

const GUIDE_SECTIONS: SectionDef[] = [
  {
    id: 'roles',
    titleKey: 'pages:documentation.guide.roles.title',
    descriptionKey: 'pages:documentation.guide.roles.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.roles.detail1',
      'pages:documentation.guide.roles.detail2',
      'pages:documentation.guide.roles.detail3',
    ],
    tipKey: 'pages:documentation.guide.roles.tip',
  },
  {
    id: 'gettingStarted',
    titleKey: 'pages:documentation.guide.gettingStarted.title',
    descriptionKey: 'pages:documentation.guide.gettingStarted.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.gettingStarted.detail1',
      'pages:documentation.guide.gettingStarted.detail2',
      'pages:documentation.guide.gettingStarted.detail3',
    ],
    tipKey: 'pages:documentation.guide.gettingStarted.tip',
  },
  {
    id: 'dashboard',
    titleKey: 'pages:documentation.guide.dashboard.title',
    descriptionKey: 'pages:documentation.guide.dashboard.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.dashboard.detail1',
      'pages:documentation.guide.dashboard.detail2',
      'pages:documentation.guide.dashboard.detail3',
      'pages:documentation.guide.dashboard.detail4',
    ],
  },
  {
    id: 'trainers',
    titleKey: 'pages:documentation.guide.trainers.title',
    descriptionKey: 'pages:documentation.guide.trainers.description',
    roleAccess: 'admin_only',
    detailKeys: [
      'pages:documentation.guide.trainers.detail1',
      'pages:documentation.guide.trainers.detail2',
      'pages:documentation.guide.trainers.detail3',
    ],
    tipKey: 'pages:documentation.guide.trainers.tip',
  },
  {
    id: 'students',
    titleKey: 'pages:documentation.guide.students.title',
    descriptionKey: 'pages:documentation.guide.students.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.students.detail1',
      'pages:documentation.guide.students.detail2',
      'pages:documentation.guide.students.detail3',
    ],
    tipKey: 'pages:documentation.guide.students.tip',
  },
  {
    id: 'studentDetail',
    titleKey: 'pages:documentation.guide.studentDetail.title',
    descriptionKey: 'pages:documentation.guide.studentDetail.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.studentDetail.detail1',
      'pages:documentation.guide.studentDetail.detail2',
      'pages:documentation.guide.studentDetail.detail3',
    ],
  },
  {
    id: 'programs',
    titleKey: 'pages:documentation.guide.programs.title',
    descriptionKey: 'pages:documentation.guide.programs.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.programs.detail1',
      'pages:documentation.guide.programs.detail2',
      'pages:documentation.guide.programs.detail3',
      'pages:documentation.guide.programs.detail4',
    ],
    tipKey: 'pages:documentation.guide.programs.tip',
  },
  {
    id: 'appointments',
    titleKey: 'pages:documentation.guide.appointments.title',
    descriptionKey: 'pages:documentation.guide.appointments.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.appointments.detail1',
      'pages:documentation.guide.appointments.detail2',
      'pages:documentation.guide.appointments.detail3',
      'pages:documentation.guide.appointments.detail4',
      'pages:documentation.guide.appointments.detail5',
    ],
    tipKey: 'pages:documentation.guide.appointments.tip',
  },
  {
    id: 'calendar',
    titleKey: 'pages:documentation.guide.calendar.title',
    descriptionKey: 'pages:documentation.guide.calendar.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.calendar.detail1',
      'pages:documentation.guide.calendar.detail2',
      'pages:documentation.guide.calendar.detail3',
    ],
  },
  {
    id: 'reminders',
    titleKey: 'pages:documentation.guide.reminders.title',
    descriptionKey: 'pages:documentation.guide.reminders.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.reminders.detail1',
      'pages:documentation.guide.reminders.detail2',
      'pages:documentation.guide.reminders.detail3',
      'pages:documentation.guide.reminders.detail4',
    ],
    tipKey: 'pages:documentation.guide.reminders.tip',
  },
  {
    id: 'whatsapp',
    titleKey: 'pages:documentation.guide.whatsapp.title',
    descriptionKey: 'pages:documentation.guide.whatsapp.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.whatsapp.detail1',
      'pages:documentation.guide.whatsapp.detail2',
      'pages:documentation.guide.whatsapp.detail3',
    ],
    tipKey: 'pages:documentation.guide.whatsapp.tip',
  },
  {
    id: 'reports',
    titleKey: 'pages:documentation.guide.reports.title',
    descriptionKey: 'pages:documentation.guide.reports.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.reports.detail1',
      'pages:documentation.guide.reports.detail2',
      'pages:documentation.guide.reports.detail3',
      'pages:documentation.guide.reports.detail4',
    ],
    tipKey: 'pages:documentation.guide.reports.tip',
  },
  {
    id: 'workspaces',
    titleKey: 'pages:documentation.guide.workspaces.title',
    descriptionKey: 'pages:documentation.guide.workspaces.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.workspaces.detail1',
      'pages:documentation.guide.workspaces.detail2',
      'pages:documentation.guide.workspaces.detail3',
    ],
    tipKey: 'pages:documentation.guide.workspaces.tip',
  },
  {
    id: 'workspaceSettings',
    titleKey: 'pages:documentation.guide.workspaceSettings.title',
    descriptionKey: 'pages:documentation.guide.workspaceSettings.description',
    roleAccess: 'admin_only',
    detailKeys: [
      'pages:documentation.guide.workspaceSettings.detail1',
      'pages:documentation.guide.workspaceSettings.detail2',
    ],
  },
  {
    id: 'approvals',
    titleKey: 'pages:documentation.guide.approvals.title',
    descriptionKey: 'pages:documentation.guide.approvals.description',
    roleAccess: 'platform_admin_only',
    detailKeys: [
      'pages:documentation.guide.approvals.detail1',
      'pages:documentation.guide.approvals.detail2',
    ],
    tipKey: 'pages:documentation.guide.approvals.tip',
  },
  {
    id: 'profile',
    titleKey: 'pages:documentation.guide.profile.title',
    descriptionKey: 'pages:documentation.guide.profile.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.profile.detail1',
      'pages:documentation.guide.profile.detail2',
      'pages:documentation.guide.profile.detail3',
    ],
  },
  {
    id: 'themeLanguage',
    titleKey: 'pages:documentation.guide.themeLanguage.title',
    descriptionKey: 'pages:documentation.guide.themeLanguage.description',
    roleAccess: 'all',
    detailKeys: [
      'pages:documentation.guide.themeLanguage.detail1',
      'pages:documentation.guide.themeLanguage.detail2',
    ],
  },
]

function RoleBadges({ access, t }: { access: RoleAccess; t: (key: string) => string }) {
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {(access === 'all' || access === 'admin_only' || access === 'platform_admin_only') && (
        <Badge variant={access === 'platform_admin_only' ? 'warning' : 'default'}>
          {t('pages:documentation.roles.platformAdmin')}
        </Badge>
      )}
      {(access === 'all' || access === 'admin_only') && (
        <Badge variant="success">{t('pages:documentation.roles.ownerAdmin')}</Badge>
      )}
      {access === 'all' && (
        <Badge variant="muted">{t('pages:documentation.roles.trainer')}</Badge>
      )}
    </span>
  )
}

function TableOfContents({
  sections,
  openSections,
  sectionRefs,
  t,
}: {
  sections: SectionDef[]
  openSections: Set<string>
  sectionRefs: React.RefObject<Record<string, HTMLDivElement | null>>
  t: (key: string) => string
}) {
  const handleClick = (id: string) => {
    sectionRefs.current?.[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="hidden lg:block">
      <div className="sticky top-24 space-y-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {t('pages:documentation.tocTitle')}
        </p>
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => handleClick(section.id)}
            className={`block w-full truncate rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-border/50 ${
              openSections.has(section.id) ? 'font-medium text-foreground' : 'text-muted'
            }`}
          >
            {t(section.titleKey)}
          </button>
        ))}
      </div>
    </nav>
  )
}

function GuideSectionCard({
  section,
  isOpen,
  onToggle,
  sectionRef,
  t,
}: {
  section: SectionDef
  isOpen: boolean
  onToggle: () => void
  sectionRef: (el: HTMLDivElement | null) => void
  t: (key: string) => string
}) {
  return (
    <div ref={sectionRef} className="panel">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{t(section.titleKey)}</h3>
            <RoleBadges access={section.roleAccess} t={t} />
          </div>
          <p className="text-sm text-muted">{t(section.descriptionKey)}</p>
        </div>
        <span className="mt-1 shrink-0 text-muted transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
          {section.detailKeys.map((key, i) => (
            <div key={key} className="timeline-card text-sm">
              <p className="text-muted">
                <span className="mr-1.5 font-semibold text-foreground">{i + 1}.</span>
                {t(key)}
              </p>
            </div>
          ))}
          {section.tipKey && (
            <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <strong>Tip:</strong> {t(section.tipKey)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

type DocumentationPageProps = {
  area: 'admin' | 'trainer'
}

export function DocumentationPage({ area }: DocumentationPageProps) {
  const { t } = useTranslation(['pages'])
  const { user, systemRole, workspaceRole } = useAuth()
  const activeWorkspaceId = getActiveWorkspaceId()
  const areaBase = area === 'admin' ? '/admin' : '/trainer'

  const allIds = GUIDE_SECTIONS.map((s) => s.id)
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(allIds))
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setOpenSections(new Set(allIds))
  const collapseAll = () => setOpenSections(new Set())

  const links = [
    { labelKey: 'pages:documentation.links.dashboard', path: `${areaBase}/dashboard` },
    { labelKey: 'pages:documentation.links.workspaces', path: `${areaBase}/workspaces` },
    ...(area === 'admin'
      ? [{ labelKey: 'pages:documentation.links.trainers', path: `${areaBase}/trainers` }]
      : []),
    { labelKey: 'pages:documentation.links.students', path: `${areaBase}/students` },
    { labelKey: 'pages:documentation.links.programs', path: `${areaBase}/programs` },
    { labelKey: 'pages:documentation.links.appointments', path: `${areaBase}/appointments` },
    { labelKey: 'pages:documentation.links.reminders', path: `${areaBase}/reminders` },
    { labelKey: 'pages:documentation.links.calendar', path: `${areaBase}/calendar` },
    { labelKey: 'pages:documentation.links.whatsapp', path: `${areaBase}/whatsapp` },
    { labelKey: 'pages:documentation.links.reports', path: `${areaBase}/reports` },
    { labelKey: 'pages:documentation.links.profile', path: `${areaBase}/profile` },
  ]

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="panel">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          {t('pages:documentation.sectionLabel')}
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight">
          {t('pages:documentation.title')}
        </h2>
        <p className="text-sm text-muted">{t('pages:documentation.description')}</p>
      </div>

      {/* User Info Cards */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">
            {t('pages:documentation.user')}
          </p>
          <p className="mt-1 font-semibold">{user?.name ?? '-'}</p>
          <p className="text-xs text-muted">{user?.email ?? '-'}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">
            {t('pages:documentation.activeWorkspaceId')}
          </p>
          <p className="mt-1 text-lg font-semibold">
            {activeWorkspaceId ?? t('pages:documentation.notSelected')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="muted">{systemRole ?? '-'}</Badge>
            <Badge variant="muted">{workspaceRole ?? '-'}</Badge>
          </div>
        </div>
      </div>

      {/* Roles overview */}
      <div className="panel">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-muted">
          {t('pages:documentation.roles.accessLabel')}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-2">
            <Badge variant="default">{t('pages:documentation.roles.platformAdmin')}</Badge>
            <p className="mt-1 text-xs text-muted">{t('pages:documentation.guide.roles.detail1').split('—')[0].trim()}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-2">
            <Badge variant="success">{t('pages:documentation.roles.ownerAdmin')}</Badge>
            <p className="mt-1 text-xs text-muted">{t('pages:documentation.guide.roles.detail2').split('—')[0].trim()}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-2">
            <Badge variant="muted">{t('pages:documentation.roles.trainer')}</Badge>
            <p className="mt-1 text-xs text-muted">{t('pages:documentation.guide.roles.detail3').split('—')[0].trim()}</p>
          </div>
        </div>
      </div>

      {/* Expand / Collapse controls */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={expandAll}
          className="rounded-lg border border-border/70 bg-card/80 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-border/40"
        >
          {t('pages:documentation.expandAll')}
        </button>
        <button
          type="button"
          onClick={collapseAll}
          className="rounded-lg border border-border/70 bg-card/80 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-border/40"
        >
          {t('pages:documentation.collapseAll')}
        </button>
      </div>

      {/* Main content: Sections + TOC */}
      <div className="flex gap-5">
        <div className="min-w-0 flex-1 space-y-3">
          {GUIDE_SECTIONS.map((section) => (
            <GuideSectionCard
              key={section.id}
              section={section}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              sectionRef={(el) => {
                sectionRefs.current[section.id] = el
              }}
              t={t}
            />
          ))}
        </div>
        <TableOfContents
          sections={GUIDE_SECTIONS}
          openSections={openSections}
          sectionRefs={sectionRefs}
          t={t}
        />
      </div>

      {/* Quick navigation links */}
      <div className="panel space-y-2 text-sm">
        <h3 className="text-lg font-semibold">{t('pages:documentation.quickLinks')}</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="rounded-xl border border-border/70 bg-background/55 px-3 py-2 transition-colors hover:bg-border/30"
            >
              <p className="text-xs font-medium">{t(link.labelKey)}</p>
              <code className="text-xs text-muted">{link.path}</code>
            </Link>
          ))}
        </div>
      </div>

      {/* Support tip */}
      <p className="rounded-xl bg-muted/25 px-3 py-2 text-sm text-muted">
        <strong>{t('pages:documentation.helpTitle')}:</strong>{' '}
        {t('pages:documentation.helpBody')}
      </p>
    </div>
  )
}
