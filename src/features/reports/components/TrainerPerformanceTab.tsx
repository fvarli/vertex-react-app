import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../../../components/ui/skeleton'
import { Table, TBody, TD, TH, THead } from '../../../components/ui/table'
import { extractApiMessage } from '../../../lib/api-errors'
import { getTrainerPerformanceReport } from '../api'
import type { ReportParams } from '../types'
import { ReportExportButton } from './ReportExportButton'

type Props = {
  params: ReportParams
}

export function TrainerPerformanceTab({ params }: Props) {
  const { t } = useTranslation(['pages', 'common'])

  const query = useQuery({
    queryKey: ['reports', 'trainer-performance', params],
    queryFn: () => getTrainerPerformanceReport(params),
  })

  if (query.isLoading) {
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

  if (query.isError) {
    return (
      <p className="rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">
        {extractApiMessage(query.error, t('common:requestFailed'))}
      </p>
    )
  }

  const data = query.data!

  return (
    <>
      <div className="mb-4 flex justify-end">
        <ReportExportButton type="trainer-performance" params={params} />
      </div>

      <div className="table-surface hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH>{t('pages:reports.trainerPerformance.trainerName')}</TH>
              <TH>{t('pages:reports.trainerPerformance.totalStudents')}</TH>
              <TH>{t('pages:reports.trainerPerformance.completedAppointments')}</TH>
              <TH>{t('pages:reports.trainerPerformance.completionRate')}</TH>
              <TH>{t('pages:reports.trainerPerformance.noShowCount')}</TH>
              <TH>{t('pages:reports.trainerPerformance.reminderSuccessRate')}</TH>
            </tr>
          </THead>
          <TBody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="border-b border-border/70 px-3 py-3 text-center text-muted">
                  {t('pages:reports.noData')}
                </td>
              </tr>
            ) : (
              data.rows.map((row) => (
                <tr key={row.trainer_id}>
                  <TD>{row.trainer_name}</TD>
                  <TD>{row.total_students}</TD>
                  <TD>{row.completed_appointments}</TD>
                  <TD>{row.completion_rate}%</TD>
                  <TD>{row.no_show_count}</TD>
                  <TD>{row.reminder_success_rate}%</TD>
                </tr>
              ))
            )}
          </TBody>
        </Table>
      </div>

      <div className="mt-4 grid gap-3 md:hidden">
        {data.rows.length === 0 ? (
          <p className="text-center text-sm text-muted">{t('pages:reports.noData')}</p>
        ) : (
          data.rows.map((row) => (
            <div key={row.trainer_id} className="rounded-xl border border-border/70 bg-card/75 p-3 text-sm">
              <p className="font-semibold">{row.trainer_name}</p>
              <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted">
                <span>{t('pages:reports.trainerPerformance.totalStudents')}: {row.total_students}</span>
                <span>{t('pages:reports.trainerPerformance.completedAppointments')}: {row.completed_appointments}</span>
                <span>{t('pages:reports.trainerPerformance.completionRate')}: {row.completion_rate}%</span>
                <span>{t('pages:reports.trainerPerformance.noShowCount')}: {row.no_show_count}</span>
                <span>{t('pages:reports.trainerPerformance.reminderSuccessRate')}: {row.reminder_success_rate}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
