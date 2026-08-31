import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { makeCustomerAccountOrder } from '@/tests/fixtures/shopify/customer-account'

import { OrderHistory } from './order-history'

const meta: Meta<typeof OrderHistory> = {
  title: 'Account/OrderHistory',
  component: OrderHistory,
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

type Story = StoryObj<typeof OrderHistory>

export const Empty: Story = {
  args: {
    orders: [],
    pageInfo: {
      endCursor: null,
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
    },
  },
}

export const FirstPage: Story = {
  args: {
    orders: [makeCustomerAccountOrder()],
    pageInfo: {
      endCursor: 'next-cursor',
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: 'first-cursor',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getAllByText('Payment')[0]).toBeVisible()
    await expect(canvas.getAllByText('View order')[0]).toBeVisible()
  },
}

export const LaterPage: Story = {
  args: {
    orders: [
      makeCustomerAccountOrder({
        id: 'gid://shopify/Order/test-order-2',
        name: '#TV1002',
      }),
    ],
    pageInfo: {
      endCursor: null,
      hasNextPage: false,
      hasPreviousPage: true,
      startCursor: 'previous-cursor',
    },
  },
}

export const LongStatusLabel: Story = {
  args: {
    orders: [
      makeCustomerAccountOrder({
        financialStatus: 'PARTIALLY_REFUNDED',
        fulfillmentStatus: 'IN_PROGRESS_WITH_CARRIER_DELAY',
        name: '#TV1000000000000000002',
      }),
    ],
    pageInfo: Empty.args?.pageInfo,
  },
}
