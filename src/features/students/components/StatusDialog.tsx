import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/button'
import { Dialog } from '../../../components/ui/dialog'
import type { StudentStatus } from '../types'

type StatusDialogProps = {
  open: boolean
  status: StudentStatus
  submitting: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function StatusDialog({ open, status, submitting, onClose, onConfirm }: StatusDialogProps) {
  const { t } = useTranslation(['pages', 'common'])
  const isPassive = status === 'passive'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isPassive ? t('pages:students.statusDialog.setPassive') : t('pages:students.statusDialog.setActive')}
      description={t('pages:students.statusDialog.description')}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {t('common:cancel')}
          </Button>
          <Button variant={isPassive ? 'danger' : 'default'} onClick={() => void onConfirm()} disabled={submitting}>
            {submitting ? t('common:saving') : t('common:confirm')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">
        {isPassive ? t('pages:students.statusDialog.confirmPassive') : t('pages:students.statusDialog.confirmActive')}
      </p>
    </Dialog>
  )
}
