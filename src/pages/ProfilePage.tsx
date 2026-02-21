import { useTranslation } from 'react-i18next'
import { AvatarSection } from '../features/profile/components/AvatarSection'
import { ProfileInfoSection } from '../features/profile/components/ProfileInfoSection'
import { PasswordSection } from '../features/profile/components/PasswordSection'
import { DeleteAccountSection } from '../features/profile/components/DeleteAccountSection'

export function ProfilePage() {
  const { t } = useTranslation(['pages'])

  return (
    <div className="page-surface space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('pages:profile.sectionLabel')}</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{t('pages:profile.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('pages:profile.description')}</p>
      </div>

      <AvatarSection />
      <ProfileInfoSection />
      <PasswordSection />
      <DeleteAccountSection />
    </div>
  )
}
