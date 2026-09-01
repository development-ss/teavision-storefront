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
        price: { amount: '38.62', currencyCode: 'AUD' },
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
    expect(html).toContain('Buy 5+')
    expect(html).toContain('$40.65')
    expect(html).toContain('$38.62')
  })

  it('hides native bulk pricing tiers above the available maximum', () => {
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

    expect(html).not.toContain('Buy in Bulk and Save')
    expect(html).not.toContain('Buy 5+')
  })

  it('submits a native bulk tier that is within the storefront maximum', async () => {
    capturedAddToCartPayloads.length = 0
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    const bulkVariant = {
      ...variants[1],
      quantityAvailable: 5,
      quantityRule: {
        minimum: 1,
        maximum: 5,
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
      (button) => button.textContent?.includes('Buy 5+') === true,
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

  it('shows the exact Hulk percentage total and submits its tier quantity', async () => {
    capturedAddToCartPayloads.length = 0
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    const op1Variant: ProductVariant = {
      ...variants[0],
      id: 'gid://shopify/ProductVariant/op1-1kg',
      title: '1kg',
      quantityAvailable: 50,
      quantityRule: {
        minimum: 1,
        maximum: 50,
        increment: 1,
      },
      price: { amount: '51.44', currencyCode: 'AUD' },
    }

    await act(async () => {
      root.render(
        <ProductFormWithInitialVariant
          variants={[op1Variant]}
          options={options}
          volumeDiscountTiers={[
            { minimumQuantity: 5, discountPercent: 5 },
            { minimumQuantity: 10, discountPercent: 10 },
            { minimumQuantity: 20, discountPercent: 12 },
            { minimumQuantity: 40, discountPercent: 15 },
          ]}
          addToCart={captureAddToCart}
        />,
      )
    })

    expect(host.textContent).toContain('Buy 10 for 10% Off')
    expect(host.textContent).toContain('Total $463.00')
    expect(host.textContent).not.toContain('Total $462.96')

    const buyTenButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Buy 10 for 10% Off') === true,
    )
    if (!buyTenButton) throw new Error('Expected volume tier button to render')

    await act(async () => {
      buyTenButton.click()
    })

    const grabDealButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Grab this deal',
    )
    if (!grabDealButton) throw new Error('Expected grab deal button to render')

    await act(async () => {
      grabDealButton.click()
    })

    expect(capturedAddToCartPayloads.at(-1)).toEqual({
      variantId: 'gid://shopify/ProductVariant/op1-1kg',
      quantity: 10,
    })

    await act(async () => {
      root.unmount()
    })
    host.remove()
  })

  it('submits the next reachable quantity for an off-step Hulk tier', async () => {
    capturedAddToCartPayloads.length = 0
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    const steppedVariant: ProductVariant = {
      ...variants[0],
      quantityAvailable: 10,
      quantityRule: {
        minimum: 2,
        maximum: 10,
        increment: 4,
      },
    }

    await act(async () => {
      root.render(
        <ProductFormWithInitialVariant
          variants={[steppedVariant]}
          options={options}
          volumeDiscountTiers={[{ minimumQuantity: 5, discountPercent: 5 }]}
          addToCart={captureAddToCart}
        />,
      )
    })

    const tierButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Buy 6 for 5% Off') === true,
    )
    if (!tierButton) throw new Error('Expected aligned tier button to render')

    await act(async () => {
      tierButton.click()
    })

    const grabDealButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Grab this deal',
    )
    if (!grabDealButton) throw new Error('Expected grab deal button to render')

    await act(async () => {
      grabDealButton.click()
    })

    expect(capturedAddToCartPayloads.at(-1)).toEqual({
      variantId: steppedVariant.id,
      quantity: 6,
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

  it('shows add failures while keeping the add action available for retry', async () => {
    capturedAddToCartPayloads.length = 0
    let attempts = 0
    const flakyAddToCart = async (variantId: string, quantity: number) => {
      attempts += 1
      if (attempts === 1) throw new Error('temporary failure')
      await captureAddToCart(variantId, quantity)
    }
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)

    await act(async () => {
      root.render(
        <ProductFormWithInitialVariant
          variants={[variants[0]]}
          options={options}
          addToCart={flakyAddToCart}
        />,
      )
    })

    const addToCartButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Add to Cart',
    )
    if (!addToCartButton)
      throw new Error('Expected add-to-cart button to render')

    await act(async () => {
      addToCartButton.click()
      await new Promise((resolve) => setTimeout(resolve, 10))
    })
    expect(host.textContent).toContain(
      'Unable to add to cart. Please try again.',
    )

    await act(async () => {
      addToCartButton.click()
      await new Promise((resolve) => setTimeout(resolve, 10))
    })
    expect(capturedAddToCartPayloads.at(-1)).toEqual({
      variantId: variants[0].id,
      quantity: 1,
    })

    await act(async () => {
      root.unmount()
    })
    host.remove()
  })
})
