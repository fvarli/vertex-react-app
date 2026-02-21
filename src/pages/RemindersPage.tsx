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
import {
  bulkReminderAction,
  cancelReminder,
  listReminders,
  markReminderSent,
  openReminder,
  requeueReminder,
  type ReminderStatus,
} from '../features/appointments/reminders'
import { listStudents } from '../features/students/api'
import { api } from '../lib/api'
import { extractApiMessage, isForbidden } from '../lib/api-errors'
import { useWorkspaceAccess } from '../features/workspace/access'

function formatDate(value: string | null): string {
  if (!value) return '-'
  return dayjs(value).format('DD.MM.YYYY HH:mm')
}

export function RemindersPage() {
  const { t } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canMutate, approvalMessage } = useWorkspaceAccess()

  const [status, setStatus] = useState<ReminderStatus | 'all'>('all')
  const [escalatedOnly, setEscalatedOnly] = useState<'0' | '1'>('0')
  const [retryDueOnly, setRetryDueOnly] = useState<'0' | '1'>('0')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  const remindersQuery = useQuery({
    queryKey: ['reminders', { status, page, escalatedOnly, retryDueOnly }],
    queryFn: () =>
      listReminders({
        status,
        escalated_only: escalatedOnly === '1',
        retry_due_only: retryDueOnly === '1',
        page,
        per_page: 15,
      }),
  })

  const studentsQuery = useQuery({
    queryKey: ['students', 'reminder-resolve'],
    queryFn: () => listStudents({ status: 'all', page: 1, per_page: 200 }),
  })

  const invalidate = async () => {
    setSelectedIds([])
    await queryClient.invalidateQueries({ queryKey: ['reminders'] })
    await queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
  }

  const openMutation = useMutation({
    mutationFn: openReminder,
    onSuccess: async () => {
      setNotice(t('pages:reminders.noticeOpened'))
      setErrorNotice(null)
      await invalidate()
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
      await invalidate()
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
      await invalidate()
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const requeueMutation = useMutation({
    mutationFn: (id: number) => requeueReminder(id),
    onSuccess: async () => {
      setNotice(t('pages:reminders.noticeRequeued'))
      setErrorNotice(null)
      await invalidate()
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const bulkMutation = useMutation({
    mutationFn: bulkReminderAction,
    onSuccess: async (data) => {
      setNotice(t('pages:reminders.noticeBulkApplied', { count: data.affected }))
      setErrorNotice(null)
      await invalidate()
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

  const allSelected = reminders.length > 0 && reminders.every((r) => selectedIds.includes(r.id))

  function toggleSelect(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([])
      return
    }
    setSelectedIds(reminders.map((r) => r.id))
  }

  async function handleBulk(action: 'mark-sent' | 'cancel' | 'requeue') {
    if (!canMutate) return
    if (selectedIds.length === 0) {
      setErrorNotice(t('pages:reminders.needSelection'))
      return
    }

    await bulkMutation.mutateAsync({ ids: selectedIds, action })
  }

  async function exportCsv() {
    try {
      const response = await api.get('/reminders/export.csv', {
        params: {
          status: status === 'all' ? undefined : status,
          escalated_only: escalatedOnly === '1',
          retry_due_only: retryDueOnly === '1',
        },
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reminders-${dayjs().format('YYYYMMDD-HHmmss')}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setNotice(t('pages:reminders.noticeExported'))
      setErrorNotice(null)
    } catch (error) {
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    }
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:reminders.sectionLabel')}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:reminders.title')}</h2>
            <p className="mt-1 text-sm text-muted">{t('pages:reminders.description')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={status} onChange={(e) => setStatus(e.target.value as ReminderStatus | 'all')}>
              <option value="all">{t('pages:reminders.filters.all')}</option>
              <option value="pending">{t('pages:reminders.filters.pending')}</option>
              <option value="ready">{t('pages:reminders.filters.ready')}</option>
              <option value="sent">{t('pages:reminders.filters.sent')}</option>
              <option value="missed">{t('pages:reminders.filters.missed')}</option>
              <option value="failed">{t('pages:reminders.filters.failed')}</option>
              <option value="escalated">{t('pages:reminders.filters.escalated')}</option>
              <option value="cancelled">{t('pages:reminders.filters.cancelled')}</option>
            </Select>
            <Select value={escalatedOnly} onChange={(e) => setEscalatedOnly(e.target.value as '0' | '1')}>
              <option value="0">{t('pages:reminders.filters.escalatedOnlyOff')}</option>
              <option value="1">{t('pages:reminders.filters.escalatedOnlyOn')}</option>
            </Select>
            <Select value={retryDueOnly} onChange={(e) => setRetryDueOnly(e.target.value as '0' | '1')}>
              <option value="0">{t('pages:reminders.filters.retryDueOnlyOff')}</option>
              <option value="1">{t('pages:reminders.filters.retryDueOnlyOn')}</option>
            </Select>
            <Button variant="outline" onClick={() => void exportCsv()}>
              {t('pages:reminders.actions.export')}
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-border/70 bg-background/55 p-3">
          <Button size="sm" variant="outline" onClick={() => void handleBulk('mark-sent')} disabled={bulkMutation.isPending || !canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>
            {t('pages:reminders.actions.bulkMarkSent')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => void handleBulk('requeue')} disabled={bulkMutation.isPending || !canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>
            {t('pages:reminders.actions.bulkRequeue')}
          </Button>
          <Button size="sm" variant="danger" onClick={() => void handleBulk('cancel')} disabled={bulkMutation.isPending || !canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>
            {t('pages:reminders.actions.bulkCancel')}
          </Button>
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
                    <TH>
                      <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                    </TH>
                    <TH>{t('pages:reminders.table.student')}</TH>
                    <TH>{t('pages:reminders.table.appointment')}</TH>
                    <TH>{t('pages:reminders.table.scheduledFor')}</TH>
                    <TH>{t('pages:reminders.table.status')}</TH>
                    <TH>{t('pages:reminders.table.retry')}</TH>
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
                        <TD>
                          <input type="checkbox" checked={selectedIds.includes(reminder.id)} onChange={() => toggleSelect(reminder.id)} />
                        </TD>
                        <TD>{studentName}</TD>
                        <TD>{reminder.appointment ? formatDate(reminder.appointment.starts_at) : '-'}</TD>
                        <TD>{formatDate(reminder.scheduled_for)}</TD>
                        <TD>
                          <Badge variant={reminder.status === 'sent' ? 'success' : 'muted'}>
                            {t(`pages:reminders.filters.${reminder.status}`)}
                          </Badge>
                        </TD>
                        <TD>
                          <div className="text-xs text-muted">
                            <p>{t('pages:reminders.table.attempts', { count: reminder.attempt_count })}</p>
                            <p>
                              {t('pages:reminders.table.nextRetry')}: {formatDate(reminder.next_retry_at)}
                            </p>
                          </div>
                        </TD>
                        <TD>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => void openMutation.mutateAsync(reminder.id)} disabled={!canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>
                              {t('pages:reminders.actions.open')}
                            </Button>
                            <Button size="sm" onClick={() => void markSentMutation.mutateAsync(reminder.id)} disabled={!canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>
                              {t('pages:reminders.actions.markSent')}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => void requeueMutation.mutateAsync(reminder.id)} disabled={!canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>
                              {t('pages:reminders.actions.requeue')}
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => void cancelMutation.mutateAsync(reminder.id)} disabled={!canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>
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
