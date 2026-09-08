'use server'

import { headers } from 'next/headers'

import { getClientIpFromHeaders, checkRateLimit } from '@/lib/rate-limit'

import { createTrustooProductReview, getTrustooProductReviews } from './trustoo'

export type ProductReviewField = 'rating' | 'author' | 'email' | 'content'

export type ProductReviewActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Partial<Record<ProductReviewField, string>>
}

const REVIEW_RATE_LIMIT = 5
const REVIEW_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readString(formData: FormData, field: string): string {
  const value = formData.get(field)
  return typeof value === 'string' ? value.trim() : ''
}

async function isReviewRateLimited(): Promise<boolean> {
  const requestHeaders = await headers()
  const result = await checkRateLimit({
    namespace: 'product-review',
    identifier: getClientIpFromHeaders(requestHeaders),
    limit: REVIEW_RATE_LIMIT,
    windowMs: REVIEW_RATE_LIMIT_WINDOW_MS,
  })

  return result.limited
}

export async function submitProductReviewAction(
  handle: string,
  productId: string,
  _previousState: ProductReviewActionState,
  formData: FormData,
): Promise<ProductReviewActionState> {
  if (readString(formData, 'website')) {
    return {
      status: 'error',
      message: 'Please try again.',
    }
  }

  const rating = Number(readString(formData, 'rating'))
  const author = readString(formData, 'author')
  const email = readString(formData, 'email')
  const content = readString(formData, 'content')
  const fieldErrors: Partial<Record<ProductReviewField, string>> = {}

  if (!/^[a-z0-9][a-z0-9-]{0,254}$/.test(handle)) {
    return { status: 'error', message: 'This product cannot receive reviews.' }
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    fieldErrors.rating = 'Choose a rating.'
  if (author.length < 1 || author.length > 80)
    fieldErrors.author = 'Enter a name of 1 to 80 characters.'
  if (email.length > 254 || !EMAIL_PATTERN.test(email))
    fieldErrors.email = 'Enter a valid email address.'
  if (content.length < 10 || content.length > 2000)
    fieldErrors.content = 'Write between 10 and 2,000 characters.'

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors,
    }
  }

  if (await isReviewRateLimited()) {
    return {
      status: 'error',
      message: 'Too many submissions. Please wait a moment and try again.',
    }
  }

  const result = await createTrustooProductReview({
    productId,
    rating,
    author,
    email,
    content,
  })

  if (!result.ok) {
    return {
      status: 'error',
      message:
        result.reason === 'not-configured'
          ? 'Reviews are temporarily unavailable. Please try again later.'
          : 'We could not submit your review. Please try again shortly.',
    }
  }

  return {
    status: 'success',
    message:
      'Thanks for sharing your experience. Your review was submitted successfully.',
  }
}

export async function loadProductReviews(handle: string, page: number) {
  return getTrustooProductReviews(handle, page)
}
