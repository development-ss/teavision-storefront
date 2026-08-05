/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { CollectionProductSummary } from '@/lib/shopify/types'
import type { SearchaniseSearchResult } from '@/lib/searchanise/types'

import { ProductResults } from './product-results'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/cart/actions', () => ({
  addToCartAction: vi.fn(),
}))

const product: CollectionProductSummary = {
  id: 'gid://shopify/Product/matcha',
  handle: 'matcha',
  title: 'Premium Matcha',
  availableForSale: true,
  productType: 'Green tea',
  tags: [],
  featuredImage: {
    url: 'https://cdn.shopify.com/s/files/1/0000/0001/products/matcha.jpg?v=1',
    altText: 'Premium Matcha',
    width: 900,
    height: 900,
  },
  priceRange: {
    minVariantPrice: { amount: '95.00', currencyCode: 'AUD' },
  },
  variants: [],
}

const result: SearchaniseSearchResult = {
  status: 'success',
  query: 'Matcha',
  products: [
    product,
    {
      ...product,
      id: 'gid://shopify/Product/organic-matcha',
      handle: 'organic-matcha',
      title: 'Organic Matcha',
    },
  ],
  facets: [],
  pagination: {
    currentPage: 1,
    pageSize: 24,
    totalPages: 1,
    totalItems: 2,
    startIndex: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

describe('ProductResults', () => {
  it('uses the collection PLP horizontal product-card layout', () => {
    const html = renderToStaticMarkup(
      <ProductResults clearHref="/search?q=Matcha" result={result} />,
    )

    expect(html).toContain('<ul class="grid gap-4 sm:gap-5" role="list">')
    expect(html).not.toContain('grid-cols-2')
    expect(html).not.toContain('lg:grid-cols-3')
    expect(html.match(/grid-cols-\[7\.5rem_minmax\(0,1fr\)\]/g)).toHaveLength(2)
    expect(html).toContain('sm:grid-cols-[12rem_minmax(0,1fr)]')
    expect(html).toContain('lg:grid-cols-[14rem_minmax(0,1fr)]')
  })

  it('preloads only the first horizontal product image', () => {
    const html = renderToStaticMarkup(
      <ProductResults clearHref="/search?q=Matcha" result={result} />,
    )
    const imagePreloads =
      html.match(/<link(?=[^>]*rel="preload")(?=[^>]*as="image")[^>]*>/g) ?? []

    expect(imagePreloads).toHaveLength(1)
    expect(html.match(/<img[^>]*loading="lazy"/g)).toHaveLength(1)
  })
})
