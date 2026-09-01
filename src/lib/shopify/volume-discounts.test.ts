import { describe, expect, test } from 'vitest'

import {
  getHulkDiscountedUnitPrice,
  HULK_VOLUME_DISCOUNT_TIERS,
} from './volume-discounts'

describe('Hulk volume discount storefront projection', () => {
  test('matches the active Shopify Functions offer', () => {
    expect(HULK_VOLUME_DISCOUNT_TIERS).toEqual([
      { minimumQuantity: 5, discountPercent: 5 },
      { minimumQuantity: 10, discountPercent: 10 },
      { minimumQuantity: 20, discountPercent: 12 },
      { minimumQuantity: 40, discountPercent: 15 },
    ])
  })

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
