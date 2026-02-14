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
  const isPassive = status === 'passive'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isPassive ? 'Set Student Passive' : 'Set Student Active'}
      description="You can change this again later"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant={isPassive ? 'danger' : 'default'} onClick={() => void onConfirm()} disabled={submitting}>
            {submitting ? 'Saving...' : 'Confirm'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">
        {isPassive
          ? 'Student will be marked as passive and hidden from default active lists.'
          : 'Student will be marked active and included in active lists again.'}
      </p>
    </Dialog>
  )
}
