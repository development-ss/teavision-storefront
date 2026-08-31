'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { ProductCard } from '@/components/collection/product-card'
import { IconButton } from '@/components/ui/icon-button'
import type { ProductSummary } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

type RelatedProductsCarouselProps = {
  products: ProductSummary[]
  ariaLabel?: string
  className?: string
  /* Rendered inline with the arrows so the title row carries no dead band */
  heading?: ReactNode
}

export function RelatedProductsCarousel({
  ariaLabel = 'Related products',
  products,
  className,
  heading,
}: RelatedProductsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: false,
    slidesToScroll: 1,
  })
  const [activeIndex, setActiveIndex] = useState(0)
  const [canScrollPrevious, setCanScrollPrevious] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return

    setActiveIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrevious(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  const scrollPrevious = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const frameId = window.requestAnimationFrame(onSelect)
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      window.cancelAnimationFrame(frameId)
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  if (products.length === 0) return null

  return (
    <div
      className={cn('relative', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          'mb-5 flex items-end gap-2',
          heading ? 'justify-between' : 'justify-end',
        )}
      >
        {heading}
        <div className="flex gap-2">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`Show previous ${ariaLabel.toLowerCase()}`}
            disabled={!canScrollPrevious}
            onClick={scrollPrevious}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`Show next ${ariaLabel.toLowerCase()}`}
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <div
        ref={emblaRef}
        className="cursor-grab overflow-hidden active:cursor-grabbing"
      >
        <ul className="-ml-4 flex" role="list">
          {products.map((product) => (
            <li
              key={product.id}
              className="min-w-0 flex-[0_0_100%] pl-4 min-[360px]:flex-[0_0_50%] sm:flex-[0_0_33.333333%] lg:flex-[0_0_25%]"
              aria-roledescription="slide"
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>

      <p className="sr-only" aria-live="polite">
        {ariaLabel} item {activeIndex + 1} of {products.length}
      </p>
    </div>
  )
}
