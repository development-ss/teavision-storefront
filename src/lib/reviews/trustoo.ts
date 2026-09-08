import { createHmac } from 'node:crypto'

import { cacheLife, cacheTag } from 'next/cache'

import { trustooShopDomain } from '@/lib/env/public'
import { getTrustooPrivateToken, getTrustooPublicToken } from '@/lib/env/server'
import { logEvent } from '@/lib/observability/logger'

import type { ProductReviewSummary } from './summary'

type TrustooRatingRow = {
  rating?: unknown
  total_reviews?: unknown
}

type TrustooRatingsResponse = {
  code?: unknown
  data?: unknown
}

const TRUSTOO_PRODUCT_RATINGS_URL =
  'https://api.trustoo.io/api/v1/reviews/get_products_rating'
const TRUSTOO_CREATE_REVIEW_URL =
  'https://rapi.trustoo.io/api/v1/openapi/create_review'

export type ProductReview = {
  id: string
  rating: number
  author: string
  title: string
  content: string
  date: string | null
  reply: string
}

export type ProductReviewsPage = {
  reviews: ProductReview[]
  page: number
  totalPages: number
  totalCount: number
}

export type CreateTrustooReviewInput = {
  productId: string
  rating: number
  author: string
  email: string
  content: string
}

export type CreateTrustooReviewResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'not-configured' | 'provider-error' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function reviewText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function numericProductId(value: string): string | null {
  const match = /^gid:\/\/shopify\/Product\/(\d+)$/.exec(value)
  return match?.[1] ?? (/^\d+$/.test(value) ? value : null)
}

export async function createTrustooProductReview(
  input: CreateTrustooReviewInput,
): Promise<CreateTrustooReviewResult> {
  const publicToken = getTrustooPublicToken()
  const privateToken = getTrustooPrivateToken()
  const productId = numericProductId(input.productId)

  if (!publicToken || !privateToken || !trustooShopDomain || !productId) {
    logEvent('warn', 'trustoo_failed', {
      reason: 'review-submit-not-configured',
    })
    return { ok: false, reason: 'not-configured' }
  }

  const body = JSON.stringify({
    product_id: productId,
    rating: input.rating,
    author: input.author,
    author_email: input.email,
    author_country: 'AU',
    content: input.content,
    // Trustoo's OpenAPI create endpoint expects this source label for
    // reviews submitted through the custom storefront integration.
    source: 'ChatWILL',
  })
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const sign = createHmac('sha256', privateToken)
    .update(`timestamp=${timestamp}|${body}`)
    .digest('hex')

  try {
    const response = await fetch(TRUSTOO_CREATE_REVIEW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Public-Token': publicToken,
        Sign: sign,
        Timestamp: timestamp,
      },
      body,
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error(`Trustoo responded ${response.status}`)

    const json: unknown = await response.json()
    if (
      !isRecord(json) ||
      json.code !== 0 ||
      !isRecord(json.data) ||
      typeof json.data.id !== 'string' ||
      json.data.id.length === 0
    )
      throw new Error('Trustoo returned an unusable review response')

    return { ok: true, id: json.data.id }
  } catch {
    logEvent('warn', 'trustoo_failed', { reason: 'review-submit-failed' })
    return { ok: false, reason: 'provider-error' }
  }
}

function parseReview(value: unknown): ProductReview | null {
  if (!isRecord(value)) return null
  const id = reviewText(value.id)
  const rating = Number(value.star)
  if (!id || !Number.isInteger(rating) || rating < 1 || rating > 5) return null
  const date = reviewText(value.commented_at).slice(0, 10)

  return {
    id,
    rating,
    author: reviewText(value.author) || 'Customer',
    title: reviewText(value.title),
    content: reviewText(value.content),
    date:
      /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date))
        ? date
        : null,
    reply: reviewText(value.reply_content),
  }
}

