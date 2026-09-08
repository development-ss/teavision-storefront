import { createHmac } from 'node:crypto'

import { cacheLife, cacheTag } from 'next/cache'
import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { logEvent } from '@/lib/observability/logger'

import {
  createTrustooProductReview,
  getTrustooProductRatings,
  getTrustooProductReviews,
} from './trustoo'

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

vi.mock('@/lib/env/public', () => ({
  trustooShopDomain: 'mrteashop-com.myshopify.com',
}))

const envMocks = vi.hoisted(() => ({
  getTrustooPrivateToken: vi.fn(),
  getTrustooPublicToken: vi.fn(),
}))

vi.mock('@/lib/env/server', () => envMocks)

vi.mock('@/lib/observability/logger', () => ({
  logEvent: vi.fn(),
}))

const fetchMock = vi.fn() as Mock<typeof fetch>

describe('createTrustooProductReview', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    envMocks.getTrustooPublicToken.mockReset()
    envMocks.getTrustooPrivateToken.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-08T04:05:06.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  test('does not submit when server credentials are missing', async () => {
    await expect(
      createTrustooProductReview({
        productId: 'gid://shopify/Product/123',
        rating: 5,
        author: 'A customer',
        email: 'customer@example.com',
        content: 'Fresh and fragrant.',
      }),
    ).resolves.toEqual({ ok: false, reason: 'not-configured' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('signs and submits a valid product review', async () => {
    envMocks.getTrustooPublicToken.mockReturnValue('public-token')
    envMocks.getTrustooPrivateToken.mockReturnValue('private-token')
    fetchMock.mockResolvedValue(Response.json({ code: 0, data: { id: 'r-1' } }))

    await expect(
      createTrustooProductReview({
        productId: 'gid://shopify/Product/123',
        rating: 5,
        author: 'A customer',
        email: 'customer@example.com',
        content: 'Fresh and fragrant.',
      }),
    ).resolves.toEqual({ ok: true, id: 'r-1' })

    const [url, init] = fetchMock.mock.calls[0] ?? []
    const body = JSON.stringify({
      product_id: '123',
      rating: 5,
      author: 'A customer',
      author_email: 'customer@example.com',
      author_country: 'AU',
      content: 'Fresh and fragrant.',
      source: 'ChatWILL',
    })
    expect(url).toBe('https://rapi.trustoo.io/api/v1/openapi/create_review')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(body)
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      'Public-Token': 'public-token',
      Timestamp: '1788840306',
    })
    expect((init?.headers as Record<string, string>).Sign).toBe(
      createHmac('sha256', 'private-token')
        .update(`timestamp=1788840306|${body}`)
        .digest('hex'),
    )
  })

  test('returns a provider error for malformed or failed responses', async () => {
    envMocks.getTrustooPublicToken.mockReturnValue('public-token')
    envMocks.getTrustooPrivateToken.mockReturnValue('private-token')
    fetchMock.mockResolvedValue(Response.json({ code: 1, data: null }))

    await expect(
      createTrustooProductReview({
        productId: '123',
        rating: 4,
        author: 'A customer',
        email: 'customer@example.com',
        content: 'Good tea overall.',
      }),
    ).resolves.toEqual({ ok: false, reason: 'provider-error' })
  })
})

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

  test('reads product-scoped published reviews and preserves ratings without comments', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        code: 0,
        data: {
          page: { cur_page: 2, total_page: 2, count: 11 },
          list: [
            {
              id: '21183126',
              star: 5,
              author: 'Jemima K. ',
              content: 'Beautiful tea',
              commented_at: '2023-04-12 19:43:34',
              reply_content: 'Thank you',
              author_email: 'private@example.com',
            },
            {
              id: '25224602',
              star: 4,
              author: 'Robin F.',
              content: '',
              commented_at: 'invalid',
            },
          ],
        },
      }),
    )
    const result = await getTrustooProductReviews('organic-peppermint', 2)
    expect(result).toEqual({
      page: 2,
      totalPages: 2,
      totalCount: 11,
      reviews: [
        {
          id: '21183126',
          rating: 5,
          author: 'Jemima K.',
          title: '',
          content: 'Beautiful tea',
          date: '2023-04-12',
          reply: 'Thank you',
        },
        {
          id: '25224602',
          rating: 4,
          author: 'Robin F.',
          title: '',
          content: '',
          date: null,
          reply: '',
        },
      ],
    })
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(url.pathname).toBe('/api/v1/reviews/get_product_reviews')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      shop: 'mrteashop-com.myshopify.com',
      product_handle: 'organic-peppermint',
      page: '2',
      limit: '10',
      no_empty: '2',
    })
    expect(JSON.stringify(result)).not.toContain('private@example.com')
  })

  test('distinguishes an empty review list from a failed request', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        code: 0,
        data: { page: { cur_page: 1, total_page: 0, count: 0 }, list: [] },
      }),
    )
    await expect(getTrustooProductReviews('new-tea')).resolves.toEqual({
      page: 1,
      totalPages: 0,
      totalCount: 0,
      reviews: [],
    })
    fetchMock.mockRejectedValueOnce(new Error('timeout'))
    await expect(getTrustooProductReviews('new-tea')).resolves.toBeNull()
  })

  test.each([
    null,
    { code: 0, data: { list: [] } },
    { code: 1, data: null },
    {
      code: 0,
      data: {
        page: { cur_page: 1, total_page: 1, count: 1 },
        list: [{ id: 'bad', star: 6 }],
      },
    },
  ])('rejects malformed review responses: %j', async (response) => {
    fetchMock.mockResolvedValue(Response.json(response))
    await expect(getTrustooProductReviews('tea')).resolves.toBeNull()
  })

  test('does not request unscoped reviews or invalid pages', async () => {
    await expect(getTrustooProductReviews('')).resolves.toBeNull()
    await expect(getTrustooProductReviews('tea', 0)).resolves.toBeNull()
    await expect(getTrustooProductReviews('tea', 1.5)).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
