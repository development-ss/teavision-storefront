import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { makeCustomerAccountOrder } from '@/tests/fixtures/shopify/customer-account'

import { OrderDetail } from './order-detail'

const meta: Meta<typeof OrderDetail> = {
  title: 'Account/OrderDetail',
  component: OrderDetail,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className="bg-paper px-gutter py-section">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof OrderDetail>

export const TrackingPresent: Story = {
  args: {
    order: makeCustomerAccountOrder(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Tracking')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'TRACK123' }),
    ).toHaveAttribute('href', 'https://tracking.test/TRACK123')
  },
}

export const TrackingAbsent: Story = {
  args: {
    order: makeCustomerAccountOrder({
      fulfillments: [],
      statusPageUrl: null,
    }),
  },
}

export const LongLineItemName: Story = {
  args: {
    order: makeCustomerAccountOrder({
      lineItems: [
        {
          ...makeCustomerAccountOrder().lineItems[0],
          title:
            'Organic ceremonial-grade green tea with a very long wholesale product title for wrapping checks',
        },
      ],
    }),
  },
}
