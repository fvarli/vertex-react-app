import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { createStudent, getStudentTimeline, listStudents, updateStudent, updateStudentStatus } from '../features/students/api'
import { StudentFormDialog } from '../features/students/components/StudentFormDialog'
import { StatusDialog } from '../features/students/components/StatusDialog'
import { StudentsTable } from '../features/students/components/StudentsTable'
import type { Student, StudentStatus } from '../features/students/types'
import { extractApiMessage, isForbidden } from '../lib/api-errors'
import { useWorkspaceAccess } from '../features/workspace/access'

export function StudentsPage() {
  const { t } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canMutate, approvalMessage } = useWorkspaceAccess()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | StudentStatus>('active')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [activeStudent, setActiveStudent] = useState<Student | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const [statusOpen, setStatusOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<Student | null>(null)
  const [timelineTarget, setTimelineTarget] = useState<Student | null>(null)

  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [searchInput])

  const queryKey = useMemo(() => ['students', { search, status, page, perPage }], [search, status, page, perPage])

  const studentsQuery = useQuery({
    queryKey,
    queryFn: () =>
      listStudents({
        search: search || undefined,
        status,
        page,
        per_page: perPage,
      }),
  })

  useEffect(() => {
    if (studentsQuery.error && isForbidden(studentsQuery.error)) {
      navigate('/workspaces', { replace: true })
    }
  }, [studentsQuery.error, navigate])

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      setNotice(t('pages:students.noticeCreated'))
      setErrorNotice(null)
      setFormOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ studentId, payload }: { studentId: number; payload: Parameters<typeof updateStudent>[1] }) => updateStudent(studentId, payload),
    onSuccess: async () => {
      setNotice(t('pages:students.noticeUpdated'))
      setErrorNotice(null)
      setFormOpen(false)
      setActiveStudent(null)
      await queryClient.invalidateQueries({ queryKey: ['students'] })
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
    mutationFn: ({ studentId, nextStatus }: { studentId: number; nextStatus: StudentStatus }) =>
      updateStudentStatus(studentId, { status: nextStatus }),
    onSuccess: async () => {
      setNotice(t('pages:students.noticeStatus'))
      setErrorNotice(null)
      setStatusOpen(false)
      setStatusTarget(null)
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const pagination = studentsQuery.data
  const students = pagination?.data ?? []
  const timelineQuery = useQuery({
    queryKey: ['students', 'timeline', timelineTarget?.id],
    queryFn: () => getStudentTimeline(timelineTarget!.id, 25),
    enabled: Boolean(timelineTarget?.id),
  })

  const createOrUpdateSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="page-surface space-y-5 fade-in p-1">
      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:students.sectionLabel')}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:students.title')}</h2>
            <p className="mt-1 text-sm text-muted">{t('pages:students.description')}</p>
          </div>
          <Button
            disabled={!canMutate}
            title={!canMutate ? approvalMessage ?? undefined : undefined}
            onClick={() => {
              setFormMode('create')
              setActiveStudent(null)
              setFormOpen(true)
            }}
          >
            {t('pages:students.new')}
          </Button>
        </div>

        <div className="filter-surface mb-4 grid gap-3 sm:grid-cols-3">
          <Input placeholder={t('pages:students.searchPlaceholder')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'all' | StudentStatus)
              setPage(1)
            }}
          >
            <option value="active">{t('common:active')}</option>
            <option value="passive">{t('common:passive')}</option>
            <option value="all">{t('common:all')}</option>
          </Select>
          <Select
            value={String(perPage)}
            onChange={(e) => {
              setPerPage(Number(e.target.value))
              setPage(1)
            }}
          >
            <option value="10">{t('pages:pagination.perPage', { count: 10 })}</option>
            <option value="15">{t('pages:pagination.perPage', { count: 15 })}</option>
            <option value="25">{t('pages:pagination.perPage', { count: 25 })}</option>
          </Select>
        </div>

        {notice ? <p className="mb-3 rounded-xl bg-success/15 px-3 py-2 text-sm text-success">{notice}</p> : null}
        {errorNotice ? <p className="mb-3 rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{errorNotice}</p> : null}

        {studentsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : studentsQuery.isError ? (
          <p className="text-sm text-danger">{extractApiMessage(studentsQuery.error, t('common:requestFailed'))}</p>
        ) : (
          <>
            <div className="table-surface">
              <StudentsTable
                students={students}
                onEdit={(student) => {
                  if (!canMutate) return
                  setFormMode('edit')
                  setActiveStudent(student)
                  setFormOpen(true)
                }}
                onStatus={(student) => {
                  if (!canMutate) return
                  setStatusTarget(student)
                  setStatusOpen(true)
                }}
                onTimeline={(student) => {
                  setTimelineTarget(student)
                }}
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {t('pages:students.pagination', {
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

      <StudentFormDialog
        open={formOpen}
        mode={formMode}
        student={activeStudent}
        submitting={createOrUpdateSubmitting}
        onClose={() => setFormOpen(false)}
        onSubmit={async (values) => {
          if (!canMutate) return
          const payload = {
            full_name: values.full_name,
            phone: values.phone,
            notes: values.notes || null,
          }

          if (formMode === 'create') {
            await createMutation.mutateAsync(payload)
            return
          }

          if (!activeStudent) return
          await updateMutation.mutateAsync({ studentId: activeStudent.id, payload })
        }}
      />

      <StatusDialog
        open={statusOpen}
        status={statusTarget?.status === 'active' ? 'passive' : 'active'}
        submitting={statusMutation.isPending}
        onClose={() => setStatusOpen(false)}
        onConfirm={async () => {
          if (!canMutate) return
          if (!statusTarget) return
          const nextStatus: StudentStatus = statusTarget.status === 'active' ? 'passive' : 'active'
          await statusMutation.mutateAsync({ studentId: statusTarget.id, nextStatus })
        }}
      />

      {timelineTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-4 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t('pages:students.timeline.title', { name: timelineTarget.full_name })}</h3>
                <p className="text-sm text-muted">{t('pages:students.timeline.description')}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setTimelineTarget(null)}>
                {t('common:close')}
              </Button>
            </div>
            {timelineQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : timelineQuery.isError ? (
              <p className="text-sm text-danger">{extractApiMessage(timelineQuery.error, t('common:requestFailed'))}</p>
            ) : (timelineQuery.data?.items.length ?? 0) === 0 ? (
              <p className="text-sm text-muted">{t('pages:students.timeline.empty')}</p>
            ) : (
              <ul className="space-y-2">
                {timelineQuery.data?.items.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="rounded-xl border border-border/70 bg-background/70 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <Badge variant={item.status === 'done' || item.status === 'active' ? 'success' : 'muted'}>{item.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {item.type} • {dayjs(item.event_at).format('DD.MM.YYYY HH:mm')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
