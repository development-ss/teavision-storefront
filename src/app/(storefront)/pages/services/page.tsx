import type { Metadata } from 'next'

import { submitContactFormAction } from '@/lib/contact/actions'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { PageContent } from './_components/page-content'

const TITLE = 'Tea Blending, Packing & Wholesale Services'
const DESCRIPTION =
  'Explore Teavision custom tea blending, private label packing, tea bag manufacture and bulk ingredient supply, with expert support from concept to delivery.'

export const metadata: Metadata = withNoindexRobots({
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/pages/services' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/pages/services',
    type: 'website',
  },
})

export default function Page() {
  return <PageContent action={submitContactFormAction} />
}
