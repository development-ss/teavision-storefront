import Image from 'next/image'

import { getShopifyImageUrl } from '@/lib/shopify/image-url'
import type { CollectionSummary } from '@/lib/shopify/types'

type FallbackImage = {
  alt: string
  height: number
  src: string
  width: number
}

// Matches the tile's `aspect-[1/1.08]` class so Shopify crops server-side
// instead of the browser zoom-cropping an oversized/undersized source.
const TILE_WIDTH = 1200
const TILE_HEIGHT = Math.round(TILE_WIDTH * 1.08)

const FALLBACK_IMAGES: Partial<Record<string, FallbackImage>> = {
  'black-tea': {
    alt: 'Loose leaf black tea',
    height: 270,
    src: '/images/navigation/mega-menu-tea-leaves.png',
    width: 280,
  },
  'matcha-tea': {
    alt: 'Bright green matcha powder',
    height: 1024,
    src: '/images/custom-tea-blends/matcha-powder.png',
    width: 1536,
  },
  'organic-tea': {
    alt: 'Teavision organic tea range',
    height: 2880,
    src: '/images/homepage/organic-range.jpg',
    width: 1920,
  },
}

export function CollectionCardImage({
  collection,
}: {
  collection: CollectionSummary
}) {
  const shopifyImage = collection.featuredImage
  const fallbackImage = FALLBACK_IMAGES[collection.handle]
  const image = shopifyImage
    ? {
        alt: shopifyImage.altText ?? collection.title,
        height: TILE_HEIGHT,
        src: getShopifyImageUrl(shopifyImage.url, {
          crop: 'center',
          height: TILE_HEIGHT,
          width: TILE_WIDTH,
        }),
        width: TILE_WIDTH,
      }
    : fallbackImage

  if (!image) {
    return <div className="bg-paper-2 aspect-[1/1.08] w-full rounded-lg" />
  }

  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      className="aspect-[1/1.08] w-full object-cover transition-transform duration-300 group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  )
}
