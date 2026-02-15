import { cn } from '../../lib/utils'

type BadgeProps = {
  className?: string
  variant?: 'default' | 'success' | 'muted'
  children: React.ReactNode
}

export function Badge({ className, variant = 'default', children }: BadgeProps) {
  const classes =
    variant === 'success'
      ? 'bg-success/20 text-success'
      : variant === 'muted'
        ? 'bg-border text-muted'
        : 'bg-primary text-white dark:text-slate-950'

  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', classes, className)}>{children}</span>
}
