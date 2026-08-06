import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { BulkPricingTier, Money } from '@/lib/shopify/types'

import { BulkSavings } from './bulk-savings'

const basePrice: Money = { amount: '11.47', currencyCode: 'AUD' }

const percentageTiers: BulkPricingTier[] = [
  { minimumQuantity: 5, discountPercent: 5 },
  { minimumQuantity: 10, discountPercent: 10 },
  { minimumQuantity: 20, discountPercent: 12 },
  { minimumQuantity: 40, discountPercent: 15 },
]

describe('BulkSavings', () => {
  it('rounds tier totals once from the unrounded discounted unit price', () => {
    const html = renderToStaticMarkup(
      <BulkSavings
        tiers={percentageTiers}
        basePrice={basePrice}
        selectedQuantity={1}
      />,
    )

    expect(html).toContain('Total $54.48')
    expect(html).toContain('Total $103.23')
    expect(html).toContain('Total $201.87')
    expect(html).toContain('Total $389.98')
  })

  it('keeps per-unit tier prices rounded to cents', () => {
    const html = renderToStaticMarkup(
      <BulkSavings
        tiers={percentageTiers}
        basePrice={basePrice}
        selectedQuantity={1}
      />,
    )

    expect(html).toContain('$10.90')
    expect(html).toContain('$10.32')
    expect(html).toContain('$10.09')
    expect(html).toContain('$9.75')
  })

  it('totals explicit Shopify-authored tier prices unchanged', () => {
    const html = renderToStaticMarkup(
      <BulkSavings
        tiers={[
          {
            minimumQuantity: 5,
            price: { amount: '10.00', currencyCode: 'AUD' },
          },
        ]}
        basePrice={basePrice}
        selectedQuantity={1}
      />,
    )

    expect(html).toContain('$10.00')
    expect(html).toContain('Total $50.00')
  })
})
