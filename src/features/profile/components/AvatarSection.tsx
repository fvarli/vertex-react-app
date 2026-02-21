import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/button'
import { useAuth } from '../../auth/auth-context'
import { useToast } from '../../toast/toast-context'
import { uploadAvatar, deleteAvatar } from '../api'
import { extractApiMessage } from '../../../lib/api-errors'

const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function AvatarSection() {
  const { t } = useTranslation(['pages', 'common'])
  const { user, refreshProfile } = useAuth()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const initials = [user?.name?.[0], user?.surname?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset the input so the same file can be selected again
    event.target.value = ''

    if (!ACCEPTED_TYPES.includes(file.type)) {
      addToast(t('pages:profile.avatar.invalidType'), 'error')
      return
    }

    if (file.size > MAX_SIZE) {
      addToast(t('pages:profile.avatar.tooLarge'), 'error')
      return
    }

    setIsUploading(true)
    try {
      await uploadAvatar(file)
      await refreshProfile()
      addToast(t('pages:profile.avatar.uploaded'), 'success')
    } catch (err) {
      addToast(extractApiMessage(err, t('common:requestFailed')), 'error')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteAvatar()
      await refreshProfile()
      addToast(t('pages:profile.avatar.removed'), 'success')
    } catch (err) {
      addToast(extractApiMessage(err, t('common:requestFailed')), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="panel space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t('pages:profile.avatar.title')}</h3>
        <p className="text-sm text-muted">{t('pages:profile.avatar.description')}</p>
      </div>

      <div className="flex items-center gap-4">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-16 w-16 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/20 text-lg font-bold text-muted">
            {initials}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? t('common:saving') : t('pages:profile.avatar.upload')}
          </Button>
          {user?.avatar ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? t('common:saving') : t('pages:profile.avatar.remove')}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
