import { describe, expect, test, vi } from 'vitest'

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

import { parseHulkVolumeDiscountTiers } from './hulk-volume-discounts'

describe('Hulk volume discount offer parsing', () => {
  test('reads tiers from the active Function-app configuration', () => {
    expect(
      parseHulkVolumeDiscountTiers({
        charges_applied: true,
        eligible_offer: {
          main_offer_type: 'volume',
          discount_type: 'bulk_qty',
          offer_levels: '',
          fix_quantity_level: JSON.stringify([
            ['40', '15', '% Off', '', '0'],
            ['5', '5', '% Off', '', '0'],
            ['20', '12', '% Off', '', '0'],
            ['10', '10', '% Off', '', '0'],
          ]),
        },
      }),
    ).toEqual([
      { minimumQuantity: 5, discountPercent: 5 },
      { minimumQuantity: 10, discountPercent: 10 },
      { minimumQuantity: 20, discountPercent: 12 },
      { minimumQuantity: 40, discountPercent: 15 },
    ])
  })

  test('retains compatibility with the legacy offer-level field', () => {
    expect(
      parseHulkVolumeDiscountTiers({
        charges_applied: true,
        eligible_offer: {
          main_offer_type: 'volume',
          offer_levels: [['5', '5', '% Off']],
        },
      }),
    ).toEqual([{ minimumQuantity: 5, discountPercent: 5 }])
  })

  test('returns no tiers for inactive or non-percentage offers', () => {
    expect(
      parseHulkVolumeDiscountTiers({
        charges_applied: false,
        eligible_offer: {
          main_offer_type: 'volume',
          fix_quantity_level: [['5', '5', '% Off']],
        },
      }),
    ).toEqual([])

    expect(
      parseHulkVolumeDiscountTiers({
        charges_applied: true,
        eligible_offer: {
          main_offer_type: 'volume',
          fix_quantity_level: [['5', '10', 'Fixed price']],
        },
      }),
    ).toEqual([])
  })
})
