import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { TBody, TD, TH, THead, Table } from '../components/ui/table'
import { createProgram, listPrograms, updateProgram, updateProgramStatus } from '../features/programs/api'
import type { Program, ProgramItem, ProgramStatus } from '../features/programs/types'
import { listStudents } from '../features/students/api'
import { extractApiMessage, isForbidden } from '../lib/api-errors'

function blankItem(order: number): ProgramItem {
  return {
    day_of_week: 1,
    order_no: order,
    exercise: '',
    sets: null,
    reps: null,
    rest_seconds: null,
    notes: null,
  }
}

export function ProgramsPage() {
  const { t } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [studentId, setStudentId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | 'all'>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)

  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [weekStartDate, setWeekStartDate] = useState('')
  const [status, setStatus] = useState<ProgramStatus>('draft')
  const [items, setItems] = useState<ProgramItem[]>([blankItem(1)])

  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  const studentsQuery = useQuery({
    queryKey: ['students', 'program-select'],
    queryFn: () => listStudents({ status: 'all', page: 1, per_page: 100 }),
  })

  const students = studentsQuery.data?.data ?? []
  const selectedStudentId = studentId ?? students[0]?.id ?? null

  const programsQuery = useQuery({
    queryKey: ['programs', selectedStudentId, statusFilter],
    queryFn: () =>
      listPrograms(selectedStudentId as number, {
        status: statusFilter,
        sort: 'week_start_date',
        direction: 'desc',
        per_page: 100,
      }),
    enabled: Boolean(selectedStudentId),
  })

  const programs = programsQuery.data?.data ?? []

  const createMutation = useMutation({
    mutationFn: ({ targetStudentId, payload }: { targetStudentId: number; payload: Parameters<typeof createProgram>[1] }) =>
      createProgram(targetStudentId, payload),
    onSuccess: async () => {
      setNotice(t('pages:programs.noticeCreated'))
      setErrorNotice(null)
      setFormOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['programs', selectedStudentId] })
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
    mutationFn: ({ programId, payload }: { programId: number; payload: Parameters<typeof updateProgram>[1] }) =>
      updateProgram(programId, payload),
    onSuccess: async () => {
      setNotice(t('pages:programs.noticeUpdated'))
      setErrorNotice(null)
      setFormOpen(false)
      setEditingProgram(null)
      await queryClient.invalidateQueries({ queryKey: ['programs', selectedStudentId] })
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
    mutationFn: ({ programId, nextStatus }: { programId: number; nextStatus: ProgramStatus }) =>
      updateProgramStatus(programId, { status: nextStatus }),
    onSuccess: async () => {
      setNotice(t('pages:programs.noticeStatus'))
      setErrorNotice(null)
      await queryClient.invalidateQueries({ queryKey: ['programs', selectedStudentId] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  function openCreateForm() {
    setEditingProgram(null)
    setTitle('')
    setGoal('')
    setWeekStartDate('')
    setStatus('draft')
    setItems([blankItem(1)])
    setFormOpen(true)
  }

  function openEditForm(program: Program) {
    setEditingProgram(program)
    setTitle(program.title)
    setGoal(program.goal ?? '')
    setWeekStartDate(program.week_start_date)
    setStatus(program.status)
    setItems(
      program.items.length > 0
        ? program.items.map((item) => ({
            day_of_week: item.day_of_week,
            order_no: item.order_no,
            exercise: item.exercise,
            sets: item.sets,
            reps: item.reps,
            rest_seconds: item.rest_seconds,
            notes: item.notes,
          }))
        : [blankItem(1)],
    )
    setFormOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedStudentId && !editingProgram) {
      setErrorNotice(t('pages:programs.needStudent'))
      return
    }

    const payload = {
      title: title.trim(),
      goal: goal.trim() || null,
      week_start_date: weekStartDate,
      status,
      items: items
        .filter((item) => item.exercise.trim().length > 0)
        .map((item) => ({
          day_of_week: Number(item.day_of_week),
          order_no: Number(item.order_no),
          exercise: item.exercise.trim(),
          sets: item.sets,
          reps: item.reps,
          rest_seconds: item.rest_seconds,
          notes: item.notes,
        })),
    }

    if (editingProgram) {
      await updateMutation.mutateAsync({ programId: editingProgram.id, payload })
      return
    }

    await createMutation.mutateAsync({ targetStudentId: selectedStudentId as number, payload })
  }

  function updateItem(index: number, changes: Partial<ProgramItem>) {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...changes } : item)))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{t('pages:programs.title')}</h2>
            <p className="text-sm text-muted">{t('pages:programs.description')}</p>
          </div>
          <Button onClick={openCreateForm} disabled={!selectedStudentId}>
            {t('pages:programs.new')}
          </Button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Select value={selectedStudentId ? String(selectedStudentId) : ''} onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">{t('pages:programs.selectStudent')}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProgramStatus | 'all')}>
            <option value="all">{t('pages:programs.allStatus')}</option>
            <option value="draft">{t('common:draft')}</option>
            <option value="active">{t('common:active')}</option>
            <option value="archived">{t('common:archived')}</option>
          </Select>
          <Input value={weekStartDate} onChange={(e) => setWeekStartDate(e.target.value)} type="date" placeholder={t('pages:programs.weekStart')} />
        </div>

        {notice ? <p className="mb-3 rounded-md bg-success/15 px-3 py-2 text-sm text-success">{notice}</p> : null}
        {errorNotice ? <p className="mb-3 rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">{errorNotice}</p> : null}

        {!selectedStudentId ? (
          <p className="text-sm text-muted">{t('pages:programs.empty')}</p>
        ) : programsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : programsQuery.isError ? (
          <p className="text-sm text-danger">{extractApiMessage(programsQuery.error, t('common:requestFailed'))}</p>
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>{t('pages:programs.table.id')}</TH>
                <TH>{t('pages:programs.table.title')}</TH>
                <TH>{t('pages:programs.table.week')}</TH>
                <TH>{t('pages:programs.table.status')}</TH>
                <TH>{t('pages:programs.table.items')}</TH>
                <TH>{t('pages:programs.table.actions')}</TH>
              </tr>
            </THead>
            <TBody>
              {programs.map((program) => (
                <tr key={program.id}>
                  <TD>#{program.id}</TD>
                  <TD>{program.title}</TD>
                  <TD>{program.week_start_date}</TD>
                  <TD>{t(`common:${program.status}`)}</TD>
                  <TD>{program.items.length}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditForm(program)}>
                        {t('common:edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void statusMutation.mutateAsync({ programId: program.id, nextStatus: 'active' })}
                      >
                        {t('pages:programs.table.activate')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void statusMutation.mutateAsync({ programId: program.id, nextStatus: 'draft' })}
                      >
                        {t('common:draft')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void statusMutation.mutateAsync({ programId: program.id, nextStatus: 'archived' })}
                      >
                        {t('pages:programs.table.archive')}
                      </Button>
                    </div>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      {formOpen ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">{editingProgram ? t('pages:programs.form.editTitle') : t('pages:programs.form.newTitle')}</h3>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('pages:programs.form.programTitle')} required />
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={t('pages:programs.form.goal')} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={weekStartDate} onChange={(e) => setWeekStartDate(e.target.value)} type="date" required />
              <Select value={status} onChange={(e) => setStatus(e.target.value as ProgramStatus)}>
                <option value="draft">{t('common:draft')}</option>
                <option value="active">{t('common:active')}</option>
                <option value="archived">{t('common:archived')}</option>
              </Select>
            </div>

            <div className="space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{t('pages:programs.form.itemsTitle')}</h4>
                <Button type="button" size="sm" variant="outline" onClick={() => setItems((prev) => [...prev, blankItem(prev.length + 1)])}>
                  {t('pages:programs.form.addItem')}
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={`${item.order_no}-${index}`} className="grid gap-2 rounded-md border border-border p-2 sm:grid-cols-6">
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    value={item.day_of_week}
                    onChange={(e) => updateItem(index, { day_of_week: Number(e.target.value) })}
                    placeholder={t('pages:programs.form.day')}
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.order_no}
                    onChange={(e) => updateItem(index, { order_no: Number(e.target.value) })}
                    placeholder={t('pages:programs.form.order')}
                  />
                  <Input value={item.exercise} onChange={(e) => updateItem(index, { exercise: e.target.value })} placeholder={t('pages:programs.form.exercise')} />
                  <Input
                    type="number"
                    min={1}
                    value={item.sets ?? ''}
                    onChange={(e) => updateItem(index, { sets: e.target.value ? Number(e.target.value) : null })}
                    placeholder={t('pages:programs.form.sets')}
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.reps ?? ''}
                    onChange={(e) => updateItem(index, { reps: e.target.value ? Number(e.target.value) : null })}
                    placeholder={t('pages:programs.form.reps')}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={item.rest_seconds ?? ''}
                      onChange={(e) => updateItem(index, { rest_seconds: e.target.value ? Number(e.target.value) : null })}
                      placeholder={t('pages:programs.form.rest')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev))}
                    >
                      {t('common:remove')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? t('common:saving') : t('common:save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormOpen(false)
                  setEditingProgram(null)
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
