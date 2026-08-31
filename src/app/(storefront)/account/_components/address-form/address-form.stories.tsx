import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { makeCustomerAccountAddress } from '@/tests/fixtures/shopify/customer-account'
import type { CustomerAccountFormState } from '@/lib/shopify/customer-account/types'

import { AddressForm } from './address-form'

const meta: Meta<typeof AddressForm> = {
  title: 'Account/AddressForm',
  component: AddressForm,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className="bg-paper px-gutter py-section">
        <div className="mx-auto max-w-3xl">
          <Story />
        </div>
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof AddressForm>

const successAction = async (previousState: CustomerAccountFormState) =>
  previousState

export const Loaded: Story = {
  args: {
    action: successAction,
    address: makeCustomerAccountAddress(),
    isDefaultAddress: true,
    mode: 'edit',
  },
}

export const FieldErrors: Story = {
  name: 'field-errors',
  args: {
    ...Loaded.args,
    initialState: {
      fieldErrors: {
        address1: 'Enter a street address.',
        zip: 'Enter a postcode.',
      },
      message: null,
      status: 'error',
    },
  },
}

export const FormLevelError: Story = {
  name: 'form-level-error',
  args: {
    ...Loaded.args,
    initialState: {
      fieldErrors: {},
      message: 'We could not save this address. Please try again.',
      status: 'error',
    },
  },
}

export const PendingSubmit: Story = {
  name: 'pending-submit',
  args: {
    ...Loaded.args,
    isPendingOverride: true,
  },
}
