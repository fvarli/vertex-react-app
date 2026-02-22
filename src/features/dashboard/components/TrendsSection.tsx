import { useTranslation } from 'react-i18next'
import type { DashboardTrends } from '../types'

type Props = {
  trends: DashboardTrends
}

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'stable' }) {
  if (direction === 'up') return <span className="text-lg text-success">&#8593;</span>
  if (direction === 'down') return <span className="text-lg text-danger">&#8595;</span>
  return <span className="text-lg text-muted">&#8594;</span>
}

export function TrendsSection({ trends }: Props) {
  const { t } = useTranslation(['pages'])

  const appointmentTrend: 'up' | 'down' | 'stable' =
    trends.appointments_vs_last_week > 0 ? 'up' : trends.appointments_vs_last_week < 0 ? 'down' : 'stable'

  return (
    <div className="panel stagger-in">
      <h3 className="mb-3 text-lg font-semibold tracking-tight">{t('pages:dashboard.trends.title')}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.trends.appointmentsVsLastWeek')}</p>
            <TrendIcon direction={appointmentTrend} />
          </div>
          <p className="mt-2 text-3xl font-extrabold">
            {trends.appointments_vs_last_week > 0 ? '+' : ''}
            {trends.appointments_vs_last_week}%
          </p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.trends.newStudents')}</p>
          <p className="mt-2 text-3xl font-extrabold">{trends.new_students}</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.08em] text-muted">{t('pages:dashboard.trends.completionRate')}</p>
            <TrendIcon direction={trends.completion_rate_trend} />
          </div>
          <p className="mt-2 text-3xl font-extrabold">{trends.completion_rate}%</p>
        </div>
      </div>
    </div>
  )
}
