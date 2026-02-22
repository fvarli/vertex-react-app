import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Dialog } from '../../../components/ui/dialog'
import type { Appointment } from '../types'

type Props = {
  open: boolean
  appointment: Appointment | null
  studentName?: string
  onClose: () => void
  onStatusChange: (appointmentId: number, status: 'done' | 'cancelled' | 'no_show' | 'planned') => void
  onWhatsAppOpen: (appointmentId: number) => void
  canMutate: boolean
}

export function AppointmentDetailDialog({ open, appointment, studentName, onClose, onStatusChange, onWhatsAppOpen, canMutate }: Props) {
  const { t } = useTranslation(['pages', 'common'])

  if (!appointment) return null

  return (
    <Dialog
      open={open}
      title={t('pages:appointmentDetail.title')}
      description={t('pages:appointmentDetail.description')}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap gap-2">
          {canMutate ? (
            <>
              {appointment.status !== 'done' ? (
                <Button size="sm" variant="secondary" onClick={() => onStatusChange(appointment.id, 'done')}>
                  {t('common:done')}
                </Button>
              ) : null}
              {appointment.status !== 'no_show' ? (
                <Button size="sm" variant="outline" onClick={() => onStatusChange(appointment.id, 'no_show')}>
                  {t('pages:appointments.table.noShow')}
                </Button>
              ) : null}
              {appointment.status !== 'cancelled' ? (
                <Button size="sm" variant="danger" onClick={() => onStatusChange(appointment.id, 'cancelled')}>
                  {t('pages:appointments.table.cancel')}
                </Button>
              ) : null}
              {appointment.status !== 'planned' ? (
                <Button size="sm" variant="outline" onClick={() => onStatusChange(appointment.id, 'planned')}>
                  {t('common:planned')}
                </Button>
              ) : null}
            </>
          ) : null}
          <Button variant="outline" onClick={onClose}>
            {t('common:close')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{t('pages:appointmentDetail.info')}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted">{t('pages:appointments.table.student')}</span>
            <span>{studentName ?? `#${appointment.student_id}`}</span>
            <span className="text-muted">{t('pages:appointments.table.start')}</span>
            <span>{dayjs(appointment.starts_at).format('DD.MM.YYYY HH:mm')}</span>
            <span className="text-muted">{t('pages:appointments.table.end')}</span>
            <span>{dayjs(appointment.ends_at).format('HH:mm')}</span>
            <span className="text-muted">{t('pages:appointments.table.status')}</span>
            <Badge variant={appointment.status === 'done' ? 'success' : appointment.status === 'cancelled' ? 'danger' : 'muted'}>
              {t(`common:${appointment.status}`)}
            </Badge>
          </div>
          {appointment.location ? (
            <div className="text-sm">
              <span className="text-muted">{t('pages:calendar.detail.location')}: </span>
              <span>{appointment.location}</span>
            </div>
          ) : null}
          {appointment.notes ? (
            <div className="text-sm">
              <span className="text-muted">{t('pages:calendar.detail.notes')}: </span>
              <span>{appointment.notes}</span>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{t('pages:appointmentDetail.whatsapp')}</h4>
          <div className="flex items-center gap-2">
            <Badge variant={appointment.whatsapp_status === 'sent' ? 'success' : 'muted'}>
              {appointment.whatsapp_status === 'sent' ? t('pages:appointments.whatsapp.sent') : t('pages:appointments.whatsapp.notSent')}
            </Badge>
            {appointment.whatsapp_marked_at ? (
              <span className="text-xs text-muted">
                {dayjs(appointment.whatsapp_marked_at).format('DD.MM.YYYY HH:mm')}
              </span>
            ) : null}
          </div>
          {canMutate ? (
            <Button size="sm" onClick={() => onWhatsAppOpen(appointment.id)}>
              {t('pages:appointments.whatsapp.open')}
            </Button>
          ) : null}
        </div>

        {appointment.reminder_summary ? (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{t('pages:appointmentDetail.reminders')}</h4>
            <div className="flex gap-3 text-sm">
              <span>{t('pages:reminders.filters.pending')}: {appointment.reminder_summary.pending}</span>
              <span>{t('pages:reminders.filters.sent')}: {appointment.reminder_summary.sent}</span>
            </div>
          </div>
        ) : null}

        {appointment.series_id ? (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{t('pages:appointmentDetail.series')}</h4>
            <p className="text-sm">{t('pages:appointments.table.series')}: #{appointment.series_id}</p>
            {appointment.series_occurrence_date ? (
              <p className="text-xs text-muted">{appointment.series_occurrence_date}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Dialog>
  )
}
