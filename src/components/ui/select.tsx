import * as React from 'react'
import { cn } from '../../lib/utils'

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn('h-9 w-full rounded-md border border-border bg-white px-3 py-1 text-sm outline-none focus-visible:ring-2', className)}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = 'Select'

export { Select }
