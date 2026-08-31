'use client'

import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'

import { searchanisePublicConfig } from '@/lib/env/public'
import { cn } from '@/lib/utils'
import { Section } from '@/components/ui/section'

import { RecommendationCarouselSkeleton } from '../recommendation-carousel-skeleton'
import { RelatedProductsCarousel } from '../related-products-carousel'
import { SearchaniseScriptLoader } from './searchanise-script-loader'
import { useSearchaniseRecommendations } from './use-searchanise-recommendations'

const DEFAULT_WIDGET_ID = '1T8K1Y6Q6G8R3B3'
const DEFAULT_FALLBACK_DELAY_MS = 2500
const LOAD_ROOT_MARGIN = '800px 0px'

export type SearchaniseRecommendationsProps = {
  className?: string
  fallback?: ReactNode
  fallbackDelayMs?: number
  headingClassName?: string
  sectionClassName?: string
  title?: ReactNode
  titleId?: string
  widgetId?: string
}

export { parseSearchaniseProducts } from './searchanise-product-parser'

export function SearchaniseRecommendations({
  className,
  fallback,
  fallbackDelayMs = DEFAULT_FALLBACK_DELAY_MS,
  headingClassName,
  sectionClassName,
  title,
  titleId,
  widgetId = DEFAULT_WIDGET_ID,
}: SearchaniseRecommendationsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const hasFallback =
    fallback !== undefined && fallback !== null && fallback !== false
  const { products, renderState, widgetRef } = useSearchaniseRecommendations({
    enabled: shouldLoad,
    fallbackDelayMs,
    hasFallback,
    widgetId,
  })

  useEffect(() => {
    if (shouldLoad) return

    const container = containerRef.current
    if (!container) return

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => setShouldLoad(true))
      return () => window.cancelAnimationFrame(frame)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return

        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin: LOAD_ROOT_MARGIN },
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [shouldLoad])

  // Carousel states render the heading inline with the arrows (no dead band
  // between title and cards); other states keep a standalone heading with the
  // same mb-5 gap the carousel heading row uses.
  const headingIsInline =
    renderState === 'rendered' || renderState === 'fallback'
  const headingElement = title ? (
    <h2
      id={titleId}
      className={cn(headingClassName, !headingIsInline && 'mb-5')}
    >
      {title}
    </h2>
  ) : null

  const visibleContent = !shouldLoad ? null : renderState === 'waiting' ? (
    <RecommendationCarouselSkeleton />
  ) : renderState === 'rendered' && products.length > 0 ? (
    <RelatedProductsCarousel
      products={products}
      ariaLabel="Customers also bought products"
      heading={headingElement}
    />
  ) : renderState === 'fallback' && fallback ? (
    <div data-searchanise-fallback>{fallback}</div>
  ) : renderState === 'empty' ? (
    <p className="type-body-sm text-ink-faint" role="status">
      No recommendations are available.
    </p>
  ) : null

  return (
    <div
      ref={containerRef}
      className={cn('relative min-w-0', className)}
      data-searchanise-state={renderState}
    >
      {shouldLoad &&
      searchanisePublicConfig.enabled &&
      searchanisePublicConfig.apiKey ? (
        <Suspense fallback={null}>
          <SearchaniseScriptLoader apiKey={searchanisePublicConfig.apiKey} />
        </Suspense>
      ) : null}

      {shouldLoad ? (
        <div
          className="pointer-events-none absolute top-0 left-0 h-0 w-full overflow-hidden opacity-0"
          aria-hidden="true"
          inert
        >
          <div
            ref={widgetRef}
            className="searchanise-recommendations"
            id={widgetId}
          />
        </div>
      ) : null}

      {visibleContent && title ? (
        <Section.Root
          tone="transparent"
          spacing="none"
          className={sectionClassName}
          aria-labelledby={titleId}
        >
          {headingIsInline ? null : headingElement}
          {visibleContent}
        </Section.Root>
      ) : (
        visibleContent
      )}
    </div>
  )
}
