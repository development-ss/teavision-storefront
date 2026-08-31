import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { CustomerAccountFormState } from '@/lib/shopify/customer-account/types'

import { DeleteAddressDialog } from './delete-address-dialog'

const meta: Meta<typeof DeleteAddressDialog> = {
  title: 'Account/DeleteAddressDialog',
  component: DeleteAddressDialog,
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

type Story = StoryObj<typeof DeleteAddressDialog>

const successAction = async (previousState: CustomerAccountFormState) =>
  previousState

export const Closed: Story = {
  name: 'closed',
  args: {
    action: successAction,
    addressId: 'gid://shopify/CustomerAddress/test-address-1',
    addressLabel: 'Avery Nguyen',
  },
}

export const OpenConfirmation: Story = {
  name: 'open-confirmation',
  args: {
    ...Closed.args,
    openByDefault: true,
  },
}

export const PendingDestructiveSubmit: Story = {
  name: 'pending-destructive-submit',
  args: {
    ...OpenConfirmation.args,
    isPendingOverride: true,
  },
}
