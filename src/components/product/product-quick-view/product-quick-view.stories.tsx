import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import type { Product, ProductSummary } from '@/lib/shopify/types'

import { ProductQuickView } from './product-quick-view'
import type { AddToCart } from '../use-add-to-cart'

const stubProduct: ProductSummary = {
  id: 'gid://shopify/Product/masters-sencha',
  handle: 'tea-masters-sencha',
  title: 'Tea Masters Sencha Green Tea',
  featuredImage: {
    url: 'https://cdn.shopify.com/s/files/1/0000/0001/products/tea-1.jpg?v=1',
    altText: 'Loose leaf green tea',
    width: 900,
    height: 900,
  },
  priceRange: {
    minVariantPrice: { amount: '12.00', currencyCode: 'AUD' },
  },
  rating: 4.8,
  reviewCount: 37,
}

const quickViewProduct: Product = {
  ...stubProduct,
  description:
    'A bright, grassy green tea with reliable bulk availability for cafe menus, kombucha production, and retail blends.',
  descriptionHtml:
    '<p>A bright, grassy green tea with reliable bulk availability for cafe menus, kombucha production, and retail blends.</p>',
  tags: ['Green tea', 'Wholesale'],
  images: stubProduct.featuredImage ? [stubProduct.featuredImage] : [],
  options: [
    {
      name: 'Size',
      values: ['50g Sample', '1kg', '5kg'],
    },
  ],
  variants: [
    {
      id: 'gid://shopify/ProductVariant/masters-sencha-50g',
      title: '50g Sample',
      availableForSale: true,
      price: { amount: '12.00', currencyCode: 'AUD' },
      quantityPriceBreaks: [],
      image: stubProduct.featuredImage,
    },
    {
      id: 'gid://shopify/ProductVariant/masters-sencha-1kg',
      title: '1kg',
      availableForSale: true,
      price: { amount: '88.00', currencyCode: 'AUD' },
      quantityPriceBreaks: [],
    },
    {
      id: 'gid://shopify/ProductVariant/masters-sencha-5kg',
      title: '5kg',
      availableForSale: false,
      price: { amount: '390.00', currencyCode: 'AUD' },
      quantityPriceBreaks: [],
    },
  ],
}

const soldOutProduct: Product = {
  ...quickViewProduct,
  variants: quickViewProduct.variants.map((variant) => ({
    ...variant,
    availableForSale: false,
  })),
}

const minimumQuantityProduct: Product = {
  ...quickViewProduct,
  variants: [
    {
      ...quickViewProduct.variants[0]!,
      id: 'gid://shopify/ProductVariant/masters-sencha-carton',
      title: 'Carton',
      quantityAvailable: 20,
      quantityRule: {
        minimum: 5,
        maximum: 20,
        increment: 5,
      },
    },
  ],
}

const defaultVariantProduct: Product = {
  ...quickViewProduct,
  title: '2003Y Mini Ripe Pu-erh Tea Brick (250g/box)',
  options: [
    {
      name: 'Title',
      values: ['Default Title'],
    },
  ],
  variants: [
    {
      ...quickViewProduct.variants[0]!,
      id: 'gid://shopify/ProductVariant/mini-pu-erh-brick',
      title: 'Default Title',
    },
  ],
}

const capturedQuickViewPayloads: Array<{
  quantity: number
  variantId: string
}> = []

const captureQuickViewPayload: AddToCart = async (variantId, quantity) => {
  capturedQuickViewPayloads.push({ variantId, quantity })
}

const addSelectedPackQuantityToCart: AddToCart = async (
  variantId,
  quantity,
) => {
  if (
    variantId !== 'gid://shopify/ProductVariant/masters-sencha-1kg' ||
    quantity !== 2
  ) {
    throw new Error(`Unexpected cart payload: ${variantId} x ${quantity}`)
  }
}

function createRecoveringAddToCart(): AddToCart {
  let attempts = 0

  return async () => {
    attempts += 1
    if (attempts === 1) {
      throw new Error('Temporary add failure')
    }
  }
}

