import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Dialog } from '../../../components/ui/dialog'
import { useAuth } from '../../auth/auth-context'
import { useToast } from '../../toast/toast-context'
import { deleteAccount } from '../api'
import { extractApiMessage } from '../../../lib/api-errors'

export function DeleteAccountSection() {
  const { t } = useTranslation(['pages', 'common'])
  const { logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setError(null)
    setIsSubmitting(true)

    try {
      await deleteAccount({ password })
      addToast(t('pages:profile.deleteAccount.deleted'), 'success')
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(extractApiMessage(err, t('common:requestFailed')))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setIsOpen(false)
    setPassword('')
    setError(null)
  }

  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-danger">{t('pages:profile.deleteAccount.title')}</h3>
        <p className="text-sm text-muted">{t('pages:profile.deleteAccount.description')}</p>
      </div>

      <Button variant="outline" className="border-danger/40 text-danger" onClick={() => setIsOpen(true)}>
        {t('pages:profile.deleteAccount.button')}
      </Button>

      <Dialog
        open={isOpen}
        title={t('pages:profile.deleteAccount.dialogTitle')}
        description={t('pages:profile.deleteAccount.dialogDescription')}
        onClose={handleClose}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>
              {t('common:cancel')}
            </Button>
            <Button
              className="bg-danger text-white hover:bg-danger/90"
              disabled={isSubmitting || !password}
              onClick={handleDelete}
            >
              {isSubmitting ? t('common:saving') : t('common:confirm')}
            </Button>
          </>
        }
      >
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">{t('pages:profile.deleteAccount.password')}</span>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? <p className="mt-2 rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p> : null}
      </Dialog>
    </div>
  )
}
