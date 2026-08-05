import type { Metadata } from 'next'
import { Suspense } from 'react'

import { withNoindexRobots } from '@/lib/seo/noindex'
import {
  getCollection,
  getCollections,
} from '@/lib/shopify/operations/collection'

import { DefaultResults } from './_components/default-results'
import { HeroContent } from './_components/hero-content'
import { PageContent } from './_components/page-content'
import { CollectionStory } from './_components/story'
import {
  getHeroImage,
  getPath,
  truncateMetaDescription,
} from './_lib/page-helpers'
import type { PageProps } from './_lib/page-types'

export async function generateStaticParams(): Promise<
  Array<{ handle: string }>
> {
  const handles = await getCollections()

  return handles.map((handle) => ({ handle }))
}

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
  // Canonical always points at the base collection (not paginated URL, not category URL — D-03, D-27)
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
    alternates: { canonical: canonicalPath },
  })
}

export default function Page({ params, searchParams }: PageProps) {
  return (
    <div className="bg-card">
      <HeroContent params={params} />
      <CollectionStory params={params} />
      {/* The fallback is the real default grid, not a skeleton: it reads only
          params + cached data, so crawlers and no-JS renders get actual
          products while query-driven variants stream in over it. */}
      <Suspense fallback={<DefaultResults params={params} />}>
        <PageContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
