import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TBody, TD, TH, THead } from '../components/ui/table'
import { useAuth } from '../features/auth/auth-context'
import {
  getAppointmentReport,
  getProgramReport,
  getReminderReport,
  getStudentReport,
} from '../features/reports/api'
import { ReportExportButton } from '../features/reports/components/ReportExportButton'
import { StudentRetentionTab } from '../features/reports/components/StudentRetentionTab'
import { TrainerPerformanceTab } from '../features/reports/components/TrainerPerformanceTab'
import type { ReportGroupBy, ReportParams } from '../features/reports/types'
import { getTrainerOverview } from '../features/trainers/api'
import { extractApiMessage } from '../lib/api-errors'

type ReportTab = 'appointments' | 'students' | 'programs' | 'reminders' | 'trainer-performance' | 'student-retention'

export function ReportsPage() {
  const { t } = useTranslation(['pages', 'common'])
  const location = useLocation()
  const { workspaceRole } = useAuth()
  const isOwnerAdmin = workspaceRole === 'owner_admin'
  const isAdminArea = location.pathname.startsWith('/admin/')

  const [activeTab, setActiveTab] = useState<ReportTab>('appointments')
  const [dateFrom, setDateFrom] = useState(() => dayjs().subtract(30, 'day').format('YYYY-MM-DD'))
  const [dateTo, setDateTo] = useState(() => dayjs().format('YYYY-MM-DD'))
  const [groupBy, setGroupBy] = useState<ReportGroupBy>('day')
  const [trainerId, setTrainerId] = useState<string>('')

  const params: ReportParams = {
    date_from: dateFrom,
    date_to: dateTo,
    group_by: groupBy,
    trainer_id: trainerId ? Number(trainerId) : undefined,
  }

  const trainersQuery = useQuery({
    queryKey: ['trainers', 'overview-for-filter'],
    queryFn: () => getTrainerOverview({ include_inactive: false }),
    enabled: isOwnerAdmin && isAdminArea,
  })

  const appointmentsQuery = useQuery({
    queryKey: ['reports', 'appointments', params],
    queryFn: () => getAppointmentReport(params),
    enabled: activeTab === 'appointments',
  })

  const studentsQuery = useQuery({
    queryKey: ['reports', 'students', params],
    queryFn: () => getStudentReport(params),
    enabled: activeTab === 'students',
  })

  const programsQuery = useQuery({
    queryKey: ['reports', 'programs', params],
    queryFn: () => getProgramReport(params),
    enabled: activeTab === 'programs',
  })

  const remindersQuery = useQuery({
    queryKey: ['reports', 'reminders', params],
    queryFn: () => getReminderReport(params),
    enabled: activeTab === 'reminders',
  })

  const tabs: { key: ReportTab; label: string; adminOnly?: boolean }[] = [
    { key: 'appointments', label: t('pages:reports.tabs.appointments') },
    { key: 'students', label: t('pages:reports.tabs.students') },
    { key: 'programs', label: t('pages:reports.tabs.programs') },
    { key: 'reminders', label: t('pages:reports.tabs.reminders') },
    { key: 'trainer-performance', label: t('pages:reports.tabs.trainerPerformance'), adminOnly: true },
    { key: 'student-retention', label: t('pages:reports.tabs.studentRetention'), adminOnly: true },
  ]

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || (isOwnerAdmin && isAdminArea))

  return (
    <div className="page space-y-5 fade-in">
      <div className="panel">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:reports.sectionLabel')}</p>
        <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:reports.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('pages:reports.description')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-border/50 text-muted hover:bg-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="filter-surface mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-muted">{t('pages:reports.filters.dateFrom')}</label>
          <input
            type="date"
            className="input w-full"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">{t('pages:reports.filters.dateTo')}</label>
          <input
            type="date"
            className="input w-full"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">{t('pages:reports.filters.groupBy')}</label>
          <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as ReportGroupBy)}>
            <option value="day">{t('pages:reports.filters.day')}</option>
            <option value="week">{t('pages:reports.filters.week')}</option>
            <option value="month">{t('pages:reports.filters.month')}</option>
          </Select>
        </div>
        {isOwnerAdmin && isAdminArea ? (
          <div>
            <label className="mb-1 block text-xs text-muted">{t('pages:reports.filters.trainer')}</label>
            <Select value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
              <option value="">{t('pages:reports.filters.allTrainers')}</option>
              {trainersQuery.data?.trainers.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.name} {tr.surname}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
      </div>

      {activeTab === 'appointments' ? (
        <AppointmentsReport query={appointmentsQuery} params={params} />
      ) : activeTab === 'students' ? (
        <StudentsReport query={studentsQuery} params={params} />
      ) : activeTab === 'programs' ? (
        <ProgramsReport query={programsQuery} params={params} />
      ) : activeTab === 'reminders' ? (
        <RemindersReport query={remindersQuery} params={params} />
      ) : activeTab === 'trainer-performance' ? (
        <TrainerPerformanceTab params={params} />
      ) : (
        <StudentRetentionTab params={params} />
      )}
    </div>
  )
}

