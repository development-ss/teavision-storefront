import Image from 'next/image'

import { getSizedShopifyImageUrl } from '@/lib/shopify/image-url'
import type { CollectionSummary } from '@/lib/shopify/types'

type FallbackImage = {
  alt: string
  height: number
  src: string
  width: number
}

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
  const image =
    shopifyImage?.width && shopifyImage.height
      ? {
          alt: shopifyImage.altText ?? collection.title,
          height: shopifyImage.height,
          src: getSizedShopifyImageUrl(shopifyImage.url, 640),
          width: shopifyImage.width,
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
