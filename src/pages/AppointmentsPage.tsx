import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { TBody, TD, TH, THead, Table } from '../components/ui/table'
import {
  createAppointment,
  createAppointmentSeries,
  getAppointmentWhatsappLink,
  listAppointments,
  updateAppointment,
  updateAppointmentStatus,
  updateAppointmentWhatsappStatus,
} from '../features/appointments/api'
import type { Appointment, AppointmentStatus, AppointmentWhatsappStatus } from '../features/appointments/types'
import { listStudents } from '../features/students/api'
import { extractApiMessage, extractValidationErrors, isForbidden, isValidationError } from '../lib/api-errors'

function toLocalInput(value: string): string {
  return dayjs(value).format('YYYY-MM-DDTHH:mm')
}

function formatDate(value: string): string {
  return dayjs(value).format('DD.MM.YYYY HH:mm')
}

export function AppointmentsPage() {
  const { t } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [status, setStatus] = useState<AppointmentStatus | 'all'>('all')
  const [whatsappStatus, setWhatsappStatus] = useState<AppointmentWhatsappStatus | 'all'>('all')
  const [studentId, setStudentId] = useState<number | null>(null)
  const [from, setFrom] = useState(dayjs().startOf('day').format('YYYY-MM-DDTHH:mm'))
  const [to, setTo] = useState(dayjs().add(7, 'day').endOf('day').format('YYYY-MM-DDTHH:mm'))
  const [page, setPage] = useState(1)

  const [isEditing, setIsEditing] = useState(false)
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [seriesFormOpen, setSeriesFormOpen] = useState(false)

  const [formStudentId, setFormStudentId] = useState('')
  const [formStartsAt, setFormStartsAt] = useState(dayjs().add(1, 'hour').minute(0).format('YYYY-MM-DDTHH:mm'))
  const [formEndsAt, setFormEndsAt] = useState(dayjs().add(2, 'hour').minute(0).format('YYYY-MM-DDTHH:mm'))
  const [formLocation, setFormLocation] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const [seriesStudentId, setSeriesStudentId] = useState('')
  const [seriesStartDate, setSeriesStartDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'))
  const [seriesStartsAtTime, setSeriesStartsAtTime] = useState('09:00:00')
  const [seriesEndsAtTime, setSeriesEndsAtTime] = useState('10:00:00')
  const [seriesFrequency, setSeriesFrequency] = useState<'weekly' | 'monthly'>('weekly')
  const [seriesInterval, setSeriesInterval] = useState('1')
  const [seriesCount, setSeriesCount] = useState('8')
  const [seriesUntil, setSeriesUntil] = useState('')
  const [seriesWeekdays, setSeriesWeekdays] = useState<number[]>([1, 3, 5])

  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      status,
      whatsapp_status: whatsappStatus,
      student_id: studentId ?? undefined,
      date_from: dayjs(from).format('YYYY-MM-DD HH:mm:ss'),
      date_to: dayjs(to).format('YYYY-MM-DD HH:mm:ss'),
      page,
      per_page: 15,
    }),
    [status, whatsappStatus, studentId, from, to, page],
  )

  const appointmentsQuery = useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => listAppointments(filters),
  })

  const studentsQuery = useQuery({
    queryKey: ['students', 'appointment-select'],
    queryFn: () => listStudents({ status: 'all', page: 1, per_page: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: async () => {
      setNotice(t('pages:appointments.noticeCreated'))
      setErrorNotice(null)
      setFormOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }

      if (isValidationError(error)) {
        const validation = extractValidationErrors(error)
        const code = validation.code?.[0]
        if (code === 'time_slot_conflict') {
          setErrorNotice(t('pages:appointments.errors.timeSlotConflict'))
          return
        }
        if (code === 'idempotency_payload_mismatch') {
          setErrorNotice(t('pages:appointments.errors.idempotencyMismatch'))
          return
        }
      }

      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ appointmentId, payload }: { appointmentId: number; payload: Parameters<typeof updateAppointment>[1] }) =>
      updateAppointment(appointmentId, payload),
    onSuccess: async () => {
      setNotice(t('pages:appointments.noticeUpdated'))
      setErrorNotice(null)
      setFormOpen(false)
      setActiveAppointment(null)
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }

      if (isValidationError(error)) {
        const validation = extractValidationErrors(error)
        const code = validation.code?.[0]
        if (code === 'time_slot_conflict') {
          setErrorNotice(t('pages:appointments.errors.timeSlotConflict'))
          return
        }
      }

      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const createSeriesMutation = useMutation({
    mutationFn: createAppointmentSeries,
    onSuccess: async (data) => {
      setNotice(t('pages:appointments.series.created', { generated: data.generated_count }))
      setErrorNotice(null)
      setSeriesFormOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ appointmentId, nextStatus }: { appointmentId: number; nextStatus: AppointmentStatus }) =>
      updateAppointmentStatus(appointmentId, { status: nextStatus }),
    onSuccess: async () => {
      setNotice(t('pages:appointments.noticeStatus'))
      setErrorNotice(null)
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const whatsappStatusMutation = useMutation({
    mutationFn: ({ appointmentId, nextStatus }: { appointmentId: number; nextStatus: AppointmentWhatsappStatus }) =>
      updateAppointmentWhatsappStatus(appointmentId, { whatsapp_status: nextStatus }),
    onSuccess: async () => {
      setNotice(t('pages:appointments.noticeWhatsappStatus'))
      setErrorNotice(null)
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

  const whatsappLinkMutation = useMutation({
    mutationFn: getAppointmentWhatsappLink,
    onSuccess: (url) => {
      setNotice(t('pages:appointments.noticeWhatsappOpened'))
      setErrorNotice(null)
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const pagination = appointmentsQuery.data
  const appointments = pagination?.data ?? []
  const students = studentsQuery.data?.data ?? []

  function openCreateForm() {
    setIsEditing(false)
    setActiveAppointment(null)
    setFormStudentId(students[0] ? String(students[0].id) : '')
    setFormStartsAt(dayjs().add(1, 'hour').minute(0).format('YYYY-MM-DDTHH:mm'))
    setFormEndsAt(dayjs().add(2, 'hour').minute(0).format('YYYY-MM-DDTHH:mm'))
    setFormLocation('')
    setFormNotes('')
    setFormOpen(true)
  }

  function openCreateSeriesForm() {
    setSeriesStudentId(students[0] ? String(students[0].id) : '')
    setSeriesStartDate(dayjs().add(1, 'day').format('YYYY-MM-DD'))
    setSeriesStartsAtTime('09:00:00')
    setSeriesEndsAtTime('10:00:00')
    setSeriesFrequency('weekly')
    setSeriesInterval('1')
    setSeriesCount('8')
    setSeriesUntil('')
    setSeriesWeekdays([1, 3, 5])
    setSeriesFormOpen(true)
  }

  function openEditForm(appointment: Appointment) {
    setIsEditing(true)
    setActiveAppointment(appointment)
    setFormStudentId(String(appointment.student_id))
    setFormStartsAt(toLocalInput(appointment.starts_at))
    setFormEndsAt(toLocalInput(appointment.ends_at))
    setFormLocation(appointment.location ?? '')
    setFormNotes(appointment.notes ?? '')
    setFormOpen(true)
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formStudentId) {
      setErrorNotice(t('pages:appointments.needStudent'))
      return
    }

    const payload = {
      student_id: Number(formStudentId),
      starts_at: dayjs(formStartsAt).format('YYYY-MM-DD HH:mm:ss'),
      ends_at: dayjs(formEndsAt).format('YYYY-MM-DD HH:mm:ss'),
      location: formLocation.trim() || null,
      notes: formNotes.trim() || null,
    }

    if (isEditing && activeAppointment) {
      await updateMutation.mutateAsync({ appointmentId: activeAppointment.id, payload })
      return
    }

    await createMutation.mutateAsync(payload)
  }

  async function submitSeriesForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!seriesStudentId) {
      setErrorNotice(t('pages:appointments.needStudent'))
      return
    }

    await createSeriesMutation.mutateAsync({
      student_id: Number(seriesStudentId),
      start_date: seriesStartDate,
      starts_at_time: seriesStartsAtTime,
      ends_at_time: seriesEndsAtTime,
      location: formLocation.trim() || null,
      title: formNotes.trim() || null,
      recurrence_rule: {
        freq: seriesFrequency,
        interval: Number(seriesInterval || '1'),
        count: Number(seriesCount || '1'),
        until: seriesUntil || undefined,
        byweekday: seriesFrequency === 'weekly' ? seriesWeekdays : undefined,
      },
    })
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:appointments.sectionLabel')}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:appointments.title')}</h2>
            <p className="mt-1 text-sm text-muted">{t('pages:appointments.description')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openCreateSeriesForm}>
              {t('pages:appointments.series.new')}
            </Button>
            <Button onClick={openCreateForm}>{t('pages:appointments.new')}</Button>
          </div>
        </div>

        <div className="filter-surface mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus | 'all')}>
            <option value="all">{t('pages:appointments.allStatus')}</option>
            <option value="planned">{t('common:planned')}</option>
            <option value="done">{t('common:done')}</option>
            <option value="cancelled">{t('common:cancelled')}</option>
            <option value="no_show">{t('common:no_show')}</option>
          </Select>
          <Select value={whatsappStatus} onChange={(e) => setWhatsappStatus(e.target.value as AppointmentWhatsappStatus | 'all')}>
            <option value="all">{t('pages:appointments.whatsapp.filterAll')}</option>
            <option value="sent">{t('pages:appointments.whatsapp.sent')}</option>
            <option value="not_sent">{t('pages:appointments.whatsapp.notSent')}</option>
          </Select>
          <Select
            value={studentId ? String(studentId) : ''}
            onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('pages:appointments.allStudents')}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </Select>
        </div>

        {notice ? <p className="mb-3 rounded-xl bg-success/15 px-3 py-2 text-sm text-success">{notice}</p> : null}
        {errorNotice ? <p className="mb-3 rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{errorNotice}</p> : null}

        {appointmentsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : appointmentsQuery.isError ? (
          <p className="text-sm text-danger">{extractApiMessage(appointmentsQuery.error, t('common:requestFailed'))}</p>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 md:hidden">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-xl border border-border/70 bg-card/75 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {students.find((student) => student.id === appointment.student_id)?.full_name ?? `${t('pages:appointments.table.student')} #${appointment.student_id}`}
                      </p>
                      <p className="text-xs text-muted">{formatDate(appointment.starts_at)}</p>
                      <p className="text-xs text-muted">{formatDate(appointment.ends_at)}</p>
                      {appointment.series_id ? <p className="text-xs text-primary">Series #{appointment.series_id}</p> : null}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={appointment.status === 'done' ? 'success' : 'muted'}>{t(`common:${appointment.status}`)}</Badge>
                      <Badge variant={appointment.whatsapp_status === 'sent' ? 'success' : 'muted'}>
                        {appointment.whatsapp_status === 'sent' ? t('pages:appointments.whatsapp.sent') : t('pages:appointments.whatsapp.notSent')}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <Button size="sm" onClick={() => void whatsappLinkMutation.mutateAsync(appointment.id)}>
                      {t('pages:appointments.whatsapp.open')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        void whatsappStatusMutation.mutateAsync({
                          appointmentId: appointment.id,
                          nextStatus: appointment.whatsapp_status === 'sent' ? 'not_sent' : 'sent',
                        })
                      }
                    >
                      {appointment.whatsapp_status === 'sent' ? t('pages:appointments.whatsapp.markNotSent') : t('pages:appointments.whatsapp.markSent')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditForm(appointment)}>
                      {t('common:edit')}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => void statusMutation.mutateAsync({ appointmentId: appointment.id, nextStatus: 'done' })}>
                      {t('common:done')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void statusMutation.mutateAsync({ appointmentId: appointment.id, nextStatus: 'no_show' })}>
                      {t('pages:appointments.table.noShow')}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => void statusMutation.mutateAsync({ appointmentId: appointment.id, nextStatus: 'cancelled' })}>
                      {t('pages:appointments.table.cancel')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="table-surface hidden md:block">
              <Table>
                <THead>
                  <tr>
                    <TH>{t('pages:appointments.table.id')}</TH>
                    <TH>{t('pages:appointments.table.student')}</TH>
                    <TH>{t('pages:appointments.table.start')}</TH>
                    <TH>{t('pages:appointments.table.end')}</TH>
                    <TH>{t('pages:appointments.table.series')}</TH>
                    <TH>{t('pages:appointments.table.status')}</TH>
                    <TH>{t('pages:appointments.whatsapp.column')}</TH>
                    <TH>{t('pages:appointments.table.actions')}</TH>
                  </tr>
                </THead>
                <TBody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <TD>#{appointment.id}</TD>
                      <TD>{students.find((student) => student.id === appointment.student_id)?.full_name ?? appointment.student_id}</TD>
                      <TD>{formatDate(appointment.starts_at)}</TD>
                      <TD>{formatDate(appointment.ends_at)}</TD>
                      <TD>{appointment.series_id ? `#${appointment.series_id}` : '-'}</TD>
                      <TD>
                        <Badge variant={appointment.status === 'done' ? 'success' : 'muted'}>{t(`common:${appointment.status}`)}</Badge>
                      </TD>
                      <TD>
                        <Badge variant={appointment.whatsapp_status === 'sent' ? 'success' : 'muted'}>
                          {appointment.whatsapp_status === 'sent' ? t('pages:appointments.whatsapp.sent') : t('pages:appointments.whatsapp.notSent')}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => void whatsappLinkMutation.mutateAsync(appointment.id)}>
                            {t('pages:appointments.whatsapp.open')}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              void whatsappStatusMutation.mutateAsync({
                                appointmentId: appointment.id,
                                nextStatus: appointment.whatsapp_status === 'sent' ? 'not_sent' : 'sent',
                              })
                            }
                          >
                            {appointment.whatsapp_status === 'sent' ? t('pages:appointments.whatsapp.markNotSent') : t('pages:appointments.whatsapp.markSent')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditForm(appointment)}>
                            {t('common:edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => void statusMutation.mutateAsync({ appointmentId: appointment.id, nextStatus: 'done' })}
                          >
                            {t('common:done')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void statusMutation.mutateAsync({ appointmentId: appointment.id, nextStatus: 'no_show' })}
                          >
                            {t('pages:appointments.table.noShow')}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => void statusMutation.mutateAsync({ appointmentId: appointment.id, nextStatus: 'cancelled' })}
                          >
                            {t('pages:appointments.table.cancel')}
                          </Button>
                        </div>
                      </TD>
                    </tr>
                  ))}
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
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(pagination?.current_page ?? 1) <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
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
          </div>
        )}
      </div>

      {formOpen ? (
        <div className="panel">
          <h3 className="mb-3 text-lg font-semibold tracking-tight">{isEditing ? t('pages:appointments.form.editTitle') : t('pages:appointments.form.newTitle')}</h3>
          <form className="space-y-3" onSubmit={submitForm}>
            <Select value={formStudentId} onChange={(e) => setFormStudentId(e.target.value)} required>
              <option value="">{t('common:selectStudent')}</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </Select>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="datetime-local" value={formStartsAt} onChange={(e) => setFormStartsAt(e.target.value)} required />
              <Input type="datetime-local" value={formEndsAt} onChange={(e) => setFormEndsAt(e.target.value)} required />
            </div>
            <Input placeholder={t('pages:appointments.form.location')} value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
            <Input placeholder={t('pages:appointments.form.notes')} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? t('common:saving') : t('common:save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormOpen(false)
                  setActiveAppointment(null)
                }}
              >
                {t('common:close')}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {seriesFormOpen ? (
        <div className="panel">
          <h3 className="mb-1 text-lg font-semibold tracking-tight">{t('pages:appointments.series.title')}</h3>
          <p className="mb-3 text-sm text-muted">{t('pages:appointments.series.description')}</p>
          <form className="space-y-3" onSubmit={submitSeriesForm}>
            <Select value={seriesStudentId} onChange={(e) => setSeriesStudentId(e.target.value)} required>
              <option value="">{t('common:selectStudent')}</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </Select>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-xs text-muted">{t('pages:appointments.series.startDate')}</p>
                <Input type="date" value={seriesStartDate} onChange={(e) => setSeriesStartDate(e.target.value)} required />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted">{t('pages:appointments.series.startTime')}</p>
                <Input type="time" step={1} value={seriesStartsAtTime} onChange={(e) => setSeriesStartsAtTime(e.target.value)} required />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted">{t('pages:appointments.series.endTime')}</p>
                <Input type="time" step={1} value={seriesEndsAtTime} onChange={(e) => setSeriesEndsAtTime(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <p className="mb-1 text-xs text-muted">{t('pages:appointments.series.frequency')}</p>
                <Select value={seriesFrequency} onChange={(e) => setSeriesFrequency(e.target.value as 'weekly' | 'monthly')}>
                  <option value="weekly">{t('pages:appointments.series.weekly')}</option>
                  <option value="monthly">{t('pages:appointments.series.monthly')}</option>
                </Select>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted">{t('pages:appointments.series.interval')}</p>
                <Input type="number" min={1} max={12} value={seriesInterval} onChange={(e) => setSeriesInterval(e.target.value)} />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted">{t('pages:appointments.series.count')}</p>
                <Input type="number" min={1} max={365} value={seriesCount} onChange={(e) => setSeriesCount(e.target.value)} />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted">{t('pages:appointments.series.until')}</p>
                <Input type="date" value={seriesUntil} onChange={(e) => setSeriesUntil(e.target.value)} />
              </div>
            </div>
            {seriesFrequency === 'weekly' ? (
              <div>
                <p className="mb-2 text-xs text-muted">{t('pages:appointments.series.weekdays')}</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={seriesWeekdays.includes(day) ? 'secondary' : 'outline'}
                      onClick={() =>
                        setSeriesWeekdays((prev) => (prev.includes(day) ? prev.filter((v) => v !== day) : [...prev, day]))
                      }
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={createSeriesMutation.isPending}>
                {createSeriesMutation.isPending ? t('common:saving') : t('common:save')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setSeriesFormOpen(false)}>
                {t('common:close')}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
