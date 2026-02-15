import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { TBody, TD, TH, THead, Table } from '../components/ui/table'
import {
  createAppointment,
  listAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from '../features/appointments/api'
import type { Appointment, AppointmentStatus } from '../features/appointments/types'
import { listStudents } from '../features/students/api'

function isWorkspaceForbidden(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false
  return error.response?.status === 403
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
  }

  return fallback
}

function toLocalInput(value: string): string {
  return dayjs(value).format('YYYY-MM-DDTHH:mm')
}

function formatDate(value: string): string {
  return dayjs(value).format('DD MMM YYYY HH:mm')
}

export function AppointmentsPage() {
  const { t } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [status, setStatus] = useState<AppointmentStatus | 'all'>('all')
  const [studentId, setStudentId] = useState<number | null>(null)
  const [from, setFrom] = useState(dayjs().startOf('day').format('YYYY-MM-DDTHH:mm'))
  const [to, setTo] = useState(dayjs().add(7, 'day').endOf('day').format('YYYY-MM-DDTHH:mm'))
  const [page, setPage] = useState(1)

  const [isEditing, setIsEditing] = useState(false)
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const [formStudentId, setFormStudentId] = useState('')
  const [formStartsAt, setFormStartsAt] = useState(dayjs().add(1, 'hour').minute(0).format('YYYY-MM-DDTHH:mm'))
  const [formEndsAt, setFormEndsAt] = useState(dayjs().add(2, 'hour').minute(0).format('YYYY-MM-DDTHH:mm'))
  const [formLocation, setFormLocation] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      status,
      student_id: studentId ?? undefined,
      date_from: dayjs(from).format('YYYY-MM-DD HH:mm:ss'),
      date_to: dayjs(to).format('YYYY-MM-DD HH:mm:ss'),
      page,
      per_page: 15,
    }),
    [status, studentId, from, to, page],
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
      if (isWorkspaceForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(errorMessage(error, t('common:requestFailed')))
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
      if (isWorkspaceForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(errorMessage(error, t('common:requestFailed')))
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
      if (isWorkspaceForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(errorMessage(error, t('common:requestFailed')))
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

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{t('pages:appointments.title')}</h2>
            <p className="text-sm text-muted">{t('pages:appointments.description')}</p>
          </div>
          <Button onClick={openCreateForm}>{t('pages:appointments.new')}</Button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus | 'all')}>
            <option value="all">{t('pages:appointments.allStatus')}</option>
            <option value="planned">{t('common:planned')}</option>
            <option value="done">{t('common:done')}</option>
            <option value="cancelled">{t('common:cancelled')}</option>
            <option value="no_show">{t('common:no_show')}</option>
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

        {notice ? <p className="mb-3 rounded-md bg-success/15 px-3 py-2 text-sm text-success">{notice}</p> : null}
        {errorNotice ? <p className="mb-3 rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">{errorNotice}</p> : null}

        {appointmentsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : appointmentsQuery.isError ? (
          <p className="text-sm text-danger">{errorMessage(appointmentsQuery.error, t('common:requestFailed'))}</p>
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>{t('pages:appointments.table.id')}</TH>
                  <TH>{t('pages:appointments.table.student')}</TH>
                  <TH>{t('pages:appointments.table.start')}</TH>
                  <TH>{t('pages:appointments.table.end')}</TH>
                  <TH>{t('pages:appointments.table.status')}</TH>
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
                    <TD>{t(`common:${appointment.status}`)}</TD>
                    <TD>
                      <div className="flex flex-wrap gap-2">
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

            <div className="mt-4 flex items-center justify-between">
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
          </>
        )}
      </div>

      {formOpen ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">{isEditing ? t('pages:appointments.form.editTitle') : t('pages:appointments.form.newTitle')}</h3>
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
            <div className="flex gap-2">
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
    </div>
  )
}
