import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../../../components/ui/skeleton'
import { extractApiMessage } from '../../../lib/api-errors'
import { getStudentRetentionReport } from '../api'
import type { ReportParams } from '../types'

type Props = {
  params: ReportParams
}

export function StudentRetentionTab({ params }: Props) {
  const { t } = useTranslation(['pages', 'common'])

  const query = useQuery({
    queryKey: ['reports', 'student-retention', params],
    queryFn: () => getStudentRetentionReport(params),
  })

  if (query.isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <p className="rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">
        {extractApiMessage(query.error, t('common:requestFailed'))}
      </p>
    )
  }

  const data = query.data!

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div className="kpi-card stagger-in">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:reports.retention.retentionRate')}</p>
        <p className="mt-2 text-3xl font-extrabold">{data.retention_rate}%</p>
      </div>
      <div className="kpi-card stagger-in">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:reports.retention.churnRate')}</p>
        <p className="mt-2 text-3xl font-extrabold">{data.churn_rate}%</p>
      </div>
      <div className="kpi-card stagger-in">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:reports.retention.newStudents')}</p>
        <p className="mt-2 text-3xl font-extrabold">{data.new_students}</p>
      </div>
      <div className="kpi-card stagger-in">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:reports.retention.churnedStudents')}</p>
        <p className="mt-2 text-3xl font-extrabold">{data.churned_students}</p>
      </div>
      <div className="kpi-card stagger-in">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:reports.retention.avgLifetimeDays')}</p>
        <p className="mt-2 text-3xl font-extrabold">{data.avg_student_lifetime_days}</p>
      </div>
      <div className="kpi-card stagger-in">
        <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:reports.retention.withoutAppointment30d')}</p>
        <p className="mt-2 text-3xl font-extrabold">{data.students_without_appointment_30d}</p>
      </div>
    </div>
  )
}
