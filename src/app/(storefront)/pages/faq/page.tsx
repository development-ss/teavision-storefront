import type { Metadata } from 'next'

import { Faq } from '@/components/homepage/faq'
import { FAQ_GROUPS } from '@/lib/faq/content'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { cn } from '@/lib/utils'

import { HeroSection } from './_components/hero-section'
import { JsonLd } from './_components/json-ld'
import {
  FAQ_PAGE_DESCRIPTION,
  FAQ_PAGE_PATH,
  FAQ_PAGE_TITLE,
} from './_lib/data'

export const metadata: Metadata = withNoindexRobots({
  title: { absolute: FAQ_PAGE_TITLE },
  description: FAQ_PAGE_DESCRIPTION,
  openGraph: {
    title: FAQ_PAGE_TITLE,
    description: FAQ_PAGE_DESCRIPTION,
    url: FAQ_PAGE_PATH,
    type: 'website',
  },
  alternates: { canonical: FAQ_PAGE_PATH },
})

export default function Page() {
  return (
    <>
      <JsonLd />
      {/* Section 1 — Page heading on brand green */}
      <HeroSection />
      {/* FAQ groups */}
      {FAQ_GROUPS.map((group, index) => (
        <Faq
          key={group.id}
          eyebrow={null}
          description={null}
          title={group.title}
          items={[...group.items]}
          tone="surface"
          spacing="compact"
          className={cn(
            index === 0 && 'pt-section md:pt-section',
            index === FAQ_GROUPS.length - 1 && 'pb-section md:pb-section',
          )}
        />
      ))}
    </>
  )
}
