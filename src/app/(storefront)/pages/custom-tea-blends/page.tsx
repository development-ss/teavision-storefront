import type { Metadata } from 'next'

import {
  CUSTOM_TEA_BLEND_DESCRIPTION,
  CUSTOM_TEA_BLEND_META_TITLE,
  CUSTOM_TEA_BLEND_PAGE_PATH,
} from '@/lib/contact/custom-tea-blend'
import { DEFAULT_OG_IMAGE } from '@/lib/seo/default-og-image'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { PageContent } from './_components/page-content'

export const metadata: Metadata = withNoindexRobots({
  title: { absolute: CUSTOM_TEA_BLEND_META_TITLE },
  description: CUSTOM_TEA_BLEND_DESCRIPTION,
  openGraph: {
    title: CUSTOM_TEA_BLEND_META_TITLE,
    description: CUSTOM_TEA_BLEND_DESCRIPTION,
    url: CUSTOM_TEA_BLEND_PAGE_PATH,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: { canonical: CUSTOM_TEA_BLEND_PAGE_PATH },
})

export default function Page() {
  return <PageContent />
}
