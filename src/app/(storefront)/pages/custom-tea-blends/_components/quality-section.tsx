import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { QUALITY_CARDS } from '../_lib/data'
import { QualityFeatureCard } from './quality-feature-card'

export function QualitySection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container>
        <div className="max-w-3xl">
          <Eyebrow>Quality assured</Eyebrow>
          <h2 className="type-heading-02 text-ink mt-3">
            Naturopath-guided and commercially grounded.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {QUALITY_CARDS.map((card) => (
            <QualityFeatureCard key={card.title} card={card} />
          ))}
        </div>
      </Section.Container>
    </Section.Root>
  )
}
