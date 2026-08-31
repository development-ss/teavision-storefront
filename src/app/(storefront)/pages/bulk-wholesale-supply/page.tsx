import type { Metadata } from 'next'

import { ContactSection } from '@/components/contact/contact-section'
import { submitContactFormAction } from '@/lib/contact/actions'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { CtaSection } from './_components/cta-section'
import { FaqSection } from './_components/faq-section'
import { FeaturesGrid3 } from './_components/features-grid-3'
import { HeroSection } from './_components/hero-section'
import { ImportFeaturesSection } from './_components/import-features-section'
import { JsonLd } from './_components/json-ld'
import { LogisticsSection } from './_components/logistics-section'
import { ProcessSection } from './_components/process-section'
import { WhyChooseSection } from './_components/why-choose-section'
import { PAGE_DESCRIPTION, PAGE_PATH, PAGE_TITLE } from './_lib/data'

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
      {/* Section 1 — Hero split */}
      <HeroSection />
      {/* Section 2 — Features grid 3-col */}
      <FeaturesGrid3 />
      {/* Section 3 — Freight & logistics */}
      <LogisticsSection />
      {/* Section 4 — What you can import */}
      <ImportFeaturesSection />
      {/* Section 5 — Why choose Teavision */}
      <WhyChooseSection />
      {/* Section 6 — How it works */}
      <ProcessSection />
      {/* Section 7 — FAQ */}
      <FaqSection />
      {/* Section 8 — CTA banner */}
      <CtaSection />
      {/* Section 9 — Contact */}
      <ContactSection action={submitContactFormAction} />
    </>
  )
}
