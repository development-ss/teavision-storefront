import { Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

export function CtaSection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="type-heading-01 text-brand max-w-[20ch] text-balance">
            Ready to Get Started?
          </h2>
          <p className="type-lede text-ink-soft max-w-[52ch]">
            Contact us today to discover how we can elevate your product
            offerings with global, high-quality tea and ingredients.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button href="tel:+611300729617" variant="secondary" size="lg">
              <Phone className="size-4" aria-hidden="true" />
              Call 1300 729 617
            </Button>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
