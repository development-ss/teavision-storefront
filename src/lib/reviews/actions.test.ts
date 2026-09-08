import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createTrustooProductReview: vi.fn(),
  getTrustooProductReviews: vi.fn(),
  headers: vi.fn(),
  checkRateLimit: vi.fn(),
  getClientIpFromHeaders: vi.fn(),
}))

vi.mock('next/headers', () => ({ headers: mocks.headers }))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getClientIpFromHeaders: mocks.getClientIpFromHeaders,
}))
vi.mock('./trustoo', () => ({
  createTrustooProductReview: mocks.createTrustooProductReview,
  getTrustooProductReviews: mocks.getTrustooProductReviews,
}))

import {
  submitProductReviewAction,
  type ProductReviewActionState,
} from './actions'

function reviewForm(fields: Record<string, string>): FormData {
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => formData.set(key, value))
  return formData
}

const initialState: ProductReviewActionState = { status: 'idle' }
const validFields = {
  rating: '5',
  author: 'A customer',
  email: 'customer@example.com',
  content: 'Fresh and fragrant tea.',
}

describe('submitProductReviewAction', () => {
  beforeEach(() => {
    mocks.headers.mockResolvedValue(new Headers())
    mocks.getClientIpFromHeaders.mockReturnValue('127.0.0.1')
    mocks.checkRateLimit.mockResolvedValue({ limited: false })
    mocks.createTrustooProductReview.mockReset()
    mocks.createTrustooProductReview.mockResolvedValue({ ok: true, id: 'r-1' })
  })

  test('returns field errors before contacting Trustoo', async () => {
    await expect(
      submitProductReviewAction(
        'organic-peppermint',
        'gid://shopify/Product/123',
        initialState,
        reviewForm({
          rating: '0',
          author: '',
          email: 'invalid',
          content: 'Short',
        }),
      ),
    ).resolves.toEqual({
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors: {
        rating: 'Choose a rating.',
        author: 'Enter a name of 1 to 80 characters.',
        email: 'Enter a valid email address.',
        content: 'Write between 10 and 2,000 characters.',
      },
    })
    expect(mocks.createTrustooProductReview).not.toHaveBeenCalled()
  })

  test('submits valid guest review details', async () => {
    await expect(
      submitProductReviewAction(
        'organic-peppermint',
        'gid://shopify/Product/123',
        initialState,
        reviewForm(validFields),
      ),
    ).resolves.toEqual({
      status: 'success',
      message:
        'Thanks for sharing your experience. Your review was submitted successfully.',
    })
    expect(mocks.checkRateLimit).toHaveBeenCalledWith({
      namespace: 'product-review',
      identifier: '127.0.0.1',
      limit: 5,
      windowMs: 600000,
    })
    expect(mocks.createTrustooProductReview).toHaveBeenCalledWith({
      productId: 'gid://shopify/Product/123',
      rating: 5,
      author: 'A customer',
      email: 'customer@example.com',
      content: 'Fresh and fragrant tea.',
    })
  })

  test('maps provider configuration and failure to safe messages', async () => {
    mocks.createTrustooProductReview.mockResolvedValueOnce({
      ok: false,
      reason: 'not-configured',
    })
    await expect(
      submitProductReviewAction(
        'organic-peppermint',
        'gid://shopify/Product/123',
        initialState,
        reviewForm(validFields),
      ),
    ).resolves.toMatchObject({
      status: 'error',
      message: 'Reviews are temporarily unavailable. Please try again later.',
    })

    mocks.createTrustooProductReview.mockResolvedValueOnce({
      ok: false,
      reason: 'provider-error',
    })
    await expect(
      submitProductReviewAction(
        'organic-peppermint',
        'gid://shopify/Product/123',
        initialState,
        reviewForm(validFields),
      ),
    ).resolves.toMatchObject({
      status: 'error',
      message: 'We could not submit your review. Please try again shortly.',
    })
  })

  test('rejects malformed products and honeypot submissions', async () => {
    await expect(
      submitProductReviewAction(
        'Bad Handle',
        'gid://shopify/Product/123',
        initialState,
        reviewForm(validFields),
      ),
    ).resolves.toEqual({
      status: 'error',
      message: 'This product cannot receive reviews.',
    })
    await expect(
      submitProductReviewAction(
        'organic-peppermint',
        'gid://shopify/Product/123',
        initialState,
        reviewForm({ ...validFields, website: 'https://spam.test' }),
      ),
    ).resolves.toEqual({ status: 'error', message: 'Please try again.' })
    expect(mocks.createTrustooProductReview).not.toHaveBeenCalled()
  })

  test('stops before the provider when the client is rate limited', async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({ limited: true })

    await expect(
      submitProductReviewAction(
        'organic-peppermint',
        'gid://shopify/Product/123',
        initialState,
        reviewForm(validFields),
      ),
    ).resolves.toEqual({
      status: 'error',
      message: 'Too many submissions. Please wait a moment and try again.',
    })
    expect(mocks.createTrustooProductReview).not.toHaveBeenCalled()
  })
})
