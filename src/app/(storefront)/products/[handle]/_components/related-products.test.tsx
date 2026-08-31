import { isValidElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getTrustooProductRatings } from '@/lib/reviews/trustoo'
import { getProductRecommendations } from '@/lib/shopify/operations/product'
import type { ProductSummary } from '@/lib/shopify/types'
import {
  makeProduct,
  makeProductSummary,
} from '@/tests/fixtures/shopify/product'

import { RelatedProducts } from './related-products'

let capturedHeading: ReactNode
let capturedProducts: ProductSummary[]

vi.mock('@/components/product/related-products-carousel', () => ({
  RelatedProductsCarousel: ({
    heading,
    products,
  }: {
    heading?: ReactNode
    products: ProductSummary[]
  }) => {
    capturedHeading = heading
    capturedProducts = products
    return <div data-related-products-carousel>{heading}</div>
  },
}))

vi.mock('@/lib/reviews/trustoo', () => ({
  getTrustooProductRatings: vi.fn(),
}))

vi.mock('@/lib/shopify/operations/product', () => ({
  getProductRecommendations: vi.fn(),
}))

describe('RelatedProducts', () => {
  beforeEach(() => {
    capturedHeading = null
    capturedProducts = []
    vi.mocked(getTrustooProductRatings).mockResolvedValue({})
    vi.mocked(getProductRecommendations).mockResolvedValue([
      makeProductSummary({
        id: 'gid://shopify/Product/recommended-tea',
        handle: 'recommended-tea',
        title: 'Recommended Tea',
      }),
    ])
  })

  it('passes a keyed heading into the carousel', async () => {
    renderToStaticMarkup(await RelatedProducts({ product: makeProduct() }))

    if (!isValidElement(capturedHeading)) {
      throw new Error('Expected RelatedProducts to pass a heading element')
    }

    expect(capturedHeading.key).toBe('related-products-title')
  })

  it('uses Trustoo ratings instead of Shopify fallback ratings', async () => {
    vi.mocked(getProductRecommendations).mockResolvedValue([
      makeProductSummary({
        handle: 'recommended-tea',
        rating: 4.2,
        reviewCount: 18,
      }),
    ])
    vi.mocked(getTrustooProductRatings).mockResolvedValue({
      'recommended-tea': { rating: 5, reviewCount: 3 },
    })

    renderToStaticMarkup(await RelatedProducts({ product: makeProduct() }))

    expect(capturedProducts).toEqual([
      expect.objectContaining({
        handle: 'recommended-tea',
        rating: 5,
        reviewCount: 3,
      }),
    ])
  })

  it('keeps a valid Shopify summary when Trustoo has no row', async () => {
    vi.mocked(getProductRecommendations).mockResolvedValue([
      makeProductSummary({
        handle: 'fallback-tea',
        rating: 4.6,
        reviewCount: 9,
      }),
    ])

    renderToStaticMarkup(await RelatedProducts({ product: makeProduct() }))

    expect(capturedProducts).toEqual([
      expect.objectContaining({
        handle: 'fallback-tea',
        rating: 4.6,
        reviewCount: 9,
      }),
    ])
  })

  it('removes zero-review Trustoo summaries from related product cards', async () => {
    vi.mocked(getProductRecommendations).mockResolvedValue([
      makeProductSummary({
        handle: 'unreviewed-tea',
        rating: 4.2,
        reviewCount: 18,
      }),
    ])
    vi.mocked(getTrustooProductRatings).mockResolvedValue({
      'unreviewed-tea': { rating: 0, reviewCount: 0 },
    })

    renderToStaticMarkup(await RelatedProducts({ product: makeProduct() }))

    expect(capturedProducts).toEqual([
      expect.objectContaining({
        handle: 'unreviewed-tea',
        rating: undefined,
        reviewCount: undefined,
      }),
    ])
  })
})
