import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { BulkPricingTier, Money } from '@/lib/shopify/types'

import { BulkSavings } from './bulk-savings'

const basePrice: Money = { amount: '11.47', currencyCode: 'AUD' }

const nativePriceBreaks: BulkPricingTier[] = [
  {
    minimumQuantity: 5,
    price: { amount: '10.90', currencyCode: 'AUD' },
  },
  {
    minimumQuantity: 10,
    price: { amount: '10.32', currencyCode: 'AUD' },
  },
  {
    minimumQuantity: 20,
    price: { amount: '10.09', currencyCode: 'AUD' },
  },
  {
    minimumQuantity: 40,
    price: { amount: '9.75', currencyCode: 'AUD' },
  },
]

describe('BulkSavings', () => {
  it('totals Shopify-authored unit prices', () => {
    const html = renderToStaticMarkup(
      <BulkSavings
        tiers={nativePriceBreaks}
        basePrice={basePrice}
        selectedQuantity={1}
      />,
    )

    expect(html).toContain('Total $54.50')
    expect(html).toContain('Total $103.20')
    expect(html).toContain('Total $201.80')
    expect(html).toContain('Total $390.00')
  })

  it('keeps per-unit tier prices rounded to cents', () => {
    const html = renderToStaticMarkup(
      <BulkSavings
        tiers={nativePriceBreaks}
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
