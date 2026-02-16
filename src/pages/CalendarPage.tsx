import { useQuery } from '@tanstack/react-query'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import trLocale from '@fullcalendar/core/locales/tr'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Appointment } from '../features/appointments/types'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { fetchCalendar } from '../features/appointments/api'
import { listStudents } from '../features/students/api'
import { extractApiMessage, isForbidden } from '../lib/api-errors'

function formatDateTime(value: string): string {
  return dayjs(value).format('DD.MM.YYYY HH:mm')
}

type CalendarViewMode = 'month' | 'week' | 'day' | 'list'

function startOfWeekMonday(value: dayjs.Dayjs): dayjs.Dayjs {
  const day = value.day()
  const diff = (day + 6) % 7
  return value.subtract(diff, 'day').startOf('day')
}

function rangeForView(viewMode: CalendarViewMode, focusDate: dayjs.Dayjs): { from: dayjs.Dayjs; to: dayjs.Dayjs } {
  if (viewMode === 'month') {
    return { from: focusDate.startOf('month').startOf('day'), to: focusDate.endOf('month').endOf('day') }
  }
  if (viewMode === 'week') {
    const start = startOfWeekMonday(focusDate)
    return { from: start, to: start.add(6, 'day').endOf('day') }
  }
  if (viewMode === 'day') {
    return { from: focusDate.startOf('day'), to: focusDate.endOf('day') }
  }

  return { from: focusDate.startOf('day'), to: focusDate.add(6, 'day').endOf('day') }
}

function shiftFocus(viewMode: CalendarViewMode, focusDate: dayjs.Dayjs, direction: -1 | 1): dayjs.Dayjs {
  if (viewMode === 'month') return focusDate.add(direction, 'month')
  if (viewMode === 'week' || viewMode === 'list') return focusDate.add(direction * 7, 'day')
  return focusDate.add(direction, 'day')
}