// Public storefront feed used by Trustoo's review widget. It contains only
// published reviews and accepts the same shop domain as the ratings endpoint.
export async function getTrustooProductReviews(
  handle: string,
  page = 1,
): Promise<ProductReviewsPage | null> {
  'use cache'
  cacheTag('trustoo-reviews')
  cacheLife('minutes')

  if (
    !trustooShopDomain ||
    !/^[a-z0-9][a-z0-9-]{0,254}$/.test(handle) ||
    !Number.isSafeInteger(page) ||
    page < 1
  )
    return null

  const params = new URLSearchParams({
    shop: trustooShopDomain,
    product_handle: handle,
    page: String(page),
    limit: '10',
    no_empty: '2',
  })

  try {
    const response = await fetch(
      `https://api.trustoo.io/api/v1/reviews/get_product_reviews?${params}`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!response.ok) throw new Error('Review request failed')
    const json: unknown = await response.json()
    if (
      !isRecord(json) ||
      json.code !== 0 ||
      !isRecord(json.data) ||
      !Array.isArray(json.data.list) ||
      !isRecord(json.data.page)
    )
      throw new Error('Invalid reviews response')
    const pagination = json.data.page
    if (
      ![pagination.cur_page, pagination.total_page, pagination.count].every(
        (value) =>
          typeof value === 'number' &&
          Number.isSafeInteger(value) &&
          value >= 0,
      ) ||
      pagination.cur_page !== page
    )
      throw new Error('Invalid reviews pagination')
    const reviews = json.data.list.map(parseReview)
    if (reviews.some((review) => review === null))
      throw new Error('Invalid review')

    cacheLife('hours')
    return {
      reviews: reviews as ProductReview[],
      page,
      totalPages: pagination.total_page as number,
      totalCount: pagination.count as number,
    }
  } catch {
    logEvent('warn', 'trustoo_failed', { reason: 'reviews-unavailable', page })
    return null
  }
}

function isTrustooRatingRow(value: unknown): value is TrustooRatingRow {
  return typeof value === 'object' && value !== null
}

function parseRating(value: unknown): number {
  const rating =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? parseFloat(value)
        : 0

  return Number.isFinite(rating) ? rating : 0
}

function parseReviewCount(value: unknown): number {
  const reviewCount =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? parseInt(value, 10)
        : 0

  return Number.isFinite(reviewCount) ? reviewCount : 0
}

function toProductReviewSummary(row: TrustooRatingRow): ProductReviewSummary {
  return {
    rating: parseRating(row.rating),
    reviewCount: parseReviewCount(row.total_reviews),
  }
}

export async function getTrustooProductRatings(
  handles: string[],
): Promise<Record<string, ProductReviewSummary>> {
  'use cache'
  cacheTag('trustoo-reviews')

  const shop = trustooShopDomain
  const uniqueHandles = Array.from(new Set(handles.filter(Boolean)))

  if (!shop || uniqueHandles.length === 0) {
    cacheLife('minutes')
    return {}
  }

  const searchParams = new URLSearchParams({
    shop,
    product_handle: uniqueHandles.join(','),
  })

  try {
    const response = await fetch(
      `${TRUSTOO_PRODUCT_RATINGS_URL}?${searchParams.toString()}`,
      { cache: 'no-store' },
    )

    if (!response.ok) {
      cacheLife('minutes')
      logEvent('warn', 'trustoo_failed', {
        status: response.status,
        handleCount: uniqueHandles.length,
        reason: 'request-failed',
      })
      return {}
    }

    const json = (await response.json()) as TrustooRatingsResponse
    if (json.code !== 0 || !Array.isArray(json.data)) {
      cacheLife('minutes')
      logEvent('warn', 'trustoo_failed', {
        handleCount: uniqueHandles.length,
        reason: 'unusable-response',
      })
      return {}
    }

    cacheLife('hours')
    return json.data.reduce<Record<string, ProductReviewSummary>>(
      (ratings, row, index) => {
        if (!isTrustooRatingRow(row)) return ratings

        const handle = uniqueHandles[index]
        if (!handle) return ratings

        ratings[handle] = toProductReviewSummary(row)
        return ratings
      },
      {},
    )
  } catch {
    cacheLife('minutes')
    logEvent('warn', 'trustoo_failed', {
      handleCount: uniqueHandles.length,
      reason: 'request-threw',
    })
    return {}
  }
}
