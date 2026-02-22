import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TBody, TD, TH, THead } from '../components/ui/table'
import { listAppointments } from '../features/appointments/api'
import { listPrograms } from '../features/programs/api'
import { fetchStudent, getStudentTimeline } from '../features/students/api'
import { extractApiMessage } from '../lib/api-errors'

type DetailTab = 'overview' | 'programs' | 'appointments' | 'timeline'

export function StudentDetailPage() {
  const { t } = useTranslation(['pages', 'common'])
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const studentId = Number(id)
  const base = location.pathname.startsWith('/admin/') ? '/admin' : '/trainer'

  const [activeTab, setActiveTab] = useState<DetailTab>('overview')

  const studentQuery = useQuery({
    queryKey: ['students', studentId],
    queryFn: () => fetchStudent(studentId),
    enabled: !isNaN(studentId),
  })

  const programsQuery = useQuery({
    queryKey: ['students', studentId, 'programs'],
    queryFn: () => listPrograms(studentId, { per_page: 50 }),
    enabled: activeTab === 'programs' || activeTab === 'overview',
  })

  const appointmentsQuery = useQuery({
    queryKey: ['students', studentId, 'appointments'],
    queryFn: () =>
      listAppointments({
        student_id: studentId,
        per_page: 50,
        sort: 'starts_at',
        direction: 'desc',
      }),
    enabled: activeTab === 'appointments',
  })

  const timelineQuery = useQuery({
    queryKey: ['students', studentId, 'timeline'],
    queryFn: () => getStudentTimeline(studentId, 50),
    enabled: activeTab === 'timeline',
  })

  const student = studentQuery.data

  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'overview', label: t('pages:studentDetail.tabs.overview') },
    { key: 'programs', label: t('pages:studentDetail.tabs.programs') },
    { key: 'appointments', label: t('pages:studentDetail.tabs.appointments') },
    { key: 'timeline', label: t('pages:studentDetail.tabs.timeline') },
  ]

  if (studentQuery.isLoading) {
    return (
      <div className="page space-y-5 fade-in">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (studentQuery.isError) {
    return (
      <div className="page space-y-5 fade-in">
        <p className="rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">
          {extractApiMessage(studentQuery.error, t('common:requestFailed'))}
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(`${base}/students`)}>
          {t('pages:studentDetail.backToList')}
        </Button>
      </div>
    )
  }

  return (
    <div className="page space-y-5 fade-in">
      <div className="panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:studentDetail.sectionLabel')}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{student?.full_name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Badge variant={student?.status === 'active' ? 'success' : 'muted'}>
                {t(`common:${student?.status}`)}
              </Badge>
              {student?.phone ? <span>{student.phone}</span> : null}
            </div>
            {student?.notes ? <p className="mt-2 text-sm text-muted">{student.notes}</p> : null}
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`${base}/students`)}>
            {t('pages:studentDetail.backToList')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
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

      {activeTab === 'overview' ? (
        <OverviewTab student={student!} programCount={programsQuery.data?.total ?? 0} />
      ) : activeTab === 'programs' ? (
        <ProgramsTab query={programsQuery} />
      ) : activeTab === 'appointments' ? (
        <AppointmentsTab query={appointmentsQuery} />
      ) : (
        <TimelineTab query={timelineQuery} />
      )}
    </div>
  )
}

function OverviewTab({ student, programCount }: { student: import('../features/students/types').Student; programCount: number }) {
  const { t } = useTranslation(['pages', 'common'])
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="kpi-card stagger-in">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:studentDetail.overview.status')}</p>
        <p className="mt-2 text-3xl font-extrabold">{t(`common:${student.status}`)}</p>
      </div>
      <div className="kpi-card stagger-in">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:studentDetail.overview.programs')}</p>
        <p className="mt-2 text-3xl font-extrabold">{programCount}</p>
      </div>
      <div className="kpi-card stagger-in">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:studentDetail.overview.phone')}</p>
        <p className="mt-2 text-xl font-extrabold">{student.phone || '-'}</p>
      </div>
      <div className="kpi-card stagger-in">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:studentDetail.overview.joined')}</p>
        <p className="mt-2 text-xl font-extrabold">{dayjs(student.created_at).format('DD.MM.YYYY')}</p>
      </div>
    </div>
  )
}

type QR<T> = { data: T | undefined; isLoading: boolean; isError: boolean; error: unknown }

