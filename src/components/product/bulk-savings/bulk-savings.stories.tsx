import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { BulkSavings } from './bulk-savings'

const meta: Meta<typeof BulkSavings> = {
  title: 'Product/BulkSavings',
  component: BulkSavings,
  tags: ['autodocs'],
  args: {
    canAddToCart: true,
    onGrabDeal: () => undefined,
    onSelectTier: () => undefined,
  },
}
export default meta

type Story = StoryObj<typeof BulkSavings>

export const NativePriceBreaks: Story = {
  args: {
    basePrice: {
      amount: '24.00',
      currencyCode: 'AUD',
    },
    selectedQuantity: 5,
    tiers: [
      {
        minimumQuantity: 2,
        price: {
          amount: '22.80',
          currencyCode: 'AUD',
        },
      },
      {
        minimumQuantity: 5,
        price: {
          amount: '20.40',
          currencyCode: 'AUD',
        },
      },
      {
        minimumQuantity: 10,
        price: {
          amount: '18.00',
          currencyCode: 'AUD',
        },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.queryByRole('link', { name: /apply for a wholesale account/i }),
    ).not.toBeInTheDocument()
  },
}

export const RequiresTierSelection: Story = {
  args: {
    ...NativePriceBreaks.args,
    selectedTierQuantity: null,
    canAddToCart: false,
  },
}

export const Pending: Story = {
  args: {
    ...NativePriceBreaks.args,
    selectedTierQuantity: 5,
    isPending: true,
  },
}

export const LimitedQuantity: Story = {
  args: {
    ...NativePriceBreaks.args,
    maximumQuantity: 5,
  },
}

export const LongQuantityLabelMobile: Story = {
  args: {
    basePrice: {
      amount: '32.50',
      currencyCode: 'AUD',
    },
    selectedQuantity: 3,
    tiers: [
      {
        minimumQuantity: 1_000_000_000,
        price: {
          amount: '30.00',
          currencyCode: 'AUD',
        },
      },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: ({ canvasElement }) => {
    if (canvasElement.scrollWidth > canvasElement.clientWidth) {
      throw new Error(
        'Long bulk-savings tier label overflows the mobile canvas',
      )
    }
  },
}
