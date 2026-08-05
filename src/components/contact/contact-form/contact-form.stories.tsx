import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { ContactForm } from './contact-form'

const successAction = async () => ({ success: true })
const errorAction = async () => ({
  success: false,
  error: 'Unable to send your message right now. Please try again shortly.',
})

const meta: Meta<typeof ContactForm> = {
  title: 'Contact/ContactForm',
  component: ContactForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-paper p-6">
        <div className="border-hairline-2 bg-card mx-auto max-w-3xl rounded-lg border p-5 sm:p-6">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    action: successAction,
  },
}
export default meta

type Story = StoryObj<typeof ContactForm>

export const Default: Story = {}

export const SubmittedSuccess: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByLabelText('Name'), 'Buyer')
    await userEvent.type(canvas.getByLabelText('Email'), 'buyer@example.com')
    await userEvent.type(canvas.getByLabelText('Message'), 'Please contact me.')
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))

    await expect(
      await canvas.findByRole('heading', { name: 'Thanks for your message.' }),
    ).toBeVisible()

    await userEvent.click(
      canvas.getByRole('button', { name: 'Send another enquiry' }),
    )
    await expect(
      canvas.getByRole('button', { name: 'Send enquiry' }),
    ).toBeVisible()
  },
}

export const Success: Story = {
  args: {
    action: successAction,
    initialState: 'success',
  },
}

export const Error: Story = {
  args: {
    action: errorAction,
    initialState: 'error',
    initialError:
      'Unable to send your message right now. Please try again shortly.',
  },
}
