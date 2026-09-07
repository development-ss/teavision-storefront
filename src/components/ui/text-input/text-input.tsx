import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export type TextInputProps = ComponentProps<'input'>

const inputClassName =
  'type-body-sm border-ink-faint focus:border-brand focus:shadow-focus focus:ring-0 focus:outline-none bg-card text-ink placeholder:text-ink-faint min-h-12 w-full rounded-sm border px-4 py-3.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40'

export function TextInput({
  className,
  type = 'text',
  ...props
}: TextInputProps) {
  return (
    <input type={type} className={cn(inputClassName, className)} {...props} />
  )
}