function ProgramsTab({ query }: { query: QR<import('../features/programs/types').Paginated<import('../features/programs/types').Program>> }) {
  const { t } = useTranslation(['pages', 'common'])
  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />
  if (query.isError) return <ErrMsg error={query.error} />
  const programs = query.data?.data ?? []
  if (programs.length === 0) return <p className="text-sm text-muted">{t('pages:studentDetail.programsEmpty')}</p>
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {programs.map((p) => (
          <div key={p.id} className="rounded-xl border border-border/70 bg-card/75 p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{p.title}</p>
              <Badge variant={p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'muted'}>{p.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">{t('pages:studentDetail.weekStart')}: {p.week_start_date}</p>
            <p className="text-xs text-muted">{t('pages:studentDetail.items')}: {p.items.length}</p>
          </div>
        ))}
      </div>
      <div className="table-surface hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH>{t('pages:programs.table.title')}</TH>
              <TH>{t('pages:programs.table.week')}</TH>
              <TH>{t('pages:programs.table.status')}</TH>
              <TH>{t('pages:programs.table.items')}</TH>
            </tr>
          </THead>
          <TBody>
            {programs.map((p) => (
              <tr key={p.id}>
                <TD>{p.title}</TD>
                <TD>{p.week_start_date}</TD>
                <TD><Badge variant={p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'muted'}>{p.status}</Badge></TD>
                <TD>{p.items.length}</TD>
              </tr>
            ))}
          </TBody>
        </Table>
      </div>
    </>
  )
}

function AppointmentsTab({ query }: { query: QR<import('../features/appointments/types').Paginated<import('../features/appointments/types').Appointment>> }) {
  const { t } = useTranslation(['pages', 'common'])
  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />
  if (query.isError) return <ErrMsg error={query.error} />
  const appointments = query.data?.data ?? []
  if (appointments.length === 0) return <p className="text-sm text-muted">{t('pages:studentDetail.appointmentsEmpty')}</p>
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {appointments.map((a) => (
          <div key={a.id} className="rounded-xl border border-border/70 bg-card/75 p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{dayjs(a.starts_at).format('DD.MM.YYYY HH:mm')}</p>
              <Badge variant={a.status === 'done' ? 'success' : a.status === 'cancelled' ? 'danger' : 'muted'}>{t(`common:${a.status}`)}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">
              {dayjs(a.starts_at).format('HH:mm')} - {dayjs(a.ends_at).format('HH:mm')}
            </p>
          </div>
        ))}
      </div>
      <div className="table-surface hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH>{t('pages:appointments.table.start')}</TH>
              <TH>{t('pages:appointments.table.end')}</TH>
              <TH>{t('pages:appointments.table.status')}</TH>
              <TH>{t('pages:appointments.whatsapp.column')}</TH>
            </tr>
          </THead>
          <TBody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <TD>{dayjs(a.starts_at).format('DD.MM.YYYY HH:mm')}</TD>
                <TD>{dayjs(a.ends_at).format('HH:mm')}</TD>
                <TD><Badge variant={a.status === 'done' ? 'success' : a.status === 'cancelled' ? 'danger' : 'muted'}>{t(`common:${a.status}`)}</Badge></TD>
                <TD><Badge variant={a.whatsapp_status === 'sent' ? 'success' : 'muted'}>{a.whatsapp_status}</Badge></TD>
              </tr>
            ))}
          </TBody>
        </Table>
      </div>
    </>
  )
}

function TimelineTab({ query }: { query: QR<import('../features/students/types').StudentTimeline> }) {
  const { t } = useTranslation(['pages', 'common'])
  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />
  if (query.isError) return <ErrMsg error={query.error} />
  const items = query.data?.items ?? []
  if (items.length === 0) return <p className="text-sm text-muted">{t('pages:students.timeline.empty')}</p>
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={`${item.type}-${item.id}`} className="rounded-xl border border-border/70 bg-card/75 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <Badge variant={item.status === 'done' || item.status === 'active' ? 'success' : 'muted'}>{item.status}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted">
            {item.type} • {dayjs(item.event_at).format('DD.MM.YYYY HH:mm')}
          </p>
        </li>
      ))}
    </ul>
  )
}

function ErrMsg({ error }: { error: unknown }) {
  const { t } = useTranslation(['common'])
  return (
    <p className="rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">
      {extractApiMessage(error, t('common:requestFailed'))}
    </p>
  )
}
