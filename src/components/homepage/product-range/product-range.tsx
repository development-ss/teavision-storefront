import { Eyebrow, Section } from '@/components/ui'
import type { HomepageContent } from '@/lib/sanity/home-page'

import { OverlayImageCard } from '../overlay-image-card'

export type ProductRangeProps = HomepageContent['productRange']

export function ProductRange({ cards, intro }: ProductRangeProps) {
  return (
    <Section.Root id="product-range" tone="surface">
      <Section.Container>
        {/* Split section head: Eyebrow + heading left, description right */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {intro.eyebrow && (
              <Eyebrow className="mb-4">{intro.eyebrow}</Eyebrow>
            )}
            <h2 className="type-heading-01">{intro.title}</h2>
          </div>
          {intro.copy && (
            <p className="text-ink-soft max-w-[34ch] lg:text-right">
              {intro.copy}
            </p>
          )}
        </div>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <li key={card.href} className="overflow-hidden rounded-lg">
              <OverlayImageCard card={card} />
            </li>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
