import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'

import {
  makeCustomerAccountAddress,
  makeCustomerAccountProfile,
} from '@/tests/fixtures/shopify/customer-account'
import type { CustomerAccountFormState } from '@/lib/shopify/customer-account/types'

import { AddressBook } from './address-book'

const meta: Meta<typeof AddressBook> = {
  title: 'Account/AddressBook',
  component: AddressBook,
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

type Story = StoryObj<typeof AddressBook>

const successAction = async (previousState: CustomerAccountFormState) =>
  previousState

const defaultAddress = makeCustomerAccountAddress({
  address1: '45 Default Road',
  firstName: 'Default',
  id: 'gid://shopify/CustomerAddress/default',
  lastName: 'Recipient',
})
const secondaryAddress = makeCustomerAccountAddress({
  address1: '12 Secondary Lane',
  firstName: 'Secondary',
  id: 'gid://shopify/CustomerAddress/secondary',
  lastName: 'Recipient',
})

export const DefaultFirst: Story = {
  name: 'default-first',
  args: {
    addresses: [secondaryAddress, defaultAddress],
    defaultAddressId: defaultAddress.id,
    deleteAddressAction: successAction,
    setDefaultAction: successAction,
  },
  play: async ({ canvasElement }) => {
    const text = canvasElement.textContent ?? ''

    await expect(text.indexOf('Default Recipient')).toBeLessThan(
      text.indexOf('Secondary Recipient'),
    )
  },
}

export const NoAddresses: Story = {
  name: 'no-addresses',
  args: {
    addresses: [],
    defaultAddressId: null,
    deleteAddressAction: successAction,
    setDefaultAction: successAction,
  },
}

export const MutationSuccess: Story = {
  name: 'mutation-success',
  args: {
    addresses: makeCustomerAccountProfile().addresses,
    defaultAddressId: makeCustomerAccountProfile().defaultAddress?.id ?? null,
    deleteAddressAction: successAction,
    initialState: {
      fieldErrors: {},
      message: 'Default address updated.',
      status: 'success',
    },
    setDefaultAction: successAction,
  },
}

export const SectionError: Story = {
  name: 'section-error',
  args: {
    addresses: makeCustomerAccountProfile().addresses,
    defaultAddressId: makeCustomerAccountProfile().defaultAddress?.id ?? null,
    deleteAddressAction: successAction,
    initialState: {
      fieldErrors: {},
      message: 'We could not load saved addresses.',
      status: 'error',
    },
    setDefaultAction: successAction,
  },
}
