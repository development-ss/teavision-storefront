import { Plus } from 'lucide-react'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import type { SectionRootProps } from '@/components/ui/section'
import type { HomepageContent } from '@/lib/sanity/home-page'
import { cn } from '@/lib/utils'

import { FAQ_FIXTURE, type FaqItem } from '../content'

type FaqProps = Pick<SectionRootProps, 'className' | 'spacing' | 'tone'> & {
  intro?: HomepageContent['faq']['intro']
  items?: HomepageContent['faq']['items'] | FaqItem[]
  eyebrow?: string | null
  title?: string
  description?: string | null
}

export function Faq({
  className,
  description,
  eyebrow,
  intro,
  items = FAQ_FIXTURE.items,
  spacing,
  title,
  tone = 'sunken',
}: FaqProps) {
  const resolvedEyebrow =
    eyebrow !== undefined
      ? eyebrow
      : (intro?.eyebrow ?? FAQ_FIXTURE.intro.eyebrow)
  const resolvedTitle = title ?? intro?.title ?? FAQ_FIXTURE.intro.title
  const resolvedDescription =
    description !== undefined
      ? description
      : (intro?.copy ?? FAQ_FIXTURE.intro.copy)

  return (
    <Section.Root tone={tone} spacing={spacing} className={className}>
      <Section.Container variant="base">
        {/* Design constrains FAQ content to 880px (55rem) */}
        <div className="mx-auto max-w-220 text-center">
          {resolvedEyebrow ? (
            <Eyebrow rule={false} className="justify-center">
              {resolvedEyebrow}
            </Eyebrow>
          ) : null}
          <h2
            className={cn(
              'type-heading-01 text-ink',
              resolvedEyebrow && 'mt-4',
            )}
          >
            {resolvedTitle}
          </h2>
          {resolvedDescription ? (
            <p className="type-lede text-ink-soft mt-4">
              {resolvedDescription}
            </p>
          ) : null}
        </div>

        <div className="border-hairline mx-auto mt-11 max-w-220 border-b">
          {items.map((faq) => (
            <details
              key={faq.question}
              className="group border-hairline border-t"
            >
              <summary className="focus-visible:ring-ring font-display text-ink hover:text-brand flex cursor-pointer list-none items-center justify-between gap-5 py-6.5 text-[clamp(1.1rem,1.8vw,1.4rem)] transition-colors marker:content-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="border-hairline text-brand group-open:border-brand group-open:bg-brand group-open:text-paper relative grid size-7.5 shrink-0 place-items-center rounded-full border transition-transform group-open:rotate-45 motion-reduce:transition-none"
                >
                  {/* 16px SVG plus per design .faq__q .ic — a text glyph sits small/off-center */}
                  <Plus className="size-4" strokeWidth={1.8} />
                </span>
              </summary>
              <div className="text-ink-soft pb-6.5">
                <p className="max-w-[60ch] whitespace-pre-line">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </Section.Container>
    </Section.Root>
  )
}
