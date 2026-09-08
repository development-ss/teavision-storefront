import { notFound } from 'next/navigation'

import { getCollection } from '@/lib/shopify/operations/collection'
import { getCollectionHero } from '@/lib/shopify/collection-content'
import { Hero } from '@/components/collection/hero'

import type { RouteParams } from '../_lib/page-types'

type HeroContentProps = {
  params: Promise<RouteParams>
}

export async function HeroContent({ params }: HeroContentProps) {
  const { handle } = await params
  const collection = await getCollection(handle)

  if (!collection) notFound()

  return (
    <Hero
      {...getCollectionHero(collection)}
      collectionTitle={collection.title}
      collectionPath={`/collections/${handle}`}
    />
  )
}
