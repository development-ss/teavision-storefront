import type { ReactNode } from 'react'
import { Pause, Play } from 'lucide-react'

import { Section } from '@/components/ui/section'
import { cn } from '@/lib/utils'

type TestimonialsMarqueeProps = {
  children: ReactNode
  itemCount: number
}

export function TestimonialsMarquee({
  children,
  itemCount,
}: TestimonialsMarqueeProps) {
  // Four cards fill the widest container. Smaller sets stay grouped and scroll
  // manually, rather than leaving gaps or repeating the same quote on screen.
  const canLoop = itemCount >= 4
  const listClasses = cn(
    'flex gap-5 px-gutter',
    canLoop && 'auto-scroll:px-0 auto-scroll:pr-5',
  )

  return (
    <div className="group/marquee max-w-wide mx-auto mt-8 md:mt-10">
      {canLoop && (
        <Section.Container className="auto-scroll:flex mb-4 hidden justify-end">
          <label className="text-brand-deep hover:bg-paper has-focus-visible:ring-ring relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-semibold has-focus-visible:ring-2 has-focus-visible:ring-offset-2">
            <input
              type="checkbox"
              aria-label="Pause or resume automatic scrolling"
              className="peer sr-only"
            />
            <Pause aria-hidden="true" className="size-4 peer-checked:hidden" />
            <Play
              aria-hidden="true"
              className="hidden size-4 peer-checked:block"
            />
            <span className="peer-checked:hidden">Pause</span>
            <span className="hidden peer-checked:block">Resume</span>
          </label>
        </Section.Container>
      )}
      <div
        role="region"
        aria-label="Customer testimonial excerpts"
        tabIndex={itemCount > 1 ? 0 : undefined}
        className={cn(
          'focus-visible:ring-ring relative overflow-x-auto overscroll-x-contain pb-3 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
          canLoop &&
            'auto-scroll:overflow-hidden auto-scroll:mask-x-from-[calc(100%-3rem)]',
        )}
      >
        <div
          className={cn(
            'flex w-max',
            canLoop &&
              'auto-scroll:animate-marquee auto-scroll:[animation-duration:60s] group-focus-within/marquee:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused] group-has-checked/marquee:[animation-play-state:paused]',
          )}
        >
          <ul aria-label="Partner testimonials" className={listClasses}>
            {children}
          </ul>
          {canLoop && (
            <ul
              aria-hidden="true"
              inert
              className={cn(listClasses, 'auto-scroll:flex hidden')}
            >
              {children}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
