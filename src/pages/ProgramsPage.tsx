import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { TBody, TD, TH, THead, Table } from '../components/ui/table'
import { createProgram, listPrograms, updateProgram, updateProgramStatus } from '../features/programs/api'
import type { Program, ProgramItem, ProgramStatus } from '../features/programs/types'
import { listStudents } from '../features/students/api'

function isWorkspaceForbidden(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false
  return error.response?.status === 403
}

function errorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
  }

  return 'Request failed. Please try again.'
}

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
    queryKey: ['programs', selectedStudentId],
    queryFn: () => listPrograms(selectedStudentId as number),
    enabled: Boolean(selectedStudentId),
  })

  const programs = useMemo(() => {
    const list = programsQuery.data ?? []
    if (statusFilter === 'all') return list
    return list.filter((program) => program.status === statusFilter)
  }, [programsQuery.data, statusFilter])

  const createMutation = useMutation({
    mutationFn: ({ targetStudentId, payload }: { targetStudentId: number; payload: Parameters<typeof createProgram>[1] }) =>
      createProgram(targetStudentId, payload),
    onSuccess: async () => {
      setNotice('Program created successfully.')
      setErrorNotice(null)
      setFormOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['programs', selectedStudentId] })
    },
    onError: (error) => {
      if (isWorkspaceForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(errorMessage(error))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ programId, payload }: { programId: number; payload: Parameters<typeof updateProgram>[1] }) =>
      updateProgram(programId, payload),
    onSuccess: async () => {
      setNotice('Program updated successfully.')
      setErrorNotice(null)
      setFormOpen(false)
      setEditingProgram(null)
      await queryClient.invalidateQueries({ queryKey: ['programs', selectedStudentId] })
    },
    onError: (error) => {
      if (isWorkspaceForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(errorMessage(error))
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ programId, nextStatus }: { programId: number; nextStatus: ProgramStatus }) =>
      updateProgramStatus(programId, { status: nextStatus }),
    onSuccess: async () => {
      setNotice('Program status updated successfully.')
      setErrorNotice(null)
      await queryClient.invalidateQueries({ queryKey: ['programs', selectedStudentId] })
    },
    onError: (error) => {
      if (isWorkspaceForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      setErrorNotice(errorMessage(error))
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
      setErrorNotice('Please select student.')
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
            <h2 className="text-xl font-semibold">Programs</h2>
            <p className="text-sm text-muted">Create and manage weekly student programs with ordered items.</p>
          </div>
          <Button onClick={openCreateForm} disabled={!selectedStudentId}>
            New Program
          </Button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Select value={selectedStudentId ? String(selectedStudentId) : ''} onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProgramStatus | 'all')}>
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </Select>
          <Input value={weekStartDate} onChange={(e) => setWeekStartDate(e.target.value)} type="date" placeholder="Week start" />
        </div>

        {notice ? <p className="mb-3 rounded-md bg-success/15 px-3 py-2 text-sm text-success">{notice}</p> : null}
        {errorNotice ? <p className="mb-3 rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">{errorNotice}</p> : null}

        {!selectedStudentId ? (
          <p className="text-sm text-muted">Select a student to view programs.</p>
        ) : programsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : programsQuery.isError ? (
          <p className="text-sm text-danger">{errorMessage(programsQuery.error)}</p>
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Title</TH>
                <TH>Week</TH>
                <TH>Status</TH>
                <TH>Items</TH>
                <TH>Actions</TH>
              </tr>
            </THead>
            <TBody>
              {programs.map((program) => (
                <tr key={program.id}>
                  <TD>#{program.id}</TD>
                  <TD>{program.title}</TD>
                  <TD>{program.week_start_date}</TD>
                  <TD>{program.status}</TD>
                  <TD>{program.items.length}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditForm(program)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void statusMutation.mutateAsync({ programId: program.id, nextStatus: 'active' })}
                      >
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void statusMutation.mutateAsync({ programId: program.id, nextStatus: 'draft' })}
                      >
                        Draft
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void statusMutation.mutateAsync({ programId: program.id, nextStatus: 'archived' })}
                      >
                        Archive
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
          <h3 className="mb-3 text-lg font-semibold">{editingProgram ? 'Edit Program' : 'New Program'}</h3>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Program title" required />
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Goal (optional)" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={weekStartDate} onChange={(e) => setWeekStartDate(e.target.value)} type="date" required />
              <Select value={status} onChange={(e) => setStatus(e.target.value as ProgramStatus)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Select>
            </div>

            <div className="space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Program Items</h4>
                <Button type="button" size="sm" variant="outline" onClick={() => setItems((prev) => [...prev, blankItem(prev.length + 1)])}>
                  Add Item
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
                    placeholder="Day"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.order_no}
                    onChange={(e) => updateItem(index, { order_no: Number(e.target.value) })}
                    placeholder="Order"
                  />
                  <Input value={item.exercise} onChange={(e) => updateItem(index, { exercise: e.target.value })} placeholder="Exercise" />
                  <Input
                    type="number"
                    min={1}
                    value={item.sets ?? ''}
                    onChange={(e) => updateItem(index, { sets: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Sets"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.reps ?? ''}
                    onChange={(e) => updateItem(index, { reps: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Reps"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={item.rest_seconds ?? ''}
                      onChange={(e) => updateItem(index, { rest_seconds: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Rest(s)"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormOpen(false)
                  setEditingProgram(null)
                }}
              >
                Close
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
