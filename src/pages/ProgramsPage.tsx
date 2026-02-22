import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Dialog } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { TBody, TD, TH, THead, Table } from '../components/ui/table'
import {
  copyProgramWeek,
  createProgram,
  createProgramFromTemplate,
  createProgramTemplate,
  listProgramTemplates,
  listPrograms,
  updateProgram,
  updateProgramStatus,
} from '../features/programs/api'
import type { Program, ProgramItem, ProgramStatus } from '../features/programs/types'
import { listStudents } from '../features/students/api'
import { extractApiMessage, extractValidationErrors, isForbidden, isValidationError } from '../lib/api-errors'
import { useWorkspaceAccess } from '../features/workspace/access'

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
  const { canMutate, approvalMessage } = useWorkspaceAccess()

  const [studentId, setStudentId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | 'all'>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)

  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [weekStartDate, setWeekStartDate] = useState('')
  const [status, setStatus] = useState<ProgramStatus>('draft')
  const [items, setItems] = useState<ProgramItem[]>([blankItem(1)])
  const [templateId, setTemplateId] = useState('')
  const [templateWeekStartDate, setTemplateWeekStartDate] = useState('')
  const [templateStatus, setTemplateStatus] = useState<ProgramStatus>('draft')
  const [copySourceWeek, setCopySourceWeek] = useState('')
  const [copyTargetWeek, setCopyTargetWeek] = useState('')
  const [copyStatus, setCopyStatus] = useState<ProgramStatus>('draft')

  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [archiveConfirmId, setArchiveConfirmId] = useState<number | null>(null)

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
  const templatesQuery = useQuery({
    queryKey: ['program-templates'],
    queryFn: () => listProgramTemplates({ per_page: 100 }),
  })
  const templates = templatesQuery.data?.data ?? []

  const createMutation = useMutation({
    mutationFn: ({ targetStudentId, payload }: { targetStudentId: number; payload: Parameters<typeof createProgram>[1] }) =>
      createProgram(targetStudentId, payload),
    onSuccess: async () => {
      setNotice(t('pages:programs.noticeCreated'))
      setErrorNotice(null)
      setFieldErrors({})
      setFormOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['programs', selectedStudentId] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      if (isValidationError(error)) {
        setFieldErrors(extractValidationErrors(error))
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
      setFieldErrors({})
      setFormOpen(false)
      setEditingProgram(null)
      await queryClient.invalidateQueries({ queryKey: ['programs', selectedStudentId] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/workspaces', { replace: true })
        return
      }
      if (isValidationError(error)) {
        setFieldErrors(extractValidationErrors(error))
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

  const fromTemplateMutation = useMutation({
    mutationFn: ({ targetStudentId, payload }: { targetStudentId: number; payload: Parameters<typeof createProgramFromTemplate>[1] }) =>
      createProgramFromTemplate(targetStudentId, payload),
    onSuccess: async () => {
      setNotice(t('pages:programs.noticeCreatedFromTemplate'))
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

  const copyWeekMutation = useMutation({
    mutationFn: ({ targetStudentId, payload }: { targetStudentId: number; payload: Parameters<typeof copyProgramWeek>[1] }) =>
      copyProgramWeek(targetStudentId, payload),
    onSuccess: async () => {
      setNotice(t('pages:programs.noticeCopiedWeek'))
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

  const templateMutation = useMutation({
    mutationFn: createProgramTemplate,
    onSuccess: async () => {
      setNotice(t('pages:programs.noticeTemplateSaved'))
      setErrorNotice(null)
      await queryClient.invalidateQueries({ queryKey: ['program-templates'] })
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
    if (!canMutate) return
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

  async function handleCreateFromTemplate() {
    if (!canMutate) return
    if (!selectedStudentId || !templateId || !templateWeekStartDate) {
      setErrorNotice(t('pages:programs.needTemplateFields'))
      return
    }

    await fromTemplateMutation.mutateAsync({
      targetStudentId: selectedStudentId,
      payload: {
        template_id: Number(templateId),
        week_start_date: templateWeekStartDate,
        status: templateStatus,
      },
    })
  }

  async function handleCopyWeek() {
    if (!canMutate) return
    if (!selectedStudentId || !copySourceWeek || !copyTargetWeek) {
      setErrorNotice(t('pages:programs.needCopyFields'))
      return
    }

    await copyWeekMutation.mutateAsync({
      targetStudentId: selectedStudentId,
      payload: {
        source_week_start_date: copySourceWeek,
        target_week_start_date: copyTargetWeek,
        status: copyStatus,
      },
    })
  }

  async function handleSaveTemplate(program: Program) {
    if (!canMutate) return
    const templateName = window.prompt(t('pages:programs.templateNamePrompt'), `${program.title}-${program.week_start_date}`)
    if (!templateName || templateName.trim().length === 0) {
      return
    }

    await templateMutation.mutateAsync({
      name: templateName.trim(),
      title: program.title,
      goal: program.goal,
      items: program.items.map((item) => ({
        day_of_week: item.day_of_week,
        order_no: item.order_no,
        exercise: item.exercise,
        sets: item.sets,
        reps: item.reps,
        rest_seconds: item.rest_seconds,
        notes: item.notes,
      })),
    })
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:programs.sectionLabel')}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:programs.title')}</h2>
            <p className="mt-1 text-sm text-muted">{t('pages:programs.description')}</p>
          </div>
          <Button onClick={openCreateForm} disabled={!selectedStudentId || !canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>
            {t('pages:programs.new')}
          </Button>
        </div>

        <div className="filter-surface mb-4 grid gap-3 sm:grid-cols-3">
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

        <div className="mb-4 grid gap-3 rounded-2xl border border-border/70 bg-background/55 p-3 lg:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-border/70 bg-card/60 p-3">
            <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:programs.accelerator.templateTitle')}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                <option value="">{t('pages:programs.accelerator.selectTemplate')}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
              <Input type="date" value={templateWeekStartDate} onChange={(e) => setTemplateWeekStartDate(e.target.value)} />
              <Select value={templateStatus} onChange={(e) => setTemplateStatus(e.target.value as ProgramStatus)}>
                <option value="draft">{t('common:draft')}</option>
                <option value="active">{t('common:active')}</option>
                <option value="archived">{t('common:archived')}</option>
              </Select>
            </div>
            <Button size="sm" onClick={() => void handleCreateFromTemplate()} disabled={fromTemplateMutation.isPending || !selectedStudentId || !canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>
              {t('pages:programs.accelerator.createFromTemplate')}
            </Button>
          </div>

          <div className="space-y-2 rounded-xl border border-border/70 bg-card/60 p-3">
            <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:programs.accelerator.copyTitle')}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input type="date" value={copySourceWeek} onChange={(e) => setCopySourceWeek(e.target.value)} placeholder={t('pages:programs.accelerator.sourceWeek')} />
              <Input type="date" value={copyTargetWeek} onChange={(e) => setCopyTargetWeek(e.target.value)} placeholder={t('pages:programs.accelerator.targetWeek')} />
              <Select value={copyStatus} onChange={(e) => setCopyStatus(e.target.value as ProgramStatus)}>
                <option value="draft">{t('common:draft')}</option>
                <option value="active">{t('common:active')}</option>
                <option value="archived">{t('common:archived')}</option>
              </Select>
            </div>
            <Button size="sm" variant="outline" onClick={() => void handleCopyWeek()} disabled={copyWeekMutation.isPending || !selectedStudentId || !canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>
              {t('pages:programs.accelerator.copyWeek')}
            </Button>
          </div>
        </div>

        {notice ? <p className="mb-3 rounded-xl bg-success/15 px-3 py-2 text-sm text-success">{notice}</p> : null}
        {errorNotice ? <p className="mb-3 rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{errorNotice}</p> : null}

        {!selectedStudentId ? (
          <p className="text-sm text-muted">{t('pages:programs.empty')}</p>
        ) : programsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : programsQuery.isError ? (
          <p className="text-sm text-danger">{extractApiMessage(programsQuery.error, t('common:requestFailed'))}</p>
        ) : programs.length === 0 ? (
          <div className="rounded-xl bg-border/50 px-4 py-6 text-center">
            <p className="text-sm text-muted">{t('pages:emptyState.programs')}</p>
            <Button
              className="mt-3"
              size="sm"
              disabled={!canMutate}
              title={!canMutate ? approvalMessage ?? undefined : undefined}
              onClick={openCreateForm}
            >
              {t('pages:emptyState.programsCta')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 md:hidden">
              {programs.map((program) => (
                <div key={program.id} className="rounded-xl border border-border/70 bg-card/75 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{program.title}</p>
                      <p className="text-xs text-muted">{t('pages:programs.table.week')}: {program.week_start_date}</p>
                      <p className="text-xs text-muted">{t('pages:programs.table.items')}: {program.items.length}</p>
                    </div>
                    <Badge variant={program.status === 'active' ? 'success' : 'muted'}>{t(`common:${program.status}`)}</Badge>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditForm(program)}>
                      {t('common:edit')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void handleSaveTemplate(program)}>
                      {t('pages:programs.table.saveTemplate')}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => void statusMutation.mutateAsync({ programId: program.id, nextStatus: 'active' })}>
                      {t('pages:programs.table.activate')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void statusMutation.mutateAsync({ programId: program.id, nextStatus: 'draft' })}>
                      {t('common:draft')}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setArchiveConfirmId(program.id)}>
                      {t('pages:programs.table.archive')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="table-surface hidden md:block">
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
                      <TD>
                        <Badge variant={program.status === 'active' ? 'success' : 'muted'}>{t(`common:${program.status}`)}</Badge>
                      </TD>
                      <TD>{program.items.length}</TD>
                      <TD>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditForm(program)}>
                            {t('common:edit')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => void handleSaveTemplate(program)}>
                            {t('pages:programs.table.saveTemplate')}
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
                            onClick={() => setArchiveConfirmId(program.id)}
                          >
                            {t('pages:programs.table.archive')}
                          </Button>
                        </div>
                      </TD>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {formOpen ? (
        <div className="panel">
          <h3 className="mb-3 text-lg font-semibold tracking-tight">{editingProgram ? t('pages:programs.form.editTitle') : t('pages:programs.form.newTitle')}</h3>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid gap-1">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('pages:programs.form.programTitle')} required />
              {fieldErrors.title ? <span className="text-xs text-danger">{fieldErrors.title[0]}</span> : null}
            </div>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={t('pages:programs.form.goal')} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Input value={weekStartDate} onChange={(e) => setWeekStartDate(e.target.value)} type="date" required />
                {fieldErrors.week_start_date ? <span className="text-xs text-danger">{fieldErrors.week_start_date[0]}</span> : null}
              </div>
              <Select value={status} onChange={(e) => setStatus(e.target.value as ProgramStatus)}>
                <option value="draft">{t('common:draft')}</option>
                <option value="active">{t('common:active')}</option>
                <option value="archived">{t('common:archived')}</option>
              </Select>
            </div>

            <div className="space-y-3 rounded-xl border border-border/70 bg-background/40 p-3">
              <h4 className="text-sm font-semibold">{t('pages:programs.form.itemsTitle')}</h4>
              {fieldErrors.items ? <span className="text-xs text-danger">{fieldErrors.items[0]}</span> : null}

              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const dayItems = items
                  .map((item, idx) => ({ item, idx }))
                  .filter(({ item }) => item.day_of_week === dayNum)
                  .sort((a, b) => a.item.order_no - b.item.order_no)

                return (
                  <div key={dayNum} className="rounded-xl border border-border/50 bg-card/40 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                        {t(`pages:programs.form.days.${dayNum}`)}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const maxOrder = dayItems.reduce((max, { item }) => Math.max(max, item.order_no), 0)
                          setItems((prev) => [...prev, { ...blankItem(maxOrder + 1), day_of_week: dayNum }])
                        }}
                      >
                        {t('pages:programs.form.addExercise')}
                      </Button>
                    </div>

                    {dayItems.length === 0 ? (
                      <p className="text-xs text-muted">{t('pages:programs.form.noDayItems')}</p>
                    ) : (
                      <div className="space-y-2">
                        {dayItems.map(({ item, idx }, posInDay) => (
                          <div key={idx} className="grid gap-2 rounded-lg border border-border/60 bg-background/50 p-2 sm:grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_auto]">
                            <Input
                              type="number"
                              min={1}
                              value={item.order_no}
                              onChange={(e) => updateItem(idx, { order_no: Number(e.target.value) })}
                              placeholder={t('pages:programs.form.order')}
                            />
                            <Input value={item.exercise} onChange={(e) => updateItem(idx, { exercise: e.target.value })} placeholder={t('pages:programs.form.exercise')} />
                            <Input
                              type="number"
                              min={1}
                              value={item.sets ?? ''}
                              onChange={(e) => updateItem(idx, { sets: e.target.value ? Number(e.target.value) : null })}
                              placeholder={t('pages:programs.form.sets')}
                            />
                            <Input
                              type="number"
                              min={1}
                              value={item.reps ?? ''}
                              onChange={(e) => updateItem(idx, { reps: e.target.value ? Number(e.target.value) : null })}
                              placeholder={t('pages:programs.form.reps')}
                            />
                            <Input
                              type="number"
                              min={0}
                              value={item.rest_seconds ?? ''}
                              onChange={(e) => updateItem(idx, { rest_seconds: e.target.value ? Number(e.target.value) : null })}
                              placeholder={t('pages:programs.form.rest')}
                            />
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={posInDay === 0}
                                onClick={() => {
                                  const prevItem = dayItems[posInDay - 1]
                                  const curOrder = item.order_no
                                  const prevOrder = prevItem.item.order_no
                                  updateItem(idx, { order_no: prevOrder })
                                  updateItem(prevItem.idx, { order_no: curOrder })
                                }}
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={posInDay === dayItems.length - 1}
                                onClick={() => {
                                  const nextItem = dayItems[posInDay + 1]
                                  const curOrder = item.order_no
                                  const nextOrder = nextItem.item.order_no
                                  updateItem(idx, { order_no: nextOrder })
                                  updateItem(nextItem.idx, { order_no: curOrder })
                                }}
                              >
                                ↓
                              </Button>
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                              >
                                {t('common:remove')}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
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

      <Dialog
        open={archiveConfirmId !== null}
        title={t('pages:confirmDialog.archiveProgram')}
        description={t('pages:confirmDialog.archiveProgramDescription')}
        onClose={() => setArchiveConfirmId(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setArchiveConfirmId(null)}>
              {t('common:cancel')}
            </Button>
            <Button
              variant="danger"
              disabled={statusMutation.isPending}
              onClick={async () => {
                if (!archiveConfirmId) return
                await statusMutation.mutateAsync({ programId: archiveConfirmId, nextStatus: 'archived' })
                setArchiveConfirmId(null)
              }}
            >
              {statusMutation.isPending ? t('common:saving') : t('pages:programs.table.archive')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">{t('pages:confirmDialog.archiveProgramDescription')}</p>
      </Dialog>
    </div>
  )
}
