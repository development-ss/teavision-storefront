import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ContactSection } from '@/components/contact'
import { Section } from '@/components/ui'
import { submitContactFormAction } from '@/lib/contact/actions'
import { getPage, getPagePath } from '@/lib/shopify/operations/storefront-page'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { getMetaDescription } from '../[...slug]/_lib/page-formatting'
import { resolvePageProfile } from '../[...slug]/_lib/page-profile'
import { Hero } from '../[...slug]/_components/hero'
import { TermsConditionsContent } from './_components/terms-conditions-content'

const TERMS_CONDITIONS_HANDLE = 'terms-conditions'

async function getTermsConditionsPage() {
  return getPage(TERMS_CONDITIONS_HANDLE)
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getTermsConditionsPage()

  if (!page) {
    return withNoindexRobots({ title: 'Page Not Found' })
  }

  const description = getMetaDescription(page)
  const title = page.seo.title ?? page.title
  const canonical = getPagePath(page.handle)

  return withNoindexRobots({
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    alternates: { canonical },
  })
}

export default async function TermsConditionsPage() {
  const page = await getTermsConditionsPage()

  if (!page) {
    notFound()
  }

  const profile = resolvePageProfile(page.handle)

  return (
    <>
      <Hero
        compact
        page={page}
        profile={profile}
        showActions={false}
        showKicker={false}
        titleClassName="max-w-none md:whitespace-nowrap"
      />
      <Section.Root tone="surface" className="border-hairline border-t">
        <Section.Container>
          <TermsConditionsContent />
        </Section.Container>
      </Section.Root>
      <ContactSection action={submitContactFormAction} />
    </>
  )
}
