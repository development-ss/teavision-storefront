import { ArrowRight, Mail, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'

export function CtaSection() {
  return (
    <Section.Root tone="brand">
      <Section.Container className="flex flex-col gap-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="type-heading-02 text-paper">
            Ready to Order from Australia&apos;s{' '}
            <span className="text-gold">Premier Tea Suppliers?</span>
          </h2>
          <p className="type-body text-paper/80 mx-auto mt-5 max-w-3xl">
            Join hundreds of satisfied customers who trust us for premium bulk
            tea, tea bags, herbs, and spices. Experience the Teavision
            difference today.
          </p>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <Card
            padding="lg"
            radius="lg"
            className="border-paper/20 text-center"
          >
            <h3 className="type-heading-04 text-ink">Bulk Tea Orders</h3>
            <p className="type-body-sm text-ink-soft mt-3">
              Explore our extensive range of bulk tea online and loose tea bulk
              options. Perfect for cafes, restaurants, and retailers.
            </p>
            <Button
              href="/collections"
              variant="brand"
              className="mt-6"
              size="lg"
            >
              Browse Products
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Card>
        </div>

        <div className="text-paper flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <a
            href="tel:1300729617"
            className="type-label hover:text-gold focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-md px-3 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Phone className="size-4" aria-hidden="true" />
            1300 729 617
          </a>
          <a
            href="mailto:info@teavision.com.au"
            className="type-label hover:text-gold focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-md px-3 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Mail className="size-4" aria-hidden="true" />
            info@teavision.com.au
          </a>
        </div>

        <p className="type-body text-paper/75 text-center">
          Contact our team today to discuss your bulk tea order requirements.
        </p>
      </Section.Container>
    </Section.Root>
  )
}
