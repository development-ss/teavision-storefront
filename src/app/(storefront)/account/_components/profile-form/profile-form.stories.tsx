import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { makeCustomerAccountProfile } from '@/tests/fixtures/shopify/customer-account'
import type { CustomerAccountFormState } from '@/lib/shopify/customer-account/types'

import { ProfileForm } from './profile-form'

const meta: Meta<typeof ProfileForm> = {
  title: 'Account/Profile/Form',
  component: ProfileForm,
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

type Story = StoryObj<typeof ProfileForm>

const successAction = async (previousState: CustomerAccountFormState) =>
  previousState

export const Loaded: Story = {
  args: {
    action: successAction,
    profile: makeCustomerAccountProfile(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getByRole('textbox', { name: 'First name' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('textbox', { name: 'Last name' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('textbox', { name: 'Phone' }),
    ).not.toBeInTheDocument()
    await expect(canvas.queryByText('Phone')).not.toBeInTheDocument()
    await expect(canvas.queryByText('+61 400 000 000')).not.toBeInTheDocument()
    await expect(
      canvas.queryByText(
        'Phone changes are managed through Shopify account sign-in.',
      ),
    ).not.toBeInTheDocument()
  },
}

export const FieldError: Story = {
  name: 'field-error',
  args: {
    ...Loaded.args,
    initialState: {
      fieldErrors: { firstName: 'Enter your first name.' },
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
      message: 'We could not update your profile. Please try again.',
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
