import { notFound } from 'next/navigation'

import { getCollection } from '@/lib/shopify/operations/collection'

import {
  cleanHeroDescription,
  getDescriptionHeroImage,
  getHeroImage,
  parseCollectionRichHero,
} from '../_lib/page-helpers'
import type { RouteParams } from '../_lib/page-types'
import { CollectionRichHero } from './collection-rich-hero'
import { Hero } from './hero'

type HeroContentProps = {
  params: Promise<RouteParams>
}

export async function HeroContent({ params }: HeroContentProps) {
  const { handle } = await params
  const collection = await getCollection(handle)

  if (!collection) notFound()

  const richHero = parseCollectionRichHero(collection.descriptionHtml)

  if (richHero) return <CollectionRichHero richHero={richHero} />

  return (
    <Hero
      collectionTitle={collection.title}
      heroDescription={cleanHeroDescription(collection.description)}
      heroImage={getHeroImage(
        collection.featuredImage,
        collection.descriptionHtml,
      )}
      bannerImage={getDescriptionHeroImage(collection.descriptionHtml)}
    />
  )
}
