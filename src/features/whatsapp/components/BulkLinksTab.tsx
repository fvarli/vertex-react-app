import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Skeleton } from '../../../components/ui/skeleton'
import { Table, TBody, TD, TH, THead } from '../../../components/ui/table'
import { extractApiMessage, isForbidden } from '../../../lib/api-errors'
import { useToast } from '../../toast/toast-context'
import type { AppointmentWhatsappStatus } from '../../appointments/types'
import { fetchBulkLinks, updateWhatsappStatus } from '../api'

export function BulkLinksTab() {
  const { t } = useTranslation(['pages', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [date, setDate] = useState(() => dayjs().format('YYYY-MM-DD'))

  const query = useQuery({
    queryKey: ['whatsapp', 'bulk-links', date],
    queryFn: () => fetchBulkLinks(date),
  })

  const statusMutation = useMutation({
    mutationFn: ({ appointmentId, whatsappStatus }: { appointmentId: number; whatsappStatus: AppointmentWhatsappStatus }) =>
      updateWhatsappStatus(appointmentId, whatsappStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['whatsapp', 'bulk-links'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
    },
    onError: (error) => {
      if (isForbidden(error)) {
        addToast(extractApiMessage(error, t('common:requestFailed')), 'error')
        navigate('/workspaces', { replace: true })
        return
      }
      addToast(extractApiMessage(error, t('common:requestFailed')), 'error')
    },
  })

  const items = query.data ?? []

  return (
    <div className="space-y-4">
      <div className="filter-surface">
        <label className="mb-1 block text-xs text-muted">{t('pages:whatsapp.bulkLinks.dateLabel')}</label>
        <input
          type="date"
          className="input w-full max-w-xs"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : query.isError ? (
        <p className="rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">
          {extractApiMessage(query.error, t('common:requestFailed'))}
        </p>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-muted">{t('pages:whatsapp.bulkLinks.empty')}</p>
      ) : (
        <>
          <div className="table-surface hidden md:block">
            <Table>
              <THead>
                <tr>
                  <TH>{t('pages:whatsapp.bulkLinks.student')}</TH>
                  <TH>{t('pages:whatsapp.bulkLinks.time')}</TH>
                  <TH>{t('pages:whatsapp.bulkLinks.status')}</TH>
                  <TH>{t('pages:whatsapp.bulkLinks.actions')}</TH>
                </tr>
              </THead>
              <TBody>
                {items.map((item) => (
                  <tr key={item.appointment_id}>
                    <TD>{item.student_name}</TD>
                    <TD>{dayjs(item.starts_at).format('HH:mm')}</TD>
                    <TD>
                      <Badge variant={item.whatsapp_sent ? 'success' : 'warning'}>
                        {item.whatsapp_sent ? t('pages:whatsapp.bulkLinks.sent') : t('pages:whatsapp.bulkLinks.notSent')}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(item.whatsapp_link, '_blank')}
                        >
                          {t('pages:whatsapp.bulkLinks.openWhatsApp')}
                        </Button>
                        <Button
                          size="sm"
                          variant={item.whatsapp_sent ? 'outline' : 'default'}
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              appointmentId: item.appointment_id,
                              whatsappStatus: item.whatsapp_sent ? 'not_sent' : 'sent',
                            })
                          }
                        >
                          {item.whatsapp_sent
                            ? t('pages:whatsapp.bulkLinks.markNotSent')
                            : t('pages:whatsapp.bulkLinks.markSent')}
                        </Button>
                      </div>
                    </TD>
                  </tr>
                ))}
              </TBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <div key={item.appointment_id} className="rounded-xl border border-border/70 bg-card/75 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{item.student_name}</p>
                  <Badge variant={item.whatsapp_sent ? 'success' : 'warning'}>
                    {item.whatsapp_sent ? t('pages:whatsapp.bulkLinks.sent') : t('pages:whatsapp.bulkLinks.notSent')}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted">{dayjs(item.starts_at).format('HH:mm')}</p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(item.whatsapp_link, '_blank')}
                  >
                    {t('pages:whatsapp.bulkLinks.openWhatsApp')}
                  </Button>
                  <Button
                    size="sm"
                    variant={item.whatsapp_sent ? 'outline' : 'default'}
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        appointmentId: item.appointment_id,
                        whatsappStatus: item.whatsapp_sent ? 'not_sent' : 'sent',
                      })
                    }
                  >
                    {item.whatsapp_sent
                      ? t('pages:whatsapp.bulkLinks.markNotSent')
                      : t('pages:whatsapp.bulkLinks.markSent')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
