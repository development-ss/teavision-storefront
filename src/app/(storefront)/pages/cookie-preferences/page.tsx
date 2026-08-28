import type { Metadata } from 'next'

import { ConsentPreferences } from '@/components/consent'
import { Card, Section } from '@/components/ui'
import { getLegalPolicy } from '@/lib/legal/policies'
import { withNoindexRobots } from '@/lib/seo/noindex'

const policy = getLegalPolicy('cookie-preferences')

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

export default function CookiePreferencesPage() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="max-w-3xl">
          <h1 className="type-heading-02 text-ink">{policy.title}</h1>
          <p className="type-body text-ink-soft mt-5">
            Essential cookies keep our website secure, remember your cart and
            take you through checkout. With your permission, we also use
            analytics and marketing cookies. Choose which optional cookies you
            allow and change your preferences at any time.
          </p>

          <Card as="article" padding="lg" radius="md" className="mt-8">
            <h2 className="type-heading-05 text-ink">Your cookie choices</h2>
            <div className="mt-5">
              <ConsentPreferences />
            </div>
            <p className="type-body text-ink-soft mt-4">
              Having trouble saving your choices? Email info@teavision.com.au
              and we can help you update them.
            </p>
          </Card>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
