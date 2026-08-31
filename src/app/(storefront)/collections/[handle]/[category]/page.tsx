import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoadingSkeleton } from '@/components/collection/loading-skeleton'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { getCollection } from '@/lib/shopify/operations/collection'

import { PageContent } from '../_components/page-content'
import {
  getHeroImage,
  getPath,
  truncateMetaDescription,
} from '../_lib/page-helpers'
import type { PageProps } from '../_lib/page-types'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollection(handle)
  if (!collection) return withNoindexRobots({ title: 'Collection not found' })
  const description = truncateMetaDescription(
    collection.seo.description ??
      collection.description ??
      `Browse ${collection.title} from Teavision, Australia's bulk tea and herb supplier.`,
  )
  const title = collection.seo.title ?? collection.title
  // Category pages canonicalize to parent collection URL, paginated or not (D-27)
  const canonicalPath = getPath(handle)
  const heroImage = getHeroImage(
    collection.featuredImage,
    collection.descriptionHtml,
  )

  return withNoindexRobots({
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: canonicalPath,
      images: heroImage
        ? [
            {
              url: heroImage.url,
              alt: heroImage.altText ?? collection.title,
            },
          ]
        : undefined,
    },
    // Canonical → parent collection (not the category URL itself) — D-27
    alternates: { canonical: canonicalPath },
  })
}

export default function Page({ params, searchParams }: PageProps) {
  // Unlike the base collection route, this segment has no generateStaticParams,
  // so its prerendered shell cannot await params — a DefaultResults fallback
  // fails the build ("uncached data outside Suspense"). The skeleton keeps the
  // shell static; category URLs canonicalize to the parent collection (D-27),
  // so they are not indexation targets and the crawlable-fallback treatment
  // stays on the base route.
  return (
    <Suspense fallback={<LoadingSkeleton showHero={false} />}>
      <PageContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
