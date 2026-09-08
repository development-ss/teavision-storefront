import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoadingSkeleton } from '@/components/collection/loading-skeleton'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { getCollection } from '@/lib/shopify/operations/collection'
import { getCollectionMetadata } from '@/lib/seo/collection-metadata'

import { PageContent } from '../_components/page-content'
import type { PageProps } from '../_lib/page-types'

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { handle, category } = await params
  const collection = await getCollection(handle)
  if (!collection) return withNoindexRobots({ title: 'Collection not found' })
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
