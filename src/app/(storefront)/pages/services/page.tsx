import type { Metadata } from 'next'

import { submitContactFormAction } from '@/lib/contact/actions'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { PageContent } from './_components/page-content'

const TITLE = 'Tea Blending, Packing & Wholesale Services'
const DESCRIPTION =
  'Explore Teavision custom tea blending, private label packing, tea bag manufacture and bulk ingredient supply, with expert support from concept to delivery.'
const SHARE_IMAGE = {
  url: '/images/our-story/our-story-awards.webp',
  width: 4032,
  height: 3024,
  alt: 'Teavision warehouse with bulk ingredients, packing stations and production equipment',
}

export const metadata: Metadata = withNoindexRobots({
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/pages/services' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/pages/services',
    type: 'website',
    siteName: 'Teavision',
    locale: 'en_AU',
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
})

export default function Page() {
  return <PageContent action={submitContactFormAction} />
}
