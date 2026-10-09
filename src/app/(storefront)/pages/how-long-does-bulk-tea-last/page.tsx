import type { Metadata } from 'next'

import { DEFAULT_OG_IMAGE } from '@/lib/seo/default-og-image'

import { PageContent } from './_components/page-content'
import { HERO, META_DESCRIPTION, PAGE_PATH } from './_lib/data'

export const metadata: Metadata = {
  title: { absolute: HERO.title },
  description: META_DESCRIPTION,
  openGraph: {
    title: HERO.title,
    description: META_DESCRIPTION,
    url: PAGE_PATH,
    type: 'article',
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: { canonical: PAGE_PATH },
}

export default function Page() {
  return <PageContent />
}
