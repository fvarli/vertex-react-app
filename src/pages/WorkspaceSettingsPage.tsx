import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TBody, TD, TH, THead } from '../components/ui/table'
import { useWorkspaceAccess } from '../features/workspace/access'
import { fetchWorkspaceMembers, updateWorkspace } from '../features/workspace/api'
import { extractApiMessage } from '../lib/api-errors'

export function WorkspaceSettingsPage() {
  const { t } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { activeWorkspace } = useWorkspaceAccess()

  const [name, setName] = useState(activeWorkspace?.name ?? '')
  const [notice, setNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  const membersQuery = useQuery({
    queryKey: ['workspace', activeWorkspace?.id, 'members'],
    queryFn: () => fetchWorkspaceMembers(activeWorkspace!.id),
    enabled: Boolean(activeWorkspace?.id),
  })

  const updateMutation = useMutation({
    mutationFn: () => updateWorkspace(activeWorkspace!.id, { name: name.trim() }),
    onSuccess: async () => {
      setNotice(t('pages:workspaceSettings.noticeUpdated'))
      setErrorNotice(null)
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
    onError: (error) => {
      setErrorNotice(extractApiMessage(error, t('common:requestFailed')))
    },
  })

  if (!activeWorkspace) {
    return (
      <div className="page fade-in">
        <p className="text-sm text-muted">{t('pages:workspaceSettings.noWorkspace')}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/workspaces')}>
          {t('pages:workspace.title')}
        </Button>
      </div>
    )
  }

  const members = membersQuery.data ?? []

  return (
    <div className="page space-y-5 fade-in">
      <div className="panel">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:workspaceSettings.sectionLabel')}</p>
        <h2 className="text-2xl font-extrabold tracking-tight">{t('pages:workspaceSettings.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('pages:workspaceSettings.description')}</p>
      </div>

      {notice ? <p className="rounded-xl bg-success/15 px-3 py-2 text-sm text-success">{notice}</p> : null}
      {errorNotice ? <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{errorNotice}</p> : null}

      <div className="panel">
        <h3 className="mb-3 text-lg font-semibold">{t('pages:workspaceSettings.general.title')}</h3>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            void updateMutation.mutateAsync()
          }}
        >
          <div>
            <label className="mb-1 block text-xs text-muted">{t('pages:workspaceSettings.general.name')}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={3} maxLength={120} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">{t('pages:workspaceSettings.general.status')}</label>
            <Badge variant={activeWorkspace.approval_status === 'approved' ? 'success' : activeWorkspace.approval_status === 'pending' ? 'warning' : 'danger'}>
              {t(`pages:workspace.status.${activeWorkspace.approval_status}`)}
            </Badge>
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? t('common:saving') : t('common:save')}
          </Button>
        </form>
      </div>

      <div className="panel">
        <h3 className="mb-3 text-lg font-semibold">{t('pages:workspaceSettings.members.title')}</h3>
        <p className="mb-3 text-sm text-muted">{t('pages:workspaceSettings.members.description')}</p>

        {membersQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : membersQuery.isError ? (
          <p className="text-sm text-danger">{extractApiMessage(membersQuery.error, t('common:requestFailed'))}</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted">{t('pages:workspaceSettings.members.empty')}</p>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {members.map((m) => (
                <div key={m.id} className="rounded-xl border border-border/70 bg-card/75 p-3 text-sm">
                  <p className="font-semibold">{m.name} {m.surname}</p>
                  <p className="text-xs text-muted">{m.email}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="muted">{m.role}</Badge>
                    <Badge variant={m.is_active ? 'success' : 'muted'}>{m.is_active ? t('common:active') : t('common:passive')}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="table-surface hidden md:block">
              <Table>
                <THead>
                  <tr>
                    <TH>{t('pages:workspaceSettings.members.name')}</TH>
                    <TH>{t('pages:workspaceSettings.members.email')}</TH>
                    <TH>{t('pages:workspaceSettings.members.role')}</TH>
                    <TH>{t('pages:workspaceSettings.members.status')}</TH>
                  </tr>
                </THead>
                <TBody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <TD>{m.name} {m.surname}</TD>
                      <TD>{m.email}</TD>
                      <TD><Badge variant="muted">{m.role}</Badge></TD>
                      <TD><Badge variant={m.is_active ? 'success' : 'muted'}>{m.is_active ? t('common:active') : t('common:passive')}</Badge></TD>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
