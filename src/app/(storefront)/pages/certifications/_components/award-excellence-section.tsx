import { Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'

import { AWARD_EXCELLENCE } from '../_lib/data'

export function AwardExcellenceSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <Section.Intro
          eyebrow="Recognition"
          title={AWARD_EXCELLENCE.title}
          copy={AWARD_EXCELLENCE.copy}
        />

        <Card
          padding="lg"
          radius="lg"
          className="mx-auto mt-10 max-w-3xl text-center"
        >
          <Star aria-hidden="true" className="text-gold mx-auto size-16" />
          <p className="type-display text-brand mt-6">
            {AWARD_EXCELLENCE.stat}
          </p>
          <div className="mt-4 flex justify-center">
            <Badge variant="gold" label={AWARD_EXCELLENCE.label} />
          </div>
          <h3 className="type-heading-03 text-ink mt-4">
            {AWARD_EXCELLENCE.label}
          </h3>
          <p className="type-body text-ink-soft mt-4">
            {AWARD_EXCELLENCE.detailPrefix}{' '}
            <strong className="text-ink font-semibold">
              {AWARD_EXCELLENCE.detailHighlight}
            </strong>{' '}
            {AWARD_EXCELLENCE.detailSuffix}
          </p>
        </Card>
      </Section.Container>
    </Section.Root>
  )
}
