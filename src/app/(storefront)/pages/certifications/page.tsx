import type { Metadata } from 'next'

import { DEFAULT_OG_IMAGE } from '@/lib/seo/default-og-image'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { PageContent } from './_components/page-content'

const TITLE = 'Certifications and Quality Standards | Teavision'
const DESCRIPTION =
  'Teavision certifications and quality systems for wholesale tea, herbs and spices, including ACO certified organic, USDA organic and food safety standards.'

export const metadata: Metadata = withNoindexRobots({
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/pages/certifications',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: { canonical: '/pages/certifications' },
})

export default function Page() {
  return <PageContent />
}
