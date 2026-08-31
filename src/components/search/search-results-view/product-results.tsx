import { ProductCard } from '@/components/collection/product-card'
import type { SearchaniseSearchResult } from '@/lib/searchanise/types'

import { SearchAlert } from './search-alert'

const PRODUCT_IMAGE_PRELOAD_COUNT = 1

export function ProductResults({
  clearHref,
  result,
}: {
  clearHref: string
  result: SearchaniseSearchResult
}) {
  if (result.products.length === 0) {
    return (
      <SearchAlert
        actionHref={clearHref}
        actionLabel="Clear filters"
        tone="empty"
        message="No products matched this search. Try removing a filter or searching a broader term."
      />
    )
  }

  return (
    <ul className="grid gap-4 sm:gap-5" role="list">
      {result.products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            layout="list"
            priority={index < PRODUCT_IMAGE_PRELOAD_COUNT}
          />
        </li>
      ))}
    </ul>
  )
}
