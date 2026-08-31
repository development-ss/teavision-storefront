import type { Metadata } from 'next'

import { ContactSection } from '@/components/contact/contact-section'
import { submitContactFormAction } from '@/lib/contact/actions'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { CapabilitiesSection } from './_components/capabilities-section'
import { CertsStrip } from './_components/certs-strip'
import { HeroSection } from './_components/hero-section'
import { JsonLd } from './_components/json-ld'
import { PackagingSection } from './_components/packaging-section'
import { ProcessSection } from './_components/process-section'
import { TopProductsSection } from './_components/top-products-section'
import { YourBrandSection } from './_components/your-brand-section'

const PAGE_PATH = '/pages/private-label-packing'
const PAGE_TITLE = 'Private Label Packing'
const PAGE_DESCRIPTION =
  "Australia's #1 private label tea partner. Custom blends, tea bag manufacturing, extract powders, and full packaging under your brand. Low MOQs, export-ready docs."

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
      {/* Section 2 — Certifications strip */}
      <CertsStrip />
      {/* Section 3 — Your Brand, Our Product */}
      <YourBrandSection />
      {/* Section 4 — Best Selling Custom Label Ideas */}
      <CapabilitiesSection />
      {/* Section 5 — Packaging options & formats */}
      <PackagingSection />
      {/* Section 6 — From brief to shelf in 5 steps */}
      <ProcessSection />
      {/* Section 7 — Top 20 Private Label Products */}
      <TopProductsSection />
      {/* Section 8 — Contact */}
      <ContactSection action={submitContactFormAction} />
    </>
  )
}
