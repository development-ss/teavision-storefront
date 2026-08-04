export type ProductReviewSummary = {
  rating: number
  reviewCount: number
}

export function getVisibleProductReviewSummary(summary: {
  rating?: number
  reviewCount?: number
}): ProductReviewSummary | null {
  const { rating, reviewCount } = summary

  if (
    typeof rating === 'number' &&
    Number.isFinite(rating) &&
    rating > 0 &&
    rating <= 5 &&
    typeof reviewCount === 'number' &&
    Number.isInteger(reviewCount) &&
    reviewCount > 0
  ) {
    return { rating, reviewCount }
  }

  return null
}