const meta: Meta<typeof ProductQuickView> = {
  title: 'Product/ProductQuickView',
  component: ProductQuickView,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta

type Story = StoryObj<typeof ProductQuickView>

async function openQuickViewDialog(
  canvasElement: HTMLElement,
  triggerName = 'Quick View',
) {
  const canvas = within(canvasElement)

  await userEvent.click(canvas.getByRole('button', { name: triggerName }))

  return within(await within(document.body).findByRole('dialog'))
}

export const Default: Story = {
  args: {
    product: stubProduct,
    initialProduct: quickViewProduct,
  },
}

export const AddToCartTrigger: Story = {
  args: {
    product: stubProduct,
    initialProduct: quickViewProduct,
    addToCart: addSelectedPackQuantityToCart,
    buttonIcon: 'cart',
    buttonLabel: 'Add to cart',
  },
  play: async ({ canvasElement }) => {
    const dialog = await openQuickViewDialog(canvasElement, 'Add to cart')

    await userEvent.click(await dialog.findByRole('button', { name: '1kg' }))
    await userEvent.click(
      dialog.getByRole('button', {
        name: 'Increase quantity for tea masters sencha green tea',
      }),
    )

    await expect(
      dialog.getByRole('spinbutton', {
        name: 'Quantity for Tea Masters Sencha Green Tea',
      }),
    ).toHaveValue(2)

    await userEvent.click(dialog.getByRole('button', { name: 'Add to Cart' }))
    await expect(await dialog.findByRole('status')).toHaveTextContent(
      'Added to cart',
    )
  },
}

export const SoldOut: Story = {
  args: {
    product: stubProduct,
    initialProduct: soldOutProduct,
  },
  play: async ({ canvasElement }) => {
    const dialog = await openQuickViewDialog(canvasElement)

    await expect(
      dialog.getByRole('button', { name: 'Sold Out' }),
    ).toBeDisabled()
  },
}

export const DefaultVariant: Story = {
  args: {
    product: {
      ...stubProduct,
      title: defaultVariantProduct.title,
    },
    initialProduct: defaultVariantProduct,
  },
  play: async ({ canvasElement }) => {
    const dialog = await openQuickViewDialog(canvasElement)

    await expect(dialog.queryByText('Default Title')).not.toBeInTheDocument()
    await expect(dialog.queryByText('Pack size')).not.toBeInTheDocument()
    await expect(
      dialog.getByRole('button', { name: 'Add to Cart' }),
    ).toBeEnabled()
  },
}

export const FetchError: Story = {
  args: {
    product: stubProduct,
  },
  play: async ({ canvasElement }) => {
    const originalFetch = window.fetch
    window.fetch = async () => new Response(null, { status: 500 })

    try {
      const dialog = await openQuickViewDialog(canvasElement)

      await expect(await dialog.findByRole('alert')).toHaveTextContent(
        'Unable to load product details. Please try again.',
      )
    } finally {
      window.fetch = originalFetch
    }
  },
}

export const InvalidResponse: Story = {
  args: {
    product: stubProduct,
  },
  play: async ({ canvasElement }) => {
    const originalFetch = window.fetch
    window.fetch = async () =>
      Response.json({
        id: 'gid://shopify/Product/invalid',
        title: 'Invalid product',
      })

    try {
      const dialog = await openQuickViewDialog(canvasElement)

      await expect(await dialog.findByRole('alert')).toHaveTextContent(
        'Unable to load product details. Please try again.',
      )
    } finally {
      window.fetch = originalFetch
    }
  },
}

export const RetrySuccess: Story = {
  args: {
    product: stubProduct,
  },
  play: async ({ canvasElement }) => {
    const originalFetch = window.fetch
    let attempts = 0
    window.fetch = async () => {
      attempts += 1
      if (attempts === 1) return new Response(null, { status: 500 })

      return Response.json(quickViewProduct)
    }

    try {
      const dialog = await openQuickViewDialog(canvasElement)
      await expect(await dialog.findByRole('alert')).toHaveTextContent(
        'Unable to load product details. Please try again.',
      )

      await userEvent.click(dialog.getByRole('button', { name: 'Try again' }))
      await expect(
        await dialog.findByRole('heading', {
          name: 'Tea Masters Sencha Green Tea',
        }),
      ).toBeVisible()
    } finally {
      window.fetch = originalFetch
    }
  },
}

export const AddFailureRecovery: Story = {
  args: {
    product: stubProduct,
    initialProduct: quickViewProduct,
  },
  render: (args) => (
    <ProductQuickView {...args} addToCart={createRecoveringAddToCart()} />
  ),
  play: async ({ canvasElement }) => {
    const dialog = await openQuickViewDialog(canvasElement)
    await userEvent.click(dialog.getByRole('button', { name: 'Add to Cart' }))
    await expect(await dialog.findByRole('alert')).toHaveTextContent(
      'Unable to add to cart. Please try again.',
    )

    await userEvent.click(dialog.getByRole('button', { name: 'Add to Cart' }))
    await expect(await dialog.findByRole('status')).toHaveTextContent(
      'Added to cart',
    )
  },
}

export const MinimumQuantityPayload: Story = {
  args: {
    product: stubProduct,
    initialProduct: minimumQuantityProduct,
    addToCart: captureQuickViewPayload,
  },
  play: async ({ canvasElement }) => {
    capturedQuickViewPayloads.length = 0
    const dialog = await openQuickViewDialog(canvasElement)

    await userEvent.click(dialog.getByRole('button', { name: 'Add to Cart' }))

    await waitFor(() => {
      expect(capturedQuickViewPayloads.at(-1)).toEqual({
        variantId: 'gid://shopify/ProductVariant/masters-sencha-carton',
        quantity: 5,
      })
    })
  },
}
