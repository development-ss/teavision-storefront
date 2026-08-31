import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

import { CTA } from '../_lib/data'

export function CtaSection() {
  return (
    <Section.Root tone="brand">
      <Section.Container className="text-center">
        <h2 className="type-heading-02 text-paper">{CTA.title}</h2>
        <p className="type-body-lg text-paper/80 mx-auto mt-5 max-w-3xl">
          {CTA.copy}
        </p>
        <Button href={CTA.href} variant="inverse" size="cta" className="mt-8">
          {CTA.action}
        </Button>
      </Section.Container>
    </Section.Root>
  )
}
