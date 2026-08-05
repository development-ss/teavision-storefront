import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getTrustooProductRatings } from '@/lib/reviews/trustoo'
import { getProduct } from '@/lib/shopify/operations/product'
import { makeProduct } from '@/tests/fixtures/shopify/product'

import { GET } from './route'

vi.mock('@/lib/shopify/operations/product', () => ({
  getProduct: vi.fn(),
}))

vi.mock('@/lib/reviews/trustoo', () => ({
  getTrustooProductRatings: vi.fn(),
}))

const getProductMock = getProduct as unknown as Mock<
  (handle: string) => Promise<ReturnType<typeof makeProduct> | null>
>
const getTrustooProductRatingsMock =
  getTrustooProductRatings as unknown as Mock<typeof getTrustooProductRatings>

function routeContext(handle: string) {
  return { params: Promise.resolve({ handle }) }
}

describe('quick-view route', () => {
  beforeEach(() => {
    getProductMock.mockReset()
    getTrustooProductRatingsMock.mockReset()
    getTrustooProductRatingsMock.mockResolvedValue({})
  })

  test('returns quick-view product details for a product', async () => {
    getProductMock.mockResolvedValue(
      makeProduct({ handle: 'test-standard-tea' }),
    )

    const response = await GET(
      new Request('http://localhost'),
      routeContext('test-standard-tea'),
    )
    const payload = (await response.json()) as Record<string, unknown>

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      description: expect.any(String),
      handle: 'test-standard-tea',
      id: expect.any(String),
      title: expect.any(String),
    })
    expect(payload).toHaveProperty('variants')
    expect(payload).not.toHaveProperty('descriptionHtml')
    expect(payload).not.toHaveProperty('tags')
  })

  test('uses the same Trustoo rating as collection cards and product pages', async () => {
    getProductMock.mockResolvedValue(
      makeProduct({
        handle: 'reviewed-tea',
        rating: 4.2,
        reviewCount: 18,
      }),
    )
    getTrustooProductRatingsMock.mockResolvedValue({
      'reviewed-tea': { rating: 5, reviewCount: 3 },
    })

    const response = await GET(
      new Request('http://localhost'),
      routeContext('reviewed-tea'),
    )

    await expect(response.json()).resolves.toMatchObject({
      rating: 5,
      reviewCount: 3,
    })
    expect(getTrustooProductRatingsMock).toHaveBeenCalledWith(['reviewed-tea'])
  })

  test('falls back to a valid Shopify summary when Trustoo has no row', async () => {
    getProductMock.mockResolvedValue(
      makeProduct({
        handle: 'fallback-tea',
        rating: 4.6,
        reviewCount: 9,
      }),
    )

    const response = await GET(
      new Request('http://localhost'),
      routeContext('fallback-tea'),
    )

    await expect(response.json()).resolves.toMatchObject({
      rating: 4.6,
      reviewCount: 9,
    })
  })

  test('omits zero-review Trustoo summaries', async () => {
    getProductMock.mockResolvedValue(
      makeProduct({
        handle: 'unreviewed-tea',
        rating: 4.2,
        reviewCount: 18,
      }),
    )
    getTrustooProductRatingsMock.mockResolvedValue({
      'unreviewed-tea': { rating: 0, reviewCount: 0 },
    })

    const response = await GET(
      new Request('http://localhost'),
      routeContext('unreviewed-tea'),
    )
    const payload = (await response.json()) as Record<string, unknown>

    expect(payload).not.toHaveProperty('rating')
    expect(payload).not.toHaveProperty('reviewCount')
  })

  test('returns 404 for a missing product', async () => {
    getProductMock.mockResolvedValue(null)

    const response = await GET(
      new Request('http://localhost'),
      routeContext('missing'),
    )

    await expect(response.json()).resolves.toEqual({
      message: 'Product not found',
    })
    expect(response.status).toBe(404)
  })

  test('returns 503 when the product fetch fails', async () => {
    getProductMock.mockRejectedValue(new Error('Shopify unavailable'))

    const response = await GET(
      new Request('http://localhost'),
      routeContext('tea'),
    )

    await expect(response.json()).resolves.toEqual({
      message: 'Product quick view is unavailable',
    })
    expect(response.status).toBe(503)
  })
})
