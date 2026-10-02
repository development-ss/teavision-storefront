import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { LoadingSkeleton } from '@/components/collection/loading-skeleton'
import {
  getCollection,
  getCollectionProductsPage,
  getCollectionTagCounts,
} from '@/lib/shopify/operations/collection'
import { getCollectionMetadata } from '@/lib/seo/collection-metadata'

import { PageContent } from '../_components/page-content'
import { findCategoryTagForPath, matchCategoryTag } from '../_lib/page-helpers'
import type { PageProps } from '../_lib/page-types'

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { handle, category } = await params
  const collection = await getCollection(handle)
  // Throwing here, while metadata still blocks the response, sends a real 404.
  // The results grid repeats this lookup after streaming starts, too late to
  // change the status. Both reads hit the same cached entries as the grid.
  if (!collection) notFound()
  if (category) {
    const [firstPage, tagCounts] = await Promise.all([
      getCollectionProductsPage(handle, 1),
      getCollectionTagCounts(handle),
    ])
    const categoryTag =
      findCategoryTagForPath(category, firstPage.filters, firstPage.products) ??
      matchCategoryTag(category, Object.keys(tagCounts))
    if (!categoryTag) notFound()
  }
  return getCollectionMetadata(collection, await searchParams, category)
}

export default function Page({ params, searchParams }: PageProps) {
  // Unlike the base collection route, this segment has no generateStaticParams,
  // so its prerendered shell cannot await params — a DefaultResults fallback
  // fails the build ("uncached data outside Suspense"). The skeleton keeps the
  // shell static; category URLs canonicalize to the parent collection (D-27),
  // so they are not indexation targets and the crawlable-fallback treatment
  // stays on the base route.
  return (
    <div className="bg-card">
      <Suspense fallback={<LoadingSkeleton />}>
        <PageContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
