import { useTranslation } from 'react-i18next'

export function TemplatePlaceholderHelp() {
  const { t } = useTranslation(['pages'])

  const placeholders = [
    { key: '{student_name}', label: t('pages:whatsapp.placeholders.studentName') },
    { key: '{appointment_date}', label: t('pages:whatsapp.placeholders.appointmentDate') },
    { key: '{appointment_time}', label: t('pages:whatsapp.placeholders.appointmentTime') },
    { key: '{trainer_name}', label: t('pages:whatsapp.placeholders.trainerName') },
    { key: '{location}', label: t('pages:whatsapp.placeholders.location') },
  ]

  return (
    <div className="rounded-lg border border-border/70 bg-border/20 p-3">
      <p className="mb-2 text-xs font-medium text-muted">{t('pages:whatsapp.placeholders.title')}</p>
      <ul className="space-y-1">
        {placeholders.map((p) => (
          <li key={p.key} className="flex items-center gap-2 text-xs">
            <code className="rounded bg-border/60 px-1.5 py-0.5 font-mono text-[11px]">{p.key}</code>
            <span className="text-muted">{p.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
