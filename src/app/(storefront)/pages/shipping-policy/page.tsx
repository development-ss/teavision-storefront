import type { Metadata } from 'next'

import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { getLegalPolicy } from '@/lib/legal/policies'
import { withNoindexRobots } from '@/lib/seo/noindex'

const policy = getLegalPolicy('shipping-policy')

export const metadata: Metadata = withNoindexRobots({
  title: policy.title,
  description: policy.description,
  alternates: { canonical: policy.href },
  openGraph: {
    title: policy.title,
    description: policy.description,
    url: policy.href,
    type: 'website',
  },
})

export default function ShippingPolicyPage() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="max-w-prose">
          <h1 id="shipping-policy-title" className="type-heading-02 text-ink">
            {policy.title}
          </h1>

          <Card
            as="article"
            aria-labelledby="shipping-policy-title"
            padding="lg"
            radius="md"
            className="border-hairline bg-card mt-8"
          >
            <p className="type-body text-ink-soft">
              Teavision uses third-party freight and logistics companies to
              deliver its products to customers. The delivery timeframes
              provided by Teavision are subject to change due to the nature of
              these service providers, and deliveries may arrive later than
              expected. We apologise for any inconvenience caused and will
              endeavour to get your product to you as quickly as possible and in
              good condition.
            </p>
            <p className="type-body text-ink-soft mt-4">
              If you receive a damaged product or feel the shipment is lost or
              delayed beyond a reasonable timeframe (generally seven days or
              longer), please get in touch with our team so that we can assist
              you.
            </p>
            <p className="type-body text-ink-soft mt-4">
              Please note that we do not deliver to PO Box addresses. Our
              couriers do not provide that service because we do not use
              Australia Post.
            </p>
          </Card>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
