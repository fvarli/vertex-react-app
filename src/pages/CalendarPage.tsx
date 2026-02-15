import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { fetchCalendar } from '../features/appointments/api'
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

function formatDateTime(value: string): string {
  return dayjs(value).format('DD MMM HH:mm')
}

export function CalendarPage() {
  const { t } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const [from, setFrom] = useState(dayjs().startOf('day').format('YYYY-MM-DDTHH:mm'))
  const [to, setTo] = useState(dayjs().add(7, 'day').endOf('day').format('YYYY-MM-DDTHH:mm'))
  const [trainerId, setTrainerId] = useState<number | null>(null)

  const range = useMemo(
    () => ({
      from: dayjs(from).format('YYYY-MM-DD HH:mm:ss'),
      to: dayjs(to).format('YYYY-MM-DD HH:mm:ss'),
      trainer_id: trainerId ?? undefined,
    }),
    [from, to, trainerId],
  )

  const calendarQuery = useQuery({
    queryKey: ['calendar', range],
    queryFn: () => fetchCalendar(range),
  })

  const studentsQuery = useQuery({
    queryKey: ['students', 'calendar-select'],
    queryFn: () => listStudents({ status: 'all', page: 1, per_page: 100 }),
  })

  useEffect(() => {
    if (calendarQuery.error && isWorkspaceForbidden(calendarQuery.error)) {
      navigate('/workspaces', { replace: true })
    }
  }, [calendarQuery.error, navigate])

  const students = studentsQuery.data?.data ?? []
  const days = calendarQuery.data?.days ?? []

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-xl font-semibold">{t('pages:calendar.title')}</h2>
        <p className="mb-4 text-sm text-muted">{t('pages:calendar.description')}</p>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select
            value={trainerId ? String(trainerId) : ''}
            onChange={(e) => setTrainerId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('pages:calendar.trainerFilter')}</option>
            {Array.from(new Set(students.map((student) => student.trainer_user_id))).map((id) => (
              <option key={id} value={id}>
                {t('pages:calendar.trainer', { id })}
              </option>
            ))}
          </Select>
        </div>

        {calendarQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : calendarQuery.isError ? (
          <p className="text-sm text-danger">{errorMessage(calendarQuery.error, t('common:requestFailed'))}</p>
        ) : (
          <div className="space-y-3">
            {days.length === 0 ? (
              <p className="text-sm text-muted">{t('pages:calendar.empty')}</p>
            ) : (
              days.map((day) => (
                <div key={day.date} className="rounded-md border border-border p-3">
                  <h3 className="mb-2 text-sm font-semibold">{dayjs(day.date).format('dddd, DD MMM YYYY')}</h3>
                  <div className="space-y-2">
                    {day.items.map((item) => (
                      <div key={item.id} className="rounded-md bg-border/30 px-3 py-2 text-sm">
                        <strong>{formatDateTime(item.starts_at)}</strong> - {formatDateTime(item.ends_at)} • {t('pages:calendar.student')} #{item.student_id} •{' '}
                        {t(`common:${item.status}`)}
                        {item.location ? ` • ${item.location}` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
