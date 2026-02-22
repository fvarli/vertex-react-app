import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Dialog } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { createTrainer, getTrainerOverview } from '../features/trainers/api'
import type { CreateTrainerPayload } from '../features/trainers/types'
import { extractApiMessage, extractValidationErrors, isForbidden, isValidationError } from '../lib/api-errors'
import { useWorkspaceAccess } from '../features/workspace/access'

type MembershipFilter = 'active' | 'all'

const initialForm: CreateTrainerPayload = {
  name: '',
  surname: '',
  email: '',
  phone: '',
  password: '',
}

export function TrainersPage() {
  const { t } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canMutate, approvalMessage } = useWorkspaceAccess()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [membershipFilter, setMembershipFilter] = useState<MembershipFilter>('active')
  const [openCreate, setOpenCreate] = useState(false)
  const [form, setForm] = useState<CreateTrainerPayload>(initialForm)
  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  const queryParams = useMemo(
    () => ({
      include_inactive: membershipFilter === 'all',
      search: search || undefined,
    }),
    [membershipFilter, search],
  )

  const overviewQuery = useQuery({
    queryKey: ['trainers', 'overview', queryParams],
    queryFn: () => getTrainerOverview(queryParams),
  })

  useEffect(() => {
    if (overviewQuery.error && isForbidden(overviewQuery.error)) {
      navigate('/forbidden', { replace: true })
    }
  }, [navigate, overviewQuery.error])

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createTrainer,
    onSuccess: async () => {
      setNotice(t('pages:trainers.noticeCreated'))
      setSuccessMessage(t('pages:trainers.form.successMessage'))
      setErrorNotice(null)
      setFieldErrors({})
      setOpenCreate(false)
      setForm(initialForm)
      await queryClient.invalidateQueries({ queryKey: ['trainers', 'overview'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        navigate('/forbidden', { replace: true })
        return
      }
      if (isValidationError(error)) {
        setFieldErrors(extractValidationErrors(error))
      }
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  const summary = overviewQuery.data?.summary
  const trainers = overviewQuery.data?.trainers ?? []

  return (
    <div className="page space-y-5 fade-in">
      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:trainers.sectionLabel')}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:trainers.title')}</h2>
            <p className="mt-1 text-sm text-muted">{t('pages:trainers.description')}</p>
          </div>
          <Button onClick={() => setOpenCreate(true)} disabled={!canMutate} title={!canMutate ? approvalMessage ?? undefined : undefined}>{t('pages:trainers.new')}</Button>
        </div>

        <div className="filter-surface mb-4 grid gap-3 sm:grid-cols-2">
          <Input placeholder={t('pages:trainers.searchPlaceholder')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Select value={membershipFilter} onChange={(e) => setMembershipFilter(e.target.value as MembershipFilter)}>
            <option value="active">{t('pages:trainers.filters.activeOnly')}</option>
            <option value="all">{t('pages:trainers.filters.allMemberships')}</option>
          </Select>
        </div>

        {successMessage ? (
          <div className="mb-3 rounded-xl bg-success/15 px-3 py-2 text-sm text-success">
            <p>{successMessage}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setSuccessMessage(null)}>
              {t('common:close')}
            </Button>
          </div>
        ) : notice ? <p className="mb-3 rounded-xl bg-success/15 px-3 py-2 text-sm text-success">{notice}</p> : null}
        {errorNotice ? <p className="mb-3 rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{errorNotice}</p> : null}

        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="kpi-card">
            <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:trainers.cards.totalTrainers')}</p>
            <p className="mt-2 text-3xl font-extrabold">{summary?.total_trainers ?? 0}</p>
          </div>
          <div className="kpi-card">
            <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:trainers.cards.activeTrainers')}</p>
            <p className="mt-2 text-3xl font-extrabold">{summary?.active_trainers ?? 0}</p>
          </div>
          <div className="kpi-card">
            <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:trainers.cards.totalStudents')}</p>
            <p className="mt-2 text-3xl font-extrabold">{summary?.total_students ?? 0}</p>
          </div>
          <div className="kpi-card">
            <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:trainers.cards.todayAppointments')}</p>
            <p className="mt-2 text-3xl font-extrabold">{summary?.today_appointments ?? 0}</p>
          </div>
          <div className="kpi-card">
            <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:trainers.cards.avgStudents')}</p>
            <p className="mt-2 text-3xl font-extrabold">{summary?.avg_students_per_trainer ?? '-'}</p>
          </div>
        </div>

        {overviewQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : overviewQuery.isError ? (
          <p className="text-sm text-danger">{extractApiMessage(overviewQuery.error, t('common:requestFailed'))}</p>
        ) : trainers.length === 0 ? (
          <p className="text-sm text-muted">{t('pages:trainers.empty')}</p>
        ) : (
          <div className="table-surface overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-foreground/[0.03]">
                <tr>
                  <th className="border-b border-border/80 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                    {t('pages:trainers.table.trainer')}
                  </th>
                  <th className="border-b border-border/80 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                    {t('pages:trainers.table.contact')}
                  </th>
                  <th className="border-b border-border/80 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                    {t('pages:trainers.table.membership')}
                  </th>
                  <th className="border-b border-border/80 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                    {t('pages:trainers.table.students')}
                  </th>
                  <th className="border-b border-border/80 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                    {t('pages:trainers.table.today')}
                  </th>
                  <th className="border-b border-border/80 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                    {t('pages:trainers.table.upcoming')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer) => (
                  <tr key={trainer.id}>
                    <td className="border-b border-border/70 px-3 py-3 align-middle text-foreground">
                      <div className="font-medium">{`${trainer.name} ${trainer.surname}`}</div>
                      <div className="text-xs text-muted">#{trainer.id}</div>
                    </td>
                    <td className="border-b border-border/70 px-3 py-3 align-middle text-foreground">
                      <div>{trainer.email}</div>
                      <div className="text-xs text-muted">{trainer.phone ?? '-'}</div>
                    </td>
                    <td className="border-b border-border/70 px-3 py-3 align-middle text-foreground">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={trainer.membership_is_active ? 'success' : 'muted'}>
                          {trainer.membership_is_active ? t('common:active') : t('common:passive')}
                        </Badge>
                      </div>
                    </td>
                    <td className="border-b border-border/70 px-3 py-3 align-middle text-foreground">{trainer.student_count}</td>
                    <td className="border-b border-border/70 px-3 py-3 align-middle text-foreground">{trainer.today_appointments}</td>
                    <td className="border-b border-border/70 px-3 py-3 align-middle text-foreground">{trainer.upcoming_7d_appointments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={openCreate}
        title={t('pages:trainers.form.title')}
        description={t('pages:trainers.form.description')}
        onClose={() => setOpenCreate(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              {t('common:cancel')}
            </Button>
            <Button
              onClick={async () => {
                if (!canMutate) return
                await createMutation.mutateAsync(form)
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? t('common:saving') : t('common:save')}
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            {t('pages:trainers.form.name')}
            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
            {fieldErrors.name ? <span className="text-xs text-danger">{fieldErrors.name[0]}</span> : null}
          </label>
          <label className="grid gap-1 text-sm">
            {t('pages:trainers.form.surname')}
            <Input value={form.surname} onChange={(e) => setForm((prev) => ({ ...prev, surname: e.target.value }))} required />
            {fieldErrors.surname ? <span className="text-xs text-danger">{fieldErrors.surname[0]}</span> : null}
          </label>
          <label className="grid gap-1 text-sm">
            {t('pages:trainers.form.email')}
            <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
            {fieldErrors.email ? <span className="text-xs text-danger">{fieldErrors.email[0]}</span> : <span className="text-xs text-muted">{t('pages:trainers.form.emailHint')}</span>}
          </label>
          <label className="grid gap-1 text-sm">
            {t('pages:trainers.form.phone')}
            <Input value={form.phone ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            {fieldErrors.phone ? <span className="text-xs text-danger">{fieldErrors.phone[0]}</span> : null}
          </label>
          <label className="grid gap-1 text-sm">
            {t('pages:trainers.form.password')}
            <Input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required minLength={8} />
            {fieldErrors.password ? <span className="text-xs text-danger">{fieldErrors.password[0]}</span> : <span className="text-xs text-muted">{t('pages:trainers.form.passwordHint')}</span>}
          </label>
          <p className="rounded-lg bg-border/50 px-3 py-2 text-xs text-muted">{t('pages:trainers.form.alreadyExistsHint')}</p>
        </div>
      </Dialog>
    </div>
  )
}

