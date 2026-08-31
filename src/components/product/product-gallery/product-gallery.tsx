'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'

import { ToggleButton } from '@/components/ui/toggle-button'
import type { ShopifyImage } from '@/lib/shopify/types'
import { getSizedShopifyImageUrl } from '@/lib/shopify/image-url'
import { cn } from '@/lib/utils'

type ProductGalleryProps = {
  images: ShopifyImage[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  if (images.length === 0) {
    return <div className="bg-paper-2 aspect-[1/1.05] w-full rounded-lg" />
  }

  return (
    <div
      className="w-full lg:sticky lg:top-30"
      role="region"
      aria-label={`${title} image gallery`}
    >
      <div
        className={cn(
          'bg-paper-2 aspect-[1/1.05] w-full overflow-hidden rounded-lg',
          images.length > 1 && 'cursor-grab active:cursor-grabbing',
        )}
        ref={emblaRef}
      >
        <div className="flex">
          {images.map((image, i) => (
            <div
              key={image.url}
              className="relative aspect-[1/1.05] min-w-0 flex-[0_0_100%]"
              aria-hidden={selectedIndex !== i}
            >
              {image.width && image.height ? (
                <Image
                  src={getSizedShopifyImageUrl(image.url, 800)}
                  alt={image.altText ?? title}
                  width={image.width}
                  height={image.height}
                  preload={i === 0}
                  quality={68}
                  sizes="(min-width: 1480px) 41rem, (min-width: 1024px) 44vw, (min-width: 400px) 90vw, calc(100vw - 2.5rem)"
                  className="size-full object-cover"
                />
              ) : (
                <div className="bg-paper-2 size-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, i) => (
            <ToggleButton
              key={image.url}
              variant="thumbnail"
              className={cn(
                'bg-paper-2 aria-pressed:border-brand aspect-square h-auto w-full rounded-[8px] border-2 border-transparent opacity-70 hover:opacity-100 aria-pressed:opacity-100 aria-pressed:ring-0',
              )}
              aria-label={`View image ${i + 1}`}
              pressed={selectedIndex === i}
              onClick={() => emblaApi?.scrollTo(i)}
            >
              {image.width && image.height ? (
                <Image
                  src={getSizedShopifyImageUrl(image.url, 120)}
                  alt={image.altText ?? `${title} ${i + 1}`}
                  width={image.width}
                  height={image.height}
                  sizes="120px"
                  className="size-full object-cover"
                />
              ) : (
                <div className="bg-paper-2 size-full" />
              )}
            </ToggleButton>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        Image {selectedIndex + 1} of {images.length}
      </p>
    </div>
  )
}
