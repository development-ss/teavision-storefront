import type { ComponentPropsWithoutRef } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Section } from '../section'

export type StatBandItem = {
  icon: LucideIcon
  label: string
  value: string
}

export type StatBandProps = Omit<
  ComponentPropsWithoutRef<'section'>,
  'aria-label' | 'children'
> & {
  'aria-label': string
  items: readonly StatBandItem[]
}

export function StatBand({
  'aria-label': ariaLabel,
  className,
  items,
  ...props
}: StatBandProps) {
  return (
    <Section.Root
      aria-label={ariaLabel}
      className={cn('border-paper/12 border-y', className)}
      spacing="none"
      tone="brand"
      {...props}
    >
      <Section.Container>
        <ul className="grid grid-cols-2 xl:grid-cols-4" role="list">
          {items.map((item, index) => {
            const Icon = item.icon
            const isLastItem = index === items.length - 1
            const isInFirstRow = index < items.length - 2
            const isLeftColumn = index % 2 === 0

            return (
              <li
                key={`${item.value}-${item.label}`}
                className={cn(
                  'flex min-h-32 flex-col justify-center px-4 py-6 sm:px-7 xl:min-h-36 xl:px-9',
                  isInFirstRow && 'border-paper/12 border-b',
                  isLeftColumn && !isLastItem && 'border-paper/12 border-r',
                  'xl:border-b-0',
                  !isLastItem && 'xl:border-paper/12 xl:border-r',
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    aria-hidden="true"
                    className="text-gold size-5 shrink-0 sm:size-6"
                    strokeWidth={1.75}
                  />
                  <p className="type-heading-02 text-paper whitespace-nowrap tabular-nums">
                    {item.value}
                  </p>
                </div>
                <p className="type-body-sm text-paper/75 mt-2 max-w-[24ch] leading-snug">
                  {item.label}
                </p>
              </li>
            )
          })}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
