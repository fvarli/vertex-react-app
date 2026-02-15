import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { getDashboardSummary } from '../features/dashboard/api'
import { listAppointments } from '../features/appointments/api'
import { extractApiMessage } from '../lib/api-errors'
import { Skeleton } from '../components/ui/skeleton'

function formatDateTime(value: string): string {
  return dayjs(value).format('DD MMM YYYY HH:mm')
}

export function DashboardPage() {
  const { t } = useTranslation(['pages', 'common'])

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

  const summary = summaryQuery.data
  const timeline = timelineQuery.data?.data ?? []

  return (
    <div className="page space-y-4">
      <div className="panel">
        <h2 className="text-xl font-semibold">{t('pages:dashboard.title')}</h2>
        <p className="text-sm text-muted">{t('pages:dashboard.description')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryQuery.isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : summaryQuery.isError ? (
          <p className="rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">
            {extractApiMessage(summaryQuery.error, t('common:requestFailed'))}
          </p>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted">{t('pages:dashboard.cards.activeStudents')}</p>
              <p className="text-2xl font-semibold">{summary?.students.active ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted">{t('pages:dashboard.cards.passiveStudents')}</p>
              <p className="text-2xl font-semibold">{summary?.students.passive ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted">{t('pages:dashboard.cards.todayAppointments')}</p>
              <p className="text-2xl font-semibold">{summary?.appointments.today_total ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted">{t('pages:dashboard.cards.upcomingAppointments')}</p>
              <p className="text-2xl font-semibold">{summary?.appointments.upcoming_7d ?? 0}</p>
            </div>
          </>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-lg font-semibold">{t('pages:dashboard.timelineTitle')}</h3>
        <p className="mb-3 text-sm text-muted">{t('pages:dashboard.timelineDescription')}</p>

        {timelineQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : timelineQuery.isError ? (
          <p className="text-sm text-danger">{extractApiMessage(timelineQuery.error, t('common:requestFailed'))}</p>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-muted">{t('pages:dashboard.timelineEmpty')}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {timeline.map((item) => (
              <li key={item.id} className="rounded-md border border-border/80 px-3 py-2">
                <strong>{formatDateTime(item.starts_at)}</strong> - {formatDateTime(item.ends_at)} • {t(`common:${item.status}`)} • #
                {item.student_id}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
