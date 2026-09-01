import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export type FormLabelProps = ComponentProps<'label'> & {
  required?: boolean
}

export function FormLabel({
  children,
  className,
  required,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={cn('type-mono-meta text-ink-faint block', className)}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="text-danger ml-1">
          *
        </span>
      ) : null}
    </label>
  )
}
