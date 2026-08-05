import { describe, expect, test } from 'vitest'

import { getVisibleProductReviewSummary } from './summary'

describe('getVisibleProductReviewSummary', () => {
  test('returns a complete rating summary', () => {
    expect(
      getVisibleProductReviewSummary({ rating: 4.8, reviewCount: 12 }),
    ).toEqual({
      rating: 4.8,
      reviewCount: 12,
    })
  })

  test.each([
    { rating: 0, reviewCount: 0 },
    { rating: 4.8, reviewCount: 0 },
    { rating: 4.8, reviewCount: undefined },
    { rating: undefined, reviewCount: 12 },
    { rating: 6, reviewCount: 12 },
    { rating: Number.NaN, reviewCount: 12 },
    { rating: 4.8, reviewCount: 1.5 },
  ])('hides an incomplete or invalid summary: %o', (summary) => {
    expect(getVisibleProductReviewSummary(summary)).toBeNull()
  })
})
