import type { ComponentProps, ReactNode } from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'outOfStock'
  | 'sale'
  | 'new'
  | 'certification'
  | 'organic'
  | 'gold'
  | 'onDark'

export type BadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
  variant: BadgeVariant
  label?: string
  icon?: ReactNode
}

const badgeVariants = cva(
  'inline-flex items-center gap-2 rounded-full border border-hairline bg-card px-3 py-1.5 type-mono-meta text-ink-soft',
  {
    variants: {
      variant: {
        outOfStock: 'border-danger/30 bg-danger-tint text-danger',
        sale: 'border-gold-deep/40 bg-gold-tint text-gold-deep',
        new: 'border-hairline bg-paper-2 text-ink-soft',
        certification: 'border-hairline bg-paper-2 text-ink-soft',
        organic:
          'border-brand/30 bg-brand-tint text-brand before:size-1.5 before:rounded-full before:bg-current',
        gold: 'border-gold-deep/40 bg-gold-tint text-gold-deep',
        onDark: 'border-paper/30 bg-paper/15 text-paper',
      } satisfies Record<BadgeVariant, string>,
    },
  },
)

const defaultLabels: Partial<Record<BadgeVariant, string>> = {
  outOfStock: 'Sold out',
  sale: 'Sale',
  new: 'New',
}

export function Badge({
  variant,
  label,
  icon,
  className,
  ...props
}: BadgeProps) {
  const text = label ?? defaultLabels[variant]
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon}
      {text}
    </span>
  )
}
