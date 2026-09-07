import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export type TextareaProps = ComponentProps<'textarea'>

const textareaClassName =
  'type-body-sm border-ink-faint focus:border-brand focus:shadow-focus focus:ring-0 focus:outline-none bg-card text-ink placeholder:text-ink-faint min-h-36 w-full resize-y rounded-sm border px-4 py-3.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40'

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(textareaClassName, className)} {...props} />
}
