'use server'

import { getTrustooProductReviews } from './trustoo'

export async function loadProductReviews(handle: string, page: number) {
  return getTrustooProductReviews(handle, page)
}
