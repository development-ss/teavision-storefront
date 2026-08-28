import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import type { ProductVariant } from '@/lib/shopify/types'

import { ProductPurchaseForm } from './product-purchase-form'

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
  {
    id: 'gid://shopify/ProductVariant/tea-masters-sencha-5kg',
    title: '5kg',
    availableForSale: false,
    quantityAvailable: 0,
    quantityRule: {
      minimum: 1,
      maximum: 0,
      increment: 1,
    },
    price: { amount: '390.00', currencyCode: 'AUD' },
    quantityPriceBreaks: [],
    image: null,
  },
]

const minimumQuantityVariants: ProductVariant[] = [
  {
    ...variants[0],
    id: 'gid://shopify/ProductVariant/tea-masters-sencha-carton',
    title: 'Carton',
    quantityAvailable: 20,
    quantityRule: {
      minimum: 5,
      maximum: 20,
      increment: 5,
    },
  },
]

const standardPackVariant: ProductVariant = {
  ...variants[0],
  id: 'gid://shopify/ProductVariant/mini-pu-erh-brick',
  title: 'Default Title',
  price: { amount: '40.65', currencyCode: 'AUD' },
}

async function successfulAddToCart() {}

async function failingAddToCart() {
  throw new Error('Unable to add to cart.')
}

function pendingAddToCart() {
  return new Promise<never>(() => undefined)
}

function noopCartRefresh() {}

const capturedPurchasePayloads: Array<{
  quantity: number
  variantId: string
}> = []

const capturePurchasePayload = async (variantId: string, quantity: number) => {
  capturedPurchasePayloads.push({ variantId, quantity })
}

const meta: Meta<typeof ProductPurchaseForm> = {
  title: 'Collection/ProductPurchaseForm',
  component: ProductPurchaseForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
  args: {
    variants,
    productTitle: 'Tea Masters Sencha',
    addToCart: successfulAddToCart,
    onCartChanged: noopCartRefresh,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(24rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof ProductPurchaseForm>

export const Default: Story = {
  args: {},
}

export const QuantitySuccess: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Increase quantity for tea masters sencha',
      }),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Add to cart' }))

    await expect(await canvas.findByRole('status')).toHaveTextContent(
      '2 added to cart',
    )
  },
}

export const AddToCartError: Story = {
  args: {
    addToCart: failingAddToCart,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Add to cart' }))

    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Unable to add to cart. Please try again.',
    )
  },
}

export const AddToCartPending: Story = {
  args: {
    addToCart: pendingAddToCart,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Add to cart' }))

    await expect(
      await canvas.findByRole('button', { name: 'Add to cart' }),
    ).toBeDisabled()
  },
}

export const SelectedVariantPayload: Story = {
  args: {
    addToCart: capturePurchasePayload,
  },
  play: async ({ canvasElement }) => {
    capturedPurchasePayloads.length = 0
    const canvas = within(canvasElement)

    await userEvent.selectOptions(
      canvas.getByRole('combobox', {
        name: 'Select pack size for Tea Masters Sencha',
      }),
      'gid://shopify/ProductVariant/tea-masters-sencha-1kg',
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Add to cart' }))

    await waitFor(() => {
      expect(capturedPurchasePayloads.at(-1)).toEqual({
        variantId: 'gid://shopify/ProductVariant/tea-masters-sencha-1kg',
        quantity: 1,
      })
    })
  },
}

export const InlineQuantityStepper: Story = {
  args: {
    addToCart: capturePurchasePayload,
    layout: 'inline',
    showPrice: false,
  },
  play: async ({ canvasElement }) => {
    capturedPurchasePayloads.length = 0
    const canvas = within(canvasElement)

    await expect(
      canvas.getByRole('combobox', {
        name: 'Select pack size for Tea Masters Sencha',
      }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('spinbutton', {
        name: 'Quantity for Tea Masters Sencha',
      }),
    ).toBeVisible()

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Increase quantity for tea masters sencha',
      }),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Add to cart' }))

    await waitFor(() => {
      expect(capturedPurchasePayloads.at(-1)).toEqual({
        variantId: 'gid://shopify/ProductVariant/tea-masters-sencha-50g',
        quantity: 2,
      })
    })
  },
}

export const CardPurchaseControls: Story = {
  args: {
    addToCart: capturePurchasePayload,
    layout: 'card',
  },
  play: async ({ canvasElement }) => {
    capturedPurchasePayloads.length = 0
    const canvas = within(canvasElement)

    await userEvent.selectOptions(
      canvas.getByRole('combobox', {
        name: 'Select pack size for Tea Masters Sencha',
      }),
      'gid://shopify/ProductVariant/tea-masters-sencha-1kg',
    )
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Increase quantity for tea masters sencha',
      }),
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Add to cart' }))

    await waitFor(() => {
      expect(capturedPurchasePayloads.at(-1)).toEqual({
        variantId: 'gid://shopify/ProductVariant/tea-masters-sencha-1kg',
        quantity: 2,
      })
    })
  },
}

export const CardStandard: Story = {
  args: {
    variants: [standardPackVariant],
    productTitle: '2003Y Mini Ripe Pu-erh Tea Brick (250g/box)',
    layout: 'card',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getByRole('option', { name: 'Standard' }),
    ).toBeVisible()
    await expect(canvas.queryByText('Default Title')).not.toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: 'Add to cart' }),
    ).toBeEnabled()
  },
}

export const InlineMinimumQuantityPayload: Story = {
  args: {
    variants: minimumQuantityVariants,
    addToCart: capturePurchasePayload,
    layout: 'inline',
    showPrice: false,
  },
  play: async ({ canvasElement }) => {
    capturedPurchasePayloads.length = 0
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'Add to cart' }))

    await waitFor(() => {
      expect(capturedPurchasePayloads.at(-1)).toEqual({
        variantId: 'gid://shopify/ProductVariant/tea-masters-sencha-carton',
        quantity: 5,
      })
    })
  },
}

export const InlineSoldOutVariant: Story = {
  args: {
    addToCart: capturePurchasePayload,
    layout: 'inline',
    showPrice: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.selectOptions(
      canvas.getByRole('combobox', {
        name: 'Select pack size for Tea Masters Sencha',
      }),
      'gid://shopify/ProductVariant/tea-masters-sencha-5kg',
    )

    await expect(
      canvas.getByRole('button', { name: 'Sold out' }),
    ).toBeDisabled()
  },
}

export const NoVariants: Story = {
  args: {
    variants: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getByText('No purchasable variants are currently available.'),
    ).toBeVisible()
  },
}
