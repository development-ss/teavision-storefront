import type { Metadata } from 'next'

import { Section } from '@/components/ui/section'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { SupplyPaths } from './_components/supply-paths'
import { WholesaleHero } from './_components/wholesale-hero'
import { WholesaleInclusions } from './_components/wholesale-inclusions'

export const metadata: Metadata = withNoindexRobots({
  title: { absolute: 'Wholesale Supply' },
  description:
    'Buy bulk tea, herbs and spices direct from Teavision for cafes, restaurants, and retailers across Australia.',
  openGraph: {
    title: 'Wholesale Supply',
    description:
      'Buy bulk tea, herbs and spices direct from Teavision for cafes, restaurants, and retailers.',
    url: '/pages/wholesale',
  },
  alternates: { canonical: '/pages/wholesale' },
})

export default function Page() {
  return (
    <>
      <WholesaleHero />

      <Section.Root tone="surface">
        <Section.Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.62fr)_minmax(22rem,0.38fr)] lg:items-start">
            <SupplyPaths />
            <WholesaleInclusions />
          </div>
        </Section.Container>
      </Section.Root>
    </>
  )
}
