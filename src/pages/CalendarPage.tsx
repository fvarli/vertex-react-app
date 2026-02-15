import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { fetchCalendar } from '../features/appointments/api'
import { listStudents } from '../features/students/api'
import { extractApiMessage, isForbidden } from '../lib/api-errors'

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
    if (calendarQuery.error && isForbidden(calendarQuery.error)) {
      navigate('/workspaces', { replace: true })
    }
  }, [calendarQuery.error, navigate])

  const students = studentsQuery.data?.data ?? []
  const days = calendarQuery.data?.days ?? []

  return (
    <div className="space-y-5 fade-in">
      <div className="panel">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Schedule</p>
        <h2 className="mb-2 text-2xl font-extrabold tracking-tight">{t('pages:calendar.title')}</h2>
        <p className="mb-4 text-sm text-muted">{t('pages:calendar.description')}</p>

        <div className="mb-4 grid gap-3 rounded-2xl border border-border/70 bg-background/55 p-3 sm:grid-cols-3">
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
          <p className="text-sm text-danger">{extractApiMessage(calendarQuery.error, t('common:requestFailed'))}</p>
        ) : (
          <div className="space-y-3">
            {days.length === 0 ? (
              <p className="text-sm text-muted">{t('pages:calendar.empty')}</p>
            ) : (
              days.map((day) => (
                <div key={day.date} className="rounded-2xl border border-border/70 bg-card/60 p-4">
                  <h3 className="mb-2 text-sm font-semibold">{dayjs(day.date).format('dddd, DD MMM YYYY')}</h3>
                  <div className="space-y-2">
                    {day.items.map((item) => (
                      <div key={item.id} className="timeline-card">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm">
                            <strong>{formatDateTime(item.starts_at)}</strong> - {formatDateTime(item.ends_at)}
                          </p>
                          <Badge variant={item.status === 'done' ? 'success' : 'muted'}>{t(`common:${item.status}`)}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted">
                          {t('pages:calendar.student')} #{item.student_id}
                        </p>
                        {item.location ? <p className="text-xs text-muted">{item.location}</p> : null}
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
