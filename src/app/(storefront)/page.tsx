import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { ContactSection } from '@/components/contact/contact-section'
import { CertificationCoverage } from '@/components/homepage/certification-coverage'
import { Cta } from '@/components/homepage/catalogues'
import { Faq } from '@/components/homepage/faq'
import { HomepageHero } from '@/components/homepage/hero'
import { HomepageNewsletter } from '@/components/homepage/newsletter'
import { OrganicHerbs } from '@/components/homepage/organic-herbs'
import { PrivateLabel } from '@/components/homepage/private-label'
import { ProductRange } from '@/components/homepage/product-range'
import { SupplyChain } from '@/components/homepage/supply-chain'
import { SupplyChainProtection } from '@/components/homepage/supply-chain-protection'
import { TeaJournal } from '@/components/homepage/tea-journal'
import { Testimonials } from '@/components/homepage/testimonials'
import {
  sendNewsletterSignupFormAction,
  submitContactFormAction,
} from '@/lib/contact/actions'
import { getDraftHomepage, getHomepage } from '@/lib/sanity/home-page'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/homepage-json-ld'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { serializeInlineJson } from '@/lib/seo/serialize-inline-json'

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await getHomepage()
  const { seo } = homepage

  return withNoindexRobots({
    title: { absolute: seo.title },
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonicalPath,
      type: 'website',
      images: seo.ogImage
        ? [
            {
              url: seo.ogImage.src,
              alt: seo.ogImage.alt,
              width: seo.ogImage.width,
              height: seo.ogImage.height,
            },
          ]
        : undefined,
    },
    alternates: { canonical: seo.canonicalPath },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
  })
}

export default async function HomePage() {
  const { isEnabled } = await draftMode()
  const homepage = isEnabled ? await getDraftHomepage() : await getHomepage()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeInlineJson(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeInlineJson(websiteJsonLd) }}
      />

      <div className="bg-paper">
        <HomepageHero hero={homepage.hero} />
        <ProductRange
          cards={homepage.productRange.cards}
          intro={homepage.productRange.intro}
        />
        <Testimonials {...homepage.testimonials} />
        <PrivateLabel
          cards={homepage.privateLabel.cards}
          intro={homepage.privateLabel.intro}
        />
        <OrganicHerbs {...homepage.organicHerbs} />
        <SupplyChain {...homepage.supplyChain} />
        <CertificationCoverage {...homepage.certificationCoverage} />
        <SupplyChainProtection {...homepage.supplyChainProtection} />
        <TeaJournal {...homepage.teaJournal} />
        <ContactSection
          action={submitContactFormAction}
          {...homepage.contact}
        />
        <Cta {...homepage.catalogueCta} />
        <Faq {...homepage.faq} />
        <HomepageNewsletter
          action={sendNewsletterSignupFormAction}
          intro={homepage.newsletter.intro}
        />
      </div>
    </>
  )
}
