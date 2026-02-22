import { cn } from '../../lib/utils'

type BadgeProps = {
  className?: string
  variant?: 'default' | 'success' | 'muted' | 'warning' | 'danger'
  children: React.ReactNode
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-primary text-white dark:text-slate-950',
  success: 'bg-success/20 text-success',
  muted: 'bg-border text-muted',
  warning: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  danger: 'bg-danger/20 text-danger',
}

export function Badge({ className, variant = 'default', children }: BadgeProps) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', variantClasses[variant], className)}>{children}</span>
}
