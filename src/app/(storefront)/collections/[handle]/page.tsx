import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoadingSkeleton } from '@/components/collection/loading-skeleton'
import { withNoindexRobots } from '@/lib/seo/noindex'
import {
  getCollection,
  getCollections,
} from '@/lib/shopify/operations/collection'
import { getCollectionMetadata } from '@/lib/seo/collection-metadata'

import { DefaultResults } from './_components/default-results'
import { HeroContent } from './_components/hero-content'
import { PageContent } from './_components/page-content'
import type { PageProps } from './_lib/page-types'

export async function generateStaticParams(): Promise<
  Array<{ handle: string }>
> {
  const handles = await getCollections()

  return handles.map((handle) => ({ handle }))
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollection(handle)
  if (!collection) return withNoindexRobots({ title: 'Collection not found' })
  return getCollectionMetadata(collection, await searchParams)
}

export default function Page({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="bg-card">
        <HeroContent params={params} />
        {/* The fallback is the real default grid, not a skeleton: it reads only
          params + cached data, so crawlers and no-JS renders get actual
          products while query-driven variants stream in over it. */}
        <Suspense fallback={<DefaultResults params={params} />}>
          <PageContent params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </Suspense>
  )
}
