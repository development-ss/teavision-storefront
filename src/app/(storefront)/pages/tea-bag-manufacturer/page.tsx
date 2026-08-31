import type { Metadata } from 'next'

import { ContactSection } from '@/components/contact/contact-section'
import { Testimonials } from '@/components/homepage/testimonials'
import { submitContactFormAction } from '@/lib/contact/actions'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { CtaSection } from './_components/cta-section'
import { HeroSection } from './_components/hero-section'
import { JsonLd } from './_components/json-ld'
import { PackagingSection } from './_components/packaging-section'
import { ProcessSection } from './_components/process-section'
import { ReadyToShipSection } from './_components/ready-to-ship-section'
import { SolutionsSection } from './_components/solutions-section'
import { StatsSection } from './_components/stats-section'

const PAGE_PATH = '/pages/tea-bag-manufacturer'
const PAGE_TITLE = 'Tea Bag Manufacturer'
const PAGE_DESCRIPTION =
  'Custom tea bags and blends for global brands. Over 10 million tea bags produced annually with private label packaging and international shipping from Australia. MOQ from 8,000 bags.'

export const metadata: Metadata = withNoindexRobots({
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_PATH,
    type: 'website',
  },
  alternates: { canonical: PAGE_PATH },
})

export default function Page() {
  return (
    <>
      <JsonLd />
      {/* Section 1 — Hero */}
      <HeroSection />
      {/* Section 2 — Statistics band */}
      <StatsSection />
      {/* Section 3 — Manufacturing solutions */}
      <SolutionsSection />
      {/* Section 4 — CTA banner */}
      <CtaSection
        title="Ready to Elevate Your Tea Brand?"
        copy="Speak with our tea specialists about custom blends, private-label packaging, and global logistics in one simple step."
      />
      {/* Section 5 — Tea bag & packaging options */}
      <PackagingSection />
      {/* Section 6 — Simple 3-step process */}
      <ProcessSection />
      {/* Section 7 — CTA banner */}
      <CtaSection
        title="Let's Craft Your Signature Blend"
        copy="Speak with our tea specialists about custom blends, private-label packaging, and global logistics in one simple step."
      />
      {/* Section 8 — Ready-to-ship tea bags */}
      <ReadyToShipSection />
      {/* Section 9 — Testimonials */}
      <Testimonials />
      {/* Section 10 — Contact */}
      <ContactSection action={submitContactFormAction} />
    </>
  )
}
