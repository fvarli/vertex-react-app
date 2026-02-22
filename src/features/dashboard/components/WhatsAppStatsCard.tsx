import { useTranslation } from 'react-i18next'
import { Badge } from '../../../components/ui/badge'
import type { WhatsAppStats } from '../types'

type Props = {
  stats: WhatsAppStats
}

export function WhatsAppStatsCard({ stats }: Props) {
  const { t } = useTranslation(['pages'])

  const rateVariant = stats.send_rate >= 80 ? 'success' : stats.send_rate < 50 ? 'danger' : 'warning'

  return (
    <div className="panel stagger-in">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">{t('pages:dashboard.whatsapp.title')}</h3>
        <Badge variant={rateVariant} className="text-[11px]">
          {stats.send_rate}%
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.whatsapp.todayTotal')}</p>
          <p className="mt-2 text-3xl font-extrabold">{stats.today_total}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.whatsapp.sent')}</p>
          <p className="mt-2 text-3xl font-extrabold">{stats.sent}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.whatsapp.notSent')}</p>
          <p className="mt-2 text-3xl font-extrabold">{stats.not_sent}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.whatsapp.sendRate')}</p>
          <p className="mt-2 text-3xl font-extrabold">{stats.send_rate}%</p>
        </div>
      </div>
    </div>
  )
}
