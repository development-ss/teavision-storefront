import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

import { CTA } from '../_lib/data'

export function CtaSection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container className="text-center">
        <h2 className="type-heading-02 text-ink">{CTA.title}</h2>
        <p className="type-body-lg text-ink-soft mx-auto mt-5 max-w-2xl">
          {CTA.copy}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={CTA.primary.href} variant="primary" size="cta">
            {CTA.primary.label}
          </Button>
          <Button href={CTA.secondary.href} variant="secondary" size="cta">
            {CTA.secondary.label}
          </Button>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
