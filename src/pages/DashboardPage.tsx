import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { listAppointments } from '../features/appointments/api'
import { getDashboardSummary } from '../features/dashboard/api'
import { getTrainerOverview } from '../features/trainers/api'
import { extractApiMessage } from '../lib/api-errors'

function formatDateTime(value: string): string {
  return dayjs(value).format('DD.MM.YYYY HH:mm')
}

export function DashboardPage() {
  const { t } = useTranslation(['pages', 'common'])
  const location = useLocation()
  const navigate = useNavigate()
  const isAdminArea = location.pathname.startsWith('/admin/')
  const prefix = isAdminArea ? '/admin' : '/trainer'

  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
  })

  const timelineQuery = useQuery({
    queryKey: ['dashboard', 'today-timeline'],
    queryFn: () =>
      listAppointments({
        date_from: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        date_to: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        sort: 'starts_at',
        direction: 'asc',
        page: 1,
        per_page: 50,
      }),
  })

  const trainerOverviewQuery = useQuery({
    queryKey: ['dashboard', 'trainer-overview'],
    queryFn: () => getTrainerOverview({ include_inactive: false }),
    enabled: isAdminArea,
  })

  const summary = summaryQuery.data
  const timeline = timelineQuery.data?.data ?? []

  return (
    <div className="page space-y-5 fade-in">
      <div className="panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:dashboard.sectionLabel')}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:dashboard.title')}</h2>
            <p className="mt-1 text-sm text-muted">{t('pages:dashboard.description')}</p>
          </div>
          <Badge variant="muted" className="rounded-lg px-3 py-1 text-[11px] tracking-[0.08em]">
            {dayjs(summary?.date ?? dayjs().format('YYYY-MM-DD')).format('DD.MM.YYYY')}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryQuery.isLoading ? (
          <>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </>
        ) : summaryQuery.isError ? (
          <p className="rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">
            {extractApiMessage(summaryQuery.error, t('common:requestFailed'))}
          </p>
        ) : (
          <>
            {(summary?.students.active ?? 0) === 0 && (summary?.appointments.today_total ?? 0) === 0 ? (
              <div className="col-span-full rounded-xl bg-border/50 px-4 py-6 text-center">
                <p className="text-sm text-muted">{t('pages:emptyState.dashboardWelcome')}</p>
                <Button className="mt-3" size="sm" onClick={() => navigate(isAdminArea ? '/admin/students' : '/trainer/students')}>
                  {t('pages:emptyState.studentsCta')}
                </Button>
              </div>
            ) : null}
            <Link to={`${prefix}/students`} className="kpi-card stagger-in cursor-pointer transition-colors hover:border-primary/40">
              <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.cards.activeStudents')}</p>
              <p className="mt-2 text-3xl font-extrabold">{summary?.students.active ?? 0}</p>
            </Link>
            <Link to={`${prefix}/students`} className="kpi-card stagger-in cursor-pointer transition-colors hover:border-primary/40">
              <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.cards.passiveStudents')}</p>
              <p className="mt-2 text-3xl font-extrabold">{summary?.students.passive ?? 0}</p>
            </Link>
            <Link to={`${prefix}/calendar`} className="kpi-card stagger-in cursor-pointer transition-colors hover:border-primary/40">
              <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.cards.todayAppointments')}</p>
              <p className="mt-2 text-3xl font-extrabold">{summary?.appointments.today_total ?? 0}</p>
            </Link>
            <Link to={`${prefix}/appointments`} className="kpi-card stagger-in cursor-pointer transition-colors hover:border-primary/40">
              <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.cards.todayNoShow')}</p>
              <p className="mt-2 text-3xl font-extrabold">{summary?.appointments.today_no_show ?? 0}</p>
            </Link>
            <Link to={`${prefix}/appointments`} className="kpi-card stagger-in cursor-pointer transition-colors hover:border-primary/40">
              <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.cards.attendanceRate')}</p>
              <p className="mt-2 text-3xl font-extrabold">
                {summary?.appointments.today_attendance_rate == null ? '-' : `${summary.appointments.today_attendance_rate}%`}
              </p>
            </Link>
            <Link to={`${prefix}/appointments`} className="kpi-card stagger-in cursor-pointer transition-colors hover:border-primary/40">
              <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.cards.upcomingAppointments')}</p>
              <p className="mt-2 text-3xl font-extrabold">{summary?.appointments.upcoming_7d ?? 0}</p>
            </Link>
            <Link to={`${prefix}/reminders`} className="kpi-card stagger-in cursor-pointer transition-colors hover:border-primary/40">
              <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.cards.todaySentReminders')}</p>
              <p className="mt-2 text-3xl font-extrabold">{summary?.reminders?.today_sent ?? 0}</p>
            </Link>
            <Link to={`${prefix}/reminders`} className="kpi-card stagger-in cursor-pointer transition-colors hover:border-primary/40">
              <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.cards.todayEscalatedReminders')}</p>
              <p className="mt-2 text-3xl font-extrabold">{summary?.reminders?.today_escalated ?? 0}</p>
            </Link>
          </>
        )}
      </div>

      {isAdminArea ? (
        <div className="panel">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{t('pages:dashboard.trainers.title')}</h3>
              <p className="text-sm text-muted">{t('pages:dashboard.trainers.description')}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/trainers')}>
              {t('pages:dashboard.trainers.open')}
            </Button>
          </div>

          {trainerOverviewQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ) : trainerOverviewQuery.isError ? (
            <p className="text-sm text-danger">{extractApiMessage(trainerOverviewQuery.error, t('common:requestFailed'))}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="kpi-card stagger-in">
                <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.trainers.cards.totalTrainers')}</p>
                <p className="mt-2 text-3xl font-extrabold">{trainerOverviewQuery.data?.summary.total_trainers ?? 0}</p>
              </div>
              <div className="kpi-card stagger-in">
                <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.trainers.cards.totalStudents')}</p>
                <p className="mt-2 text-3xl font-extrabold">{trainerOverviewQuery.data?.summary.total_students ?? 0}</p>
              </div>
              <div className="kpi-card stagger-in">
                <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.trainers.cards.todayAppointments')}</p>
                <p className="mt-2 text-3xl font-extrabold">{trainerOverviewQuery.data?.summary.today_appointments ?? 0}</p>
              </div>
              <div className="kpi-card stagger-in">
                <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.trainers.cards.avgStudents')}</p>
                <p className="mt-2 text-3xl font-extrabold">{trainerOverviewQuery.data?.summary.avg_students_per_trainer ?? '-'}</p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="panel">
        <h3 className="mb-2 text-lg font-semibold tracking-tight">{t('pages:dashboard.timelineTitle')}</h3>
        <p className="mb-3 text-sm text-muted">{t('pages:dashboard.timelineDescription')}</p>

        {timelineQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : timelineQuery.isError ? (
          <p className="text-sm text-danger">{extractApiMessage(timelineQuery.error, t('common:requestFailed'))}</p>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-muted">{t('pages:dashboard.timelineEmpty')}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {timeline.map((item) => (
              <li key={item.id} className="timeline-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>
                    <strong>{formatDateTime(item.starts_at)}</strong> - {formatDateTime(item.ends_at)}
                  </p>
                  <Badge variant={item.status === 'done' ? 'success' : 'muted'}>{t(`common:${item.status}`)}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">Student #{item.student_id}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