type QueryResult<T> = { data: T | undefined; isLoading: boolean; isError: boolean; error: unknown }

function AppointmentsReport({ query, params }: { query: QueryResult<import('../features/reports/types').AppointmentReport>; params: ReportParams }) {
  const { t } = useTranslation(['pages', 'common'])
  if (query.isLoading) return <ReportSkeleton />
  if (query.isError) return <ReportError error={query.error} />
  const data = query.data!
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div />
        <ReportExportButton type="appointments" params={params} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label={t('pages:reports.appointments.total')} value={data.totals.total} />
        <KpiCard label={t('pages:reports.appointments.planned')} value={data.totals.planned} />
        <KpiCard label={t('pages:reports.appointments.done')} value={data.totals.done} />
        <KpiCard label={t('pages:reports.appointments.cancelled')} value={data.totals.cancelled} />
        <KpiCard label={t('pages:reports.appointments.noShow')} value={data.totals.no_show} />
      </div>
      <div className="table-surface mt-4 hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH>{t('pages:reports.bucket')}</TH>
              <TH>{t('pages:reports.appointments.total')}</TH>
              <TH>{t('pages:reports.appointments.planned')}</TH>
              <TH>{t('pages:reports.appointments.done')}</TH>
              <TH>{t('pages:reports.appointments.cancelled')}</TH>
              <TH>{t('pages:reports.appointments.noShow')}</TH>
            </tr>
          </THead>
          <TBody>
            {data.buckets.length === 0 ? (
              <tr><td colSpan={6} className="border-b border-border/70 px-3 py-3 text-center text-muted">{t('pages:reports.noData')}</td></tr>
            ) : data.buckets.map((b) => (
              <tr key={b.bucket}>
                <TD>{b.bucket}</TD>
                <TD>{b.total}</TD>
                <TD>{b.planned}</TD>
                <TD>{b.done}</TD>
                <TD>{b.cancelled}</TD>
                <TD>{b.no_show}</TD>
              </tr>
            ))}
          </TBody>
        </Table>
      </div>
      <div className="mt-4 grid gap-3 md:hidden">
        {data.buckets.map((b) => (
          <div key={b.bucket} className="rounded-xl border border-border/70 bg-card/75 p-3 text-sm">
            <p className="font-semibold">{b.bucket}</p>
            <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted">
              <span>{t('pages:reports.appointments.total')}: {b.total}</span>
              <span>{t('pages:reports.appointments.done')}: {b.done}</span>
              <span>{t('pages:reports.appointments.cancelled')}: {b.cancelled}</span>
              <span>{t('pages:reports.appointments.noShow')}: {b.no_show}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function StudentsReport({ query, params }: { query: QueryResult<import('../features/reports/types').StudentReport>; params: ReportParams }) {
  const { t } = useTranslation(['pages', 'common'])
  if (query.isLoading) return <ReportSkeleton />
  if (query.isError) return <ReportError error={query.error} />
  const data = query.data!
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div />
        <ReportExportButton type="students" params={params} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t('pages:reports.students.total')} value={data.totals.total} />
        <KpiCard label={t('pages:reports.students.active')} value={data.totals.active} />
        <KpiCard label={t('pages:reports.students.passive')} value={data.totals.passive} />
        <KpiCard label={t('pages:reports.students.newInRange')} value={data.totals.new_in_range} />
      </div>
      <div className="table-surface mt-4 hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH>{t('pages:reports.bucket')}</TH>
              <TH>{t('pages:reports.students.total')}</TH>
              <TH>{t('pages:reports.students.active')}</TH>
              <TH>{t('pages:reports.students.passive')}</TH>
            </tr>
          </THead>
          <TBody>
            {data.buckets.length === 0 ? (
              <tr><td colSpan={4} className="border-b border-border/70 px-3 py-3 text-center text-muted">{t('pages:reports.noData')}</td></tr>
            ) : data.buckets.map((b) => (
              <tr key={b.bucket}>
                <TD>{b.bucket}</TD>
                <TD>{b.total}</TD>
                <TD>{b.active}</TD>
                <TD>{b.passive}</TD>
              </tr>
            ))}
          </TBody>
        </Table>
      </div>
      <div className="mt-4 grid gap-3 md:hidden">
        {data.buckets.map((b) => (
          <div key={b.bucket} className="rounded-xl border border-border/70 bg-card/75 p-3 text-sm">
            <p className="font-semibold">{b.bucket}</p>
            <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted">
              <span>{t('pages:reports.students.total')}: {b.total}</span>
              <span>{t('pages:reports.students.active')}: {b.active}</span>
              <span>{t('pages:reports.students.passive')}: {b.passive}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function ProgramsReport({ query, params }: { query: QueryResult<import('../features/reports/types').ProgramReport>; params: ReportParams }) {
  const { t } = useTranslation(['pages', 'common'])
  if (query.isLoading) return <ReportSkeleton />
  if (query.isError) return <ReportError error={query.error} />
  const data = query.data!
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div />
        <ReportExportButton type="programs" params={params} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t('pages:reports.programs.total')} value={data.totals.total} />
        <KpiCard label={t('pages:reports.programs.active')} value={data.totals.active} />
        <KpiCard label={t('pages:reports.programs.draft')} value={data.totals.draft} />
        <KpiCard label={t('pages:reports.programs.archived')} value={data.totals.archived} />
      </div>
      <div className="table-surface mt-4 hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH>{t('pages:reports.bucket')}</TH>
              <TH>{t('pages:reports.programs.total')}</TH>
              <TH>{t('pages:reports.programs.active')}</TH>
              <TH>{t('pages:reports.programs.draft')}</TH>
              <TH>{t('pages:reports.programs.archived')}</TH>
            </tr>
          </THead>
          <TBody>
            {data.buckets.length === 0 ? (
              <tr><td colSpan={5} className="border-b border-border/70 px-3 py-3 text-center text-muted">{t('pages:reports.noData')}</td></tr>
            ) : data.buckets.map((b) => (
              <tr key={b.bucket}>
                <TD>{b.bucket}</TD>
                <TD>{b.total}</TD>
                <TD>{b.active}</TD>
                <TD>{b.draft}</TD>
                <TD>{b.archived}</TD>
              </tr>
            ))}
          </TBody>
        </Table>
      </div>
      <div className="mt-4 grid gap-3 md:hidden">
        {data.buckets.map((b) => (
          <div key={b.bucket} className="rounded-xl border border-border/70 bg-card/75 p-3 text-sm">
            <p className="font-semibold">{b.bucket}</p>
            <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted">
              <span>{t('pages:reports.programs.total')}: {b.total}</span>
              <span>{t('pages:reports.programs.active')}: {b.active}</span>
              <span>{t('pages:reports.programs.draft')}: {b.draft}</span>
              <span>{t('pages:reports.programs.archived')}: {b.archived}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function RemindersReport({ query, params }: { query: QueryResult<import('../features/reports/types').ReminderReport>; params: ReportParams }) {
  const { t } = useTranslation(['pages', 'common'])
  if (query.isLoading) return <ReportSkeleton />
  if (query.isError) return <ReportError error={query.error} />
  const data = query.data!
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div />
        <ReportExportButton type="reminders" params={params} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t('pages:reports.reminders.total')} value={data.totals.total} />
        <KpiCard label={t('pages:reports.reminders.sent')} value={data.totals.sent} />
        <KpiCard label={t('pages:reports.reminders.sendRate')} value={`${data.totals.send_rate}%`} />
        <KpiCard label={t('pages:reports.reminders.onTimeSendRate')} value={`${data.totals.on_time_send_rate}%`} />
        <KpiCard label={t('pages:reports.reminders.missed')} value={data.totals.missed} />
        <KpiCard label={t('pages:reports.reminders.missedRate')} value={`${data.totals.missed_rate}%`} />
        <KpiCard label={t('pages:reports.reminders.escalated')} value={data.totals.escalated} />
        <KpiCard label={t('pages:reports.reminders.avgAttempts')} value={data.totals.avg_attempt_count} />
      </div>
      <div className="table-surface mt-4 hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH>{t('pages:reports.bucket')}</TH>
              <TH>{t('pages:reports.reminders.total')}</TH>
              <TH>{t('pages:reports.reminders.sent')}</TH>
              <TH>{t('pages:reports.reminders.pending')}</TH>
              <TH>{t('pages:reports.reminders.missed')}</TH>
              <TH>{t('pages:reports.reminders.failed')}</TH>
              <TH>{t('pages:reports.reminders.escalated')}</TH>
            </tr>
          </THead>
          <TBody>
            {data.buckets.length === 0 ? (
              <tr><td colSpan={7} className="border-b border-border/70 px-3 py-3 text-center text-muted">{t('pages:reports.noData')}</td></tr>
            ) : data.buckets.map((b) => (
              <tr key={b.bucket}>
                <TD>{b.bucket}</TD>
                <TD>{b.total}</TD>
                <TD>{b.sent}</TD>
                <TD>{b.pending}</TD>
                <TD>{b.missed}</TD>
                <TD>{b.failed}</TD>
                <TD>{b.escalated}</TD>
              </tr>
            ))}
          </TBody>
        </Table>
      </div>
      <div className="mt-4 grid gap-3 md:hidden">
        {data.buckets.map((b) => (
          <div key={b.bucket} className="rounded-xl border border-border/70 bg-card/75 p-3 text-sm">
            <p className="font-semibold">{b.bucket}</p>
            <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted">
              <span>{t('pages:reports.reminders.total')}: {b.total}</span>
              <span>{t('pages:reports.reminders.sent')}: {b.sent}</span>
              <span>{t('pages:reports.reminders.missed')}: {b.missed}</span>
              <span>{t('pages:reports.reminders.escalated')}: {b.escalated}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="kpi-card stagger-in">
      <p className="text-xs uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  )
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  )
}

function ReportError({ error }: { error: unknown }) {
  const { t } = useTranslation(['common'])
  return (
    <p className="rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">
      {extractApiMessage(error, t('common:requestFailed'))}
    </p>
  )
}