export function CalendarPage() {
  const { t, i18n } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [focusDate, setFocusDate] = useState(dayjs())
  const [trainerId, setTrainerId] = useState<number | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [useCustomRange, setUseCustomRange] = useState(false)

  const baseRange = useMemo(() => rangeForView(viewMode, focusDate), [viewMode, focusDate])
  const fromValue = useCustomRange && customFrom ? customFrom : baseRange.from.format('YYYY-MM-DDTHH:mm')
  const toValue = useCustomRange && customTo ? customTo : baseRange.to.format('YYYY-MM-DDTHH:mm')

  const range = useMemo(
    () => ({
      from: dayjs(fromValue).format('YYYY-MM-DD HH:mm:ss'),
      to: dayjs(toValue).format('YYYY-MM-DD HH:mm:ss'),
      trainer_id: trainerId ?? undefined,
    }),
    [fromValue, toValue, trainerId],
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
      navigate('/forbidden', { replace: true })
    }
  }, [calendarQuery.error, navigate])

  const students = useMemo(() => studentsQuery.data?.data ?? [], [studentsQuery.data])
  const days = useMemo(() => calendarQuery.data?.days ?? [], [calendarQuery.data])
  const appointments = useMemo(() => calendarQuery.data?.appointments ?? [], [calendarQuery.data])
  const studentNameById = useMemo(() => new Map(students.map((student) => [student.id, student.full_name])), [students])

  const events = useMemo(
    () =>
      appointments.map((item) => ({
        id: String(item.id),
        title: studentNameById.get(item.student_id) ?? `${t('pages:calendar.student')} #${item.student_id}`,
        start: item.starts_at.replace(' ', 'T'),
        end: item.ends_at.replace(' ', 'T'),
        classNames: [`vertex-event-${item.status}`],
      })),
    [appointments, studentNameById, t],
  )

  const titleLabel = useMemo(() => {
    if (viewMode === 'month') return focusDate.format('MMMM YYYY')
    if (viewMode === 'week') {
      const start = startOfWeekMonday(focusDate)
      return `${start.format('DD.MM.YYYY')} - ${start.add(6, 'day').format('DD.MM.YYYY')}`
    }
    if (viewMode === 'day') return focusDate.format('DD.MM.YYYY')
    return `${focusDate.format('DD.MM.YYYY')} - ${focusDate.add(6, 'day').format('DD.MM.YYYY')}`
  }, [focusDate, viewMode])

  function setQuickRange(mode: 'today' | 'thisWeek' | 'thisMonth') {
    const today = dayjs()
    setUseCustomRange(false)

    if (mode === 'today') {
      setViewMode('day')
      setFocusDate(today)
      return
    }

    if (mode === 'thisWeek') {
      setViewMode('week')
      setFocusDate(today)
      return
    }

    setViewMode('month')
    setFocusDate(today)
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="panel">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:calendar.sectionLabel')}</p>
        <h2 className="mb-2 text-2xl font-extrabold tracking-tight">{t('pages:calendar.title')}</h2>
        <p className="mb-4 text-sm text-muted">{t('pages:calendar.description')}</p>

        <div className="mb-4 filter-surface grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Button variant="outline" onClick={() => setQuickRange('today')}>
            {t('pages:calendar.quick.today')}
          </Button>
          <Button variant="outline" onClick={() => setQuickRange('thisWeek')}>
            {t('pages:calendar.quick.thisWeek')}
          </Button>
          <Button variant="outline" onClick={() => setQuickRange('thisMonth')}>
            {t('pages:calendar.quick.thisMonth')}
          </Button>
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
          <Input
            type="datetime-local"
            value={fromValue}
            onChange={(e) => {
              setCustomFrom(e.target.value)
              setUseCustomRange(true)
            }}
          />
          <Input
            type="datetime-local"
            value={toValue}
            onChange={(e) => {
              setCustomTo(e.target.value)
              setUseCustomRange(true)
            }}
          />
          <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
            {t('pages:calendar.clearSelection')}
          </Button>
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
            <div className="calendar-tabbar">
              {(['month', 'week', 'day', 'list'] as CalendarViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`calendar-tab ${viewMode === mode ? 'is-active' : ''}`}
                  onClick={() => {
                    setUseCustomRange(false)
                    setViewMode(mode)
                  }}
                >
                  {t(`pages:calendar.tabs.${mode}`)}
                </button>
              ))}
            </div>

            <div className="calendar-nav">
              <div className="inline-flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUseCustomRange(false)
                    setFocusDate((prev) => shiftFocus(viewMode, prev, -1))
                  }}
                >
                  {t('common:previous')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuickRange('today')}>
                  {t('pages:calendar.quick.today')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUseCustomRange(false)
                    setFocusDate((prev) => shiftFocus(viewMode, prev, 1))
                  }}
                >
                  {t('common:next')}
                </Button>
              </div>
              <p className="text-sm font-semibold text-foreground">{titleLabel}</p>
            </div>

            {days.length === 0 ? (
              <p className="text-sm text-muted">{t('pages:calendar.empty')}</p>
            ) : viewMode === 'list' ? (
              <div className="space-y-3">
                {days.map((day) => (
                  <div key={day.date} className="rounded-2xl border border-border/70 bg-card/60 p-4">
                    <h3 className="mb-2 text-sm font-semibold">{dayjs(day.date).format('DD.MM.YYYY')}</h3>
                    <div className="space-y-2">
                      {day.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="timeline-card w-full text-left"
                          onClick={() => setSelectedAppointment(item)}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm">
                              <strong>{formatDateTime(item.starts_at)}</strong> - {formatDateTime(item.ends_at)}
                            </p>
                            <Badge variant={item.status === 'done' ? 'success' : 'muted'}>{t(`common:${item.status}`)}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            {studentNameById.get(item.student_id) ?? `${t('pages:calendar.student')} #${item.student_id}`}
                          </p>
                          {item.location ? <p className="text-xs text-muted">{item.location}</p> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="calendar-grid">
                <div className="calendar-surface">
                  <FullCalendar
                    key={`${viewMode}-${focusDate.format('YYYY-MM-DD')}`}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    locales={[trLocale]}
                    locale={i18n.language === 'tr' ? 'tr' : 'en'}
                    initialDate={focusDate.toDate()}
                    initialView={viewMode === 'month' ? 'dayGridMonth' : viewMode === 'week' ? 'timeGridWeek' : 'timeGridDay'}
                    headerToolbar={false}
                    allDaySlot={false}
                    dayMaxEvents={3}
                    events={events}
                    eventClick={(info) => {
                      const id = Number(info.event.id)
                      const selected = appointments.find((item) => item.id === id) ?? null
                      setSelectedAppointment(selected)
                    }}
                    height="auto"
                  />
                </div>
                <aside className="calendar-detail">
                  {selectedAppointment ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted">{t('pages:calendar.detail.title')}</p>
                      <p className="text-sm font-semibold text-foreground">
                        {studentNameById.get(selectedAppointment.student_id) ??
                          `${t('pages:calendar.student')} #${selectedAppointment.student_id}`}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDateTime(selectedAppointment.starts_at)} - {formatDateTime(selectedAppointment.ends_at)}
                      </p>
                      <Badge variant={selectedAppointment.status === 'done' ? 'success' : 'muted'}>
                        {t(`common:${selectedAppointment.status}`)}
                      </Badge>
                      {selectedAppointment.location ? (
                        <p className="text-xs text-muted">
                          {t('pages:calendar.detail.location')}: {selectedAppointment.location}
                        </p>
                      ) : null}
                      {selectedAppointment.notes ? (
                        <p className="text-xs text-muted">
                          {t('pages:calendar.detail.notes')}: {selectedAppointment.notes}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">{t('pages:calendar.detail.empty')}</p>
                  )}
                </aside>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
