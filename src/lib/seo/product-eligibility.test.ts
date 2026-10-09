import { describe, expect, test } from 'vitest'

import { isProductIndexable } from './product-eligibility'

describe('isProductIndexable', () => {
  test('keeps the checkout-only freight product out of search', () => {
    expect(isProductIndexable('freight')).toBe(false)
  })

  test('keeps a normal product indexable', () => {
    expect(isProductIndexable('cats-claw-cut')).toBe(true)
  })
})
