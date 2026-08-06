/**
 * @vitest-environment jsdom
 */
import type { ComponentProps, ComponentType } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { ProductOption, ProductVariant } from '@/lib/shopify/types'

import { ProductForm } from './product-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/cart/actions', () => ({
  addToCartAction: vi.fn(),
}))

const ProductFormWithInitialVariant = ProductForm as ComponentType<
  ComponentProps<typeof ProductForm> & { initialVariantId?: string }
>

const options: ProductOption[] = [
  {
    name: 'Size',
    values: ['Sample', '250g box'],
  },
]

const variants: ProductVariant[] = [
  {
    id: 'gid://shopify/ProductVariant/first-available',
    title: 'Sample',
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
    id: 'gid://shopify/ProductVariant/41503540936791',
    title: '250g box',
    availableForSale: true,
    quantityAvailable: 50,
    quantityRule: {
      minimum: 1,
      maximum: 50,
      increment: 1,
    },
    price: { amount: '40.65', currencyCode: 'AUD' },
    quantityPriceBreaks: [
      {
        minimumQuantity: 5,
        discountPercent: 5,
      },
    ],
    image: null,
  },
]

const capturedAddToCartPayloads: Array<{
  quantity: number
  variantId: string
}> = []

const captureAddToCart = async (variantId: string, quantity: number) => {
  capturedAddToCartPayloads.push({ variantId, quantity })
}

describe('ProductForm', () => {
  it('shows the production in-stock message for an available selected variant', () => {
    const html = renderToStaticMarkup(
      <ProductFormWithInitialVariant variants={variants} options={options} />,
    )

    expect(html).toContain('In stock! Usually ships within 24 hours.')
    expect(html).not.toContain('Sorry! This product is currently out of stock.')
  })

  it('shows the production sold-out message for a sold-out selected variant', () => {
    const html = renderToStaticMarkup(
      <ProductFormWithInitialVariant
        variants={[{ ...variants[0], availableForSale: false }]}
        options={options}
      />,
    )

    expect(html).toContain('Sorry! This product is currently out of stock.')
    expect(html).not.toContain('In stock! Usually ships within 24 hours.')
  })

  it('follows the selected variant availability on a mixed-availability product', () => {
    const mixedVariants = [
      variants[0],
      { ...variants[1], availableForSale: false },
    ]

    const inStockHtml = renderToStaticMarkup(
      <ProductFormWithInitialVariant
        variants={mixedVariants}
        options={options}
        initialVariantId={variants[0].id}
      />,
    )
    const soldOutHtml = renderToStaticMarkup(
      <ProductFormWithInitialVariant
        variants={mixedVariants}
        options={options}
        initialVariantId="41503540936791"
      />,
    )

    expect(inStockHtml).toContain('In stock! Usually ships within 24 hours.')
    expect(inStockHtml).not.toContain(
      'Sorry! This product is currently out of stock.',
    )
    expect(soldOutHtml).toContain(
      'Sorry! This product is currently out of stock.',
    )
    expect(soldOutHtml).not.toContain(
      'In stock! Usually ships within 24 hours.',
    )
  })

  it('uses a deep-linked numeric Shopify variant id for initial bulk pricing', () => {
    const html = renderToStaticMarkup(
      <ProductFormWithInitialVariant
        variants={variants}
        options={options}
        initialVariantId="41503540936791"
      />,
    )

    expect(html).toContain('Buy in Bulk and Save')
    expect(html).toContain('Buy 5 for 5% Off')
    expect(html).toContain('$40.65')
  })

  it('shows bulk pricing tiers even when current inventory is below the first tier', () => {
    const html = renderToStaticMarkup(
      <ProductFormWithInitialVariant
        variants={[
          {
            ...variants[1],
            quantityAvailable: 1,
            quantityRule: {
              minimum: 1,
              maximum: null,
              increment: 1,
            },
          },
        ]}
        options={options}
        initialVariantId="41503540936791"
      />,
    )

    expect(html).toContain('Buy in Bulk and Save')
    expect(html).toContain('Buy 5 for 5% Off')
  })

  it('lets bulk deal submissions exceed the storefront quantity maximum', async () => {
    capturedAddToCartPayloads.length = 0
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    const bulkVariant = {
      ...variants[1],
      quantityAvailable: 1,
      quantityRule: {
        minimum: 1,
        maximum: null,
        increment: 1,
      },
    }

    await act(async () => {
      root.render(
        <ProductFormWithInitialVariant
          variants={[bulkVariant]}
          options={options}
          initialVariantId="41503540936791"
          addToCart={captureAddToCart}
        />,
      )
    })

    const buyFiveButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Buy 5 for 5% Off') === true,
    )
    if (!buyFiveButton) throw new Error('Expected bulk tier button to render')

    await act(async () => {
      buyFiveButton.click()
    })

    const grabDealButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Grab this deal',
    )
    if (!grabDealButton) throw new Error('Expected grab deal button to render')

    await act(async () => {
      grabDealButton.click()
    })

    expect(capturedAddToCartPayloads.at(-1)).toEqual({
      variantId: 'gid://shopify/ProductVariant/41503540936791',
      quantity: 5,
    })

    await act(async () => {
      root.unmount()
    })
    host.remove()
  })

  it('resets quantity to the new variant minimum when pack size changes', async () => {
    capturedAddToCartPayloads.length = 0
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    const nextVariant = {
      ...variants[1],
      quantityRule: {
        minimum: 2,
        maximum: 50,
        increment: 1,
      },
    }

    await act(async () => {
      root.render(
        <ProductFormWithInitialVariant
          variants={[variants[0], nextVariant]}
          options={options}
          addToCart={captureAddToCart}
        />,
      )
    })

    const increaseButton = host.querySelector<HTMLButtonElement>(
      'button[aria-label="Increase quantity"]',
    )
    const nextVariantButton = host.querySelector<HTMLButtonElement>(
      'button[aria-label="250g box"]',
    )
    const addToCartButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Add to Cart',
    )

    if (!increaseButton) {
      throw new Error('Expected quantity increase button to render')
    }
    if (!nextVariantButton) {
      throw new Error('Expected next variant button to render')
    }
    if (!addToCartButton) {
      throw new Error('Expected add-to-cart button to render')
    }

    await act(async () => {
      increaseButton.click()
      increaseButton.click()
    })
    await act(async () => {
      nextVariantButton.click()
    })
    await act(async () => {
      addToCartButton.click()
    })

    expect(capturedAddToCartPayloads.at(-1)).toEqual({
      variantId: nextVariant.id,
      quantity: 2,
    })

    await act(async () => {
      root.unmount()
    })
    host.remove()
  })
})
