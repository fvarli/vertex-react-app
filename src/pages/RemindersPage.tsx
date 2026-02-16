import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { TBody, TD, TH, THead, Table } from '../components/ui/table'
import { cancelReminder, listReminders, markReminderSent, openReminder, type ReminderStatus } from '../features/appointments/reminders'
import { listStudents } from '../features/students/api'
import { extractApiMessage, isForbidden } from '../lib/api-errors'

function formatDate(value: string): string {
  return dayjs(value).format('DD.MM.YYYY HH:mm')
}

export function RemindersPage() {
  const { t } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [status, setStatus] = useState<ReminderStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  const remindersQuery = useQuery({
    queryKey: ['reminders', { status, page }],
    queryFn: () => listReminders({ status, page, per_page: 15 }),
  })

  const studentsQuery = useQuery({
    queryKey: ['students', 'reminder-resolve'],
    queryFn: () => listStudents({ status: 'all', page: 1, per_page: 200 }),
  })

  const openMutation = useMutation({
    mutationFn: openReminder,
    onSuccess: async () => {
      setNotice(t('pages:reminders.noticeOpened'))
      setErrorNotice(null)
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const markSentMutation = useMutation({
    mutationFn: markReminderSent,
    onSuccess: async () => {
      setNotice(t('pages:reminders.noticeMarkedSent'))
      setErrorNotice(null)
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const cancelMutation = useMutation({
    mutationFn: cancelReminder,
    onSuccess: async () => {
      setNotice(t('pages:reminders.noticeCancelled'))
      setErrorNotice(null)
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const reminders = remindersQuery.data?.data ?? []
  const students = studentsQuery.data?.data ?? []
  const pagination = remindersQuery.data

  return (
    <div className="space-y-5 fade-in">
      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:reminders.sectionLabel')}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:reminders.title')}</h2>
            <p className="mt-1 text-sm text-muted">{t('pages:reminders.description')}</p>
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value as ReminderStatus | 'all')}>
            <option value="all">{t('pages:reminders.filters.all')}</option>
            <option value="pending">{t('pages:reminders.filters.pending')}</option>
            <option value="ready">{t('pages:reminders.filters.ready')}</option>
            <option value="sent">{t('pages:reminders.filters.sent')}</option>
            <option value="missed">{t('pages:reminders.filters.missed')}</option>
            <option value="cancelled">{t('pages:reminders.filters.cancelled')}</option>
          </Select>
        </div>

        {notice ? <p className="mb-3 rounded-xl bg-success/15 px-3 py-2 text-sm text-success">{notice}</p> : null}
        {errorNotice ? <p className="mb-3 rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{errorNotice}</p> : null}

        {remindersQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : remindersQuery.isError ? (
          <p className="text-sm text-danger">{extractApiMessage(remindersQuery.error, t('common:requestFailed'))}</p>
        ) : (
          <>
            <div className="table-surface">
              <Table>
                <THead>
                  <tr>
                    <TH>{t('pages:reminders.table.student')}</TH>
                    <TH>{t('pages:reminders.table.appointment')}</TH>
                    <TH>{t('pages:reminders.table.scheduledFor')}</TH>
                    <TH>{t('pages:reminders.table.status')}</TH>
                    <TH>{t('pages:reminders.table.actions')}</TH>
                  </tr>
                </THead>
                <TBody>
                  {reminders.map((reminder) => {
                    const studentName =
                      students.find((student) => student.id === reminder.appointment?.student_id)?.full_name ??
                      `${t('pages:appointments.table.student')} #${reminder.appointment?.student_id ?? '-'}`
                    return (
                      <tr key={reminder.id}>
                        <TD>{studentName}</TD>
                        <TD>{reminder.appointment ? formatDate(reminder.appointment.starts_at) : '-'}</TD>
                        <TD>{formatDate(reminder.scheduled_for)}</TD>
                        <TD>
                          <Badge variant={reminder.status === 'sent' ? 'success' : 'muted'}>{t(`pages:reminders.filters.${reminder.status}`)}</Badge>
                        </TD>
                        <TD>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => void openMutation.mutateAsync(reminder.id)}>
                              {t('pages:reminders.actions.open')}
                            </Button>
                            <Button size="sm" onClick={() => void markSentMutation.mutateAsync(reminder.id)}>
                              {t('pages:reminders.actions.markSent')}
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => void cancelMutation.mutateAsync(reminder.id)}>
                              {t('pages:reminders.actions.cancel')}
                            </Button>
                          </div>
                        </TD>
                      </tr>
                    )
                  })}
                </TBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {t('pages:appointments.pagination', {
                  page: pagination?.current_page ?? 1,
                  lastPage: pagination?.last_page ?? 1,
                  total: pagination?.total ?? 0,
                })}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={(pagination?.current_page ?? 1) <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                  {t('common:prev')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(pagination?.current_page ?? 1) >= (pagination?.last_page ?? 1)}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  {t('common:next')}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
