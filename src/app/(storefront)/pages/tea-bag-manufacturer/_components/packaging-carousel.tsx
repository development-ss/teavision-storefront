'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'

import type { PackagingImage } from '../_lib/data'

type PackagingCarouselProps = {
  images: PackagingImage[]
}

export function PackagingCarousel({ images }: PackagingCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    slidesToScroll: 1,
  })
  const [activeIndex, setActiveIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return

    setActiveIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  const scrollPrevious = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Packaging examples"
    >
      <div className="mb-4 flex justify-end gap-2">
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Show previous packaging example"
          onClick={scrollPrevious}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Show next packaging example"
          onClick={scrollNext}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </IconButton>
      </div>

      <div
        ref={emblaRef}
        className="cursor-grab overflow-hidden active:cursor-grabbing"
      >
        <ul className="-ml-4 flex" role="list">
          {images.map((image, index) => (
            <li
              key={image.src}
              className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%]"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${images.length}`}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="sr-only" aria-live="polite">
        Packaging example {activeIndex + 1} of {images.length}
      </p>
    </div>
  )
}
