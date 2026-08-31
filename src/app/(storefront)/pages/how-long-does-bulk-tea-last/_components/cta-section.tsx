import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

import { CTA } from '../_lib/data'

export function CtaSection() {
  return (
    <Section.Root tone="brand">
      <Section.Container className="text-center">
        <p className="type-heading-02 text-gold mx-auto max-w-[20ch] text-balance italic">
          {CTA.tagline}
        </p>
        <p className="type-body-lg text-paper/85 mx-auto mt-6 max-w-[62ch]">
          {CTA.body}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={CTA.primary.href} variant="inverse" size="cta">
            {CTA.primary.label}
          </Button>
          <Button
            href={CTA.secondary.href}
            variant="inverseSecondary"
            size="cta"
          >
            {CTA.secondary.label}
          </Button>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
