import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import type {
  BulkPricingTier,
  ProductOption,
  ProductVariant,
} from '@/lib/shopify/types'

import { ProductForm } from './product-form'

async function successfulAddToCart() {}

async function failingAddToCart() {
  throw new Error('Maximum quantity available reached.')
}

function pendingAddToCart() {
  return new Promise<never>(() => undefined)
}

function noopCartRefresh() {}

const capturedAddToCartPayloads: Array<{
  quantity: number
  variantId: string
}> = []

const captureAddToCart = async (variantId: string, quantity: number) => {
  capturedAddToCartPayloads.push({ variantId, quantity })
}

const options: ProductOption[] = [
  {
    name: 'Pack size',
    values: ['50g Sample', '1kg', '5kg'],
  },
]

const bulkPricingTiers: BulkPricingTier[] = [
  {
    minimumQuantity: 2,
    price: { amount: '22.80', currencyCode: 'AUD' },
  },
  {
    minimumQuantity: 5,
    price: { amount: '20.40', currencyCode: 'AUD' },
  },
  {
    minimumQuantity: 10,
    price: { amount: '18.00', currencyCode: 'AUD' },
  },
]

const baseVariant: ProductVariant = {
  id: 'gid://shopify/ProductVariant/organic-chamomile-1kg',
  title: 'Default Title',
  availableForSale: true,
  quantityAvailable: 12,
  quantityRule: {
    minimum: 1,
    maximum: 12,
    increment: 1,
  },
  price: { amount: '24.00', currencyCode: 'AUD' },
  quantityPriceBreaks: bulkPricingTiers,
  image: null,
}

const multiVariants: ProductVariant[] = [
  {
    ...baseVariant,
    id: 'gid://shopify/ProductVariant/organic-chamomile-50g',
    title: '50g Sample',
    quantityAvailable: 8,
    price: { amount: '12.00', currencyCode: 'AUD' },
  },
  {
    ...baseVariant,
    id: 'gid://shopify/ProductVariant/organic-chamomile-1kg',
    title: '1kg',
    quantityAvailable: 6,
    price: { amount: '88.00', currencyCode: 'AUD' },
  },
  {
    ...baseVariant,
    id: 'gid://shopify/ProductVariant/organic-chamomile-5kg',
    title: '5kg',
    availableForSale: false,
    quantityAvailable: 0,
    price: { amount: '390.00', currencyCode: 'AUD' },
  },
]

const meta: Meta<typeof ProductForm> = {
  title: 'Product/ProductForm',
  component: ProductForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof ProductForm>

export const SingleVariant: Story = {
  args: {
    variants: [baseVariant],
    options: [],
  },
}

export const MultipleVariants: Story = {
  args: {
    variants: multiVariants,
    options,
  },
}

export const SoldOut: Story = {
  args: {
    variants: [
      {
        ...baseVariant,
        availableForSale: false,
        quantityAvailable: 0,
      },
    ],
    options: [],
  },
}

export const LimitedQuantity: Story = {
  args: {
    variants: [
      {
        ...baseVariant,
        quantityAvailable: 3,
        quantityRule: {
          minimum: 1,
          maximum: 3,
          increment: 1,
        },
      },
    ],
    options: [],
  },
}

export const NoVariants: Story = {
  args: {
    variants: [],
    options: [],
  },
}

export const AddToCartSuccess: Story = {
  args: {
    variants: [baseVariant],
    options: [],
    addToCart: successfulAddToCart,
    onCartChanged: noopCartRefresh,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Add to Cart' }))

    await expect(await canvas.findByRole('status')).toHaveTextContent(
      '1 added to cart',
    )
  },
}

export const AddToCartError: Story = {
  args: {
    variants: [baseVariant],
    options: [],
    addToCart: failingAddToCart,
    onCartChanged: noopCartRefresh,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Add to Cart' }))

    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Maximum quantity available reached.',
    )
  },
}

export const AddToCartPending: Story = {
  args: {
    variants: [baseVariant],
    options: [],
    addToCart: pendingAddToCart,
    onCartChanged: noopCartRefresh,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Add to Cart' }))

    const pendingButton = await canvas.findByRole('button', { name: 'Adding…' })
    await expect(pendingButton).toBeDisabled()
    await expect(pendingButton).toHaveAttribute('aria-busy', 'true')
    await expect(pendingButton).toHaveAttribute('data-loading', 'true')
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Adding 1 to cart',
    )
  },
}

export const SelectedQuantityPayload: Story = {
  args: {
    variants: [baseVariant],
    options: [],
    addToCart: captureAddToCart,
    onCartChanged: noopCartRefresh,
  },
  play: async ({ canvasElement }) => {
    capturedAddToCartPayloads.length = 0
    const canvas = within(canvasElement)

    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase quantity' }),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Add to Cart' }))

    await waitFor(() => {
      expect(capturedAddToCartPayloads.at(-1)).toEqual({
        variantId: baseVariant.id,
        quantity: 2,
      })
    })
  },
}

export const SelectedVariantPayload: Story = {
  args: {
    variants: multiVariants,
    options,
    addToCart: captureAddToCart,
    onCartChanged: noopCartRefresh,
  },
  play: async ({ canvasElement }) => {
    capturedAddToCartPayloads.length = 0
    const canvas = within(canvasElement)

    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase quantity' }),
    )
    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase quantity' }),
    )
    await userEvent.click(canvas.getByRole('button', { name: '1kg' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Add to Cart' }))

    await waitFor(() => {
      expect(capturedAddToCartPayloads.at(-1)).toEqual({
        variantId: 'gid://shopify/ProductVariant/organic-chamomile-1kg',
        quantity: 1,
      })
    })
  },
}

export const BulkTierPayload: Story = {
  args: {
    variants: [baseVariant],
    options: [],
    addToCart: captureAddToCart,
    onCartChanged: noopCartRefresh,
  },
  play: async ({ canvasElement }) => {
    capturedAddToCartPayloads.length = 0
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /Buy 5\+/ }))
    await userEvent.click(
      canvas.getByRole('button', { name: 'Grab this deal' }),
    )

    await waitFor(() => {
      expect(capturedAddToCartPayloads.at(-1)).toEqual({
        variantId: baseVariant.id,
        quantity: 5,
      })
    })
  },
}

export const FeedbackResetsOnQuantityChange: Story = {
  args: {
    variants: [baseVariant],
    options: [],
    addToCart: failingAddToCart,
    onCartChanged: noopCartRefresh,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Add to Cart' }))
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Maximum quantity available reached.',
    )

    await waitFor(() => {
      expect(
        canvas.getByRole('button', { name: 'Increase quantity' }),
      ).toBeEnabled()
    })
    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase quantity' }),
    )
    await waitFor(() => {
      expect(canvas.queryByRole('alert')).not.toBeInTheDocument()
    })
  },
}
