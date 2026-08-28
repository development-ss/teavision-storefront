import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  getPage,
  getPageHandleFromSlug,
  getPagePath,
  getPages,
  type ShopifyPage,
} from '@/lib/shopify/operations/storefront-page'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { Content } from './_components/content'
import { getMetaDescription } from './_lib/page-formatting'

type Props = {
  params: Promise<{ slug: string[] }>
}

const RESERVED_HANDLES = new Set([
  'contact',
  'cookie-preferences',
  'custom-tea-blends',
  'download-catalogues',
  'how-long-does-bulk-tea-last',
  'our-story',
  'privacy-policy',
  'refund-policy',
  'shipping-policy',
  'terms-conditions',
  'terms-conditions-1',
  'terms-of-service',
  'wholesale',
  'wholesale-account-request',
])

async function getRequestedPage(
  params: Props['params'],
): Promise<ShopifyPage | null> {
  const { slug } = await params

  if (slug.length !== 1) {
    return null
  }

  const handle = getPageHandleFromSlug(slug)

  return handle ? getPage(handle) : null
}

export async function generateStaticParams() {
  const pages = await getPages()

  return pages
    .filter((page) => !RESERVED_HANDLES.has(page.handle))
    .map((page) => ({
      slug: [page.handle],
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getRequestedPage(params)

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

export default async function Page({ params }: Props) {
  const page = await getRequestedPage(params)

  if (!page) {
    notFound()
  }

  return <Content page={page} />
}
