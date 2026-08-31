import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { makeCustomerAccountProfile } from '@/tests/fixtures/shopify/customer-account'

import { Dashboard } from './dashboard'

const profile = makeCustomerAccountProfile()

const meta: Meta<typeof Dashboard> = {
  title: 'Account/Dashboard',
  component: Dashboard,
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

type Story = StoryObj<typeof Dashboard>

export const Loaded: Story = {
  args: {
    dashboard: {
      defaultAddress: profile.defaultAddress,
      profile,
      recentOrders: profile.orders,
      sectionErrors: {},
    },
  },
}

export const NoOrders: Story = {
  args: {
    dashboard: {
      defaultAddress: profile.defaultAddress,
      profile,
      recentOrders: [],
      sectionErrors: {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Your account is ready')).toBeVisible()
  },
}

export const PartialOrdersError: Story = {
  args: {
    dashboard: {
      defaultAddress: profile.defaultAddress,
      profile,
      recentOrders: [],
      sectionErrors: { orders: 'We could not load recent orders.' },
    },
  },
}

export const PartialAddressesError: Story = {
  args: {
    dashboard: {
      defaultAddress: null,
      profile,
      recentOrders: profile.orders,
      sectionErrors: { addresses: 'We could not load saved addresses.' },
    },
  },
}
