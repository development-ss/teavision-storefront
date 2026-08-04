/**
 * @vitest-environment jsdom
 */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { ProductVariant } from '@/lib/shopify/types'

import { ProductPurchaseForm } from './product-purchase-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/cart/actions', () => ({
  addToCartAction: vi.fn(),
}))

const variants: ProductVariant[] = [
  {
    id: 'gid://shopify/ProductVariant/tea-masters-sencha-50g',
    title: '50g Sample',
    availableForSale: true,
    quantityAvailable: 10,
    quantityRule: {
      minimum: 1,
      maximum: 10,
      increment: 1,
    },
    price: { amount: '12.00', currencyCode: 'AUD' },
    quantityPriceBreaks: [],
    image: null,
  },
  {
    id: 'gid://shopify/ProductVariant/tea-masters-sencha-1kg',
    title: '1kg',
    availableForSale: true,
    quantityAvailable: 4,
    quantityRule: {
      minimum: 1,
      maximum: 4,
      increment: 1,
    },
    price: { amount: '88.00', currencyCode: 'AUD' },
    quantityPriceBreaks: [],
    image: null,
  },
]

describe('ProductPurchaseForm', () => {
  it('renders quantity control in the inline collection layout', () => {
    const html = renderToStaticMarkup(
      <ProductPurchaseForm
        variants={variants}
        productTitle="Tea Masters Sencha"
        layout="inline"
        showPrice={false}
      />,
    )

    expect(html).toContain('Select pack size for Tea Masters Sencha')
    expect(html).toContain('Quantity for Tea Masters Sencha')
    expect(html).toContain('name="quantity"')
  })

  it('renders compact card controls beneath a collection tile', () => {
    const html = renderToStaticMarkup(
      <ProductPurchaseForm
        variants={variants}
        productTitle="Tea Masters Sencha"
        layout="card"
      />,
    )

    expect(html).toContain('Select pack size for Tea Masters Sencha')
    expect(html).toContain('Quantity for Tea Masters Sencha')
    expect(html).toContain('Add to cart')
    expect(html).toContain('grid-cols-[7.5rem_minmax(0,1fr)]')
  })

  it('updates the displayed card price when the selected size changes', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)

    await act(async () => {
      root.render(
        <ProductPurchaseForm
          variants={variants}
          productTitle="Tea Masters Sencha"
          layout="card"
          showPrice
        />,
      )
    })

    expect(host.textContent).toContain('$12.00')

    const select = host.querySelector('select')
    if (!select) throw new Error('Expected variant select to render')

    await act(async () => {
      select.value = 'gid://shopify/ProductVariant/tea-masters-sencha-1kg'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(host.textContent).toContain('$88.00')
    expect(host.textContent).not.toContain('$12.00')

    await act(async () => {
      root.unmount()
    })
    host.remove()
  })
})
