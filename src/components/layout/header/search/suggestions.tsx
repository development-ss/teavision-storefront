import Image from 'next/image'
import Link from 'next/link'
import { LoaderCircle } from 'lucide-react'
import type { MouseEventHandler } from 'react'

import { Price } from '@/components/ui/price'
import type { ProductSummary } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

import { SUGGESTIONS_LISTBOX_ID, SUGGESTIONS_PANEL_ID } from './constants'
import type { SearchSuggestionsStatus } from './types'

function getSizedImageUrl(url: string, width: number): string {
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`
}

export function SearchSuggestions({
  activeSuggestionIndex = -1,
  onSuggestionClick,
  onSuggestionMouseDown,
  onSuggestionMouseEnter,
  suggestions,
  status,
}: {
  activeSuggestionIndex?: number
  onSuggestionClick?: MouseEventHandler<HTMLAnchorElement>
  onSuggestionMouseDown?: MouseEventHandler<HTMLAnchorElement>
  onSuggestionMouseEnter?: (index: number) => void
  suggestions: ProductSummary[]
  status: SearchSuggestionsStatus
}) {
  return (
    <div
      id={SUGGESTIONS_PANEL_ID}
      className="bg-card border-hairline shadow-2 absolute top-[calc(100%+0.75rem)] right-0 left-0 z-50 max-h-[min(36rem,calc(100vh-10rem))] overflow-y-auto rounded-lg border"
    >
      {status === 'loading' && (
        <div
          className="text-ink-faint flex items-center gap-2 px-4 py-5"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            className="text-brand size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span className="type-body-sm">Searching products…</span>
        </div>
      )}

      {status === 'empty' && (
        <p
          className="type-body-sm text-ink-faint px-4 py-5"
          role="status"
          aria-live="polite"
        >
          No product suggestions found.
        </p>
      )}

      {status === 'error' && (
        <p
          className="type-body-sm text-ink-faint px-4 py-5"
          role="status"
          aria-live="polite"
        >
          Search suggestions are unavailable.
        </p>
      )}

      {status === 'results' && suggestions.length > 0 && (
        <ul
          id={SUGGESTIONS_LISTBOX_ID}
          role="listbox"
          aria-label="Search suggestions"
        >
          {suggestions.map((product, index) => {
            const productUrl = `/products/${product.handle}`
            const optionId = `${SUGGESTIONS_LISTBOX_ID}-${index}`
            const isActive = index === activeSuggestionIndex

            return (
              <li key={product.id} role="none">
                <Link
                  id={optionId}
                  href={productUrl}
                  role="option"
                  aria-selected={isActive}
                  aria-label={`View ${product.title}`}
                  onClick={onSuggestionClick}
                  onMouseDown={onSuggestionMouseDown}
                  onMouseEnter={() => onSuggestionMouseEnter?.(index)}
                  className={cn(
                    'border-hairline-2 hover:bg-brand-tint focus-visible:ring-ring grid grid-cols-[4rem_minmax(0,1fr)] gap-3 border-b px-3 py-3 transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                    isActive && 'bg-brand-tint',
                  )}
                >
                  <span className="bg-paper-2 relative size-16 overflow-hidden rounded-sm">
                    {product.featuredImage &&
                    product.featuredImage.width &&
                    product.featuredImage.height ? (
                      <Image
                        src={getSizedImageUrl(product.featuredImage.url, 160)}
                        alt={product.featuredImage.altText ?? product.title}
                        width={product.featuredImage.width}
                        height={product.featuredImage.height}
                        sizes="4rem"
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="size-full" aria-hidden="true" />
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="flex items-start justify-between gap-3">
                      <span className="type-label text-brand line-clamp-1">
                        {product.title}
                      </span>
                      {product.availableForSale !== undefined && (
                        <span
                          className={cn(
                            'type-caption shrink-0 rounded-full border px-2 py-0.5',
                            product.availableForSale
                              ? 'border-brand/30 bg-brand-tint text-brand'
                              : 'border-danger/30 bg-danger-tint text-danger',
                          )}
                        >
                          {product.availableForSale
                            ? 'In stock'
                            : 'Unavailable'}
                        </span>
                      )}
                    </span>

                    {product.description && (
                      <span className="type-body-sm text-ink-soft mt-1 line-clamp-2">
                        {product.description}
                      </span>
                    )}

                    <span className="type-body-sm mt-1 flex flex-wrap items-baseline gap-1.5">
                      <span className="text-ink-faint">From</span>
                      <Price
                        price={product.priceRange.minVariantPrice}
                        size="sm"
                        className="text-ink"
                      />
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
