import { useTranslation } from 'react-i18next'
import { Badge } from '../../../components/ui/badge'
import type { TopTrainer } from '../types'

type Props = {
  trainers: TopTrainer[]
}

export function TopTrainersCard({ trainers }: Props) {
  const { t } = useTranslation(['pages'])

  if (trainers.length === 0) return null

  return (
    <div className="panel stagger-in">
      <h3 className="mb-3 text-lg font-semibold tracking-tight">{t('pages:dashboard.topTrainers.title')}</h3>
      <p className="mb-4 text-sm text-muted">{t('pages:dashboard.topTrainers.description')}</p>
      <ul className="space-y-2">
        {trainers.map((trainer, index) => (
          <li key={trainer.trainer_id} className="flex items-center justify-between rounded-xl border border-border/70 bg-card/75 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{trainer.trainer_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">
                {trainer.completed_appointments} {t('pages:dashboard.topTrainers.sessions')}
              </span>
              <Badge variant={trainer.completion_rate >= 80 ? 'success' : 'muted'}>
                {trainer.completion_rate}%
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
