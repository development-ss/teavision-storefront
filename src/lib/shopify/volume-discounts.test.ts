import { describe, expect, test } from 'vitest'

import { getHulkDiscountedUnitPrice } from './volume-discounts'

describe('Hulk volume discount pricing', () => {
  test.each([
    { discountPercent: 5, expectedUnitPrice: '10.90' },
    { discountPercent: 10, expectedUnitPrice: '10.33' },
    { discountPercent: 12, expectedUnitPrice: '10.10' },
    { discountPercent: 15, expectedUnitPrice: '9.75' },
  ])(
    'mirrors Hulk whole-cent unit rounding at $discountPercent%',
    ({ discountPercent, expectedUnitPrice }) => {
      expect(
        getHulkDiscountedUnitPrice(
          { amount: '11.47', currencyCode: 'AUD' },
          discountPercent,
        ),
      ).toEqual({ amount: expectedUnitPrice, currencyCode: 'AUD' })
    },
  )
})
