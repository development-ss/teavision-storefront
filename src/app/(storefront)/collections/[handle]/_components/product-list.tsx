import { Leaf } from 'lucide-react'

import { ProductCard } from '@/components/collection'
import { Button, Pagination } from '@/components/ui'
import type { CollectionProductSummary } from '@/lib/shopify/types'

type ProductListProps = {
  clearFiltersHref?: string | null
  currentPage?: number
  totalPages?: number
  buildPageHref?: (page: number) => string
  preloadFirstImage?: boolean
  products: CollectionProductSummary[]
}

const PRODUCT_IMAGE_PRELOAD_COUNT = 1

export function ProductList({
  clearFiltersHref = null,
  currentPage = 1,
  totalPages = 1,
  buildPageHref,
  preloadFirstImage = true,
  products,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <Leaf className="text-ink-faint/50 size-11" aria-hidden="true" />
        <h3 className="font-display text-ink mt-4 text-2xl">No matches</h3>
        <p className="text-ink-soft mt-2 max-w-sm">
          Try removing a filter, or reach out — we source to order.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {clearFiltersHref ? (
            <Button href={clearFiltersHref} variant="ghost" size="sm">
              Clear filters
            </Button>
          ) : null}
          <Button href="/pages/contact" variant="ghost" size="sm">
            Contact us
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ul
        id="product-grid"
        className="grid scroll-mt-24 gap-4 sm:gap-5 lg:scroll-mt-32"
        role="list"
      >
        {products.map((product, index) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              layout="list"
              priority={
                preloadFirstImage && index < PRODUCT_IMAGE_PRELOAD_COUNT
              }
            />
          </li>
        ))}
      </ul>

      {buildPageHref && totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildPageHref={(page) => `${buildPageHref(page)}#product-grid`}
            aria-label="Collection pagination"
          />
        </div>
      )}
    </div>
  )
}
