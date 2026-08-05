import { cacheLife, cacheTag } from 'next/cache'
import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { logEvent } from '@/lib/observability/logger'

import { getTrustooProductRatings } from './trustoo'

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

vi.mock('@/lib/env/public', () => ({
  trustooShopDomain: 'mrteashop-com.myshopify.com',
}))

vi.mock('@/lib/observability/logger', () => ({
  logEvent: vi.fn(),
}))

const fetchMock = vi.fn() as Mock<typeof fetch>

describe('getTrustooProductRatings', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.mocked(cacheLife).mockClear()
    vi.mocked(cacheTag).mockClear()
    vi.mocked(logEvent).mockClear()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('maps positional response rows to unique requested handles', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        code: 0,
        data: [
          { rating: '4.8', total_reviews: '12' },
          { rating: 5, total_reviews: 3 },
        ],
      }),
    )

    await expect(
      getTrustooProductRatings([
        'english-breakfast',
        '',
        'english-breakfast',
        'black-assam',
      ]),
    ).resolves.toEqual({
      'english-breakfast': { rating: 4.8, reviewCount: 12 },
      'black-assam': { rating: 5, reviewCount: 3 },
    })

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] ?? []
    const url = new URL(String(requestUrl))

    expect(url.searchParams.get('shop')).toBe('mrteashop-com.myshopify.com')
    expect(url.searchParams.get('product_handle')).toBe(
      'english-breakfast,black-assam',
    )
    expect(requestInit).toEqual({ cache: 'no-store' })
    expect(cacheTag).toHaveBeenCalledWith('trustoo-reviews')
    expect(cacheLife).toHaveBeenCalledWith('hours')
  })

  test('preserves a positional zero-review row for downstream normalization', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        code: 0,
        data: [{ rating: '0', total_reviews: 0 }],
      }),
    )

    await expect(getTrustooProductRatings(['unreviewed-tea'])).resolves.toEqual(
      {
        'unreviewed-tea': { rating: 0, reviewCount: 0 },
      },
    )
  })

  test('returns no ratings and logs an unusable response', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ code: 1, data: 'not-an-array' }),
    )

    await expect(getTrustooProductRatings(['tea'])).resolves.toEqual({})

    expect(cacheLife).toHaveBeenCalledWith('minutes')
    expect(logEvent).toHaveBeenCalledWith('warn', 'trustoo_failed', {
      handleCount: 1,
      reason: 'unusable-response',
    })
  })

  test('returns no ratings when the request fails', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }))

    await expect(getTrustooProductRatings(['tea'])).resolves.toEqual({})

    expect(cacheLife).toHaveBeenCalledWith('minutes')
    expect(logEvent).toHaveBeenCalledWith('warn', 'trustoo_failed', {
      status: 503,
      handleCount: 1,
      reason: 'request-failed',
    })
  })

  test('returns no ratings when the request throws', async () => {
    fetchMock.mockRejectedValue(new Error('Trustoo unavailable'))

    await expect(getTrustooProductRatings(['tea'])).resolves.toEqual({})

    expect(cacheLife).toHaveBeenCalledWith('minutes')
    expect(logEvent).toHaveBeenCalledWith('warn', 'trustoo_failed', {
      handleCount: 1,
      reason: 'request-threw',
    })
  })
})
