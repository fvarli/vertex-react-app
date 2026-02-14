import { cn } from '../../lib/utils'

type BadgeProps = {
  className?: string
  variant?: 'default' | 'success' | 'muted'
  children: React.ReactNode
}

export function Badge({ className, variant = 'default', children }: BadgeProps) {
  const classes =
    variant === 'success'
      ? 'bg-green-100 text-green-800'
      : variant === 'muted'
        ? 'bg-slate-200 text-slate-700'
        : 'bg-slate-900 text-white'

  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', classes, className)}>{children}</span>
}
